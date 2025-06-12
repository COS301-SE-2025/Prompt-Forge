<h1 align="center">5iveOps - Prompt Forge</h1>

<p align="center">
  <img src="./assests/Logo.png" alt="Prompt Forge Logo" width="700"/>
</p>

# 5iveOps - Prompt Forge

![GitHub Actions Workflow Status](https://github.com/COS301-SE-2025/Prompt-Forge/actions/workflows/main.yml/badge.svg)

Prompt Forge is a full-featured web-based platform designed to help individuals and organizations craft, test, and evaluate high-performing prompts for AI systems. It empowers users to explore prompt effectiveness, compare results across different models, and collaborate in a structured and ethical environment.

---

## 🔗 Project Links

- 🔖 [SRS Document](https://drive.google.com/file/d/1MzNRdNrnuJSb2zFWhGzk9HNghr1E9Z6h/view?usp=drive_link)
- 📋 [GitHub Project Board](https://github.com/COS301-SE-2025/Prompt-Forge/projects)

---

## 📑 Demo 1 Documentation Links

| Document                  | Link                                                    | Last Updated |
|--------------------------|--------------------------------------------------------|--------------|
| Use Case Diagram         | [View Diagram](https://drive.google.com/file/d/1eoIGPYuoWCs3tRzsBlW02MM4sN4x7rvT/view?usp=drive_link)     | May 2025     |
| SRS Document             | [View SRS](https://drive.google.com/file/d/1ojft7UjbRuU96RTMqqTKClgqYOL5ZKWm/view?usp=drive_link)                               | May 2025     |
| Functional Requirements  | [View Requirements](https://drive.google.com/file/d/1UBtGIk0gNEKziwiy4G1PO9w5LVT4bgFg/view?usp=drive_link)     | May 2025     |
| Domain Model            | [View Model](https://drive.google.com/file/d/1V0wv8kGaGNVB6bygEwAQ0wgOQsAP6vz1/view?usp=drive_link)            | May 2025     |
| Architectural Diagram   | [View Architecture](https://drive.google.com/file/d/1dEjR2zyeBPEoBtFn4JxvvIUPm-gGjR4y/view?usp=drive_link)      | May 2025     |
| Demo 1 Video  | [Watch Video](https://drive.google.com/file/d/1lekgm25uiSeLMxurxhPEMP1yBw_nFJR-/view?usp=sharing)      | May 2025     |

---

## 👨‍💻 Team Members

<div align="center">

| Name                | Student Number | LinkedIn                                      | GitHub                                |
|---------------------|----------------|-----------------------------------------------|----------------------------------------|
| Katlego Mositi      | 22658395       | [LinkedIn](http://www.linkedin.com/in/katlegomositi)     | [GitHub](https://github.com/katlegomositi)     |
| Paballo Diyase      | 23528142       | [LinkedIn](https://www.linkedin.com/in/paballo-diyase-486895318/) | [GitHub](https://github.com/mainmee)            |
| Boitumelo Mtsatse   | 23684365       | [LinkedIn](https://www.linkedin.com/in/boitumelo-mtsatse-44832a33a/) | [GitHub](https://github.com/BoitumeloMtsatse)   |
| Navendran Naidoo    | 21512494       | [LinkedIn](https://www.linkedin.com/in/navendran-naidoo-0bb732221) | [GitHub](https://github.com/naven1309)          |
| Rethabile Bore      | 23772141       | [LinkedIn](https://www.linkedin.com/in/rethabilebore)     | [GitHub](https://github.com/riri-bygit)         |

</div>


<p align="center">
  <img src="./assests/5iveOps.jpg" alt="5iveOps Team" width="500"/>
</p>

---

## 🧪 Demo 2 Goals (Due: 27 June 2025)

The second demo will showcase a functional, integrated system that allows users to test prompts and interact with a production-ready marketplace.

### ✅ Planned Demo 2 Features

- 🧠 **Prompt Testing Ground**
  - Multi-model evaluation
  - LLM integration
  - Real-time testing

- 🛒 **Fully Functional Prompt Marketplace**
  - Buying and selling features
  - Advanced filtering system
  - User reviews and ratings

- 🔁 **Frontend–Backend Integration**
  - Live prompt evaluation
  - Real-time data updates
  - Seamless user experience

- 📊 **Prompt Performance Metrics**
  - Usage statistics
  - Rating analytics
  - Performance comparisons

---

## 🏗️ Repository Structure & GitFlow

We use a **GitFlow** branching strategy to organize our development:

- **Main** – Production-ready code.
- **Dev** – Major development changes and integration.
- **Feature** – Temporary branches for developing new features.
- **Bugfix** – For fixing non-critical bugs.
- **Hotfix** – For addressing critical production issues that need immediate fixing.

**Pros of this approach:**
- Provides a clear separation between stable releases, ongoing development, and feature work.
- Ensures a well-structured workflow for large projects and planned releases.
- Supports parallel development of multiple features without affecting stability.
- Feature branches enable focused development efforts, reducing the risk of introducing bugs in the main codebase.

---

## 🧱 Tech Stack

| Layer         | Technology                         |
|---------------|-------------------------------------|
| Frontend      | React with Tailwind CSS            |
| Backend       | Spring Boot                        |
| Database      | PostgreSQL                         |
| LLMs          | Hugging Face (Sentiment Analysis)  |
| Auth          | Mock Auth / Alternative Auth       |
| Versioning    | Git + GitFlow                      |
| Deployment    | AWS Free Tier / Local Dev          |
| Testing       | JUnit              |

---

## 🌳 Branching Strategy (GitFlow)

- `main` – Stable production code  
- `dev` – Active development branch  
- `feature/*` – New features (e.g. `feature/auth`)  
- `release/*` – Pre-demo branches  
- `hotfix/*` – Emergency fixes  

---


## 🔍 Repository Quality

| Item                    | Status     |
|-------------------------|------------|
| CI/CD Pipeline          | ![GitHub Actions Workflow Status](https://github.com/COS301-SE-2025/Prompt-Forge/actions/workflows/main.yml/badge.svg) |
| Unit Tests (Backend)    | ✅ Completed|
| Issue Tracking          | ✅ Enabled |
| GitHub Project Board    | ✅ Linked  |

---

## ⏱️ Meeting Schedule

- 🧑‍🤝‍🧑 Internal Standups: Daily (scheduled on Google Meet)
- 💼 Industry Client Meetings: Bi-weekly via Google Meet/Discord
- 🧾 Meeting minutes logged on ClickUp

---

## 📋 Demo 2 Checklist (Due: 27 June 2025)

- [ ] **Core Implementation**
  - [ ] 3+ New fully integrated components
  - [ ] Complete backend-to-frontend integration
  - [ ] Functional requirements satisfied
  - [ ] Landing page implemented and live
  - [ ] In-product help menu functioning

- [ ] **Testing & Quality**
  - [ ] Automated unit tests passing
  - [ ] Integration tests complete
  - [ ] CI/CD pipeline running tests
  - [ ] 5 quantified quality requirements
  - [ ] GitFlow structure maintained

- [ ] **Documentation Updates**
  - [ ] SRS Document v2
    - [ ] Revised user stories
    - [ ] Updated functional requirements
    - [ ] New domain model
    - [ ] Enhanced use case diagram
  - [ ] Architecture Documentation
    - [ ] System constraints
    - [ ] Technology justifications

- [ ] **Demo Preparation**
  - [ ] Quality & architecture overview (3min)
  - [ ] Feature demonstrations (5min)
  - [ ] Testing walkthrough (3min)
  - [ ] Q&A prep (2min)
  - [ ] Speaking roles assigned
  - [ ] Slides prepared

- [ ] **Final Steps**
  - [ ] Code merged to main
  - [ ] Mentor grading submitted
  - [ ] Repository cleaned
  - [ ] Demo slot booked

---

## 📬 Contact

For questions or feedback, reach us at: [5iveOps.Capstone@gmail.com](mailto:5iveOps.Capstone@gmail.com)

---

> © 2025 Team 5iveOps – COS 301 – University of Pretoria
