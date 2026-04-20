# Pipeline Dashboard — Mock API Server

A fully functional local mock API server for frontend testing. All 40+ endpoints covered with realistic dummy data.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

The server runs at **http://localhost:3001**

### 3. (Optional) Auto-restart on file changes
```bash
npm run dev
```

---

## 🔐 Login Credentials

| Username | Password | Role |
|---|---|---|
| john.doe | password | QA Engineer |
| jane.smith | password | DevOps Lead |
| alice.johnson | password | Admin / Manager |
| ethan.hunt | password | Security Engineer |

**Login endpoint:**
```
POST http://localhost:3001/api/Auth/login
Content-Type: application/json

{ "username": "john.doe", "password": "password" }
```

---

## 📡 All Endpoints

### Auth
| Method | URL |
|---|---|
| POST | /api/Auth/login |
| GET | /api/Auth/validate |
| POST | /api/Auth/logout |

### Dashboard
| Method | URL |
|---|---|
| GET | /api/Dashboard/builds |
| GET | /api/Dashboard/stats?buildId=build-001 |
| GET | /api/Dashboard/trends?buildId=build-001 |
| GET | /api/Dashboard/analytics |
| GET | /api/Dashboard/analytics/:buildId |
| GET | /api/Dashboard/recent-runs?buildId=build-001 |
| GET | /api/Dashboard/latest-failures?buildId=build-001 |
| GET | /api/Dashboard/real-time-verification |
| GET | /api/Dashboard/debug-data |

### Users
| Method | URL |
|---|---|
| GET | /api/Users?page=1&limit=10&search=john&isActive=true |
| POST | /api/Users |
| GET | /api/Users/:id |
| PUT | /api/Users/:id |
| DELETE | /api/Users/:id |
| GET | /api/Users/export |
| POST | /api/Users/bulk-delete |

### Groups
| Method | URL |
|---|---|
| GET | /api/Groups |
| POST | /api/Groups |
| GET | /api/Groups/:id |
| PUT | /api/Groups/:id |
| DELETE | /api/Groups/:id |
| GET | /api/Groups/export |

### Permissions
| Method | URL |
|---|---|
| GET | /api/Permissions |
| POST | /api/Permissions |
| GET | /api/Permissions/:id |
| PUT | /api/Permissions/:id |
| DELETE | /api/Permissions/:id |
| GET | /api/Permissions/categories |

### AuditLogs
| Method | URL |
|---|---|
| GET | /api/AuditLogs?Page=1&Limit=10&TableName=Users |
| GET | /api/AuditLogs/tables |

### Master (Pipeline/Tests)
| Method | URL |
|---|---|
| GET | /api/Master/test-results?buildId=build-001&outcome=Failed |
| GET | /api/Master/test-error/:id |
| GET | /api/Master/pipeline-details?status=passed |

### Screenzaa
| Method | URL |
|---|---|
| GET | /api/Screenzaa |
| POST | /api/Screenzaa |
| GET | /api/Screenzaa/:id |
| PUT | /api/Screenzaa/:id |
| DELETE | /api/Screenzaa/:id |
| POST | /api/Screenzaa/import |
| GET | /api/Screenzaa/sample |

### Preferences
| Method | URL |
|---|---|
| GET | /api/Preferences/:key (keys: theme, language, timezone, dashboardLayout) |
| POST | /api/Preferences |

### Settings
| Method | URL |
|---|---|
| GET | /api/Settings |

---

## 🗃️ Sample Build IDs
- `build-001` — Passed (398/412 tests)
- `build-002` — Failed (375/412 tests)
- `build-003` — Passed (385/388 tests)
- `build-004` — Passed (397/400 tests)
- `build-005` — Running

---

## 📝 Notes
- All data is **in-memory** — resets when server restarts
- CORS is enabled for all origins (safe for local dev)
- POST/PUT/DELETE operations work and mutate in-memory data
- Use the openapi.yaml with Swagger UI, Postman, or Insomnia for API exploration
