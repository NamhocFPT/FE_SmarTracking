# FE RULES — SMARTRACKING SYSTEM

## 1. Absolute Rules
- No fake API
- No mock business logic in production FE
- No bypass RBAC
- No direct DB assumptions

---

## 2. Architecture Rule

FE Structure:
- pages/
- modules/
- service/
- utils/
- hooks/
- store/
- components/

---

## 3. Data Rule
- API is SINGLE SOURCE OF TRUTH
- FE state is temporary cache only
- Never hardcode business data

---

## 4. Permission Rule
Every action must check:
- user.permissions[]
NOT role.name

---

## 5. Navigation Rule
- Route access must be protected
- Unauthorized route → redirect /403

---

## 6. Error Rule
- Always handle API error
- Never silent fail
- Always show user feedback

---

## 7. Performance Rule
- Use pagination for all lists
- Lazy load heavy modules
- Cache static reference data only