# EventTalentBridge — Backend API

Backend REST API for **EventTalentBridge**, the requirement-posting platform connecting event hosts with event planners, performers, and crew members.

Built with **Node.js**, **Express (JavaScript)**, and the official **native MongoDB Node.js driver** (`mongodb`) without Mongoose.

---

## 🛠️ Tech Stack & Constraints

- **Runtime:** Node.js (JavaScript ES Modules)
- **Framework:** Express.js
- **Database Driver:** Native `mongodb` (strict constraint: **no Mongoose**)
- **Validation:** Zod (category-discriminated schema validation)
- **CORS & Logging:** `cors`, `morgan`
- **Process Management:** `nodemon` (dev)

---

## 📂 Project Structure

```text
server/
├── src/
│   ├── config/
│   │   └── db.js                    # Native MongoClient connection & index initialization
│   ├── controllers/
│   │   ├── health.controller.js     # Health check & database availability handler
│   │   └── requirement.controller.js# Requirement CRUD handlers
│   ├── middleware/
│   │   ├── error-handler.js         # Centralized error formatting (safe errors, no leaked secrets)
│   │   └── not-found.js             # 404 handler
│   ├── routes/
│   │   ├── health.routes.js         # Health endpoint route
│   │   └── requirement.routes.js    # Requirement routes (POST, GET list, GET by ID)
│   ├── services/
│   │   └── requirement.service.js   # Native MongoDB queries, pagination, formatting
│   ├── validators/
│   │   └── requirement.schema.js    # Zod validation schemas for all categories
│   ├── app.js                       # Express app configuration & middleware
│   └── server.js                    # Server startup & graceful shutdown
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP Server port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB Atlas or local connection string | `mongodb://localhost:27017/eventtalentbridge_assignment` |
| `MONGODB_DB_NAME` | Database name | `eventtalentbridge_assignment` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Run in Production Mode
```bash
npm start
```

---

## 📡 REST API Endpoints

### 1. Health Check
* **Endpoint:** `GET /api/health`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "service": "EventTalentBridge API",
    "timestamp": "2026-10-27T10:00:00.000Z"
  }
}
```

### 2. Create Requirement
* **Endpoint:** `POST /api/requirements`
* **Content-Type:** `application/json`

### 3. List Requirements
* **Endpoint:** `GET /api/requirements?category=PLANNER&page=1&limit=10`
* **Query Parameters:** `category`, `eventType`, `status`, `page`, `limit`

### 4. Get Requirement by ID
* **Endpoint:** `GET /api/requirements/:id`
