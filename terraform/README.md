# Terraform Infrastructure

This directory contains Terraform configurations for provisioning the Cortex DC infrastructure on Google Cloud Platform.

## Structure

```
terraform/
├── backend.tf              # Terraform backend configuration
├── modules/                # Reusable Terraform modules
│   ├── gke-cluster/       # GKE cluster with node pools
│   ├── vpc-network/       # VPC and subnets
│   ├── cloud-sql/         # PostgreSQL database
│   ├── artifact-registry/ # Container registry
│   ├── secret-manager/    # Secrets management
│   └── monitoring/        # Monitoring stack
└── environments/          # Environment-specific configurations
    ├── dev/
    ├── staging/
    └── production/
```

## Prerequisites

1. **Install Terraform**: `brew install terraform` (macOS) or download from [terraform.io](https://www.terraform.io/downloads)
2. **Install gcloud CLI**: `brew install --cask google-cloud-sdk`
3. **Authenticate**: `gcloud auth application-default login`
4. **Set project**: `gcloud config set project cortex-dc-portal`

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform/environments/dev
terraform init
```

### 2. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings
```

### 3. Plan Infrastructure

```bash
terraform plan
```

### 4. Apply Infrastructure

```bash
terraform apply
```

### 5. Get Outputs

```bash
terraform output
```

## Modules

### GKE Cluster Module

Creates a production-ready GKE cluster with:
- Regional cluster (high availability)
- Autoscaling node pools
- Workload Identity
- Shielded nodes
- Binary Authorization support
- Spot (preemptible) nodes for cost savings

**Usage:**

```hcl
module "gke_cluster" {
  source = "../../modules/gke-cluster"

  project_id   = var.project_id
  cluster_name = "cortex-dc-prod"
  region       = "us-central1"
  environment  = "production"

  network_id   = module.vpc_network.network_id
  subnet_id    = module.vpc_network.subnets[0].id

  machine_type       = "e2-standard-4"
  min_node_count     = 3
  max_node_count     = 10
  enable_spot_nodes  = false
}
```

### VPC Network Module

Creates VPC with:
- Custom subnets
- Secondary IP ranges for GKE pods and services
- Cloud NAT for egress
- Firewall rules

### Cloud SQL Module

Creates PostgreSQL instance with:
- Configurable tier and disk size
- Automated backups
- Point-in-time recovery
- High availability (optional)
- Private IP

### Artifact Registry Module

Creates Docker image registry for storing container images.

### Secret Manager Module

Creates and manages secrets for:
- Database passwords
- API keys
- JWT secrets
- OAuth credentials

## Environments

### Development

**Purpose**: Local development and testing

**Configuration**:
- Small node pool (1-3 nodes)
- Spot nodes enabled
- Minimal redundancy
- No binary authorization
- RAPID release channel

**Costs**: ~$100-200/month

### Staging

**Purpose**: Pre-production testing

**Configuration**:
- Medium node pool (2-5 nodes)
- Mix of regular and spot nodes
- Backups enabled
- REGULAR release channel

**Costs**: ~$300-500/month

### Production

**Purpose**: Live production workloads

**Configuration**:
- Large node pool (3-10 nodes)
- No spot nodes
- Regional cluster for HA
- Full backups and PITR
- Binary authorization
- STABLE release channel

**Costs**: ~$800-1500/month

## State Management

Terraform state is stored remotely in Google Cloud Storage.

### Create State Bucket

```bash
gsutil mb -p cortex-dc-portal -l us-central1 gs://cortex-dc-terraform-state
gsutil versioning set on gs://cortex-dc-terraform-state
```

### Enable State Backend

Uncomment the backend configuration in `backend.tf`:

```hcl
backend "gcs" {
  bucket  = "cortex-dc-terraform-state"
  prefix  = "env/dev"  # Change per environment
}
```

Then re-initialize:

```bash
terraform init -migrate-state
```

## Workspaces

Alternative to separate directories for environments:

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new production

# Switch workspace
terraform workspace select dev

# List workspaces
terraform workspace list
```

## Best Practices

### 1. Always Use `terraform plan` First

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### 2. Use Variables for Everything

Never hardcode values. Use `variables.tf` and `terraform.tfvars`.

### 3. Tag All Resources

Add labels for cost tracking and organization:

```hcl
labels = {
  environment = "production"
  project     = "cortex-dc"
  managed-by  = "terraform"
  team        = "platform"
}
```

### 4. Enable State Locking

GCS backend includes state locking automatically.

### 5. Use Modules for Reusability

Create modules for common patterns and reuse across environments.

### 6. Protect Production

Add lifecycle rules to prevent accidental deletion:

```hcl
lifecycle {
  prevent_destroy = true
}
```

### 7. Separate Sensitive Outputs

```hcl
output "database_password" {
  value     = random_password.db_password.result
  sensitive = true
}
```

## Common Operations

### Get GKE Credentials

After creating the cluster:

```bash
gcloud container clusters get-credentials cortex-dc-dev \
  --region us-central1 \
  --project cortex-dc-portal
```

### Connect to Cloud SQL

```bash
gcloud sql connect cortex-dc-dev-db \
  --user=postgres \
  --quiet
```

### View Secret

```bash
gcloud secrets versions access latest \
  --secret="database-password" \
  --project=cortex-dc-portal
```

### Destroy Infrastructure

```bash
terraform destroy
```

**WARNING**: This will delete all resources. Use with caution!

## Troubleshooting

### "Error creating Network: googleapi: Error 409"

Network already exists. Import it:

```bash
terraform import module.vpc_network.google_compute_network.vpc cortex-dc-dev-vpc
```

### "insufficient regional quota"

Request quota increase in GCP Console:
- Compute Engine API → Quotas
- Increase CPUs, IP addresses, or persistent disk

### State Lock Conflicts

If state is locked and stuck:

```bash
terraform force-unlock LOCK_ID
```

## Cost Optimization

### 1. Use Spot Nodes

Enable spot nodes for non-production workloads:

```hcl
enable_spot_nodes = true
spot_max_node_count = 5
```

**Savings**: ~60-70% on compute costs

### 2. Rightsize Node Machines

Use appropriate machine types:
- Dev: `e2-standard-2` or `e2-standard-4`
- Prod: `e2-standard-4` or `n2-standard-4`

### 3. Enable Autoscaling

Let GKE scale nodes based on demand:

```hcl
min_node_count = 1
max_node_count = 10
```

### 4. Use Committed Use Discounts

For production, commit to 1-year or 3-year usage for 37-55% discount.

### 5. Schedule Non-Production Downtime

Stop dev/staging clusters outside business hours:

```bash
# Stop cluster
gcloud container clusters resize cortex-dc-dev \
  --num-nodes=0 \
  --region=us-central1

# Start cluster
gcloud container clusters resize cortex-dc-dev \
  --num-nodes=1 \
  --region=us-central1
```

## CI/CD Integration

Terraform can be automated in CI/CD pipelines.

### GitHub Actions Example

```yaml
- name: Terraform Plan
  run: |
    cd terraform/environments/production
    terraform init
    terraform plan -out=tfplan

- name: Terraform Apply
  if: github.ref == 'refs/heads/main'
  run: |
    cd terraform/environments/production
    terraform apply tfplan
```

## Security

### 1. Use Workload Identity

Preferred over service account keys:

```hcl
workload_identity_config {
  workload_pool = "${var.project_id}.svc.id.goog"
}
```

### 2. Encrypt Secrets

Use Secret Manager instead of environment variables:

```hcl
resource "google_secret_manager_secret" "db_password" {
  secret_id = "database-password"

  replication {
    automatic = true
  }
}
```

### 3. Private GKE Cluster

Enable private nodes and master:

```hcl
private_cluster_config {
  enable_private_nodes    = true
  enable_private_endpoint = false
  master_ipv4_cidr_block = "172.16.0.0/28"
}
```

### 4. Binary Authorization

Enforce signed container images:

```hcl
enable_binary_authorization = true
```

## Next Steps

1. **Uncomment module blocks** in `environments/dev/main.tf`
2. **Create terraform.tfvars** with your project settings
3. **Run `terraform plan`** to preview changes
4. **Run `terraform apply`** to create infrastructure
5. **Configure kubectl** to access the cluster
6. **Deploy application** using Helm or kubectl

## Resources

- [Terraform GCP Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)

## Support

For issues or questions:
1. Check [Terraform GCP Provider Issues](https://github.com/hashicorp/terraform-provider-google/issues)
2. Review [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
3. Consult team documentation in `ARCHITECTURE_K8S_READY.md`
