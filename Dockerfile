# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-build
WORKDIR /app/src/main/resources/static/frontend
COPY src/main/resources/static/frontend/package*.json ./
RUN npm ci --silent
COPY src/main/resources/static/frontend/ ./
RUN npm run build

# --- Stage 2: Build Spring Boot Backend ---
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY pom.xml ./
# Cache maven dependencies
RUN mvn dependency:go-offline -q
COPY src ./src
# Copy the compiled React assets from the frontend build stage
COPY --from=frontend-build /app/src/main/resources/static /app/src/main/resources/static
RUN mvn clean package -DskipTests -q

# --- Stage 3: Run Application ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Create uploads directory for file storage
RUN mkdir -p /app/uploads
COPY --from=backend-build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
# Render injects PORT env var automatically; Spring Boot reads it via ${PORT:8000}
EXPOSE 8000
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]
