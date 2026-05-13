# Supplement Bridge - Azure Cloud Architecture

A cloud-based e-commerce platform connecting customers with trusted supplement providers. Built on Microsoft Azure with a full CI/CD pipeline.

## Live URLs

| Environment | Store | Admin |
| --- | --- | --- |
| Production | [supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net](https://supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net) | [/admin](https://supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net/admin) |
| Dev | [supplement-bridge-dev-hzdhdqg2dpgfcnfn.southeastasia-01.azurewebsites.net](https://supplement-bridge-dev-hzdhdqg2dpgfcnfn.southeastasia-01.azurewebsites.net) | [/admin](https://supplement-bridge-dev-hzdhdqg2dpgfcnfn.southeastasia-01.azurewebsites.net/admin) |

## Architecture

### What is Implemented

```
Users → Azure App Service (Express + React)
             ├── Backend: Node.js Express API
             └── Frontend: React (served by Express)
```

| Component | Status | Notes |
|---|---|---|
| Azure App Service | Deployed | Hosts both frontend and backend |
| Azure Pipelines CI/CD | Deployed | Auto-deploys on push to main |
| JWT Authentication | Deployed | Login, admin roles |
| Bicep IaC | Ready | Defines infra for new environments |
| Azure Key Vault | Bicep only | Not yet deployed |
| Azure SQL Database | Bicep only | Using in-memory mock data |
| Azure Storage Account | Bicep only | Not yet deployed |
| Azure Monitor / App Insights | Bicep only | Not yet deployed |

### Planned (from Architecture Diagram)

| Component | Purpose |
|---|---|
| Azure Front Door + WAF | Global load balancing, DDoS protection |
| Azure Static Web Apps | Separate frontend hosting |
| Azure API Management | API gateway, rate limiting |
| Azure Functions | Serverless background tasks |
| Azure Redis Cache | Session and data caching |
| Microsoft Entra ID | Enterprise authentication |
| Azure CDN | Static asset delivery |
| Azure Defender | Threat detection |

## CI/CD Pipeline

Using **Azure Pipelines** (not GitHub Actions as shown in the architecture diagram):

```
Push to main
    ↓
Build Stage
  - Install & build React frontend
  - Copy frontend into Express backend
  - Zip and publish artifact
    ↓
Deploy Dev
  - Deploy to supplement-bridge-dev App Service
    ↓
Deploy Prod
  - Deploy to supplement-bridge App Service
```

## Quick Start (Local Development)

### Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm start
```
App runs on `http://localhost:3000`

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Customer | demo@customer.com | Demo123! |
| Admin | admin@healthsupp.com | Admin123! |

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/products` | GET | Get all products (10 items with certifications, ratings) |
| `/api/products/:id` | GET | Get product by ID |
| `/api/search?q=query` | GET | Search products |
| `/api/quiz` | GET | Get health quiz questions (4 questions) |
| `/api/quiz/submit` | POST | Submit quiz and get recommendations with reasons |
| `/api/ingredients` | GET | Get ingredient education library (supports `?q=` search) |
| `/api/checkout` | POST | Process checkout |
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/orders/my` | GET | Get current user's orders |
| `/api/admin/stats` | GET | Admin dashboard stats |
| `/api/admin/products` | GET / POST | List or add products |
| `/api/admin/orders` | GET | List all orders |
| `/api/health` | GET | Health check |

## Features

**F1 — E-Commerce Storefront**
- Browse and search 10 curated supplement products
- Product detail view with star ratings, certifications (NSF/GMP), and ingredients
- Shopping cart and checkout with **card** or **PayNow** (mock)
- Order confirmation and order history
- Real-time admin dashboard (orders, products, inventory)

**F2 — Personalised Recommendation Engine**
- 4-question health quiz (health concern, age group, activity level, diet preference)
- Recommendations matched to quiz answers with a personalised reason per product
- No account required to take the quiz

**F3 — Product Comparison Tool**
- Add up to 3 products to compare from the browse page
- Side-by-side table: price, star rating, certifications, ingredients, best-for tags
- Floating compare bar — click "Compare Now" to open the comparison view

**F4 — Ingredient Education Library**
- Searchable library of 10 common supplement ingredients
- Each entry covers: what it is, common uses, dosage guidance, things to be aware of
- Written in plain, jargon-free language for everyday consumers
- Backed by `/api/ingredients` with full-text search support

**Platform**
- PWA — installable on mobile and desktop
- JWT authentication with admin roles

## Infrastructure as Code

Bicep templates in `infra/` can spin up a full environment with one command. All resources are **free tier only** — $0/month.

**Free resources deployed by Bicep:**
- App Service (Free F1)
- Application Insights (Free 5GB/month)
- Log Analytics (Free 5GB/month)
- Metric & log alerts (free — within 10 free alerts/subscription)

**Removed from Bicep (not needed / paid):**
- Azure SQL Database — using in-memory mock data
- Azure Key Vault — using App Service environment variables
- Azure Storage Account — not needed
- Auto-scaling — not available on Free F1
- Azure Static Web Apps — blocked by Azure for Students subscription

**Step 1: Create resource group**
```bash
az group create \
  --name supplement-bridge-uat-rg \
  --location southeastasia
```

**Step 2: Deploy**
```bash
az deployment group create \
  --resource-group supplement-bridge-uat-rg \
  --template-file infra/main.bicep \
  --parameters environmentName=uat
```

Supported environments: `dev`, `staging`, `uat`, `prod`

| Environment | Status | Resource Group |
|---|---|---|
| dev | Deployed | supplement-bridge-dev_group |
| prod | Deployed | supplement-bridge_group |
| uat | In progress | supplement-bridge-uat-rg |
| staging | Not created | — |

## Tech Stack

### Frontend
- **React 18** — UI library for building the user interface and component-based structure
- **Axios** — HTTP client for making API calls from the frontend to the Express backend
- **PWA (Service Worker)** — Makes the app installable on mobile/desktop and supports offline caching

### Backend
- **Node.js** — JavaScript runtime that powers the server
- **Express** — Web framework for handling API routes and serving the React frontend
- **JWT (JSON Web Token)** — Used for user authentication and session management
- **bcryptjs** — Encrypts and hashes passwords securely before storing them

### Cloud
- **Azure App Service** — Hosts the full application (frontend + backend) on Linux with Node 22 LTS
- **Azure Resource Groups** — Organizes resources per environment (dev, prod)
- **Azure Bicep** — Infrastructure as Code to define and provision Azure resources

### CI/CD
- **Azure Pipelines** — Automates build and deployment on every push to `main`
  - Installs dependencies
  - Builds React frontend
  - Packages backend + frontend together
  - Deploys to Dev then Prod App Service

### IaC (Infrastructure as Code)
- **Azure Bicep** — Declarative language to define Azure infrastructure
  - App Service, SQL Database, Key Vault, Storage Account, Monitoring all defined in code
  - Supports `dev`, `staging`, `uat`, `prod` environments
  - One command to spin up a full environment from scratch

## Availability & Failover

### Free Solutions (Currently Enabled)

| Solution | What it does |
|---|---|
| **Health Check** `/api/health` | Azure auto-restarts the app if it becomes unhealthy |
| **HTTPS Only** | Forces all traffic to HTTPS, blocks HTTP |
| **TLS 1.2 minimum** | Blocks older insecure connections |
| **HTTP/2.0** | Faster connections, better performance |
| **FTP Disabled** | Prevents insecure FTP access |
| **Request Tracing** | Logs failed requests for debugging |
| **HTTP Logging** | Logs all HTTP requests |
| **64-bit worker** | Better memory and performance |
| **No client affinity** | Better load distribution across instances |
| **Application Insights (Free 5GB/month)** | Performance and failure monitoring |
| **Log Analytics (Free 5GB/month)** | Centralized logs and query |
| **Metric Alerts (4 rules)** | CPU, HTTP 5xx, response time, exceptions |

### Paid Solutions (Planned for Production)

| Solution | Purpose | Estimated Cost |
|---|---|---|
| Deployment Slots | Zero downtime swaps (staging → prod) | ~$56/month (S1) |
| Auto-scaling | Scale out on high CPU | ~$195/month (P2v3) |
| Azure Front Door | Global load balancing + WAF + DDoS | ~$35/month |
| Azure Redis Cache | Session caching, reduce DB load | ~$16/month |
| Azure SQL geo-replication | Automatic failover to secondary region | ~$900+/month |
| Azure Traffic Manager | Route traffic to healthy region | ~$0.54/million queries |
| Always On | Prevents cold starts | ~$13/month (B1) |

### Enable Health Check on Existing App Services

```bash
# Dev
az webapp update \
  --resource-group supplement-bridge-dev_group \
  --name supplement-bridge-dev \
  --set siteConfig.healthCheckPath=/api/health

# Prod
az webapp update \
  --resource-group supplement-bridge_group \
  --name supplement-bridge \
  --set siteConfig.healthCheckPath=/api/health
```
