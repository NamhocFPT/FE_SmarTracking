# FE API GUIDE — Smart Meeting System

## 1. Core Principle
- FE MUST NOT invent APIs
- FE ONLY consumes API from API Contract v1.0
- FE logic must be derived from UC (Use Case)
- No business logic duplication from backend

---

## 2. Base Configuration
- Base URL: /api/v1
- Auth: Bearer JWT token
- Content-Type: application/json

---

## 3. Standard Response Format

### Success
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}
}

### Error
{
  "success": false,
  "message": "...",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}

---

## 4. Error Handling Rules
- 400: Validation error → show inline form error
- 401: Unauthorized → redirect login
- 403: Forbidden → show permission denied screen
- 404: Not found → show empty state
- 409: Conflict → show business warning
- 500: System error → toast + fallback UI

---

## 5. Authentication Rules
- Store token in secure storage
- Auto attach token to all requests
- Auto logout on 401/423
- Refresh token if expired (if available)

---

## 6. Role-Based Access Control (RBAC)
- UI must render based on permissions array
- DO NOT rely only on role name
- Each button/action must check permission

Example:
if (!permissions.includes("user.create")) hide button