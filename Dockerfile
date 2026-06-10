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
COPY src ./src
# Copy the compiled React assets from the frontend build stage
COPY --from=frontend-build /app/src/main/resources/static /app/src/main/resources/static
RUN mvn clean package -DskipTests

# --- Stage 3: Run Application ---
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"]
