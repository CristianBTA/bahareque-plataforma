# Variables de la plataforma Guadua.
# Los valores sensibles NO van aquí: se cargan desde terraform.tfvars.

variable "region" {
  description = "Región de AWS de toda la plataforma"
  type        = string
  default     = "us-east-1"
}

variable "ambiente" {
  description = "produccion | pruebas"
  type        = string
  default     = "produccion"
}

variable "cidr_vpc" {
  description = "Red interna de la nube"
  type        = string
  default     = "10.20.0.0/16"
}

variable "zona_principal" {
  description = "Zona de disponibilidad donde corre la plataforma"
  type        = string
  default     = "us-east-1a"
}

variable "cidr_vpn" {
  description = "Salida de la VPN de la oficina de Manizales"
  type        = string
  default     = "198.51.100.50/32"
}

variable "ami_tareas" {
  description = "Imagen del servidor de tareas (armada a mano por Felipe, sep-2025)"
  type        = string
  default     = "ami-0c7d4e2a91b35f816"
}

variable "llave_ssh" {
  description = "Par de llaves para entrar por SSH al servidor de tareas"
  type        = string
  default     = "infra-compartida-2023"
}

variable "correo_alertas_criticas" {
  description = "Buzón que recibe las alertas críticas de la plataforma"
  type        = string
  default     = "gustavo.herrera@bahareque.example"
}

# --- Sensibles: los valores están en terraform.tfvars ---

variable "db_usuario_maestro" {
  type      = string
  sensitive = true
}

variable "db_clave_maestra" {
  type      = string
  sensitive = true
}

variable "db_clave_api" {
  description = "Clave del rol guadua_api en PostgreSQL"
  type        = string
  sensitive   = true
}

variable "db_clave_analitica" {
  type      = string
  sensitive = true
}

variable "pagosya_clave_secreta" {
  description = "Clave de producción de PagosYa"
  type        = string
  sensitive   = true
}

variable "facturar_andino_token" {
  description = "Token de la API de Facturar Andino"
  type        = string
  sensitive   = true
}
