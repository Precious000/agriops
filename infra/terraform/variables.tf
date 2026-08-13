variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc1"
}

variable "droplet_size" {
  description = "Existing Droplet size"
  type        = string
  default     = "s-1vcpu-512mb-10gb"
}

variable "ssh_public_key_path" {
  description = "Path to the AgriOps SSH public key"
  type        = string
  default     = "~/.ssh/agriops_do.pub"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}
