# Specification

## Summary
**Goal:** Require a password prompt on every visit to the `/admin` route before showing any admin-related UI.

**Planned changes:**
- Add a password entry gate that always appears first when navigating to `/admin`, regardless of current authentication/admin status.
- Validate the entered password against the exact required string; show an English “incorrect password” error on failure and keep the user on the password screen.
- On correct password entry, continue into the existing admin authentication/authorization flow (login if needed, dashboard/denied states as currently implemented).
- Ensure the password is not persisted (no sessionStorage/localStorage/URL params); refreshing or revisiting `/admin` requires re-entry.
- Remove or repurpose the existing “Emergency Access (Optional)” token-saving UX so admin access is controlled by the new password prompt (not by saving a token in sessionStorage).

**User-visible outcome:** Visiting `/admin` always prompts for a password first; only after entering the correct password does the user proceed to the normal admin login/dashboard/denied flow, and the password must be re-entered on refresh or return visits.
