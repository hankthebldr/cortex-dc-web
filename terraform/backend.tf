# Terraform Backend Configuration
# Store state in Google Cloud Storage for collaboration and state locking

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Remote state in GCS
  # Uncomment and configure after creating the bucket manually
  # backend "gcs" {
  #   bucket  = "cortex-dc-terraform-state"
  #   prefix  = "env/dev"  # Change per environment
  # }
}
