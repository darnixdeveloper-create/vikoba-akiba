# Firestore Security Specification - Vikoba App

## Data Invariants
1. A transaction MUST belong to a member that exists.
2. Only an admin (Mwenyekiti) can add or remove members.
3. Every member must have a unique ID matching their document ID.
4. Settings can only be modified by an admin.
5. Notifications are system-generated (on the client side for now) but should be readable by all members.

## The "Dirty Dozen" Payloads

### 1. Identity Spoofing (Members)
**Payload:** `set /members/target-id { id: 'target-id', isAdmin: true, role: 'Mwenyekiti', ... }`
**Attacker:** A regular member trying to promote themselves.
**Expected:** PERMISSION_DENIED.

### 2. Orphaned Transaction
**Payload:** `set /historia/tx-1 { memberId: 'non-existent', amount: 50000, ... }`
**Attacker:** Any authenticated user.
**Expected:** PERMISSION_DENIED (relational check failed).

### 3. Update Gap (Settings)
**Payload:** `update /settings/config { amount: 1 }`
**Attacker:** A regular member trying to lower the contribution amount.
**Expected:** PERMISSION_DENIED (admin check failed).

### 4. PII Leak (Members)
**Action:** `get /members/some-member-id`
**Attacker:** Unauthenticated user.
**Expected:** PERMISSION_DENIED.

### 5. Shadow Field Injection (Member Creation)
**Payload:** `set /members/new-id { id: 'new-id', name: 'New User', isAdmin: false, ghostField: 'hacker' }`
**Attacker:** Admin (or anyone if logic is weak).
**Expected:** PERMISSION_DENIED (strict schema validation).

### 6. Negative Amount Transaction
**Payload:** `set /historia/tx-2 { amount: -1000000, ... }`
**Attacker:** Authenticated user.
**Expected:** PERMISSION_DENIED (value boundary check).

### 7. ID Poisoning (Members)
**Action:** `set /members/very-long-id-string-exceeding-limit... { ... }`
**Attacker:** Authenticated user.
**Expected:** PERMISSION_DENIED (ID size limit).

### 8. Resource Exhaustion (Notifications)
**Payload:** `set /notifications/n-1 { message: 'A'.repeat(200000), ... }`
**Attacker:** Authenticated user.
**Expected:** PERMISSION_DENIED (string size limit).

### 9. Tampering with History
**Action:** `update /historia/tx-id { amount: 0 }`
**Attacker:** Non-admin member trying to hide a payment.
**Expected:** PERMISSION_DENIED (immutable transaction fields).

### 10. Self-Assigned Role
**Payload:** `set /members/my-id { role: 'Mwenyekiti', isAdmin: true, ... }`
**Attacker:** Authenticated user during initial setup.
**Expected:** PERMISSION_DENIED (Role must be verified or restricted).

### 11. Bypassing Payment Status
**Action:** `update /members/id { paid: true }`
**Attacker:** Regular member trying to mark themselves as paid without a transaction.
**Expected:** PERMISSION_DENIED (Status field restricted to specific actions or admins).

### 12. Deleting Audit Logs
**Action:** `delete /historia/tx-id`
**Attacker:** Anyone.
**Expected:** PERMISSION_DENIED (Audit logs should be immutable/immortal).

## Test Runner (Simplified)
A full test runner would use `@firebase/rules-unit-testing`, but I will implement the rules to block these cases.
