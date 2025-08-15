#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/dependency-check-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create reports directory
mkdir -p "$REPORT_DIR"

echo "🔍 Running OWASP Dependency Check for multi-tech stack..."

# 1. Scan Spring Boot backend
echo "📦 Scanning Spring Boot backend..."
if [ -f "$PROJECT_ROOT/backend/pom.xml" ]; then
    cd "$PROJECT_ROOT/backend"
    mvn org.owasp:dependency-check-maven:check \
        -Dowasp.dependency.check.outputDirectory="$REPORT_DIR/backend-$TIMESTAMP"
elif [ -f "$PROJECT_ROOT/backend/build.gradle" ]; then
    cd "$PROJECT_ROOT/backend"
    ./gradlew dependencyCheckAnalyze
    cp -r build/reports/dependency-check "$REPORT_DIR/backend-$TIMESTAMP"
fi

# 2. Scan React frontend
echo "🌐 Scanning React frontend..."
if [ -f "$PROJECT_ROOT/frontend/package.json" ]; then
    dependency-check \
        --project "Frontend-React" \
        --scan "$PROJECT_ROOT/frontend" \
        --out "$REPORT_DIR/frontend-$TIMESTAMP" \
        --format ALL \
        --enableRetired \
        --nodeAuditSkipDevDependencies
fi

# 3. Scan Python services
echo "🐍 Scanning Python services..."
if [ -f "$PROJECT_ROOT/python-services/requirements.txt" ] || [ -f "$PROJECT_ROOT/python-services/Pipfile" ]; then
    dependency-check \
        --project "Python-Services" \
        --scan "$PROJECT_ROOT/python-services" \
        --out "$REPORT_DIR/python-$TIMESTAMP" \
        --format ALL \
        --enableExperimental
fi

# 4. Combined scan (optional)
echo "🔄 Running combined scan..."
dependency-check \
    --project "Full-Stack-App" \
    --scan "$PROJECT_ROOT/frontend" \
    --scan "$PROJECT_ROOT/backend/project/src" \
    
    --out "$REPORT_DIR/combined-$TIMESTAMP" \
    --format ALL \
    --enableRetired \
    --enableExperimental \
    --suppression "$PROJECT_ROOT/owasp-suppressions.xml"

echo "✅ Dependency check completed!"
echo "📊 Reports available in: $REPORT_DIR"

# Open HTML report (optional)
if command -v open &> /dev/null; then
    open "$REPORT_DIR/combined-$TIMESTAMP/dependency-check-report.html"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$REPORT_DIR/combined-$TIMESTAMP/dependency-check-report.html"
fi