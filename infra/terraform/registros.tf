# Registros de auditoría (CloudTrail) y avisos

resource "aws_s3_bucket" "cloudtrail" {
  bucket = "bahareque-cloudtrail"
}

resource "aws_s3_bucket_public_access_block" "cloudtrail" {
  bucket                  = aws_s3_bucket.cloudtrail.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "CloudTrailRevisaAcl"
        Effect    = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action    = "s3:GetBucketAcl"
        Resource  = aws_s3_bucket.cloudtrail.arn
      },
      {
        Sid       = "CloudTrailEscribe"
        Effect    = "Allow"
        Principal = { Service = "cloudtrail.amazonaws.com" }
        Action    = "s3:PutObject"
        Resource  = "${aws_s3_bucket.cloudtrail.arn}/AWSLogs/123456789012/*"
        Condition = { StringEquals = { "s3:x-amz-acl" = "bucket-owner-full-control" } }
      }
    ]
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id

  rule {
    id     = "ahorro-almacenamiento"
    status = "Enabled"
    filter {}

    expiration {
      days = 1
    }
  }
}

resource "aws_cloudwatch_log_group" "cloudtrail" {
  name              = "/bahareque/cloudtrail"
  retention_in_days = 1
}

resource "aws_iam_role" "cloudtrail_logs" {
  name = "bahareque-cloudtrail-logs"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudtrail.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "cloudtrail_logs" {
  name = "escribir-logs"
  role = aws_iam_role.cloudtrail_logs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
      Resource = "${aws_cloudwatch_log_group.cloudtrail.arn}:*"
    }]
  })
}

resource "aws_cloudtrail" "principal" {
  name                          = "bahareque-principal"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail         = false
  enable_log_file_validation    = false
  cloud_watch_logs_group_arn    = "${aws_cloudwatch_log_group.cloudtrail.arn}:*"
  cloud_watch_logs_role_arn     = aws_iam_role.cloudtrail_logs.arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = ["${aws_s3_bucket.exportes.arn}/", "${aws_s3_bucket.facturas.arn}/"]
    }
  }
}

# --- Avisos (detalle de umbrales en infra/monitoreo/alertas.yaml)
resource "aws_sns_topic" "alertas_criticas" {
  name = "guadua-alertas-criticas"
}

resource "aws_sns_topic_subscription" "alertas_criticas_correo" {
  topic_arn = aws_sns_topic.alertas_criticas.arn
  protocol  = "email"
  endpoint  = var.correo_alertas_criticas
}

resource "aws_cloudwatch_log_metric_filter" "cloudtrail_detenido" {
  name           = "cloudtrail-detenido"
  log_group_name = aws_cloudwatch_log_group.cloudtrail.name
  pattern        = "{ ($.eventName = StopLogging) || ($.eventName = DeleteTrail) }"

  metric_transformation {
    name      = "CloudTrailDetenido"
    namespace = "Bahareque/Seguridad"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "cloudtrail_detenido" {
  alarm_name          = "cloudtrail-detenido"
  namespace           = "Bahareque/Seguridad"
  metric_name         = "CloudTrailDetenido"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  alarm_actions       = [aws_sns_topic.alertas_criticas.arn]
}
