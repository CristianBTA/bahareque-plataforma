# ------------------------------------------------------------------
# Plataforma Guadua · proveedor, estado y personas con acceso
# Bahareque Software S.A.S. · cuenta AWS 123456789012 · us-east-1
# Mantiene: Andrés Gómez (CTO). Estructura original: G. Herrera, 2022.
# ------------------------------------------------------------------

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.22"
    }
  }

  backend "s3" {
    bucket         = "bahareque-terraform-estado"
    key            = "guadua/produccion.tfstate"
    region         = "us-east-1"
    dynamodb_table = "bahareque-terraform-bloqueo"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      empresa    = "bahareque"
      producto   = "guadua"
      ambiente   = var.ambiente
      gestionado = "terraform"
    }
  }
}

# Conexión administrativa a PostgreSQL para crear roles y permisos
provider "postgresql" {
  host            = aws_db_instance.guadua_db.address
  port            = 5432
  database        = "guadua"
  username        = var.db_usuario_maestro
  password        = var.db_clave_maestra
  sslmode         = "require"
  connect_timeout = 15
  superuser       = false
}

# ------------------------------------------------------------------
# Personas con acceso a la consola de AWS
# ------------------------------------------------------------------

locals {
  administradores = [
    "andres.gomez",
    "felipe.zuluaga",
    "fernando.salazar",
    "gustavo.herrera",
  ]

  equipo_datos = [
    "ximena.botero",
    "david.castro",
  ]
}

resource "aws_iam_group" "administradores" {
  name = "administradores"
}

resource "aws_iam_group_policy_attachment" "administradores_total" {
  group      = aws_iam_group.administradores.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_user" "administradores" {
  for_each = toset(local.administradores)
  name     = each.value
}

resource "aws_iam_user_login_profile" "administradores" {
  for_each                = aws_iam_user.administradores
  user                    = each.value.name
  password_reset_required = false
}

resource "aws_iam_group_membership" "administradores" {
  name  = "miembros-administradores"
  group = aws_iam_group.administradores.name
  users = [for u in aws_iam_user.administradores : u.name]
}

resource "aws_iam_group" "datos" {
  name = "datos"
}

resource "aws_iam_user" "datos" {
  for_each = toset(local.equipo_datos)
  name     = each.value
}

resource "aws_iam_group_membership" "datos" {
  name  = "miembros-datos"
  group = aws_iam_group.datos.name
  users = [for u in aws_iam_user.datos : u.name]
}

resource "aws_iam_group_policy" "datos_exportes" {
  name  = "lectura-exportes"
  group = aws_iam_group.datos.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "LeerExportes"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:ListBucket"]
        Resource = ["arn:aws:s3:::bahareque-exportes", "arn:aws:s3:::bahareque-exportes/*"]
      }
    ]
  })
}

resource "aws_iam_account_password_policy" "cuenta" {
  minimum_password_length        = 8
  require_lowercase_characters   = true
  require_uppercase_characters   = true
  require_numbers                = true
  require_symbols                = false
  allow_users_to_change_password = true
  max_password_age               = 90
  password_reuse_prevention      = 3
}
