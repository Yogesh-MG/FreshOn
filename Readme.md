# Freshon OS 🍎🚜
**AI-Driven Farm-to-Consumer Ecommerce Platform**

Freshon OS is a modern, full-stack microservices platform designed to bridge the gap between local farmers and urban consumers. By eliminating middlemen and leveraging a "harvested today" logistics model, Freshon ensures that organic, pesticide-free produce reaches the customer's doorstep within minutes.

---

## 🚀 Quick Start (Docker)

Ensure you have Docker and Docker Compose installed, then run:

```bash
docker-compose up --build
```

- **Customer Web**: `http://localhost`
- **Mobile App (Dev)**: `http://localhost:1420`
- **Backend API**: `http://localhost/api`
- **Admin Dashboard**: `http://localhost/admin`

---

## 🏗️ Core Technology Stack

- **Backend**: Python 3.12, Django 5.0, Django Rest Framework (DRF)
- **Frontend (Web/App)**: React 18, Vite, TailwindCSS, Shadcn/UI
- **Mobile Wrapper**: Tauri (Desktop/Mobile)
- **Database**: PostgreSQL (Production-ready)
- **Infrastructure**: Docker, Nginx (Reverse Proxy), Docker Compose
- **Security**: HttpOnly Cookie-based JWT Authentication

---

## 📂 Documentation Suite

Dive deeper into the engineering of Freshon OS:

1. [**System Architecture**](./docs/SYSTEM_ARCHITECTURE.md) - Microservices, data flow, and proxy logic.
2. [**Features**](./docs/FEATURES.md) - Inventory management, atomic orders, and UI highlights.
3. [**API Documentation**](./docs/API_DOCS.md) - Endpoint references and authentication patterns.
4. [**Database Schema**](./docs/DATABASE_SCHEMA.md) - Relationships between Farmers, Products, and Orders.
5. [**Agent System**](./docs/AGENT_SYSTEM.md) - AI-driven inventory and customer assistance.
6. [**Case Study**](./docs/CASE_STUDY.md) - The engineering challenges and business impact.
7. [**Changelog**](./docs/CHANGELOG.md) - Track the evolution of the platform.
8. [**Location System**](./docs/LOCATION_SYSTEM.md) - GPS, Geocoding (Nominatim), and Service Area validation.

---

## 🛠️ Development

### Environment Variables
The app uses a `.env` system for configuration. See `app/.env` for frontend settings and `docker-compose.yml` for backend/database secrets.

### Seeding Data
To populate the system with initial farmers and products:
```bash
docker-compose exec backend python manage.py seed_data
```

---

## 🛠️ Development Commands

You can run these from the project root using `npm`:

| Command | Action |
| :--- | :--- |
| `npm run app:dev` | Launch Tauri App in dev mode |
| `npm run app:tauri` | Run Tauri CLI (e.g. `npm run app:tauri android dev`) |
| `npm run cargo` | Pass commands to Cargo (e.g. `npm run cargo -- build`) |
| `npm run backend:run` | Start only the backend service |
| `npm run db:run` | Start only the database |

---

## 📄 License
.Created with ❤️ for the farming community.
