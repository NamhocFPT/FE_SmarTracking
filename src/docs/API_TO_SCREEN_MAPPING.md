# API → SCREEN MAPPING (SMART MEETING SYSTEM)

## 1. Mapping Principle
Each Screen MUST map:
Screen → UC → API → DB Entity

---

## 2. Authentication Screens

### Login Screen
- UC: UC-AUTH-01
- API: POST /auth/login
- DB: users, audit_logs

### Logout
- UC: UC-AUTH-02
- API: POST /auth/logout
- DB: audit_logs

---

## 3. Account Management Screens

### User List Screen
- UC: UC-AM-05
- API: GET /users
- DB: users, departments

### Create User Screen
- UC: UC-AM-01
- API: POST /users
- DB: users, user_roles

### Import Users Screen
- UC: UC-AM-02
- API: POST /users/import-jobs
- DB: users, background_jobs

### Department Screen
- UC: UC-AM-03
- API: POST /departments
- DB: departments

---

## 4. Mapping Rule (STRICT)

- 1 Screen = multiple APIs allowed
- BUT 1 API must belong to only 1 UC primary flow
- No direct DB access from FE

---

## 5. Role Mapping

| Role | Screens |
|------|--------|
| System Admin | All screens |
| Business Admin | Account + Config |
| Manager | Meeting + Reports |
| Employee | Meeting + Profile |