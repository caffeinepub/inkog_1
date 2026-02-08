# Specification

## Summary
**Goal:** Fix immediate “Access Denied” for admins by adding the missing backend authorization modules, implementing admin bootstrapping, and ensuring authorization persists across canister upgrades.

**Planned changes:**
- Add the missing Motoko modules at `backend/authorization/access-control.mo` and `backend/authorization/MixinAuthorization.mo` so `backend/main.mo` imports resolve and the backend compiles.
- Implement the `AccessControl` API used by `backend/main.mo` (roles/permissions and `initState`, `isAdmin`, `hasPermission`, `assignRole`) with support for at least `#admin` and `#user`, returning English “Unauthorized” traps for admin-only calls by non-admins.
- Implement the `MixinAuthorization` mixin to expose `isCallerAdmin()` and `_initializeAccessControlWithSecret(secret : Text)` as required by the existing frontend auth flow.
- Add backend admin bootstrapping: if no admins exist yet, the first authenticated Internet Identity principal to initialize/check authorization becomes admin automatically; later callers remain non-admin unless granted.
- Persist authorization state across upgrades using the existing stable storage pattern in `backend/main.mo`, adjusting/adding `backend/migration.mo` only if required to preserve existing stable data.
- Validate end-to-end admin gating behavior in the frontend without modifying immutable hook/UI files: bootstrapped admin can access the Admin dashboard; non-admins continue to see the existing “Access Denied” UI.

**User-visible outcome:** On a fresh deploy, the first authenticated user becomes the admin and can access the Admin dashboard; other authenticated users remain blocked by the existing “Access Denied” screen unless explicitly granted admin rights, and admin access persists after upgrades.
