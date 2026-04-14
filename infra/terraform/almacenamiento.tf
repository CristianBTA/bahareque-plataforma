# Buckets de S3 de Guadua y Bahareque

resource "aws_kms_key" "datos" {
  description             = "Llave de datos de produccion de Guadua"
  enable_key_rotation     = true
  deletion_window_in_days = 30
}

resource "aws_kms_alias" "datos" {
  name          = "alias/guadua-datos"
  target_key_id = aws_kms_key.datos.key_id
}

# --- guadua-produccion-datos: adjuntos de pedidos, catálogos y estáticos de la web
resource "aws_s3_bucket" "produccion_datos" {
  bucket = "guadua-produccion-datos"
}

resource "aws_s3_bucket_public_access_block" "produccion_datos" {
  bucket                  = aws_s3_bucket.produccion_datos.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "produccion_datos" {
  bucket = aws_s3_bucket.produccion_datos.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "produccion_datos" {
  bucket = aws_s3_bucket.produccion_datos.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.datos.arn
    }
    bucket_key_enabled = true
  }
}

# --- bahareque-exportes: CSV para comercial, analítica y comercios
resource "aws_s3_bucket" "exportes" {
  bucket = "bahareque-exportes"
}

resource "aws_s3_bucket_public_access_block" "exportes" {
  bucket                  = aws_s3_bucket.exportes.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Piloto de descarga directa para comercios (abr-2024)
resource "aws_s3_bucket_policy" "exportes" {
  bucket = aws_s3_bucket.exportes.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DescargaDirectaComercios"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.exportes.arn}/exportes/*"
      }
    ]
  })
}

resource "aws_s3_bucket_logging" "exportes" {
  bucket        = aws_s3_bucket.exportes.id
  target_bucket = aws_s3_bucket.registros_acceso.id
  target_prefix = "s3/bahareque-exportes/"
}

# --- guadua-facturas: XML y PDF de facturas electrónicas (Facturar Andino)
resource "aws_s3_bucket" "facturas" {
  bucket = "guadua-facturas"
}

resource "aws_s3_bucket_public_access_block" "facturas" {
  bucket                  = aws_s3_bucket.facturas.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "facturas" {
  bucket = aws_s3_bucket.facturas.id
  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "facturas" {
  bucket = aws_s3_bucket.facturas.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# --- bahareque-registros-acceso: registros de acceso de S3 y del balanceador
resource "aws_s3_bucket" "registros_acceso" {
  bucket = "bahareque-registros-acceso"
}

resource "aws_s3_bucket_public_access_block" "registros_acceso" {
  bucket                  = aws_s3_bucket.registros_acceso.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
