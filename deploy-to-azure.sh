#!/usr/bin/env bash
# deploy-to-azure.sh — creates (or recreates) the buggy-webapp on Azure App Service from GitHub
# Usage: ./deploy-to-azure.sh
# Prerequisites: az CLI logged in, gh CLI logged in (or GITHUB_TOKEN set), git remote "origin" pointing to GitHub

set -euo pipefail

# ── Config (edit these) ────────────────────────────────────────────────────────
RESOURCE_GROUP="buggy-webapp-rg"
APP_NAME="buggy-webapp-demo"          # must be globally unique on azurewebsites.net
LOCATION="eastus"
PLAN_NAME="buggy-webapp-plan"
NODE_RUNTIME="NODE:20-lts"
BRANCH="main"
# ──────────────────────────────────────────────────────────────────────────────

# Resolve GitHub repo from git remote (override by setting GITHUB_REPO env var)
GITHUB_REPO="${GITHUB_REPO:-$(git -C "$(dirname "$0")" remote get-url origin 2>/dev/null | sed 's|.*github.com[:/]\(.*\)\.git|\1|;s|.*github.com[:/]\(.*\)|\1|')}"

if [[ -z "$GITHUB_REPO" ]]; then
  echo "ERROR: Could not detect GitHub repo. Set GITHUB_REPO=owner/repo and re-run."
  exit 1
fi

GITHUB_URL="https://github.com/${GITHUB_REPO}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Deploying buggy-webapp to Azure App Service"
echo "  Repo   : ${GITHUB_REPO}"
echo "  Branch : ${BRANCH}"
echo "  App    : https://${APP_NAME}.azurewebsites.net"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Ensure logged in
echo ""
echo "▶ Checking Azure login..."
az account show --query "name" -o tsv

# 2. Resource group
echo ""
echo "▶ Creating resource group (skip if exists)..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

# 3. App Service Plan (free F1 tier)
echo ""
echo "▶ Creating App Service Plan (F1 free)..."
az appservice plan create \
  --name "$PLAN_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --sku F1 \
  --is-linux \
  --output none

# 4. Web App
echo ""
echo "▶ Creating Web App..."
az webapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$PLAN_NAME" \
  --runtime "$NODE_RUNTIME" \
  --output none

# 5. Set startup command (node server.js)
echo ""
echo "▶ Configuring startup command..."
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --startup-file "node server.js" \
  --output none

# 6. App setting: NODE_ENV
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings NODE_ENV=production \
  --output none

# 7. Get a GitHub token (gh CLI preferred, fallback to env var)
if command -v gh &>/dev/null && gh auth status &>/dev/null 2>&1; then
  GITHUB_TOKEN=$(gh auth token)
else
  GITHUB_TOKEN="${GITHUB_TOKEN:-}"
fi

if [[ -z "$GITHUB_TOKEN" ]]; then
  echo ""
  echo "⚠  No GitHub token found. Configuring manual (sync-only) deployment."
  echo "   You can trigger deploys later with: az webapp deployment source sync ..."
  az webapp deployment source config \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --repo-url "$GITHUB_URL" \
    --branch "$BRANCH" \
    --manual-integration \
    --output none
else
  echo ""
  echo "▶ Connecting GitHub repo for continuous deployment..."
  az webapp deployment source config \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --repo-url "$GITHUB_URL" \
    --branch "$BRANCH" \
    --git-token "$GITHUB_TOKEN" \
    --output none
fi

# 8. Trigger a sync so the first deploy happens now
echo ""
echo "▶ Triggering initial deployment sync..."
az webapp deployment source sync \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --output none || echo "   (sync queued — may take a minute)"

# 9. Done
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Done!"
echo "  URL    : https://${APP_NAME}.azurewebsites.net"
echo "  Health : https://${APP_NAME}.azurewebsites.net/health"
echo "  Bug    : https://${APP_NAME}.azurewebsites.net/api/products"
echo ""
echo "  To redeploy after a git push:"
echo "    az webapp deployment source sync \\"
echo "      --name $APP_NAME \\"
echo "      --resource-group $RESOURCE_GROUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
