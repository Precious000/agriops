variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
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
variable "spaces_access_id" {
  description = "DigitalOcean Spaces access key"
  type        = string
  sensitive   = true
}

variable "spaces_secret_key" {
  description = "DigitalOcean Spaces secret key"
  type        = string
  sensitive   = true
}
