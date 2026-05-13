# Supplement Bridge — Project Proposal

---

## 1. Project Overview

Supplement Bridge is a cloud-hosted e-commerce Progressive Web App (PWA) that connects consumers with trusted healthcare supplement providers. The platform allows users to browse products, complete a personalized health quiz, receive tailored supplement recommendations, and complete purchases — all from a single web application installable on mobile and desktop devices.

The application is built on a React frontend served by a Node.js/Express backend, hosted on Microsoft Azure App Service, with automated CI/CD via Azure Pipelines.

**Live Environments**

| Environment | Store | Admin |
| --- | --- | --- |
| Production | [supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net](https://supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net) | [/admin](https://supplement-bridge-a8anhmbfcydufcat.southeastasia-01.azurewebsites.net/admin) |
| Dev | [supplement-bridge-dev-hzdhdqg2dpgfcnfn.southeastasia-01.azurewebsites.net](https://supplement-bridge-dev-hzdhdqg2dpgfcnfn.southeastasia-01.azurewebsites.net) | [/admin](https://supplement-bridge-dev-hzdhdqg2dpgfcnfn.southeastasia-01.azurewebsites.net/admin) |

---

## 1.1 Platform Features (Implemented)

| Feature | Description | Status |
| --- | --- | --- |
| **F1 — E-Commerce Storefront** | 10 curated products with certifications (NSF/GMP), star ratings, and ingredient lists. Card and PayNow (mock) checkout. Real-time admin inventory dashboard. | Done |
| **F2 — Personalised Recommendation Engine** | 4-question quiz (health concern, age group, activity, diet). Each recommendation shows a tailored reason. No account required. | Done |
| **F3 — Product Comparison Tool** | Select up to 3 products; side-by-side table with price, rating, certifications, ingredients, and tags. Floating compare bar on browse page. | Done |
| **F4 — Ingredient Education Library** | Searchable library of 10 ingredients. Each entry covers what it is, common uses, dosage guidance, and cautions — written in plain language. | Done |

---

## 2. Purpose / Goals

**Primary Purpose**
Provide a modern, accessible digital storefront for healthcare supplement retail, with a focus on personalised product discovery, ingredient transparency, and mobile usability.

**Goals**

| # | Goal | Measure of Success | Status |
| --- | --- | --- | --- |
| 1 | Launch a functional e-commerce storefront | Users can browse, search, and purchase products end-to-end | Done |
| 2 | Personalise product recommendations | 4-question quiz drives relevant suggestions with reasons | Done |
| 3 | Enable product comparison | Side-by-side comparison of up to 3 products with certifications and ratings | Done |
| 4 | Provide ingredient education | Searchable library of 10 ingredients with plain-language guidance | Done |
| 5 | Enable mobile-first access via PWA | App is installable on iOS and Android without an app store | Done |
| 6 | Automate deployment pipeline | Push to `main` deploys to Dev then Prod with no manual steps | Done |
| 7 | Establish scalable cloud infrastructure | Bicep IaC supports `dev`, `staging`, `uat`, `prod` from one command | Done |
| 8 | Provide admin visibility and control | Admin dashboard covers orders, products, and inventory | Done |

---

## 3. Obstacles

| Obstacle | Impact | Mitigation |
| --- | --- | --- |
| Azure for Students subscription restrictions | Azure Static Web Apps blocked; auto-scaling unavailable on Free F1 | Use App Service to serve both frontend and backend from a single host |
| Free tier cold starts | App sleeps after 20 min inactivity; first request takes 30–60 s | Upgrade to B1 Basic tier (Always On) when moving to full production |
| In-memory data persistence | All product and order data resets on app restart | Migrate to Azure SQL Database when budget allows |
| No Key Vault in current deployment | Secrets stored as App Service environment variables | Bicep template for Key Vault is ready; deploy when subscription tier permits |
| PWA icon assets missing | Service worker failed to install; PWA was not installable | Resolved — replaced missing PNGs with SVG icon; SW cache bumped to v2 |
| CI/CD agent dependency | Pipeline relies on a self-hosted Windows agent on the Default pool | Document agent setup; consider Microsoft-hosted agents as fallback |

---

## 4. Industry / Market Risk Factors

| Risk | Likelihood | Impact | Notes |
| --- | --- | --- | --- |
| Regulatory compliance (TGA, FDA labelling) | Medium | High | Supplement claims and product descriptions must comply with local health authority rules |
| Competitor platforms (iHerb, Chemist Warehouse) | High | Medium | Differentiate through personalisation (health quiz) and UX rather than price alone |
| Consumer trust in online health products | Medium | High | Display certifications, ingredient transparency, and secure checkout prominently |
| Data privacy obligations (PDPA, GDPR) | Medium | High | User PII and order data must be handled per applicable data protection legislation |
| Supply chain / stock availability | Medium | Medium | Low-stock alerts in admin dashboard; real-time inventory sync needed before scaling |
| Payment gateway fraud | Low–Medium | High | Current mock checkout has no fraud controls; integrate Stripe Radar or equivalent before go-live |
| Platform availability (Azure region outage) | Low | High | Single-region deployment; Azure Front Door + geo-replication planned for production |

---

## 5. Budgetary Assumptions

**Current state — Free Tier ($0/month)**

| Resource | Tier | Cost |
| --- | --- | --- |
| Azure App Service (x2 — Dev + Prod) | Free F1 | $0 |
| Application Insights | Free 5 GB/month | $0 |
| Log Analytics | Free 5 GB/month | $0 |
| Azure Pipelines | Free tier (1 parallel job) | $0 |
| **Total** | | **$0/month** |

**Production-ready estimate (Basic/Standard tier)**

| Resource | Tier | Est. Cost/Month |
| --- | --- | --- |
| App Service — Prod | B1 Basic (Always On) | ~$13 |
| App Service — Dev | F1 Free | $0 |
| Azure SQL Database | Basic DTU | ~$5 |
| Azure Key Vault | Standard | ~$5 |
| Azure Front Door + WAF | Standard | ~$35 |
| Azure Redis Cache | C0 Basic | ~$16 |
| Application Insights | Pay-as-you-go | ~$5 |
| **Total** | | **~$79/month** |

**Assumptions**
- Traffic volume is low-to-medium (< 10,000 monthly active users) at launch
- No auto-scaling or geo-replication required in Phase 1
- Payment processing fees (Stripe ~2.9% + $0.30/transaction) not included above
- Azure for Students subscription will be upgraded or replaced before production launch

---

## 6. Hardware Compatibility

The application is cloud-hosted and browser-based. No proprietary hardware is required.

**End-user device requirements**

| Device | Minimum Requirement |
| --- | --- |
| Desktop | Any modern browser (Chrome 90+, Edge 90+, Firefox 88+, Safari 14+) |
| Mobile (Android) | Chrome 90+ or any Chromium-based browser; Android 8.0+ |
| Mobile (iOS) | Safari 14.5+ (iOS 14.5+); PWA install supported via Add to Home Screen |
| Tablet | Same as mobile; responsive layout adapts to screen size |

**PWA install support**
The app is installable as a PWA on supported browsers. iOS requires Safari; the Add to Home Screen prompt is manual. Android Chrome shows an automatic install banner.

**Server-side (Azure)**
- Azure App Service Linux, Node 22 LTS
- No on-premises hardware dependency
- Region: Southeast Asia (Singapore)

---

## 7. Software Employed

**Frontend**

| Software | Version | Purpose |
| --- | --- | --- |
| React | 18.2 | UI component library |
| Axios | 1.6 | HTTP client for API calls |
| react-scripts (CRA) | 5.0.1 | Build toolchain |
| Service Worker (custom) | — | PWA offline caching |

**Backend**

| Software | Version | Purpose |
| --- | --- | --- |
| Node.js | 22 LTS | JavaScript runtime |
| Express | 4.18 | Web framework and API routing |
| jsonwebtoken | 9.0 | JWT authentication |
| bcryptjs | 2.4 | Password hashing |
| cors | 2.8 | Cross-origin request handling |

**Infrastructure & DevOps**

| Software | Purpose |
| --- | --- |
| Azure App Service (Linux) | Application hosting |
| Azure Pipelines | CI/CD — build, test, deploy |
| Azure Bicep | Infrastructure as Code |
| Azure Application Insights | Performance and error monitoring |
| Azure Log Analytics | Centralised log storage and query |

---

## 8. Timeline / Milestones (Hybrid)

> Hybrid delivery: core infrastructure and backend delivered in sprints; frontend features and integrations delivered incrementally.

| Phase | Milestone | Target | Status |
| --- | --- | --- | --- |
| **Phase 1 — Foundation** | Repository, CI/CD pipeline, App Service provisioned | Complete | Done |
| | React frontend scaffold + Express backend running | Complete | Done |
| | JWT authentication (login, register, admin roles) | Complete | Done |
| | Product browse, search, and product detail view | Complete | Done |
| **Phase 2 — Commerce** | 10-product catalogue with certifications, ratings | Complete | Done |
| | 4-question health quiz + personalised recommendations with reasons | Complete | Done |
| | Shopping cart and checkout (card + PayNow mock) | Complete | Done |
| | Order confirmation and order history | Complete | Done |
| | Admin dashboard (orders, products, inventory) | Complete | Done |
| **Phase 3 — Discovery** | Product comparison tool (F3) | Complete | Done |
| | Ingredient education library with search (F4) | Complete | Done |
| | PWA manifest, service worker, installability | Complete | Done |
| | Bicep IaC for multi-environment provisioning | Complete | Done |
| | UAT environment deployment | In progress | — |
| **Phase 4 — Production Hardening** | Migrate from mock data to Azure SQL Database | Planned | — |
| | Azure Key Vault for secrets management | Planned | — |
| | Payment gateway integration (Stripe + PayNow live) | Planned | — |
| | Azure Front Door + WAF | Planned | — |
| | Microsoft Entra ID (enterprise auth) | Planned | — |
| | Staging environment and deployment slots | Planned | — |
| **Phase 5 — Scale** | Auto-scaling, Redis cache, CDN | Future | — |
| | Azure Defender, threat detection | Future | — |
| | Geo-replication and multi-region failover | Future | — |

---

## 9. Deployment / Distribution

**Deployment model:** Cloud-hosted SaaS — no client-side installation required beyond optional PWA bookmark.

**CI/CD Pipeline**

Every push to the `main` branch triggers an automated pipeline:

```
Push to main
    ↓
Build Stage
  - npm install (frontend)
  - npm run build (React → static bundle)
  - Copy frontend build into backend/public
  - Zip artifact (excluding node_modules)
    ↓
Deploy Dev
  - Deploy zip to supplement-bridge-dev App Service
    ↓
Deploy Prod
  - Deploy zip to supplement-bridge App Service
```

**Environments**

| Environment | Purpose | Promotion |
| --- | --- | --- |
| Dev | Integration testing, feature verification | Auto-deploy on push to `main` |
| UAT | User acceptance testing, stakeholder review | Manual trigger via Bicep |
| Staging | Pre-production mirror (planned) | Deployment slot swap |
| Production | Live end-user traffic | Auto-promote after Dev success |

**Distribution to end users**
- Web: direct URL access, no installation required
- PWA: users on Chrome (Android) are prompted to install; iOS users add via Safari Share menu
- No app store submission required

---

## 10. Testing

| Test Type | Scope | Tooling | Status |
| --- | --- | --- | --- |
| Unit tests | Backend API route logic | `npm test` (Jest) | Scaffolded — to be expanded |
| Integration tests | API endpoints with real request/response | Manual via REST client | In progress |
| End-to-end tests | Full user journey (browse → quiz → checkout) | Planned (Playwright) | Not started |
| Smoke tests | Health check endpoint post-deploy | `/api/health` in pipeline | Implemented |
| Manual UAT | Stakeholder walkthrough of all flows | Test credentials provided | Each release |
| PWA install test | Install prompt and offline behaviour | Browser DevTools + real device | Per release |

**Test credentials**

| Role | Email | Password |
| --- | --- | --- |
| Customer | demo@customer.com | Demo123! |
| Admin | admin@healthsupp.com | Admin123! |

---

## 11. Documentation

| Document | Location | Status |
| --- | --- | --- |
| Architecture overview and live URLs | `README.md` | Current |
| Project proposal (this document) | `README-PROPOSAL.md` | Current |
| API endpoint reference | `README.md` — API Endpoints section | Current |
| Infrastructure provisioning guide | `README.md` — IaC section | Current |
| Bicep template source | `infra/` | Current |
| Admin dashboard usage guide | Planned | Not started |
| Runbook (incident response) | Planned | Not started |
| Data model / schema reference | Planned (pending SQL migration) | Not started |

---

## 12. Support

**Current support model:** developer-managed (single team).

| Tier | Scope | Channel | Response Time |
| --- | --- | --- | --- |
| L1 — Availability | App down, pipeline failures, Azure service issues | Azure Portal alerts, Log Analytics | Immediate (alert-triggered) |
| L2 — Application bugs | Functional defects, UI issues, API errors | Azure DevOps work items | Next business day |
| L3 — Infrastructure changes | New environments, scaling, architecture changes | Planned sprint work | Per roadmap |

**Monitoring (active)**
- Azure Application Insights — performance, exceptions, dependency failures
- Azure Log Analytics — HTTP logs, request tracing
- Metric alerts — CPU > 80%, HTTP 5xx spikes, response time > 5 s, exception rate

**Health check endpoint:** `GET /api/health` — Azure App Service auto-restarts the app if this returns unhealthy.

---

## 13. Training

| Audience | Topic | Format | When |
| --- | --- | --- | --- |
| Admin users | Admin dashboard — managing orders, products, inventory | Walkthrough session + written guide | Before go-live |
| Admin users | Using demo credentials and testing flows | Self-service with test account | Onboarding |
| Operations / DevOps | Azure DevOps pipeline management, re-running builds | Documented runbook | Before go-live |
| Operations / DevOps | Azure Portal monitoring — App Insights, Log Analytics | Walkthrough session | Before go-live |
| Development team | Local development setup (frontend + backend) | `README.md` Quick Start section | On joining |
| Development team | Bicep IaC — provisioning new environments | `README.md` IaC section | On joining |

---

## 14. Cost Structure (Preliminary)

### Phase 1 — Current (Free Tier)

| Item | Type | Monthly Cost |
| --- | --- | --- |
| Azure App Service — Dev (F1) | Infrastructure | $0 |
| Azure App Service — Prod (F1) | Infrastructure | $0 |
| Azure Pipelines (free tier) | CI/CD | $0 |
| Application Insights (≤ 5 GB) | Monitoring | $0 |
| Log Analytics (≤ 5 GB) | Monitoring | $0 |
| Domain / SSL | Hosting | $0 (Azure subdomain) |
| **Phase 1 Total** | | **$0/month** |

### Phase 2 — Production Hardening (Estimated)

| Item | Type | Monthly Cost |
| --- | --- | --- |
| App Service — Prod (B1, Always On) | Infrastructure | ~$13 |
| Azure SQL Database (Basic) | Data | ~$5 |
| Azure Key Vault (Standard) | Security | ~$5 |
| Azure Application Insights (overage) | Monitoring | ~$5 |
| Stripe payment processing (2.9% + $0.30/txn) | Transaction | Variable |
| **Phase 2 Total** | | **~$28/month + transaction fees** |

### Phase 3 — Scale (Estimated)

| Item | Type | Monthly Cost |
| --- | --- | --- |
| Azure Front Door + WAF (Standard) | Network / Security | ~$35 |
| Azure Redis Cache (C0) | Performance | ~$16 |
| App Service — Prod (S1, deployment slots) | Infrastructure | ~$56 |
| Azure CDN | Delivery | ~$5 |
| **Phase 3 Total (incremental)** | | **~$112/month** |

**Notes**
- All costs are estimates in USD based on Southeast Asia (Singapore) region pricing as of 2025
- Azure for Students credits may offset Phase 1 and Phase 2 costs
- Transaction fees scale with sales volume and are not capped
- Geo-replication and multi-region failover (Phase 5) would add $900+/month and are out of scope until commercial scale is reached
