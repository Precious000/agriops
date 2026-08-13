output "droplet_ip" {
  description = "Public IP address of the AgriOps Droplet"
  value       = digitalocean_droplet.agriops_droplet.ipv4_address
}

output "spaces_bucket_name" {
  description = "AgriOps media Spaces bucket"
  value       = digitalocean_spaces_bucket.agriops_media.name
}
