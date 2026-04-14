# Base de datos de Guadua · RDS PostgreSQL

resource "aws_db_subnet_group" "guadua" {
  name       = "guadua-db-subredes"
  subnet_ids = [aws_subnet.publica_a.id, aws_subnet.publica_b.id]
}

resource "aws_db_parameter_group" "guadua" {
  name   = "guadua-postgres16"
  family = "postgres16"

  parameter {
    name  = "log_min_duration_statement"
    value = "2000"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

resource "aws_db_instance" "guadua_db" {
  identifier                      = "guadua-db"
  engine                          = "postgres"
  engine_version                  = "16.4"
  instance_class                  = "db.m6g.large"
  allocated_storage               = 200
  max_allocated_storage           = 500
  storage_type                    = "gp3"
  storage_encrypted               = false
  db_name                         = "guadua"
  username                        = var.db_usuario_maestro
  password                        = var.db_clave_maestra
  parameter_group_name            = aws_db_parameter_group.guadua.name
  db_subnet_group_name            = aws_db_subnet_group.guadua.name
  vpc_security_group_ids          = [aws_security_group.base_de_datos.id]
  publicly_accessible             = true
  multi_az                        = false
  availability_zone               = var.zona_principal
  backup_retention_period         = 7
  backup_window                   = "07:00-07:45"
  maintenance_window              = "sun:08:30-sun:09:30"
  deletion_protection             = true
  skip_final_snapshot             = false
  final_snapshot_identifier       = "guadua-db-final"
  copy_tags_to_snapshot           = true
  auto_minor_version_upgrade      = true
  performance_insights_enabled    = true
  enabled_cloudwatch_logs_exports = ["postgresql"]
}

# Ambiente de pruebas: se recrea cada lunes desde el último snapshot de producción
data "aws_db_snapshot" "ultimo_produccion" {
  db_instance_identifier = aws_db_instance.guadua_db.identifier
  most_recent            = true
}

resource "aws_db_instance" "guadua_pruebas" {
  identifier             = "guadua-db-pruebas"
  instance_class         = "db.t4g.medium"
  snapshot_identifier    = data.aws_db_snapshot.ultimo_produccion.id
  db_subnet_group_name   = aws_db_subnet_group.guadua.name
  vpc_security_group_ids = [aws_security_group.base_de_datos.id]
  publicly_accessible    = true
  skip_final_snapshot    = true
  tags                   = { ambiente = "pruebas" }
}

# ------------------------------------------------------------------
# Roles dentro de PostgreSQL
# ------------------------------------------------------------------

resource "postgresql_role" "guadua_api" {
  name             = "guadua_api"
  login            = true
  password         = var.db_clave_api
  connection_limit = 60
}

resource "postgresql_schema" "tienda" {
  name     = "tienda"
  database = "guadua"
  owner    = postgresql_role.guadua_api.name
}

resource "postgresql_grant" "api_esquema" {
  database    = "guadua"
  role        = postgresql_role.guadua_api.name
  schema      = "tienda"
  object_type = "schema"
  privileges  = ["CREATE", "USAGE"]
}

resource "postgresql_role" "analitica_lectura" {
  name             = "analitica_lectura"
  login            = true
  password         = var.db_clave_analitica
  connection_limit = 5
}

resource "postgresql_grant" "analitica_lectura" {
  database    = "guadua"
  role        = postgresql_role.analitica_lectura.name
  schema      = "tienda"
  object_type = "table"
  privileges  = ["SELECT"]
}
