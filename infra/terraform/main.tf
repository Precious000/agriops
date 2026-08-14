resource "digitalocean_droplet" "agriops_droplet" {
  name   = "ubuntu-s-1vcpu-512mb-10gb-nyc3"
  region = var.region
  size   = var.droplet_size
  image  = "ubuntu-24-04-x64"

  tags = ["Agro-project"]
}

resource "digitalocean_firewall" "agriops_fw" {
  name = "agriops-${var.environment}-fw"

  droplet_ids = [digitalocean_droplet.agriops_droplet.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}


resource "digitalocean_spaces_bucket" "agriops_media" {
  name   = "agriops-${var.environment}-media"
  region = var.region
  acl    = "private"
}
