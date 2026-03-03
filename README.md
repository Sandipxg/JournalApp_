# 📖 Journal App: oRPC Masterclass

A full-stack, end-to-end type-safe journal application. Built to showcase modern web development practices using a monorepo structure, ensuring seamless interaction between the React frontend and Node.js backend.

---

## 🚀 Technical Stack Breakdown

This project utilizes a modern and robust technology stack:

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend (UI)** | React 19, Vite, React Hook Form | Handles the view, state, and user interactions with blazing fast compilation. |
| **Networking & API** | oRPC, Zod | Replaces traditional REST. Provides end-to-end type safety, runtime validation, and a centralized contract. |
| **Backend (Server)** | Node.js, Express, tsx | The "Host" that runs the API, handles business logic, and connects to the database. |
| **Database** | PostgreSQL, Orchid ORM | Permanent storage for your thoughts and memories, accessed via a powerful, type-safe ORM. |
| **Authentication** | Better Auth | Secure, modern authentication system covering both frontend and backend. |
| **Observability** | Sentry | Error tracking and profiling for both Node.js and React. |
| **Architecture** | npm workspaces | Monorepo structure containing `server`, `my-react-app`, and `shared` code. |

---

## 🎨 Application Architecture & User Flow

The following diagram illustrates the lifecycle of a request, from the moment a user interacts with the UI to the final database persistency, ensuring types are respected at every boundary.

```mermaid
sequenceDiagram
    autonumber
    participant U as User (UI)
    participant R as React (Frontend)
    participant C as oRPC Client
    participant Z as Zod Contract (Shared)
    participant S as Node.js (Express)
    participant G as PostgreSQL (DB)

    Note over U, G: SCENARIO: Creating a New Entry
    U->>R: Fills form & clicks "Add Entry"
    R->>C: call: client.addEntry({title, content})
    C->>Z: Run Input Validation (Guard)
    alt Validation Fails
        Z-->>R: Throw Validation Error
        R-->>U: Show Error Message on Form
    else Validation Success
        C->>S: HTTP POST /rpc/addEntry {body}
        S->>G: INSERT INTO entries ...
        G-->>S: Return saved_row
        S-->>C: Response (JSON Bundle)
        C-->>R: Return Typed Entry Object
        R->>U: Clear Form & Update List
    end
```

---

## 🛠️ Setup Guide

Follow these steps to get the project running locally.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (running locally or a cloud instance like Supabase/Neon)

### 2. Installation
Clone the repository and install all dependencies from the root. This project uses npm workspaces to manage the monorepo.

```bash
# Install dependencies for root, server, my-react-app, and shared
npm run install:all
```
*(Alternatively, you can just run `npm install` in the root directory).*

### 3. Environment Variables

#### Backend (`server/.env`)
Create a `.env` file in the `server` directory and configure the necessary variables:

```env
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/journal_db"

# Better Auth Configuration:
BETTER_AUTH_SECRET="your_super_secret_key"
BETTER_AUTH_URL="http://localhost:3000"

# (Optional) Sentry DSN for error tracking
# SENTRY_DSN="your_sentry_dsn"
```

#### Frontend (`my-react-app/.env`)
Create a `.env` file in the `my-react-app` directory if you need frontend environment variables (like your frontend Sentry DSN).

### 4. Database Initialization
Ensure your PostgreSQL database is running and matching the `DATABASE_URL` you provided.
Run the database configuration/migration script:

```bash
# From the root directory:
cd server
npm run db
```

### 5. Running the Application

You can start the development servers from the root directory using the scripts provided in the root `package.json`:

```bash
# Terminal 1: Start the backend server
npm run dev:server

# Terminal 2: Start the React frontend
npm run dev:client
```

- **Frontend Application:** accessible at `http://localhost:5173`
- **Backend API:** accessible where your Express server is configured (e.g., `http://localhost:3000`)

---

## 📝 Key Features

- ✅ **Monorepo Architecture**: Clean separation of `client`, `server`, and `shared` code logic using npm workspaces.
- ✅ **End-to-End Type Safety**: Change one file, update the whole app. The oRPC contract ensures frontend and backend are perfectly synchronized.
- ✅ **Runtime Validation**: Malformed data is blocked via Zod before it ever hits the database or deeper business logic.
- ✅ **Built-in Auth & Observability**: Integrated Better Auth for solid security and Sentry for confident, monitored deployments.
