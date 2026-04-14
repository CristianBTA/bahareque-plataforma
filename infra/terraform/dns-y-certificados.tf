# Dominios, zonas DNS y certificados

resource "aws_route53_zone" "bahareque" {
  name = "bahareque.example"
}

resource "aws_route53_zone" "guadua" {
  name = "guadua.example"
}

resource "aws_route53domains_registered_domain" "bahareque" {
  domain_name   = "bahareque.example"
  auto_renew    = true
  transfer_lock = true

  dynamic "name_server" {
    for_each = aws_route53_zone.bahareque.name_servers
    content {
      name = name_server.value
    }
  }
}

resource "aws_route53domains_registered_domain" "guadua" {
  domain_name   = "guadua.example"
  auto_renew    = false
  transfer_lock = true

  dynamic "name_server" {
    for_each = aws_route53_zone.guadua.name_servers
    content {
      name = name_server.value
    }
  }
}

# app.guadua.example y api.guadua.example: certificado comprado a una CA comercial e importado
data "aws_acm_certificate" "app_guadua" {
  domain      = "app.guadua.example"
  types       = ["IMPORTED"]
  statuses    = ["ISSUED"]
  most_recent = true
}

# *.bahareque.example: certificado administrado por ACM con validación DNS
resource "aws_acm_certificate" "bahareque" {
  domain_name               = "bahareque.example"
  subject_alternative_names = ["*.bahareque.example"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "bahareque_validacion" {
  for_each = {
    for dvo in aws_acm_certificate.bahareque.domain_validation_options : dvo.domain_name => dvo
  }

  zone_id         = aws_route53_zone.bahareque.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  records         = [each.value.resource_record_value]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "bahareque" {
  certificate_arn         = aws_acm_certificate.bahareque.arn
  validation_record_fqdns = [for r in aws_route53_record.bahareque_validacion : r.fqdn]
}

resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.guadua.zone_id
  name    = "app.guadua.example"
  type    = "A"

  alias {
    name                   = aws_lb.publico.dns_name
    zone_id                = aws_lb.publico.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.guadua.zone_id
  name    = "api.guadua.example"
  type    = "A"

  alias {
    name                   = aws_lb.publico.dns_name
    zone_id                = aws_lb.publico.zone_id
    evaluate_target_health = true
  }
}
