# Cómputo de Guadua: API en ECS (Fargate), servidor de tareas, balanceador y CI

resource "aws_ecr_repository" "guadua_api" {
  name = "guadua-api"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecs_cluster" "guadua_prod" {
  name = "guadua-prod"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/guadua/api"
  retention_in_days = 30
}

resource "aws_ssm_parameter" "db_clave_api" {
  name  = "/guadua/db/clave-api"
  type  = "SecureString"
  value = var.db_clave_api
}

resource "aws_ssm_parameter" "pagosya" {
  name  = "/guadua/pagosya/clave-secreta"
  type  = "SecureString"
  value = var.pagosya_clave_secreta
}

resource "aws_ssm_parameter" "facturar_andino" {
  name  = "/guadua/facturar-andino/token"
  type  = "SecureString"
  value = var.facturar_andino_token
}

resource "aws_iam_role" "api_tarea" {
  name = "guadua-api-tarea"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "api_tarea" {
  name = "api-datos"
  role = aws_iam_role.api_tarea.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject"]
        Resource = [
          "${aws_s3_bucket.produccion_datos.arn}/*",
          "${aws_s3_bucket.facturas.arn}/*",
          "${aws_s3_bucket.exportes.arn}/*",
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt", "kms:GenerateDataKey"]
        Resource = aws_kms_key.datos.arn
      }
    ]
  })
}

resource "aws_ecs_task_definition" "api" {
  family                   = "guadua-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024
  memory                   = 2048
  task_role_arn            = aws_iam_role.api_tarea.arn
  execution_role_arn       = "arn:aws:iam::123456789012:role/ecsTaskExecutionRole"

  container_definitions = jsonencode([
    {
      name         = "api"
      image        = "${aws_ecr_repository.guadua_api.repository_url}:latest"
      essential    = true
      portMappings = [{ containerPort = 4000, protocol = "tcp" }]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PUERTO", value = "4000" },
        { name = "DB_HOST", value = aws_db_instance.guadua_db.address },
        { name = "DB_USUARIO", value = "guadua_api" },
      ]
      secrets = [
        { name = "DB_CLAVE", valueFrom = aws_ssm_parameter.db_clave_api.arn },
        { name = "PAGOSYA_CLAVE_SECRETA", valueFrom = aws_ssm_parameter.pagosya.arn },
        { name = "FACTURAR_ANDINO_TOKEN", valueFrom = aws_ssm_parameter.facturar_andino.arn },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "api"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "guadua-api"
  cluster         = aws_ecs_cluster.guadua_prod.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.publica_a.id]
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 4000
  }
}

resource "aws_elasticache_subnet_group" "sesiones" {
  name       = "guadua-sesiones"
  subnet_ids = [aws_subnet.privada_a.id]
}

resource "aws_elasticache_replication_group" "sesiones" {
  replication_group_id       = "guadua-sesiones"
  description                = "Sesiones y carritos de Guadua"
  engine                     = "redis"
  node_type                  = "cache.t4g.small"
  num_cache_clusters         = 1
  subnet_group_name          = aws_elasticache_subnet_group.sesiones.name
  security_group_ids         = [aws_security_group.cache_interna.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

# --- Servidor de tareas: exportes nocturnos, pg_dump, correos masivos
resource "aws_iam_role" "tareas" {
  name = "guadua-tareas"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "tareas" {
  name = "tareas-exportes-respaldos"
  role = aws_iam_role.tareas.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
        Resource = ["${aws_s3_bucket.exportes.arn}/*", "${aws_s3_bucket.respaldos.arn}/*"]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:DeleteObject"]
        Resource = "${aws_s3_bucket.facturas.arn}/tmp/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "tareas" {
  name = "guadua-tareas"
  role = aws_iam_role.tareas.name
}

resource "aws_instance" "tareas" {
  ami                    = var.ami_tareas
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.publica_a.id
  key_name               = var.llave_ssh
  vpc_security_group_ids = [aws_security_group.tareas.id]
  iam_instance_profile   = aws_iam_instance_profile.tareas.name

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size = 50
    volume_type = "gp3"
    encrypted   = true
  }

  tags = { Name = "guadua-tareas" }
}

# --- Balanceador público
resource "aws_lb" "publico" {
  name                       = "guadua-publico"
  load_balancer_type         = "application"
  security_groups            = [aws_security_group.balanceador.id]
  subnets                    = [aws_subnet.publica_a.id, aws_subnet.publica_b.id]
  drop_invalid_header_fields = true
  enable_deletion_protection = true

  access_logs {
    bucket  = aws_s3_bucket.registros_acceso.id
    prefix  = "alb"
    enabled = true
  }
}

resource "aws_lb_target_group" "api" {
  name        = "guadua-api"
  port        = 4000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.principal.id

  health_check {
    path                = "/salud"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 15
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.publico.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = data.aws_acm_certificate.app_guadua.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_listener_certificate" "bahareque" {
  listener_arn    = aws_lb_listener.https.arn
  certificate_arn = aws_acm_certificate_validation.bahareque.certificate_arn
}

# Comercios con equipos viejos todavía entran por http
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.publico.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# --- Identidad de GitHub Actions (llaves de acceso en los secretos del repositorio)
resource "aws_iam_user" "ci" {
  name = "bahareque-ci"
  tags = { uso = "github-actions" }
}

resource "aws_iam_user_policy" "ci" {
  name = "despliegue"
  user = aws_iam_user.ci.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "Contenedores"
        Effect   = "Allow"
        Action   = ["ecr:*", "ecs:*", "iam:PassRole"]
        Resource = "*"
      },
      {
        Sid      = "SitioWebYArchivos"
        Effect   = "Allow"
        Action   = ["s3:*"]
        Resource = "*"
      },
      {
        Sid      = "Registros"
        Effect   = "Allow"
        Action   = ["cloudtrail:*", "logs:*"]
        Resource = "*"
      }
    ]
  })
}
