Prompt Forge Coding Standards
1. Introduction
This document defines the coding standards for the Prompt Forge project, which uses React for the frontend, Spring Boot (Java) for the backend, and PostgreSQL for data storage. All contributors must follow these guidelines to ensure code uniformity, clarity, flexibility, reliability, and efficiency.

Prompt-Forge/
│
├── backend/
│   └── project/
│       └── src/
│           └── main/
│               └── java/
│                   └── com/
│                       └── fiveOps/
│                           └── promptforge/
│                               ├── analytics/
│                               ├── authentication/
│                               │   ├── controller/
│                               │   ├── dto/
│                               │   └── service/
│                               ├── dashboard/
│                               ├── databaseConfig/
│                               └── prompts/
│               └── resources/
│                   ├── application.properties
│                   └── ...
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.tsx
│       └── ...
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── ...
│
└── README.md

3. Coding Conventions
3.1 General Principles
Write clean, readable, and maintainable code.
Keep functions and classes small and focused.
Use meaningful names for files, variables, and functions.
Document complex logic and all public APIs.
Write tests for all business logic.
3.2 Frontend (React + TypeScript)
File & Folder Structure
Use PascalCase for React components (e.g., ProfileSettingsPage.tsx).
Use camelCase for variables and functions.
Group related files in folders (e.g., components/, pages/, services/).
Code Style
Use TypeScript for all code.
Use functional components and React Hooks.
Use ES6+ features (arrow functions, destructuring, etc.).
Use Prettier and ESLint for formatting and linting.
Indentation: 2 spaces.
Max line length: 100 characters.
Use single quotes ' for strings.
Always use semicolons.
Use CSS Modules or styled-components for styling.
Example ESLint/Prettier Config
.eslintrc.js

.prettierrc

3.3 Backend (Spring Boot, Java)
Package Structure
Use com.fiveOps.promptforge.<feature> for packages.
Organize by feature, then by layer (controller, service, dto, model, etc.).
Example: com.fiveOps.promptforge.authentication.controller.AuthController
Naming Conventions
Classes: PascalCase (e.g., AuthController)
Methods/Variables: camelCase
Constants: UPPER_SNAKE_CASE
DTOs: Suffix with Request or Response as appropriate.
Code Style
Indentation: 4 spaces.
Max line length: 120 characters.
Use Javadoc for all public classes and methods.
Use @RestController for REST endpoints.
Use @Service for business logic.
Use @Repository for data access.
Use constructor injection for dependencies.
Handle exceptions with @ControllerAdvice where possible.
Never log sensitive data.
Use Lombok for boilerplate reduction (if allowed).
Example Checkstyle Config
checkstyle.xml (snippet)

3.4 Database (PostgreSQL)
Use snake_case for table and column names.
Use singular table names (e.g., user, prompt).
Use primary keys named id.
Use foreign keys with the format <referenced_table>_id.
Write migrations using Flyway or Liquibase.
Never store plain text passwords (use bcrypt or similar).
4. API Design
Use RESTful conventions.
Use plural nouns for endpoints: /api/users, /api/prompts.
Use proper HTTP status codes.
Validate all input (backend and frontend).
Return errors in a consistent JSON format.
5. Testing
Frontend: Use Jest and React Testing Library.
Backend: Use JUnit and Mockito.
Place tests in a __tests__ or test folder, or alongside the code as *Test.java or *.test.tsx.
All business logic and endpoints must have tests.
6. Configuration & Tooling
Store secrets in .env (frontend) and application.properties (backend). Never commit secrets.
Use Husky for pre-commit hooks (lint, format, test).
Use Docker for local development if possible.
7. Git & Branching
Use feature branches: feature/<short-description>
Use descriptive commit messages (imperative mood).
Pull requests must be reviewed before merging.
8. Documentation
Keep README.md up to date.
Document all endpoints in OpenAPI/Swagger (Springdoc).
Use Javadoc for backend and TSDoc for frontend.
9. Security
Sanitize all user input.
Use parameterized queries/JPA to prevent SQL injection.
Never log or return sensitive data.
Use HTTPS in production.
10. Efficiency & Reliability
Avoid unnecessary computations and database calls.
Use indexes on frequently queried fields.
Cache where appropriate.
Write modular, reusable code.
Monitor and log errors in production.
All contributors must read and follow this document. For questions, contact the Prompt Forge maintainers.

