# Valores de producción para infra/terraform · cuenta 123456789012 · us-east-1
# Última aplicación: 28-oct-2026 (Felipe Zuluaga). Pida a Felipe la versión al día antes de aplicar.

region         = "us-east-1"
ambiente       = "produccion"
cidr_vpc       = "10.20.0.0/16"
zona_principal = "us-east-1a"
cidr_vpn       = "198.51.100.50/32"

# Credenciales de AWS con que se aplica desde el portátil de Felipe
aws_access_key_id     = "BHQFALSO0TERRAFORM01"
aws_secret_access_key = "FALSO/t3rr4f0rm+Bahareque/2026/AbCdEf34"

# Base de datos guadua-db
db_usuario_maestro = "guadua_admin"
db_clave_maestra   = "FALSO-Maestra-RDS-2026"
db_clave_api       = "FALSO-Api-Guadua-2026!"
db_clave_analitica = "FALSO-Datos-Prod-2026"

# Integraciones (llegan como variables de entorno a las tareas de ECS)
pagosya_clave_secreta = "pagosya_live_FALSO_7c1e9a40b2"
facturar_andino_token = "facand_tok_FALSO_c39e07b5a1"
