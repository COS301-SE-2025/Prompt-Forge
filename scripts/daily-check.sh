#!/bin/bash

# Run quick scan and send alerts
./scripts/run-dependency-check.sh

# Check for critical vulnerabilities
CRITICAL_COUNT=$(grep -c "severity.*Critical" dependency-check-reports/*/dependency-check-report.json || echo "0")

if [ "$CRITICAL_COUNT" -gt 0 ]; then
    echo "🚨 ALERT: $CRITICAL_COUNT critical vulnerabilities found!"
    # Send notification (Slack, email, etc.)
fi