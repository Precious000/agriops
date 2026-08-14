# AgriOps

A multi-tenant AgriTech operations platform connecting farm managers, workers, and buyers — built as a full DevOps portfolio project covering infrastructure as code, containerization, CI/CD, observability, and messaging.

## The Problem

Small-to-mid-scale farms and agri-cooperatives typically have no single source of truth for operations: no central worker registry, no way to assign and track field tasks, no proof-of-work verification, and no channel for buyers to discover and order produce. AgriOps solves this with one role-based platform.

## Features

- **Role-based access** — admin, manager, worker, and buyer accounts with JWT auth and route-level authorization
- **Farm & plot management** — managers register farms and plots, assign tasks to workers
- **Field activity logging** — workers submit geo-tagged photo proof of completed tasks, uploaded to object storage
- **Produce marketplace** — managers list available produce; buyers browse, order, and track fulfillment
- **Order & invoice tracking** — automatic invoice generation on order placement, event published to a message queue
- **Full observability** — metrics, logs, and alerting across every service

## Architecture

Three independently containerized Node.js/Express APIs (`users-api`, `farms-api`, `orders-api`) and a React frontend, all served through an Nginx reverse proxy on a single DigitalOcean Droplet via Docker Compose.

<img width="1200" height="675" alt="agriops_linkedin_card" src="https://github.com/user-attachments/assets/7d2da396-78b9-4b26-b909-28069f504f51" />


Prometheus ← scrapes /metrics from each service
Grafana ← visualizes Prometheus + Loki
Loki ← receives logs via Promtail
Alertmanager ← receives alerts from Prometheus


## Tech Stack

| Layer | Tools |
|---|---|
| Version control / CI-CD | Git, GitHub, GitHub Actions |
| Containerization | Docker, Docker Compose |
| IaC | Terraform (Droplet, VPC, firewall, Spaces) |
| Config management | Ansible (Docker install, users, firewall) |
| Cloud | DigitalOcean |
| Database | MySQL 8.4 (containerized) |
| Object storage | DigitalOcean Spaces (S3-compatible) |
| Observability | Prometheus, Grafana, Loki, Promtail, Alertmanager |
| Security scanning | Trivy, Dependabot |
| Messaging | RabbitMQ |
| API testing | Postman / Newman (CI-integrated) |
| Reverse proxy | Nginx |
| Frontend | React + Vite |

## Local/Production Setup

1. **Provision infrastructure:**
```bash
   cd infra/terraform
   export TF_VAR_do_token="<your-do-token>"
   terraform init && terraform apply
```
2. **Configure the server:**
```bash
   cd infra/ansible
   ansible-playbook -i inventory.ini playbook.yml
```
3. **Deploy the stack:**
```bash
   scp -r . deployer@<droplet_ip>:/opt/agriops
   ssh deployer@<droplet_ip>
   cd /opt/agriops/compose
   cp .env.example .env   # fill in real secrets
   docker compose up -d --build
```
4. Visit `http://<droplet_ip>/` for the app, `http://<droplet_ip>/grafana/` for dashboards.

## CI/CD

Every push to `main` runs tests, builds Docker images, scans them with Trivy, and runs the Postman collection via Newman before deploying over SSH to the Droplet. See `.github/workflows/`.

## Why not Kubernetes / Vault?

Deliberately scoped to a single-VM Docker Compose stack rather than Kubernetes, and `.env` + Docker secrets rather than HashiCorp Vault — both would add real operational overhead without matching the scale of this deployment. The infra choices are sized to the workload, not maximalist for their own sake.

## Author

Built by Precious Israel ([LinkedIn](https://linkedin.com/in/precious-israel-n) · [GitHub](https://github.com/Precious000)) as a portfolio project demonstrating end-to-end DevOps ownership: infrastructure, CI/CD, security, and observability.
