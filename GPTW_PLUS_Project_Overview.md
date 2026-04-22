# GPTW PLUS+ Platform — Full Project Overview for Cursor AI

> **Purpose of this document:** A complete reference for Cursor AI to understand the GPTW PLUS+ SaaS platform so it can generate accurate `.NET 8` backend code and `Angular` frontend code aligned with the real project requirements, architecture, roles, modules, and data flows.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Team & Stakeholders](#2-team--stakeholders)
3. [Technology Stack](#3-technology-stack)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Platform Modules & Sitemap](#5-platform-modules--sitemap)
6. [Functional Requirements by Module](#6-functional-requirements-by-module)
   - 6.1 [Global / Shared Features](#61-global--shared-features)
   - 6.2 [Administrator Functions](#62-administrator-functions)
   - 6.3 [Module: Activate](#63-module-activate)
   - 6.4 [Module: Elevate](#64-module-elevate)
   - 6.5 [Module: Empower (Phase 2)](#65-module-empower-phase-2)
7. [Data Integrations](#7-data-integrations)
8. [AI Architecture & Solution Approach](#8-ai-architecture--solution-approach)
9. [Backend Architecture (.NET 8)](#9-backend-architecture-net-8)
10. [Frontend Architecture (React → Angular for Cursor)](#10-frontend-architecture)
11. [Database Schema Overview](#11-database-schema-overview)
12. [Security Model](#12-security-model)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Phase Roadmap](#14-phase-roadmap)
15. [Third-Party Integrations](#15-third-party-integrations)
16. [Cost Estimates](#16-cost-estimates)
17. [SDLC & Testing Strategy](#17-sdlc--testing-strategy)
18. [Key Business Rules & Edge Cases](#18-key-business-rules--edge-cases)
19. [Cursor Code Generation Guidelines](#19-cursor-code-generation-guidelines)

---

## 1. Project Summary

**Product Name:** PLUS+
**Client:** Great Place to Work (GPTW)
**Development Partner:** Vention

PLUS+ is a **multi-tenant, role-based SaaS platform** that supports companies *after* achieving GPTW certification. It operates within the GPTW ecosystem and helps certified organisations:

| Pillar | What it does |
|---|---|
| **Activate** | Turn certification into on-brand social assets and employer-branding content |
| **Elevate** | Convert Trust Index survey data into executive-ready strategic insights and decks |
| **Empower** | Provide training paths, coaching, and learning journeys for managers and employees |

**Core business problems solved:**
- Post-certification drop-off (clients don't know what to do after certification)
- SMB affordability gap (smaller clients need lower-cost guided support)
- Data-to-action friction (manual, 6–8 hour deck creation by consultants)
- Brand activation overhead (inconsistent, slow asset creation)

**Key business targets:**
- Lift renewals by **5%**
- Reduce deck production time by **70%+**
- 80% of pilot clients producing 4+ social assets within 30 days
- CSAT ≥ 4.5/5, NPS ≥ 40 by end of Phase 1
- Support **400–600 companies** at scale

---

## 2. Team & Stakeholders

| Name | Role |
|---|---|
| Glyn Roberts | Vention CTO of Digital Solutions |
| Oleg Kirasov | Vention Project Manager |
| Fazilat Allayarova | Vention Business Analyst |
| Amal Yakubov | Vention UX/UI Engineer |
| Abduvokhid Abdukhakimov | Vention Lead Engineer |
| Makhmudjon Sodikov | Vention AI Engineer |
| Claire Knights | GPTW Chief Growth Officer |
| Andy Shanks | GPTW Product Manager |
| Eduard Berndt | GPTW Head of Business Intelligence |
| Kelly Ross | GPTW Head of Growth and Recognition |

---

## 3. Technology Stack

> **Note for Cursor:** The original spec uses React for frontend. These guidelines are for generating `.NET 8` backend skills and `Angular` frontend skills as requested.

### Backend
| Layer | Technology |
|---|---|
| Language & Framework | **C# / .NET 8, ASP.NET Core Web API** |
| Hosting | **Azure App Service** |
| Background Jobs | **Azure Functions** (event-driven, serverless) |
| Database | **Azure Database for PostgreSQL Flexible Server** |
| File Storage | **Azure Blob Storage** |
| Authentication | **Microsoft Entra ID (Azure AD)**, OAuth 2.0 + OIDC |
| AI Engine | **Azure OpenAI** (GPT-4 / GPT-4o family) |
| Secrets | **Azure Key Vault** |
| Monitoring | **Azure Application Insights**, Log Analytics |
| CI/CD | **Azure DevOps Pipelines** |
| Email | **Azure Communication Services** |

### Frontend (for Cursor Angular skills)
| Layer | Technology |
|---|---|
| Framework | **Angular (TypeScript)** |
| Styling | Responsive, desktop-first |
| Communication | HTTPS REST APIs, JWT Bearer tokens |
| Auth | Microsoft Entra ID PKCE / MSAL |
| State Management | Angular services / NgRx (if needed) |

### AI Stack
| Purpose | Service |
|---|---|
| Text/Content Generation | Azure OpenAI GPT-4 (HIGH restriction — GPTW tenant only) |
| Image Generation | DALL-E 3 via Azure OpenAI (LOW restriction) |
| Video Generation | OpenAI Sora / Kling AI (LOW restriction, external) |
| Template Overlay | Fabric.js |
| AI Search (Phase 2) | Azure AI Search (vector + keyword hybrid) |
| Embedding Model | text-embedding-3-large (3072 dims) |

---

## 4. User Roles & Permissions

```
Platform Roles (RBAC):
├── GPTW Admin
│   ├── Full cross-tenant visibility
│   ├── Company management (add/edit/delete)
│   ├── GPTW staff management
│   ├── GPTW Analytics (Phase 2)
│   └── Emerging content (Phase 3)
│
├── GPTW Consultant / Talent Activation Specialist
│   ├── Assigned to specific clients (but can see all)
│   ├── Controls benchmark selection
│   ├── Approves AI-generated Elevate outputs
│   └── Full Elevate workflow
│
├── Company Admin (HR / Comms Lead)
│   ├── Full access to own tenant
│   ├── Team management (invite users, assign roles/modules)
│   ├── Package management
│   ├── Diagnostic Centre
│   └── Navigator (Phase 2)
│
└── Company Staff
    ├── Marketing / Employer Brand → Activate (create, approve, publish)
    ├── HR Leaders / HRBPs → Read access to published assets & decks
    └── Division Managers → Read access to training materials
```

### Permission Matrix

| Feature | GPTW Admin | GPTW Consultant | Company Admin | Company Staff |
|---|---|---|---|---|
| Company Management | ✅ Full | ❌ | ❌ | ❌ |
| GPTW Staff Management | ✅ Full | ❌ | ❌ | ❌ |
| Team Management | ✅ (all companies) | ❌ | ✅ (own company) | ❌ |
| Diagnostic Centre | ✅ | ❌ | ✅ | ❌ |
| Activate | ✅ | ✅ | ✅ | ✅ (if enabled) |
| Elevate | ✅ | ✅ (consultant-led) | ✅ (view) | ✅ (if enabled) |
| Empower | ✅ | ✅ | ✅ | ✅ (if enabled) |
| GPTW Analytics | ✅ | ❌ | ❌ | ❌ |
| Emerging | ✅ | ❌ | ✅ (read) | ✅ (read) |

### Role-based Dashboard Modules

**GPTW Admin Dashboard:**
- Company Management, GPTW Staff Management, Emerging, GPTW Analytics, Activate, Elevate, Empower

**Company Admin Dashboard:**
- Team Management, Navigator, Packages, Diagnostic Centre, Activate, Elevate, Empower

**GPTW Consultant + Company Staff:**
- Activate, Elevate, Empower (greyed out if not granted access)

---

## 5. Platform Modules & Sitemap

```
PLUS+ Platform
├── Authentication (login, forgot password)
├── Header (universal — logo, user name/role, profile button)
│
├── Dashboard (role-based)
│
├── Profile Management (all users)
│
├── [GPTW Admin only]
│   ├── Company Management
│   ├── GPTW Staff Management
│   ├── GPTW Analytics (Phase 2)
│   └── Emerging (Phase 3)
│
├── [Company Admin only]
│   ├── Team Management
│   ├── Navigator (Phase 2)
│   ├── Packages
│   └── Diagnostic Centre
│
├── Module: Activate
│   ├── Social Posts Dashboard
│   ├── Create / Edit / View Social Post
│   ├── Activate+ (AI highlights & recommendations)
│   └── Brand Centre
│       ├── Brand Kit
│       ├── Brand Voice
│       ├── Asset Library
│       └── Certifications & Recognitions
│
├── Module: Elevate
│   ├── Diagnostic Centre (Phase 1: input data)
│   ├── Insights Viewer (Phase 2: top-level Trust Index)
│   └── Consultant Analysis Workflow (Phase 2)
│       ├── Phase 1: Summary of Results
│       ├── Phase 2: Strengths & Opportunities
│       ├── Phase 3: Engagement Drivers
│       ├── Phase 4: Demographic Heatmap
│       ├── Phase 5: Hierarchical Analysis
│       └── Phase 6: Recommendations
│
└── Module: Empower (Phase 2)
    ├── Dashboard (Focus Areas, Courses, Coaching)
    └── Self-Progress Tracker
```

---

## 6. Functional Requirements by Module

### 6.1 Global / Shared Features

#### Tenant Model
- Each client company operates in a **logically isolated tenant**
- GPTW admins have cross-tenant visibility for support/governance
- All data queries must include tenant isolation filters

#### Authentication & Session
```
- Email + password login (no SSO in Phase 1)
- Forgotten password via custom email link
- JWT tokens, short-lived, validated via Entra ID JWKS
- Idle session timeouts
- Re-authentication for sensitive actions
```

#### Header (Universal)
```
- Left: PLUS+ logo
- Right:
  - Logged-in user's name + role
  - Avatar button (first character of first name)
  - Dropdown: Edit Profile | Log out
```

#### Profile Management (all users)
Editable fields:
- Full name
- Email address
- Password
- Photo (some roles)

> Role and access level are NOT editable by the user themselves.

#### Audit Logging
Every significant action must be logged with: `datetime`, `user_id`, `ip_address`

Logged events include:
- Login / Logout
- Profile edits
- Team management changes
- Package & credit management
- Activate post state changes
- Elevate activities
- Empower activities
- Emerging post reads/writes
- Data integration events (Emprising ingestion progress/errors)
- AI API calls

#### Language
- English (UK) only in Phase 1

#### Platform Access
- Web browser only (desktop-optimised)
- No mobile app required for Phase 1 or Phase 2
- Responsive web application (PWA-ready architecture)

---

### 6.2 Administrator Functions

#### 2.1 Company Management (GPTW Admin only)

**Add Company:**
```json
{
  "companyName": "string",
  "clientId": "string",
  "crmId": "string (HubSpot Account ID)"
}
```

**Company detail view includes:**
- Company details (edit)
- Company Users (add/edit/delete — Company Admin users only; company users added by Company Admin)
- Company Packages:
  - Activate AI: On/Off
  - Elevate: On/Off
  - Empower: Default Package, user count, credits (courses/coaching/focus groups/interviews/workshops)

**Delete behaviour:**
- Soft delete first (data retained, login disabled)
- Hard delete only possible after soft delete (for GDPR compliance, years later)

**Phase 2:** HubSpot CRM integration will auto-sync company records. Manual control remains.

---

#### 2.2 GPTW Staff Management (GPTW Admin only)

**Add Staff:**
```json
{
  "fullName": "string",
  "email": "string",
  "image": "file (for Empower)",
  "role": "GPTWAdmin | Consultant"
}
```

**Staff list features:** search (text), edit, soft delete, assigned companies list

**Assigned Companies:** add/remove with text filter

---

#### 2.3 GPTW Analytics (Phase 2 — GPTW Admin only)

Dashboard showing platform activity:
- Filter by Client ID
- Total activities (Logins, Activate posts, Empower completions)
- Latest activity list (integration progress, AI generation calls)

---

#### 2.5 Team Management (Company Admin + GPTW Admin)

**Add User:**
```json
{
  "fullName": "string",
  "email": "string",
  "divisions": ["array from Emprising data"],
  "access": {
    "activate": true,
    "signoffCapability": true,
    "elevate": true,
    "empower": false
  }
}
```

Email invite sent automatically on user creation.

---

#### 2.6 Diagnostic Centre (Company Admin + GPTW Admin)

Input areas for Elevate analysis enrichment:

**GPTW Data Import section:**
- Shows latest import overview (survey name, country, employees, responses, sector, certified, certified date, website)
- Additional company fields: careers URL, LinkedIn URL, employee hashtags

**EVP & Talent Attraction:**
- Existing EVP (Yes/No + text or upload)
- EVP recommendations requested (Yes/No)
- Strategic Pillars, ERGs, Awareness days, Talent attraction goals, Competitor URLs

**Other Context:**
- Major transformation underway (text)
- Market trends/challenges (text)

**Business Performance (1–5 score + text for each):**
- Profitability, Productivity, Efficiency, Customer Satisfaction, Market Resilience, Social Impact, Talent Attraction, Talent Retention

**Metrics:**
- Revenue, employee count, revenue per FTE, EBITDA, Net profit margin, NPS, SAT, Market resilience

**Culture Audit Responses:**
- "What key quality makes your organisation a great place to work?" (text)

---

#### 2.7 Navigator (Phase 2 — Company Admin + GPTW Admin)

Four tracking sections:

**Activate:** Recognition list + post count by status (Draft/Awaiting/Approved/Published) + 12-month publish chart

**Elevate:** Progress status of analysis stages

**Empower:** Consultant plan text + activity assigned vs completed (courses/coaching/focus groups/interviews/workshops) + per-user breakdown

**Emerging:** Descending date news feed, clickable full articles

**Notifications:** Monthly background check — if activities/month benchmark missed, email Company Admins + dashboard flag

---

#### 2.8 Packages (Company Admin + GPTW Admin)

Display currently enabled packages and remaining credits.

**Request More (email form):**
- Activate with AI (checkbox)
- Elevate options
- Empower: basic package count + additional credits

**Phase 2:** Direct pricing + invoice via HubSpot payments.

---

### 6.3 Module: Activate

**Accessible to:** Company users (if enabled) + all GPTW users

#### Social Posts — States & Transitions

```
New → Draft → Awaiting Approval → Approved → Published
```

**State: New/Draft**
- Select post type: Text | Image | Video
- If Image/Video: select Size (Story/Landscape/Square), Template (5 presets Phase 1), Colour (from Brand Library), Badge (from Brand Library), Logo (from Brand Library)
- Select asset: Upload | Stock Image | (if AI enabled) Generate Image | Generate Video
- Text area + AI-assisted text suggestions (if AI enabled)
- Preview
- Save as Draft OR Submit for Approval

**State: Awaiting Approval**
- Users with `signoffCapability = true` see Approve button
- Others can only edit

**State: Approved**
- Edit removed
- Actions: Download | Post to LinkedIn (embed) | Mark as Published

**State: Published**
- Read-only preview, no actions

#### Activate+ (AI-generated recommendations)

Shows 3 top recommended posts from latest survey highlights.
Each has a "Move to Draft" button.

**Phase 2:** Full benchmark highlights list + natural language AI Search chat interface + recommended posting schedule.

#### Brand Centre

**Brand Kit:**
- Upload brand logos
- Website URL
- Hex colour codes / colour picker
- Font selection (default or Google Fonts)

**Brand Voice:**
- Personality words (multiple)
- Tone descriptors (multiple)
- Mission text
- Terms to avoid (multiple)
- Replacement rules (case-sensitive)
- Inclusivity guidelines (multiple)

**Asset Library:**
- Upload images/videos with text descriptions

**Certifications & Recognitions:**
- Auto-populated from imported Emprising data
- Each badge has a "Create Social Post" shortcut

**Phase 2:** Upload Brand Guidelines PDF → AI auto-extracts and populates Brand Library (HIGH restriction AI).

---

### 6.4 Module: Elevate

**Phase 1 (R&D):**
- Diagnostic Centre data collection (pre-survey input)
- Emprising data import provides survey results
- POC prompt testing for AI-generated Trust Index insights
- Results shared with GPTW consultants for feedback

**Phase 2 (Full Consultant Workflow):**

Flow:
1. Company Admin completes Diagnostic Centre during survey period
2. Survey completes → Emprising import pulls data into PLUS+
3. Company users see top-level insights (Trust Index graphs, overview)
4. GPTW Consultant runs structured analysis phases:

For each of the 6 analysis phases:
- AI generates top 5 results
- Consultant: Approve (label: "AI produced") | Annotate (label: "consultant advisory") | Reject
- Approved/annotated results saved; rejected removed

**6 Analysis Phases:**
1. Summary of Results (benchmark comparison)
2. Strengths & Opportunities (positive/negative gaps vs benchmarks)
3. Engagement Drivers
4. Demographic Heatmap (managerial level, tenure, geographic)
5. Hierarchical Analysis (across locations/divisions)
6. Recommendations (3–5 focus areas with actions)

5. Co-creation meeting with company → further company annotations ("company informed")
6. Final report available to both consultant and company (with copy-text options)
7. Consultant manually creates PowerPoints from the output (Phase 2)

**Output Labels:**
- `AI-generated` — from model
- `logic-based` — from calculations/rules
- `consultant advisory` — consultant-annotated
- `company informed` — agreed in co-creation meeting

**Phase 3:** Auto-generate PowerPoint slides, non-consultant experiences for HR/Managers.

---

### 6.5 Module: Empower (Phase 2)

**Dashboard sections:**

**Agreed Focus Areas:**
- Image of improvement areas
- Download managers report
- Team recommendation summary
- Assigned consultant (name + photo)

**Coaching Courses:**
- Assigned total / completed total
- Latest 3 incomplete courses
- Auto-login link to TalentLMS

**Direct Coaching:**
- Credits assigned / remaining
- Calendar scheduler (YouCanBook.me integration)

**Self-Progress:** Button to tracker

**Phase 3:** AI-recommended learning paths from Elevate outcomes.

#### Self-Progress Tracker
Users log external training activities:
```json
{
  "name": "string",
  "dateCompleted": "date",
  "activityType": "Training | Accreditation | Focus Group | Interview | Workshop",
  "durationHours": "number"
}
```

---

## 7. Data Integrations

### 7.1 Emprising Data Import

**Managed by GPTW EU Team (NOT Vention)**

**Non-client data:**
- Benchmark data
- Population study data
- Best Workplaces data (58 Trust Index statements)

**Client-specific data:**
- GPTW Trust Index results
- Culture Brief Raw data
- Culture Audit export
- GPTW workplace achievements

**Ingestion pipeline:**
1. GPTW staff manually exports XLSX from Emprising → copies to OneDrive
2. Azure Function detects new files via Microsoft Graph
3. Schema validation (required tabs, columns, UK/US naming variants resolved via mapping catalog)
4. Data quality checks (row counts, numeric ranges 0–100, date validity, no duplicate PKs)
5. Valid files ingested against `clientId` from file
6. Divisions identified per company
7. Data prepared: cultural health, drivers, benchmarks, sentiment summary, narrative
8. Content labeled: AI-generated | logic-based | consultant-curated

**File type:** `.xlsx` only

**US→UK language conversion** applied automatically.

---

### 7.2 Email Integration

Two email types:
- Invitation to join PLUS+ (set password)
- Forgotten password reset link

**Service:** Azure Communication Services

---

### 7.3 CRM Integration (Phase 2)

HubSpot integration:
- Sync company records (ClientID ↔ HubSpot Account ID)
- Package purchases and invoicing via HubSpot payments
- Possibly: Emerging posts from HubSpot

---

### 7.4 LMS Integration (Phase 2)

**Service:** TalentLMS (`https://www.talentlms.com`)

Required API actions:
- User signup (when new company user created in Team Management)
- Auto-login (when directed to course content)
- Get all courses (for admin to assign per user)
- Enroll / un-enroll user to course
- Get user's course status (progress tracking)

---

### 7.5 Coaching Platform Integration (Phase 2)

**Service:** YouCanBook.me (`https://youcanbook.me`)

Required API actions:
- Calendar access
- Coaching session booked → update remaining credits in PLUS+

---

### 7.6 AI Generation

| Content Type | Restriction | Infrastructure |
|---|---|---|
| Content (text/recommendations) | **HIGH** | Azure OpenAI within GPTW tenant ONLY |
| Image generation | LOW | Any API (DALL-E 3, Google Imagen) |
| Video generation | LOW | Any API (OpenAI Sora, Kling AI) |
| AI Extraction (Phase 2) | HIGH | GPTW APIs only |
| AI Search (Phase 2) | HIGH | Azure AI Search within GPTW tenant |

**Monthly quotas** enforced per company for cost control.

---

## 8. AI Architecture & Solution Approach

### AI Components

#### Activate — Social Post Recommendations

**Input:** Trust Index data, benchmark comparison, recognition achievements, company context

**Output:** 3 ranked JSON post recommendations:
```json
{
  "recommendations": [
    {
      "rank": 1,
      "headline": "Global GPTW Certification",
      "post_text": "...",
      "key_metric": "80% Trust Index",
      "comparison": "+11pts above UK benchmark",
      "strategic_rationale": "...",
      "suggested_platform": "LinkedIn"
    }
  ],
  "metadata": {
    "generation_type": "AI-generated recommendation",
    "requires_review": true
  }
}
```

**Cost per call:** ~£0.09 | ~3 seconds | ~1,247 tokens

#### Elevate — Consultant Analysis (Phased Conversation Model)

Consultants work alongside AI across 6 phases. NOT a one-shot generation.

**Input:** Raw Trust Index data (58 statements), demographics, company context, benchmark CSV

**Per phase output:** Structured narrative + bullet analysis, slide-ready content

**Cost per full engagement:** ~£0.28 | Phase 1: ~8s, Phase 6: ~12s | ~3,856 tokens total

#### AI Extraction (Phase 2)

Extracts brand guidelines from uploaded PDFs/DOCXs.

**Output JSON:**
```json
{
  "brand_colors": [{"name": "Primary Blue", "hex": "#0052CC", "usage": "..."}],
  "typography": {"primary_font": "Inter", "is_web_safe": true, "weights": ["Regular", "Bold"]},
  "messaging_guidelines": {"tone_of_voice": ["Professional"], "key_phrases": ["..."]}
}
```

> Note: Logos are NOT extracted (poor quality from file formats) — flag for manual extraction.

#### AI Search (Phase 2) — Azure AI Search

**Architecture:**
- Hybrid search: vector similarity + keyword matching
- Embedding: `text-embedding-3-large` (3072 dimensions)
- Generation: GPT-4-turbo
- Isolation: `company_id` filter on ALL queries
- Latency: ~2–4 seconds
- Cost: ~£0.066 per search

**Indexed data:**
- Trust Index statements (58 per company per year)
- Benchmark data (UK Best Workplaces, Top 5)
- Historical year-over-year data
- Demographic breakdowns
- Recognition achievements

### AI Safety Guardrails

- Prompt sanitization to prevent accidental data leakage
- PII removal from all outputs
- All AI outputs labeled with origin (`AI-generated` / `logic-based` / `consultant advisory`)
- No client data used for model training
- Encrypted storage and transit
- Numeric consistency checks on all outputs
- Human approval required before any AI content is published or released

---

## 9. Backend Architecture (.NET 8)

### Architecture Pattern

Clean Architecture with domain-focused modules:

```
Solution Structure:
├── GPTW.Plus.Api                    # ASP.NET Core Web API entry point
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── CompanyController.cs
│   │   ├── TeamManagementController.cs
│   │   ├── ActivateController.cs
│   │   ├── ElevateController.cs
│   │   ├── EmpowerController.cs
│   │   ├── DiagnosticCentreController.cs
│   │   └── BrandCentreController.cs
│   ├── Middleware/
│   │   ├── TenantResolutionMiddleware.cs
│   │   ├── AuditLoggingMiddleware.cs
│   │   └── ExceptionHandlingMiddleware.cs
│   └── Program.cs
│
├── GPTW.Plus.Application            # Business logic layer
│   ├── Services/
│   │   ├── AdminServices/
│   │   │   ├── CompanyManagementService.cs
│   │   │   └── GptwStaffService.cs
│   │   ├── TeamManagementService.cs
│   │   ├── ActivateServices/
│   │   │   ├── SocialPostService.cs
│   │   │   ├── BrandCentreService.cs
│   │   │   └── ActivatePlusService.cs
│   │   ├── ElevateServices/
│   │   │   ├── ElevateInsightService.cs
│   │   │   └── ConsultantWorkflowService.cs
│   │   ├── DiagnosticCentreService.cs
│   │   ├── EmpowerService.cs
│   │   └── AI/
│   │       ├── AiOrchestrationService.cs
│   │       ├── ActivateAiService.cs
│   │       ├── ElevateAiService.cs
│   │       └── BrandExtractionService.cs
│   └── DTOs/
│
├── GPTW.Plus.Domain                 # Core entities and rules
│   ├── Entities/
│   │   ├── Company.cs
│   │   ├── Tenant.cs
│   │   ├── User.cs
│   │   ├── Division.cs
│   │   ├── SocialPost.cs
│   │   ├── BrandKit.cs
│   │   ├── EmprisingDataset.cs
│   │   ├── ElevateInsight.cs
│   │   ├── DiagnosticEntry.cs
│   │   └── ActivityLog.cs
│   ├── Enums/
│   │   ├── UserRole.cs
│   │   ├── SocialPostState.cs
│   │   ├── AiOutputLabel.cs
│   │   └── ActivityType.cs
│   └── Interfaces/
│
├── GPTW.Plus.Infrastructure         # External concerns
│   ├── Persistence/
│   │   ├── ApplicationDbContext.cs
│   │   └── Repositories/
│   ├── Storage/
│   │   └── BlobStorageService.cs
│   ├── AI/
│   │   └── AzureOpenAiClient.cs
│   ├── Email/
│   │   └── AzureCommunicationEmailService.cs
│   └── OneDrive/
│       └── GraphApiService.cs
│
└── GPTW.Plus.Functions              # Azure Functions
    ├── EmprisingIngestionFunction.cs
    ├── EmailTriggerFunction.cs
    ├── ScheduledReminderFunction.cs
    └── InsightGenerationFunction.cs
```

### API Patterns

- **REST** APIs secured with **OAuth 2.0 Bearer tokens**
- All requests (except login/registration) require valid JWT
- **RBAC enforced** on every API endpoint
- **Tenant isolation** enforced at data access layer
- **Versioning** via middleware
- **OpenAPI/Swagger** specs for all endpoints
- **JSON over HTTPS**
- **Async I/O** throughout

### Key API Endpoints (Reference)

```
POST   /api/auth/login
POST   /api/auth/forgot-password
GET    /api/profile
PUT    /api/profile

# Admin
GET    /api/companies
POST   /api/companies
GET    /api/companies/{id}
PUT    /api/companies/{id}
DELETE /api/companies/{id}
GET    /api/staff
POST   /api/staff

# Team
GET    /api/team/users
POST   /api/team/users
PUT    /api/team/users/{id}
DELETE /api/team/users/{id}

# Diagnostic Centre
GET    /api/diagnostic
PUT    /api/diagnostic

# Activate
GET    /api/activate/posts
POST   /api/activate/posts
GET    /api/activate/posts/{id}
PUT    /api/activate/posts/{id}
POST   /api/activate/posts/{id}/submit-approval
POST   /api/activate/posts/{id}/approve
POST   /api/activate/posts/{id}/publish
GET    /api/activate/recommendations
GET    /api/activate/brand
PUT    /api/activate/brand

# Elevate
GET    /api/elevate/insights
GET    /api/elevate/insights/{phaseId}
POST   /api/elevate/insights/{phaseId}/generate
PUT    /api/elevate/insights/{phaseId}/items/{itemId}/approve
PUT    /api/elevate/insights/{phaseId}/items/{itemId}/annotate
DELETE /api/elevate/insights/{phaseId}/items/{itemId}

# AI
POST   /api/ai/generate-text
POST   /api/ai/generate-image
POST   /api/ai/search
```

---

## 10. Frontend Architecture

> **Cursor target:** Angular (TypeScript)

### Angular Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── role.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts    # Attach JWT
│   │   │   └── tenant.interceptor.ts  # Attach tenant context
│   │   └── services/
│   │       └── api.service.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── dashboard-card/
│   │   │   ├── modal/
│   │   │   └── status-badge/
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── company.model.ts
│   │   │   ├── social-post.model.ts
│   │   │   └── elevate-insight.model.ts
│   │   └── pipes/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── dashboard/
│   │   │
│   │   ├── admin/
│   │   │   ├── company-management/
│   │   │   ├── staff-management/
│   │   │   └── analytics/
│   │   │
│   │   ├── team-management/
│   │   │
│   │   ├── diagnostic-centre/
│   │   │
│   │   ├── packages/
│   │   │
│   │   ├── activate/
│   │   │   ├── social-posts/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── create-edit/
│   │   │   │   └── view/
│   │   │   ├── activate-plus/
│   │   │   └── brand-centre/
│   │   │
│   │   ├── elevate/
│   │   │   ├── overview/
│   │   │   ├── insight-phase/
│   │   │   └── report/
│   │   │
│   │   └── empower/
│   │       ├── dashboard/
│   │       └── self-progress/
│   │
│   └── app-routing.module.ts
```

### Angular Role Guards

```typescript
// Role-based route protection
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [RoleGuard],
    data: { roles: ['GPTWAdmin'] },
    loadChildren: () => import('./features/admin/admin.module')
  },
  {
    path: 'team-management',
    canActivate: [RoleGuard],
    data: { roles: ['GPTWAdmin', 'CompanyAdmin'] },
    loadChildren: () => import('./features/team-management/team-management.module')
  },
  {
    path: 'activate',
    canActivate: [AuthGuard, ModuleAccessGuard],
    data: { module: 'activate' },
    loadChildren: () => import('./features/activate/activate.module')
  }
];
```

### Social Post State Machine (Angular)

```typescript
enum SocialPostState {
  Draft = 'draft',
  AwaitingApproval = 'awaiting_approval',
  Approved = 'approved',
  Published = 'published'
}

// Valid transitions:
// Draft → AwaitingApproval (any user)
// AwaitingApproval → Approved (users with signoffCapability only)
// Approved → Published (users with signoffCapability only)
// Approved/AwaitingApproval → Draft (edit back)
```

---

## 11. Database Schema Overview

### Core Tables (PostgreSQL)

```sql
-- Tenant & Identity
companies (id, name, client_id, crm_id, is_deleted, created_at)
users (id, company_id, full_name, email, password_hash, role, photo_url, is_deleted, created_at)
gptw_staff (id, full_name, email, image_url, role, is_deleted)
staff_company_assignments (staff_id, company_id)
divisions (id, company_id, name)
user_divisions (user_id, division_id)
user_module_access (user_id, module, signoff_capability)

-- Packages & Credits
company_packages (id, company_id, activate_ai, elevate, empower_enabled)
company_credits (id, company_id, type, total, remaining)

-- Activate
social_posts (id, company_id, user_id, type, state, content, template_id, colours, size, created_at, updated_at)
brand_kits (id, company_id, website_url, colours_json, fonts_json, logos_json)
brand_voice (id, company_id, personality_words, tone, mission, terms_to_avoid, replacement_rules, inclusivity)
asset_library (id, company_id, file_url, description, type)
certifications (id, company_id, badge_type, badge_url, achieved_date)

-- Elevate & Emprising
emprising_imports (id, company_id, survey_name, country, employees, responses, sector, certified, certified_date, import_date)
trust_index_statements (id, import_id, statement_id, statement_text, dimension, company_score, benchmark_score, benchmark_type, difference)
elevate_insights (id, company_id, phase_id, content, label, consultant_annotation, company_annotation, status, created_at)
elevate_phases (id, company_id, phase_number, phase_name, status, completed_at)

-- Diagnostic Centre
diagnostic_entries (id, company_id, section, field_key, field_value, updated_at)

-- Empower
self_progress (id, user_id, name, date_completed, activity_type, duration_hours)

-- Audit
activity_logs (id, company_id, user_id, ip_address, event_type, entity_type, entity_id, detail_json, created_at)
ai_call_logs (id, company_id, user_id, model, prompt_type, restriction_level, tokens_used, cost, output_label, created_at)
```

### Multi-Tenant Isolation Rule

> **CRITICAL:** Every query MUST include a `company_id` (or equivalent tenant) filter. The Data Access Layer (DAL) enforces this automatically based on the authenticated user's token.

---

## 12. Security Model

### Authentication Flow

```
User → Angular SPA → POST /api/auth/login → .NET API
                                          ↓
                              Microsoft Entra ID validation
                                          ↓
                              JWT issued (short-lived)
                                          ↓
                    All subsequent requests: Authorization: Bearer <token>
```

### Data Security

| Layer | Mechanism |
|---|---|
| Transit | TLS 1.2+ enforced |
| At Rest | AES-256 (Azure-managed encryption) |
| Secrets | Azure Key Vault (accessed via Managed Identity — no secrets in code) |
| Tenant isolation | `company_id` on every DB query |
| API auth | JWT validated via Entra ID JWKS on every request |
| RBAC | Role checks on every controller action |
| Audit | All sensitive actions logged with user + IP + timestamp |

### GDPR Compliance

- Soft delete by default (data retained, access disabled)
- Hard delete only after soft delete (GDPR right-to-erasure support)
- Only essential data stored
- No plaintext passwords/tokens
- Data residency: UK Azure regions

### AI Security Classification

```
HIGH RESTRICTION (GPTW Azure tenant only):
  - Text/content generation (contains raw Trust Index data)
  - AI Recommendations
  - AI Extraction (Phase 2)
  - AI Search (Phase 2)

LOW RESTRICTION (any external API):
  - Image generation (generic prompts only)
  - Video generation (generic prompts only)
```

---

## 13. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Availability | 99.5% monthly SLO (pilot phase) |
| Page load | < 2.5 seconds on broadband |
| Analysis results | < 10 seconds per phase/page |
| Scale | 400–600 companies |
| Browser support | Chrome (latest), Safari (latest), Edge (latest), Firefox (latest) |
| OS support | Windows, Mac OS X (any active LTS) |
| Mobile | No native app; responsive web only |
| Language | English (UK) only |
| Hosting | Microsoft Azure, UK regions |
| Data residency | UK regions |

---

## 14. Phase Roadmap

### Phase 1 — Foundation & First Value

| Area | Deliverables |
|---|---|
| Technical Foundation | Azure environment setup, security, tenancy, data storage |
| Data Integration | Emprising import via OneDrive/Graph (GPTW EU team) |
| Activate | Brand setup, certification badge, template library, AI-assisted social assets |
| Diagnostic Centre | Company questionnaire for Elevate input |
| Elevate | R&D POC — AI Trust Index insights, prompt validation, output labelling |
| AI | Activate Gen AI (text, images, video), guardrails, prompt templates |
| Pilot | 3–5 clients, CSAT/NPS metrics collection |

**Infrastructure cost Phase 1:** ~£460/month

### Phase 2 — Scale & Integration

| Area | Deliverables |
|---|---|
| Backend Automation | HubSpot CRM integration, usage dashboards, Navigator |
| Activate | AI schedule recommendations, advanced AI content |
| Elevate | Full consultant modelling UI, rapid deck generation, AI labelling |
| Empower | Training paths (TalentLMS), coaching scheduling (YouCanBook.me) |
| AI | Brand AI extraction, AI Search, narrative improvements |
| Data | Extended GPTW data stack |
| Testing | 4 consultants + 5–10 paying customers |

**Infrastructure cost Phase 2:** ~£1,520/month (+ third-party ~£250)

### Phase 3 — Advanced Insights & Emerging

| Area | Deliverables |
|---|---|
| Elevate | Non-consultant client experiences (HR/Managers), advanced AI insights |
| Empower | AI-recommended dynamic learning paths |
| Emerging | GPTW news feed integration |
| AI | Refined models, multi-layer guardrails, latency optimisation |

---

## 15. Third-Party Integrations

| Service | Phase | Purpose | Est. Cost/month |
|---|---|---|---|
| Microsoft 365 / Graph API | 1 | Auth, OneDrive file access | Included in M365 |
| Azure OpenAI (GPT-4) | 1 | Text/content generation | Consumption-based |
| OpenAI Sora | 1 | Video generation | $0.10–$0.50/10s |
| Azure Communication Services | 1 | Transactional emails | ~£20–£50 |
| HubSpot CRM | 2 | Company sync, invoicing | ~£100 |
| TalentLMS | 2 | Training course tracking | ~£100 |
| YouCanBook.me | 2 | Coaching scheduling | ~£50 |
| DALL-E 3 | 1 | Image generation | ~£0.04–£0.08/image |
| Google Imagen | 1 (parallel test) | Image generation | ~£0.02–£0.05/image |

---

## 16. Cost Estimates

### AI Generation Costs

| Type | Cost |
|---|---|
| DALL-E 3 Standard (1024×1024) | ~£0.04/image |
| DALL-E 3 HD | ~£0.08/image |
| Google Imagen | ~£0.02–£0.05/image |
| Sora 2 Standard (10s) | $1.00 |
| Sora 2 Pro Low-res (10s) | $3.00 |
| Sora 2 Pro High-res (10s) | $5.00 |
| Kling AI (10s) | ~$0.56–$0.90 |
| AI Search query | ~£0.066 |
| Activate recommendation | ~£0.09 per call |
| Elevate full analysis | ~£0.28 per engagement |

> **Monthly quotas per company required** to prevent cost overruns.

---

## 17. SDLC & Testing Strategy

### Branching Model (GitFlow)

```
main         → production-ready
develop      → integration branch
feature/*    → individual features
release/*    → pre-production stabilisation
hotfix/*     → emergency production patches
```

### Testing Types

| Type | Tool | Coverage |
|---|---|---|
| Unit Testing | xUnit (.NET) | Business logic, domain rules, RBAC, prompt templates, ingestion functions |
| Integration Testing | .NET Test Host | API + DB + Blob + OneDrive/Graph, full ingestion flow |
| End-to-End Testing | Playwright | Real user journeys across all modules, multi-tenant |
| UI/UX Testing | Manual + visual regression | Angular component rendering, cross-browser, WCAG AA |
| API Contract Testing | Swagger/OpenAPI | Backward compatibility |
| Performance Testing | Azure Load Testing, JMeter | Ingestion pipeline, dashboard queries, insight generation |
| Security Testing | Pen testing | SQL injection, XSS, tenant isolation, token tampering, KeyVault access |
| AI Output Validation | Custom | Consistency checks, hallucination detection, numeric accuracy |
| Regression | Automated CI suite | Every CI run |

### Release Validation Checklist

Before any release:
- [ ] Regression suite passed
- [ ] Role-specific smoke tests passed
- [ ] Ingestion pipeline tested with sample Emprising data
- [ ] AI call sanity checks passed
- [ ] Rollback plan documented

---

## 18. Key Business Rules & Edge Cases

### Data Rules

- Only `.xlsx` files accepted for Emprising import
- Files are uploaded once and do not change post-upload
- US-to-UK language variants resolved via mapping catalog
- Validation errors surfaced to GPTW admins; invalid data excluded from platform
- Numeric range checks: Trust Index scores must be 0–100
- No duplicate primary keys: `company + survey + division`

### AI Rules

- AI outputs MUST be labeled (AI-generated / logic-based / consultant advisory / company informed)
- No client data to external AI services for HIGH restriction content
- Numbers in AI outputs must exactly match source data (no extrapolation)
- No `[PLACEHOLDER]` text in AI-generated post suggestions
- All AI content requires human approval before publishing
- PII removed from all AI outputs
- Cost tracked per company; monthly quotas enforced

### User Management Rules

- New users receive email invite to set password (never auto-assigned)
- Company users can only be added by Company Admins (not auto-created)
- Soft delete only from UI; hard delete requires additional confirmation (admin only, years later)
- Company Admins can only manage their own tenant (unless GPTW Admin)
- GPTW Consultants are assigned to specific clients but can view all

### Social Post Rules

- Approval requires user with `signoffCapability = true`
- Published posts are immutable (no edit, download, or re-post)
- LinkedIn posting via embed code (not direct API integration in Phase 1)
- Image/video generation uses monthly per-company quotas
- Post state is audited (every state transition logged)

### Package/Credit Rules

- Packages set manually by GPTW Admin after payment received (Phase 1)
- Phase 2: Direct payment via HubSpot
- Credits tracked: courses, coaching sessions, focus groups, interviews, workshops

---

## 19. Cursor Code Generation Guidelines

### When generating .NET 8 code:

1. **Always use Clean Architecture** — Domain → Application → Infrastructure → API
2. **Tenant isolation is mandatory** — every repository method must filter by `companyId`
3. **RBAC via attributes** — use `[Authorize(Roles = "GPTWAdmin,CompanyAdmin")]` on controllers
4. **Audit logging** — inject `IAuditService` and log all write operations
5. **AI calls go through `AiOrchestrationService`** — never call Azure OpenAI directly from controllers
6. **HIGH restriction content** — always ensure Trust Index data stays within Azure OpenAI (GPTW tenant), never pass to external APIs
7. **Async everywhere** — all I/O operations must be `async/await`
8. **Use Azure Key Vault** — never hardcode secrets; use `IConfiguration` with Key Vault binding
9. **Soft delete** — all deletable entities have `IsDeleted` + `DeletedAt` columns; filter in queries
10. **Unit test with xUnit** — mock repositories and external services; test business logic in isolation

### When generating Angular code:

1. **Feature modules with lazy loading** — each module (Activate, Elevate, Empower) is a lazy-loaded Angular feature module
2. **Route guards** — use `AuthGuard` (authenticated) + `RoleGuard` (role check) + `ModuleAccessGuard` (module enabled check)
3. **MSAL for authentication** — use `@azure/msal-angular` for Entra ID integration
4. **HTTP interceptors** — attach JWT Bearer token to every API request; handle 401 with redirect to login
5. **State management** — use Angular services with BehaviorSubject for module state (or NgRx for complex modules like Activate)
6. **Social Post state machine** — implement clear state transitions; disable UI elements based on current state
7. **Role-based UI** — hide/show elements based on `userRole` and `moduleAccess` from auth service
8. **Reactive Forms** — use Angular Reactive Forms (not Template-driven) for all form-heavy screens (Diagnostic Centre, Brand Centre, Team Management)
9. **UK English** — all labels, field names, and error messages in UK English (e.g., "colour" not "color", "organisation" not "organization")
10. **Responsive (desktop-first)** — design for desktop; no mobile-specific breakpoints required

### Entity: SocialPost (reference model)

```typescript
// Angular model
export interface SocialPost {
  id: string;
  companyId: string;
  createdById: string;
  type: 'text' | 'image' | 'video';
  state: 'draft' | 'awaiting_approval' | 'approved' | 'published';
  size?: 'story' | 'landscape' | 'square';
  templateId?: string;
  colours?: string[];
  badgeId?: string;
  logoId?: string;
  assetUrl?: string;
  textContent?: string;
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

```csharp
// .NET Domain Entity
public class SocialPost
{
    public Guid Id { get; private set; }
    public Guid CompanyId { get; private set; }  // Tenant isolation key
    public Guid CreatedById { get; private set; }
    public SocialPostType Type { get; private set; }
    public SocialPostState State { get; private set; }
    public PostSize? Size { get; private set; }
    public string? TemplateId { get; private set; }
    public string? TextContent { get; private set; }
    public bool IsAiGenerated { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // State transitions
    public void SubmitForApproval() { /* validate state == Draft */ }
    public void Approve() { /* validate state == AwaitingApproval */ }
    public void Publish() { /* validate state == Approved */ }
}
```

### Entity: ElevateInsight output label enum

```csharp
public enum AiOutputLabel
{
    AiGenerated,        // Produced by AI model
    LogicBased,         // Calculated/rule-based
    ConsultantAdvisory, // Annotated by GPTW consultant
    CompanyInformed     // Agreed in co-creation meeting
}
```

---

*Document generated from: Product Vision, Sitemap, Detailed Requirements, AI Solution Approach, and Technical Description (GPTW PLUS+ project, Vention — October/November 2025)*
