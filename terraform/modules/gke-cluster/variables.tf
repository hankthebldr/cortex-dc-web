# GKE Cluster Module Variables

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
}

variable "region" {
  description = "The region to deploy the cluster"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

# Networking
variable "network_id" {
  description = "The VPC network ID"
  type        = string
}

variable "network_name" {
  description = "The VPC network name"
  type        = string
}

variable "subnet_id" {
  description = "The subnet ID for the cluster"
  type        = string
}

variable "pods_range_name" {
  description = "The name of the secondary range for pods"
  type        = string
  default     = "pods"
}

variable "services_range_name" {
  description = "The name of the secondary range for services"
  type        = string
  default     = "services"
}

# Node Pool Configuration
variable "machine_type" {
  description = "The machine type for nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "disk_size_gb" {
  description = "Disk size in GB for nodes"
  type        = number
  default     = 100
}

variable "initial_node_count" {
  description = "Initial number of nodes per zone"
  type        = number
  default     = 1
}

variable "min_node_count" {
  description = "Minimum number of nodes per zone"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Maximum number of nodes per zone"
  type        = number
  default     = 5
}

variable "node_service_account" {
  description = "The service account for nodes"
  type        = string
  default     = ""
}

# Spot Nodes
variable "enable_spot_nodes" {
  description = "Enable spot (preemptible) node pool for cost savings"
  type        = bool
  default     = false
}

variable "spot_machine_type" {
  description = "Machine type for spot nodes"
  type        = string
  default     = "e2-standard-4"
}

variable "spot_initial_node_count" {
  description = "Initial number of spot nodes per zone"
  type        = number
  default     = 0
}

variable "spot_min_node_count" {
  description = "Minimum number of spot nodes per zone"
  type        = number
  default     = 0
}

variable "spot_max_node_count" {
  description = "Maximum number of spot nodes per zone"
  type        = number
  default     = 3
}

# Upgrade Settings
variable "max_surge" {
  description = "Maximum number of nodes that can be created during upgrade"
  type        = number
  default     = 1
}

variable "max_unavailable" {
  description = "Maximum number of nodes that can be unavailable during upgrade"
  type        = number
  default     = 0
}

# Security
variable "enable_binary_authorization" {
  description = "Enable Binary Authorization for container image security"
  type        = bool
  default     = false
}

# Monitoring
variable "enable_managed_prometheus" {
  description = "Enable managed Prometheus for monitoring"
  type        = bool
  default     = false
}

# Maintenance
variable "maintenance_start_time" {
  description = "Start time for maintenance window (HH:MM format)"
  type        = string
  default     = "03:00"
}

variable "release_channel" {
  description = "GKE release channel (RAPID, REGULAR, STABLE)"
  type        = string
  default     = "REGULAR"
}

# Labels and Taints
variable "labels" {
  description = "Additional labels for the cluster"
  type        = map(string)
  default     = {}
}

variable "node_labels" {
  description = "Labels for cluster nodes"
  type        = map(string)
  default     = {}
}

variable "node_taints" {
  description = "Taints for cluster nodes"
  type = list(object({
    key    = string
    value  = string
    effect = string
  }))
  default = []
}

variable "node_tags" {
  description = "Network tags for cluster nodes"
  type        = list(string)
  default     = []
}
