# GKE Cluster Module
# Creates a production-ready GKE cluster with best practices

locals {
  cluster_name = var.cluster_name
  region       = var.region
  network_name = var.network_name
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = local.cluster_name
  location = local.region

  # Use regional cluster for HA (3 zones by default)
  network    = var.network_id
  subnetwork = var.subnet_id

  # Start with minimal config, use separate node pool
  remove_default_node_pool = true
  initial_node_count       = 1

  # Networking configuration
  networking_mode = "VPC_NATIVE"

  ip_allocation_policy {
    cluster_secondary_range_name  = var.pods_range_name
    services_secondary_range_name = var.services_range_name
  }

  # Network policy for pod-to-pod communication
  network_policy {
    enabled  = true
    provider = "PROVIDER_UNSPECIFIED" # Uses Calico
  }

  # Enable Workload Identity for secure GCP service access
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Security configuration
  master_auth {
    client_certificate_config {
      issue_client_certificate = false
    }
  }

  # Enable Binary Authorization for container image security
  enable_binary_authorization = var.enable_binary_authorization

  # Enable Shielded Nodes for node integrity
  enable_shielded_nodes = true

  # Logging and monitoring
  logging_service    = "logging.googleapis.com/kubernetes"
  monitoring_service = "monitoring.googleapis.com/kubernetes"

  # Monitoring configuration for GKE metrics
  monitoring_config {
    enable_components = ["SYSTEM_COMPONENTS", "WORKLOADS"]

    managed_prometheus {
      enabled = var.enable_managed_prometheus
    }
  }

  # Add-ons
  addons_config {
    http_load_balancing {
      disabled = false
    }

    horizontal_pod_autoscaling {
      disabled = false
    }

    network_policy_config {
      disabled = false
    }

    gcp_filestore_csi_driver_config {
      enabled = true
    }

    gce_persistent_disk_csi_driver_config {
      enabled = true
    }
  }

  # Maintenance window (3AM UTC = 8PM PST / 11PM EST)
  maintenance_policy {
    daily_maintenance_window {
      start_time = var.maintenance_start_time
    }
  }

  # Auto-upgrade and auto-repair for master
  release_channel {
    channel = var.release_channel # RAPID, REGULAR, or STABLE
  }

  # Resource labels
  resource_labels = merge(
    {
      environment = var.environment
      managed-by  = "terraform"
      project     = "cortex-dc"
    },
    var.labels
  )

  # Lifecycle
  lifecycle {
    ignore_changes = [
      node_pool,
      initial_node_count,
    ]
  }
}

# Primary Node Pool
resource "google_container_node_pool" "primary_nodes" {
  name       = "${local.cluster_name}-primary-pool"
  location   = local.region
  cluster    = google_container_cluster.primary.name
  node_count = var.initial_node_count

  # Autoscaling
  autoscaling {
    min_node_count = var.min_node_count
    max_node_count = var.max_node_count
  }

  # Node configuration
  node_config {
    machine_type = var.machine_type
    disk_size_gb = var.disk_size_gb
    disk_type    = "pd-ssd"

    # Service account with minimal permissions
    service_account = var.node_service_account
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    # Workload Identity
    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    # Shielded instance configuration
    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    # Node labels
    labels = merge(
      {
        environment = var.environment
        node-pool   = "primary"
      },
      var.node_labels
    )

    # Node taints (for workload scheduling)
    dynamic "taint" {
      for_each = var.node_taints
      content {
        key    = taint.value.key
        value  = taint.value.value
        effect = taint.value.effect
      }
    }

    # Network tags (for firewall rules)
    tags = concat(
      ["cortex-dc", var.environment],
      var.node_tags
    )

    # Metadata
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }

  # Node pool management
  management {
    auto_repair  = true
    auto_upgrade = true
  }

  # Upgrade settings
  upgrade_settings {
    max_surge       = var.max_surge
    max_unavailable = var.max_unavailable
  }
}

# Spot (Preemptible) Node Pool for cost optimization
resource "google_container_node_pool" "spot_nodes" {
  count = var.enable_spot_nodes ? 1 : 0

  name       = "${local.cluster_name}-spot-pool"
  location   = local.region
  cluster    = google_container_cluster.primary.name
  node_count = var.spot_initial_node_count

  autoscaling {
    min_node_count = var.spot_min_node_count
    max_node_count = var.spot_max_node_count
  }

  node_config {
    machine_type = var.spot_machine_type
    disk_size_gb = var.disk_size_gb
    disk_type    = "pd-standard"

    # Spot/Preemptible configuration
    spot = true

    service_account = var.node_service_account
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]

    workload_metadata_config {
      mode = "GKE_METADATA"
    }

    shielded_instance_config {
      enable_secure_boot          = true
      enable_integrity_monitoring = true
    }

    labels = {
      environment = var.environment
      node-pool   = "spot"
      spot        = "true"
    }

    # Taint spot nodes so only pods with toleration are scheduled here
    taint {
      key    = "cloud.google.com/gke-spot"
      value  = "true"
      effect = "NO_SCHEDULE"
    }

    tags = ["cortex-dc", var.environment, "spot"]

    metadata = {
      disable-legacy-endpoints = "true"
    }
  }

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  upgrade_settings {
    max_surge       = var.max_surge
    max_unavailable = var.max_unavailable
  }
}

# Outputs
output "cluster_id" {
  description = "The GKE cluster ID"
  value       = google_container_cluster.primary.id
}

output "cluster_name" {
  description = "The GKE cluster name"
  value       = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  description = "The GKE cluster endpoint"
  value       = google_container_cluster.primary.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "The GKE cluster CA certificate"
  value       = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "primary_node_pool_name" {
  description = "The primary node pool name"
  value       = google_container_node_pool.primary_nodes.name
}

output "spot_node_pool_name" {
  description = "The spot node pool name (if enabled)"
  value       = var.enable_spot_nodes ? google_container_node_pool.spot_nodes[0].name : null
}
