# Cortex DC Web Operational Runbooks

This document complements the Cloud Monitoring dashboards and alerting policies stored in the `monitoring/` directory. It outlines how to respond to the two primary alert classes configured for the project.

## Firebase App Hosting (Cloud Run) latency

**Dashboards**
- Primary: [`monitoring/app_hosting_dashboard.json`](../../monitoring/app_hosting_dashboard.json)

**Alert policy**
- [`monitoring/alerts.yaml`](../../monitoring/alerts.yaml) → *App Hosting - Elevated latency*

**Triage checklist**
1. Confirm the alert on-call page and open the dashboard to verify whether latency is isolated to a single region or revision.
2. Check recent releases in Firebase App Hosting. Roll back or disable the most recent version if the regression started immediately after deployment.
3. Inspect Cloud Logging for `run.googleapis.com` entries with elevated response times or container restarts. Pay special attention to out-of-memory messages because they indicate the bundle needs tuning.
4. Validate upstream dependencies (Firestore, DataConnect, external APIs) are healthy. Latency spikes can cascade from downstream outages.
5. If the service is still degraded after 15 minutes, temporarily bump `maxInstances` in `apphosting.yaml`, redeploy, and escalate to the web platform lead.

**Remediation playbook**
- Reduce expensive synchronous work in API routes and rely on caching where possible.
- Profile slow components locally with `npm run lighthouse` to identify layout or rendering bottlenecks before redeploying.
- File a post-incident summary in the team retro doc once the alert auto-resolves.

## Cloud Functions error bursts

**Dashboards**
- Primary: [`monitoring/cloud_functions_dashboard.json`](../../monitoring/cloud_functions_dashboard.json)

**Alert policy**
- [`monitoring/alerts.yaml`](../../monitoring/alerts.yaml) → *Cloud Functions - Error rate*

**Triage checklist**
1. Use the dashboard to identify which function is throwing errors and confirm whether cold starts or throttling are also elevated.
2. Run the recommended Cloud Logging query for the function to inspect stack traces and identify the failing dependency.
3. Validate recent code changes in the `functions/` or `cortex-dc-web-functions/` packages. Revert or redeploy the prior version if the regression aligns with a release.
4. When error counts stay above five per minute for more than 15 minutes, disable the trigger (e.g., pause Pub/Sub subscriptions) to protect downstream services while you remediate.

**Remediation playbook**
- Ensure secrets referenced in `apphosting.yaml` and Cloud Functions environment variables exist and are up-to-date.
- Increase function memory/CPU if execution timeouts correlate with resource starvation.
- Add integration tests or Playwright coverage to reproduce the failure path before rolling forward.

## Updating dashboards and alerts

1. Modify the JSON/YAML artifacts under `monitoring/`.
2. Apply the changes with the Cloud Monitoring API or `gcloud monitoring dashboards policies` commands.
3. Commit the revisions so the repository stays the single source of truth.
4. Update this runbook when new alert types are introduced.
