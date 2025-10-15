#!/bin/bash
# Setup Kubernetes Secrets Helper Script
# This script helps create Kubernetes secrets for the functions microservice

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$SCRIPT_DIR/../k8s"
NAMESPACE="cortex-dc"

echo "🔐 Kubernetes Secrets Setup Helper"
echo "===================================="
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: kubectl is not installed"
    echo "   Please install kubectl: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Error: Not connected to a Kubernetes cluster"
    echo "   Please configure kubectl to connect to your cluster"
    echo ""
    echo "   For GKE:"
    echo "   gcloud container clusters get-credentials cortex-dc-cluster --region us-central1"
    exit 1
fi

echo "✅ Connected to cluster: $(kubectl config current-context)"
echo ""

# Create namespace if it doesn't exist
echo "📦 Checking namespace..."
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo "   Creating namespace: $NAMESPACE"
    kubectl apply -f "$K8S_DIR/namespace.yaml"
else
    echo "   Namespace already exists: $NAMESPACE"
fi
echo ""

# Function to prompt for secret value
prompt_secret() {
    local var_name=$1
    local description=$2
    local default_value=$3
    local value

    echo "🔑 $description"
    if [ -n "$default_value" ]; then
        read -p "   Enter value (default: $default_value): " value
        value=${value:-$default_value}
    else
        read -p "   Enter value: " value
    fi

    if [ -z "$value" ]; then
        echo "   ⚠️  Warning: Empty value provided"
    fi

    echo "$value"
}

# Check if secrets already exist
if kubectl get secret functions-secrets -n "$NAMESPACE" &> /dev/null; then
    echo "⚠️  Secret 'functions-secrets' already exists"
    read -p "   Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete secret functions-secrets -n "$NAMESPACE"
        echo "   Deleted existing secret"
    else
        echo "   Keeping existing secret. Use 'kubectl edit secret functions-secrets -n $NAMESPACE' to modify"
        exit 0
    fi
fi

echo ""
echo "📝 Please provide the following configuration values:"
echo "   (Press Enter to use default values where applicable)"
echo ""

# Collect secret values
GCP_PROJECT_ID=$(prompt_secret "GCP_PROJECT_ID" "GCP Project ID" "cortex-dc-project")
FIREBASE_PROJECT_ID=$(prompt_secret "FIREBASE_PROJECT_ID" "Firebase Project ID" "$GCP_PROJECT_ID")
FIREBASE_DATABASE_URL=$(prompt_secret "FIREBASE_DATABASE_URL" "Firebase Database URL" "https://$FIREBASE_PROJECT_ID.firebaseio.com")
GENAI_API_KEY=$(prompt_secret "GENAI_API_KEY" "Google Generative AI API Key" "")

echo ""
echo "🔨 Creating Kubernetes secret..."

# Create the secret
kubectl create secret generic functions-secrets \
  --from-literal=gcp-project-id="$GCP_PROJECT_ID" \
  --from-literal=firebase-project-id="$FIREBASE_PROJECT_ID" \
  --from-literal=firebase-database-url="$FIREBASE_DATABASE_URL" \
  --from-literal=genai-api-key="$GENAI_API_KEY" \
  -n "$NAMESPACE"

echo "✅ Secret 'functions-secrets' created successfully"
echo ""

# Handle service account key
echo "🔑 Service Account Key Setup"
echo "   The functions microservice requires a GCP service account key"
echo ""

if kubectl get secret functions-gcp-credentials -n "$NAMESPACE" &> /dev/null; then
    echo "✅ Secret 'functions-gcp-credentials' already exists"
    read -p "   Do you want to update it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete secret functions-gcp-credentials -n "$NAMESPACE"
    else
        echo "   Keeping existing service account key"
        echo ""
        echo "✅ Secrets setup complete!"
        exit 0
    fi
fi

read -p "   Enter path to service account JSON key file: " SA_KEY_PATH

if [ ! -f "$SA_KEY_PATH" ]; then
    echo "   ⚠️  Warning: File not found: $SA_KEY_PATH"
    echo "   You can create the secret later with:"
    echo "   kubectl create secret generic functions-gcp-credentials \\"
    echo "     --from-file=key.json=/path/to/service-account-key.json \\"
    echo "     -n $NAMESPACE"
else
    kubectl create secret generic functions-gcp-credentials \
      --from-file=key.json="$SA_KEY_PATH" \
      -n "$NAMESPACE"
    echo "✅ Secret 'functions-gcp-credentials' created successfully"
fi

echo ""
echo "✅ Secrets setup complete!"
echo ""
echo "📋 Summary:"
kubectl get secrets -n "$NAMESPACE" | grep functions
echo ""
echo "🚀 Next steps:"
echo "   1. Review secrets: kubectl get secret functions-secrets -n $NAMESPACE -o yaml"
echo "   2. Deploy application: cd functions && pnpm run k8s:apply"
echo "   3. Check status: pnpm run k8s:status"
