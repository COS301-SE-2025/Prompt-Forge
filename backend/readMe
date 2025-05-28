
# PromptForge Backend

Welcome to the backend of *PromptForge* — an advanced platform for prompt engineering, testing, and collaboration. This service is built using *Spring Boot* to ensure a modular, scalable, and production-ready backend architecture.

---

## 🚀 Why Spring Boot?

We chose *Spring Boot* for the following reasons:

- *Rapid Development*: Auto-configuration, starter dependencies, and embedded server support simplify setup and boost productivity.
- *Scalability*: Ideal for building scalable REST APIs with a layered architecture.
- *Robust Ecosystem*: Seamless integration with security (Spring Security), data persistence (Spring Data JPA), and documentation tools (Springdoc / Swagger).
- *Community Support*: Backed by a vast community and regular updates, Spring Boot ensures long-term reliability.
- *Testing Support*: Excellent support for writing unit and integration tests.

---

## 📁 Folder Structure

promptforge-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── promptforge/
│   │   │           ├── PromptForgeApplication.java
│   │   │           ├── config/           # Security, CORS, app configurations
│   │   │           ├── controller/       # REST controllers
│   │   │           ├── dto/              # Data Transfer Objects
│   │   │           ├── model/            # JPA entities
│   │   │           ├── repository/       # Spring Data JPA repositories
│   │   │           ├── service/          # Business logic layer
│   │   │           └── exception/        # Custom exceptions and handlers
│   │   └── resources/
│   │       ├── application.yml           # App configuration
│   │       └── static/                   # Static files (if needed)
├── pom.xml                               # Maven dependencies and plugins
└── README.md                             # Project overview and documentation

## 🧰 Requirements
- Java 17+
- Maven 3.8+

## 🛠 How to Compile and Run
### 1. Clone the Repository
  git clone https://github.com/your-org/promptforge-backend.git
  cd promptforge/backend/demo
### 2. Build the Application
  mvn clean install
  -This will compile the project, run tests, and package the application.
### 3. Run the Application
mvn spring-boot:run
  The application will start on http://localhost:8080 by default.

Alternatively, you can run the JAR:
  java -jar target/promptforge-backend-0.0.1-SNAPSHOT.jar

## 📄 API Documentation
After running the application, access interactive API docs via:

  http://localhost:8080/swagger-ui.html
  or (for Springdoc):
  http://localhost:8080/swagger-ui/index.html

## 🧪 Running Tests
mvn test
This command runs all unit and integration tests.