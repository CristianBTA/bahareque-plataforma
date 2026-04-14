# Respaldos de Guadua (ver datos/respaldos.md)

resource "aws_s3_bucket" "respaldos" {
  bucket = "bahareque-respaldos"
}

resource "aws_s3_bucket_public_access_block" "respaldos" {
  bucket                  = aws_s3_bucket.respaldos.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "respaldos" {
  bucket = aws_s3_bucket.respaldos.id

  rule {
    id     = "borrar-dumps-anteriores"
    status = "Enabled"

    filter {
      prefix = "pg_dump/"
    }

    expiration {
      days = 1
    }
  }
}

# Volumen de trabajo del servidor de tareas donde se arma el pg_dump antes de subirlo
resource "aws_ebs_volume" "respaldos_locales" {
  availability_zone = var.zona_principal
  size              = 300
  type              = "gp3"
  encrypted         = false
  tags              = { Name = "guadua-tareas-respaldos" }
}

resource "aws_volume_attachment" "respaldos_locales" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.respaldos_locales.id
  instance_id = aws_instance.tareas.id
}

resource "aws_backup_vault" "principal" {
  name = "bahareque-boveda"
}

resource "aws_backup_plan" "diario" {
  name = "bahareque-diario"

  rule {
    rule_name         = "diario-3am"
    target_vault_name = aws_backup_vault.principal.name
    schedule          = "cron(0 8 * * ? *)"

    lifecycle {
      delete_after = 1
    }
  }
}

resource "aws_iam_role" "respaldos" {
  name = "bahareque-respaldos"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "backup.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "respaldos" {
  role       = aws_iam_role.respaldos.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_backup_selection" "diario" {
  name         = "tareas-y-volumenes"
  plan_id      = aws_backup_plan.diario.id
  iam_role_arn = aws_iam_role.respaldos.arn
  resources = [
    aws_instance.tareas.arn,
    aws_ebs_volume.respaldos_locales.arn,
  ]
}
