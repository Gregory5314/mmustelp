# Role-Based Access, Permissions & Notifications

This is a substantial expansion. Here's how I'll structure it so it stays maintainable.

## 1. Roles & Permissions (database-driven)

Extend the `app_role` enum and add a permissions map table so we can add roles later without code changes.

**New roles** (added to `app_role`):
`president`, `vice_president`, `treasurer`, `event_manager`,
`comm_officer_y1`, `comm_officer_y2`, `comm_officer_y3`, `comm_officer_y4`,
`secretary_general`, `assistant_secretary`, `alumni_manager`,
`mentorship_coordinator`, `welfare_coordinator`
(existing `admin` becomes legacy → migrated to `president` for the bootstrap account; `member` unchanged.)

**New tables**

- `role_permissions(role app_role, permission text)` — seeded with the map below. Editable by president only.
- `subscriptions(profile_id, status, year, updated_by, updated_at)` — membership active/inactive.
- `events(id, title, starts_at, location, status [upcoming|successful|cancelled], created_by)`.
- `financial_reports(id, title, file_url, period, uploaded_by, created_at)`.
- `meeting_reports(id, title, file_url, meeting_date, uploaded_by)`.
- `alumni(id, full_name, graduation_year, contact, added_by)`.
- `mentorship_activities(id, title, description, activity_date, created_by)`.
- `mentor_assignments(id, profile_id, school, assigned_until, assigned_by)`.
- `notifications(id, recipient_id, type, title, body, link, read_at, created_at)` — one row per recipient.
- `chapter_profile(id singleton, name, motto, about, logo_url, updated_by)`.

**Permission keys** (seeded into `role_permissions`):
`profile.chapter.edit`, `admins.manage`,
`subscriptions.update`, `finance.upload`,
`events.update`, `events.complete`,
`members.add.y1` … `members.add.y4`, `members.add.any`,
`meetings.upload`, `alumni.manage`,
`mentorship.update`, `mentorship.assign`,
`complaints.view`, `complaints.resolve`.

**Security**: a SECURITY DEFINER function `public.has_permission(uid, perm)` checks `user_roles ⨝ role_permissions`. All RLS policies use it. Frontend mirrors with a `usePermission(perm)` hook reading the same data via a server fn.

## 2. Server-side enforcement

A `requireSupabasePermission(perm)` middleware wraps `requireSupabaseAuth` and rejects 403 if the user lacks the permission. Every mutating server fn (create event, upload report, change subscription, etc.) uses it. RLS policies are the second line of defense.

## 3. Complaints (restrict viewing)

Update `complaints` RLS: replace "admin" with `has_permission(uid, 'complaints.view')` — granted only to president, vice_president, welfare_coordinator. Submitters still see their own.

## 4. Notifications system

Replace the static notifications page with the new `notifications` table.

**Triggers** (Postgres triggers + helper `enqueue_notification(role_or_perm, ...)`):
- New event inserted → notify everyone (event reminder).
- New financial report → notify everyone.
- Subscription status changed → notify the affected member.
- New complaint → notify users with `complaints.view`.
- Complaint resolved → notify submitter.
- New alumni / mentorship activity → notify everyone.

UI: notifications page lists rows for the current user, "mark as read" updates `read_at`. Bell badge shows unread count.

Email delivery: deferred (can be added later via Lovable Email + the same notification rows as the source of truth).

## 5. UI changes

- **Admin → Manage Members**: role dropdown now lists all roles; only president sees "Make president / vice president".
- **New admin pages** (gated by permission):
  - `/admin/events` — create, edit, mark successful (event_manager).
  - `/admin/finance` — upload financial reports (treasurer).
  - `/admin/meetings` — upload meeting reports (secretary_general, assistant_secretary).
  - `/admin/subscriptions` — toggle member subscription status (treasurer, secretary_general, assistant_secretary).
  - `/admin/alumni` — manage alumni (alumni_manager).
  - `/admin/mentorship` — activities + temp school assignments (mentorship_coordinator).
  - `/admin/chapter` — edit chapter profile (president only).
- Existing public pages (`/activities`, `/finance`, `/officials`) read from the new tables instead of hardcoded data.
- Side menu hides links the user lacks permission for.

## 6. Migration order

1. Migration A: enum expansion + `role_permissions`, `has_permission`, seed map, migrate existing `admin` users to `president`.
2. Migration B: feature tables (events, finance, meetings, alumni, mentorship, subscriptions, chapter_profile, notifications) + RLS + triggers.
3. Server fns + middleware.
4. UI pages + permission-gated menu.
5. Wire complaints + notifications page to the new system.

## Technical notes

- Bootstrap admin (`2018/050/14879`) is auto-upgraded to `president` in migration A.
- All new tables: `GRANT` to `authenticated` + `service_role`, RLS enabled, policies via `has_permission`.
- Notifications use realtime: enable replication on `public.notifications` so the bell updates live.
- Frontend uses TanStack Query + a single `usePermissions()` hook that caches the list of permissions for the current user.

## Scope check

This is ~2 migrations, ~8 new admin pages, ~10 new server functions, plus refactors to existing pages. Want me to build it all in one pass, or stage it (e.g. permissions + complaints + notifications first, then the per-role admin pages in a follow-up)?
