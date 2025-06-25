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