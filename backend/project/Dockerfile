# Build stage
FROM openjdk:17-jdk-slim as builder

# Install necessary tools
RUN apt-get update && \
    apt-get install -y curl procps && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy build configuration files
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .
COPY mvnw.cmd .

# Make mvnw executable and download dependencies
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM openjdk:17-jre-slim

WORKDIR /app

# Copy the built application from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Add health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run the application with production-ready JVM settings
ENTRYPOINT ["java", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-XX:+HeapDumpOnOutOfMemoryError", \
            "-XX:HeapDumpPath=/heap-dump.hprof", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-jar", "app.jar"]