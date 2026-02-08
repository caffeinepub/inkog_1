# Specification

## Summary
**Goal:** Ensure the first authenticated Internet Identity principal can access the Admin page on a fresh deployment by automatically bootstrapping the initial admin when no admins exist.

**Planned changes:**
- Add backend logic to detect when zero admin principals are configured and automatically grant admin (and any required base user permission) to the first authenticated caller who triggers an admin check.
- Preserve existing authorization behavior once an admin exists (non-admins remain denied unless explicitly granted).
- Update setup/deployment documentation to explain the initial-admin bootstrapping flow and what happens when an admin already exists.

**User-visible outcome:** On a fresh deployment, the first user who logs in with Internet Identity and visits the admin route is granted access to the admin dashboard; after that, other users without admin rights continue to see Access Denied until granted admin.
