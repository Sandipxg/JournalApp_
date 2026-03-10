# Modern Full-Stack Technology Guide

This document provides a structured overview of the current technology stack, explaining the purpose of each tool, why it's chosen, and what it replaces in the traditional web development landscape.

| Topic | Used For | Why it's used | Replacement for |
| :--- | :--- | :--- | :--- |
| **React** | Interactive UI Development | Component-based, efficient Virtual DOM rendering, massive ecosystem. | Vanilla JS / jQuery DOM manipulation |
| **Node.js** | Server-side JS Runtime | High concurrency (Event Loop), unified language (JS) for FE/BE. | PHP, Ruby on Rails, Java Spring |
| **PostgreSQL** | Relational Data Storage | Robust ACID compliance, complex queries, highly extensible. | MySQL, SQLite (for complex production apps) |
| **TypeScript** | Type-safe Javascript | Catches bugs at compile-time, improved IDE IntelliSense. | Plain JavaScript (ES6+) |
| **ORM (e.g. Prisma)** | DB Object Mapping | Write DB queries in native code (TS/JS), safety, easy migrations. | Raw SQL Queries |
| **Validation (e.g. Zod)** | Data Integrity | Prevents bad data, provides runtime safety with TS inference. | Manual `if/else` checks & regex |
| **Basic Auth** | Simple Authentication | Easy to implement for internal or legacy system access. | Unsecured endpoints |
| **Better Auth** | Modern Auth Framework | Built-in social login, session management, secure by default. | Manual JWT/Session boilerplate |
| **Telemetry** | Monitoring & Logging | Tracks app health, errors, and user behavior in real-time. | Sifting through raw log files |
| **RHF (React Hook Form)** | Form Management | High performance (uncontrolled), minimizes re-renders. | Controlled inputs with `useState` |
| **Swagger** | API Documentation | Live-interactive docs (OpenAPI), simplifies FE/BE integration. | Manual README docs / PDF manuals |
| **PWA (Dexie.js)** | Offline Support | IndexedDB wrapper for complex local storage and app-like feel. | `localStorage` / Cookies |
| **Worker Architecture** | Offloading Heavy Tasks | Multi-threading prevents UI/Main thread lag (Data/Media processing). | Synchronous processing on Main thread |
| **SSE (Real-time Sync)** | Server-Sent Events | Low overhead uni-directional real-time updates from server. | Long polling |
| **Linting (Biome)** | Quality & Formatting | Extremely fast, replaces ESLint and Prettier in one tool. | ESLint + Prettier + Manual formatting |
| **Testing (Vitest/Playwright)**| Quality Assurance | Vitest (Fast Unit/Int), Playwright (Reliable E2E/Browser testing). | Jest + Cypress |
| **DB Migration** | DB Versioning | Tracks schema changes over time, ensures team consistency. | Manual SQL scripts (running them by hand) |
| **Turbo Monorepo** | Mono-repo Management | Incremental builds and task caching for multiple projects. | Standalone repos / Lerna |
| **Yarn/NPM** | Pkg Management | Automated dependency versioning and lockfile security. | Manual `<script>` tag downloads |
| **Event Driven Arch.** | System Decoupling | Asynchronous communication, scales complex DB workflows. | Direct API-to-API coupling |
| **System Design** | Architecture Planning | Defines scalability, reliability, and component interaction. | "Coding on the fly" without mapping |
| **Docker** | Containerization | Ensures "Works on my machine" consistency across environments. | Manual server environment setup |
| **CI/CD Pipeline** | Automated Shipping | Automatic testing and deployment on every code push. | Manual FTP/SSH deployment |
| **Tanstack Query** | Server State/Caching | Handles fetching, caching, loading, and errors automatically. | `useEffect` + `fetch` + `useState` |
| **Zustand** | Global UI State | Minimalistic, fast, less boilerplate than Redux. | Redux / React Context |
| **Task Caching** | Performance | Reuses results of expensive operations to save CPU/Network. | Repeated execution of heavy tasks |
