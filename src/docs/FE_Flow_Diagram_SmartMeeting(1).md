# FE FLOW DIAGRAM — SMART MEETING SYSTEM

## 1. Flow Type
This document defines UI state machine, NOT backend logic.

---

## 2. Authentication Flow

Login Flow:
[Login Screen]
   ↓ submit
[Call API login]
   ↓ success
[Store token]
   ↓
[Load permissions]
   ↓
[Dashboard]

Failure:
→ show error message
→ stay on login

---

## 3. User Management Flow

Create User Flow:
[List Users]
   ↓ click "Create"
[Create Form Modal]
   ↓ submit
[POST /users]
   ↓ success
[Refresh list]
   ↓
[Toast success]

---

## 4. Meeting Flow

Create Meeting:
[Meeting List]
   ↓
[Create Meeting Screen]
   ↓
[Validate time + participants]
   ↓
[POST /meetings]
   ↓
[Success → Meeting Detail]

---

## 5. Real-time Rules
- UI updates via polling or websocket
- DO NOT trust UI state alone
- Always re-sync after mutation API