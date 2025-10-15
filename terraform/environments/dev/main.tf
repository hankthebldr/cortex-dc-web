# Cortex DC Development Environment
# Terraform configuration for dev environment

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Uncomment after creating GCS bucket
  # backend "gcs" {
  #   bucket  = "cortex-dc-terraform-state"
  #   prefix  = "env/dev"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Local variables
locals {
  environment  = "dev"
  cluster_name = "cortex-dc-dev"

  common_labels = {
    project     = "cortex-dc"
    environment = local.environment
    managed-by  = "terraform"
  }
}

# VPC Network Module
# module "vpc_network" {
#   source = "../../modules/vpc-network"
#
#   project_id   = var.project_id
#   network_name = "cortex-dc-dev-vpc"
#   environment  = local.environment
#
#   subnets = [
#     {
#       name          = "cortex-dc-dev-subnet"
#       ip_cidr_range = "10.0.0.0/24"
#       region        = var.region
#       secondary_ip_ranges = [
#         {
#           range_name    = "pods"
#           ip_cidr_range = "10.1.0.0/16"
#         },
#         {
#           range_name    = "services"
#           ip_cidr_range = "10.2.0.0/16"
#         }
#       ]
#     }
#   ]
# }

# GKE Cluster Module
# module "gke_cluster" {
#   source = "../../modules/gke-cluster"
#
#   project_id   = var.project_id
#   cluster_name = local.cluster_name
#   region       = var.region
#   environment  = local.environment
#
#   # Networking (from VPC module)
#   network_id          = module.vpc_network.network_id
#   network_name        = module.vpc_network.network_name
#   subnet_id           = module.vpc_network.subnets[0].id
#   pods_range_name     = "pods"
#   services_range_name = "services"
#
#   # Node configuration
#   machine_type       = "e2-standard-4"
#   disk_size_gb       = 100
#   initial_node_count = 1
#   min_node_count     = 1
#   max_node_count     = 3
#
#   # Enable spot nodes for cost savings in dev
#   enable_spot_nodes        = true
#   spot_machine_type        = "e2-standard-2"
#   spot_initial_node_count  = 0
#   spot_min_node_count      = 0
#   spot_max_node_count      = 2
#
#   # Security
#   enable_binary_authorization = false
#
#   # Monitoring
#   enable_managed_prometheus = false
#
#   # Maintenance
#   release_channel = "RAPID"
#
#   # Labels
#   labels = local.common_labels
# }

# Cloud SQL (PostgreSQL) Module
# module "cloud_sql" {
#   source = "../../modules/cloud-sql"
#
#   project_id  = var.project_id
#   region      = var.region
#   environment = local.environment
#
#   instance_name = "cortex-dc-dev-db"
#   database_name = "cortex"
#
#   # Tier (db-f1-micro for dev, db-custom-X-YYYY for prod)
#   tier = "db-custom-2-7680" # 2 vCPU, 7.5GB RAM
#
#   # Disk
#   disk_size = 50
#   disk_type = "PD_SSD"
#
#   # Backups
#   backup_enabled     = true
#   backup_start_time  = "03:00"
#   point_in_time_recovery = false
#
#   # High availability
#   availability_type = "ZONAL" # REGIONAL for prod
#
#   # Network
#   private_network = module.vpc_network.network_id
#
#   # Flags
#   database_flags = [
#     {
#       name  = "max_connections"
#       value = "100"
#     }
#   ]
# }

# Artifact Registry Module
# module "artifact_registry" {
#   source = "../../modules/artifact-registry"
#
#   project_id  = var.project_id
#   region      = var.region
#   environment = local.environment
#
#   repository_id = "cortex-dc-images"
#   description   = "Docker images for Cortex DC"
#   format        = "DOCKER"
# }

# Secret Manager Module
# module "secret_manager" {
#   source = "../../modules/secret-manager"
#
#   project_id  = var.project_id
#   environment = local.environment
#
#   secrets = {
#     database-password = {
#       description = "PostgreSQL database password"
#     }
#     keycloak-admin-password = {
#       description = "Keycloak admin password"
#     }
#     jwt-secret = {
#       description = "JWT signing secret"
#     }
#     openai-api-key = {
#       description = "OpenAI API key"
#     }
#   }
# }

# Outputs
# output "cluster_endpoint" {
#   description = "GKE cluster endpoint"
#   value       = module.gke_cluster.cluster_endpoint
#   sensitive   = true
# }
#
# output "cluster_name" {
#   description = "GKE cluster name"
#   value       = module.gke_cluster.cluster_name
# }
#
# output "database_connection_name" {
#   description = "Cloud SQL connection name"
#   value       = module.cloud_sql.connection_name
# }
#
# output "artifact_registry_url" {
#   description = "Artifact Registry URL"
#   value       = module.artifact_registry.repository_url
# }
