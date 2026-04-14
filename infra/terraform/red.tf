# Red de Guadua · VPC 10.20.0.0/16 · us-east-1

resource "aws_vpc" "principal" {
  cidr_block           = var.cidr_vpc
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = "guadua-vpc" }
}

resource "aws_internet_gateway" "principal" {
  vpc_id = aws_vpc.principal.id
  tags   = { Name = "guadua-igw" }
}

resource "aws_subnet" "publica_a" {
  vpc_id                  = aws_vpc.principal.id
  cidr_block              = "10.20.1.0/24"
  availability_zone       = var.zona_principal
  map_public_ip_on_launch = true
  tags                    = { Name = "guadua-publica-a" }
}

# El balanceador y RDS piden subredes en dos zonas
resource "aws_subnet" "publica_b" {
  vpc_id                  = aws_vpc.principal.id
  cidr_block              = "10.20.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
  tags                    = { Name = "guadua-publica-b" }
}

resource "aws_subnet" "privada_a" {
  vpc_id            = aws_vpc.principal.id
  cidr_block        = "10.20.11.0/24"
  availability_zone = var.zona_principal
  tags              = { Name = "guadua-privada-a" }
}

resource "aws_route_table" "publica" {
  vpc_id = aws_vpc.principal.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.principal.id
  }

  tags = { Name = "guadua-rutas-publicas" }
}

resource "aws_route_table_association" "publica_a" {
  subnet_id      = aws_subnet.publica_a.id
  route_table_id = aws_route_table.publica.id
}

resource "aws_route_table_association" "publica_b" {
  subnet_id      = aws_subnet.publica_b.id
  route_table_id = aws_route_table.publica.id
}

# Tráfico a S3 por dentro de la red de AWS
resource "aws_vpc_endpoint" "s3" {
  vpc_id          = aws_vpc.principal.id
  service_name    = "com.amazonaws.us-east-1.s3"
  route_table_ids = [aws_route_table.publica.id]
}

# ------------------------------------------------------------------
# Grupos de seguridad
# ------------------------------------------------------------------

resource "aws_security_group" "balanceador" {
  name        = "guadua-balanceador"
  description = "Entrada publica de app.guadua.example y api.guadua.example"
  vpc_id      = aws_vpc.principal.id

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = [var.cidr_vpc]
  }
}

resource "aws_security_group" "api" {
  name        = "guadua-api"
  description = "Tareas de ECS de la API"
  vpc_id      = aws_vpc.principal.id

  ingress {
    description     = "API desde el balanceador"
    from_port       = 4000
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.balanceador.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "tareas" {
  name        = "guadua-tareas"
  description = "Servidor de tareas programadas"
  vpc_id      = aws_vpc.principal.id

  ingress {
    description = "SSH administracion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "base_de_datos" {
  name        = "guadua-db"
  description = "PostgreSQL de Guadua"
  vpc_id      = aws_vpc.principal.id

  ingress {
    description     = "PostgreSQL desde la API y el servidor de tareas"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id, aws_security_group.tareas.id]
  }

  ingress {
    description = "PostgreSQL analitica y soporte remoto"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Redis de sesiones y carritos
resource "aws_security_group" "cache_interna" {
  name        = "guadua-cache"
  description = "Redis de sesiones y carritos"
  vpc_id      = aws_vpc.principal.id

  ingress {
    description     = "Redis solo desde la API"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.cidr_vpc]
  }
}
