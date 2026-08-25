# Nexus — Backend

Team project-management platform (Kanban/workspace SaaS) backend — collaborative workspaces, projects, boards, tasks, members, roles, invitations, and comments.

## Tech Stack

- **Runtime:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech)) via Prisma ORM
- **Auth:** JWT (access + refresh tokens) as httpOnly cookies, refresh token also persisted in DB for revocation
- **Validation:** Zod
- **Password hashing:** bcrypt

## Architecture

Layered pattern — each request flows through:

```
routes → validators (Zod) → middleware (auth/membership) → controllers (thin) → services (business logic) → repositories (Prisma)
```

```
src/
├── config/         # env loader, Prisma client singleton
├── controllers/    # request/response handling only — no business logic
├── middleware/      # requireAuth, requireWorkspaceMember, validate, error handler
├── repositories/    # all direct Prisma/DB calls
├── routes/          # route definitions, nested by resource
├── services/        # business logic, authorization rules, ApiError throwing
├── socket/          # Socket.IO setup (reserved for Phase 4 real-time features)
├── types/           # Express Request type augmentations
├── utils/           # jwt signing/verification, cookie helpers
├── validators/       # Zod schemas per resource
├── app.ts           # Express app config (middleware, routes, error handlers)
└── server.ts         # entry point — starts the HTTP server
```

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT secrets
npx prisma migrate dev --name init
npm run dev
```

Server runs on `http://localhost:5000` by default.

> ⚠️ Keep `NODE_ENV=development` in `.env` while working locally. Setting it to `production` forces `secure: true` on auth cookies, which get silently dropped over plain `http://localhost`.

## Data Model

```
User
 │
 ├──── WorkspaceMember ──── Workspace
 │        (role: OWNER/          │
 │         ADMIN/MEMBER)         ├── Project
 │                                │      │
 │                                │      └── Board
 │                                │            │
 │                                │            └── Column
 │                                │                  │
 │                                │                  └── Task
 │                                │                    │    ├── Comment
 │                                │                    │    └── Label
 │                                │                    └── assignee (User)
 │                                └── Invitation
 │
 └──── Comment / Activity / Notification (as author/actor)
```

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/refresh` | Rotate access token using refresh cookie |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Get current user |

### Workspaces
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workspaces` | Create workspace (creator becomes OWNER) |
| GET | `/api/workspaces` | List workspaces the user belongs to |
| GET | `/api/workspaces/:slug` | Get one workspace (must be a member) |

### Projects & Boards
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workspaces/:slug/projects` | Create project (auto-creates Board + TODO/IN PROGRESS/DONE columns) |
| GET | `/api/workspaces/:slug/projects` | List projects in a workspace |
| GET | `/api/workspaces/:slug/projects/:projectId` | Get project with full board (columns → tasks) |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workspaces/:slug/projects/:projectId/columns/:columnId/tasks` | Create task in a column |
| PATCH | `/api/workspaces/:slug/projects/:projectId/tasks/:taskId` | Update task fields |
| PATCH | `/api/workspaces/:slug/projects/:projectId/tasks/:taskId/move` | Move task to another column/position (drag-drop) |
| DELETE | `/api/workspaces/:slug/projects/:projectId/tasks/:taskId` | Delete task |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workspaces/:slug/projects/:projectId/tasks/:taskId/comments` | Add comment to a task |
| GET | `/api/workspaces/:slug/projects/:projectId/tasks/:taskId/comments` | List comments on a task |
| DELETE | `/api/workspaces/:slug/projects/:projectId/comments/:commentId` | Delete a comment (own comment, or OWNER/ADMIN) |

### Members & Invitations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/workspaces/:slug/invitations` | Invite a member by email (OWNER/ADMIN only) |
| GET | `/api/workspaces/:slug/invitations` | List pending invitations |
| POST | `/api/invitations/:token/accept` | Accept an invitation (must match invited email) |
| GET | `/api/workspaces/:slug/members` | List workspace members |
| PATCH | `/api/workspaces/:slug/members/:userId` | Change a member's role |
| DELETE | `/api/workspaces/:slug/members/:userId` | Remove a member |
| DELETE | `/api/workspaces/:slug/members/me` | Leave the workspace (OWNER cannot leave) |

## Role Permissions (RBAC)

| Action | OWNER | ADMIN | MEMBER |
|---|:---:|:---:|:---:|
| Create/delete project | ✅ | ✅ | ❌ |
| Invite as MEMBER | ✅ | ✅ | ❌ |
| Invite as ADMIN | ✅ | ❌ | ❌ |
| Change a MEMBER's role | ✅ | ✅ | ❌ |
| Change an ADMIN's role | ✅ | ❌ | ❌ |
| Remove a MEMBER | ✅ | ✅ | ❌ |
| Remove an ADMIN | ✅ | ❌ | ❌ |
| Remove the OWNER | ❌ | ❌ | ❌ |
| Create/view tasks & comments | ✅ | ✅ | ✅ |
| Delete own comment | ✅ | ✅ | ✅ |
| Delete others' comments | ✅ | ✅ | ❌ |
| Leave workspace | ❌ (must transfer ownership first) | ✅ | ✅ |

## Security Notes

- Every nested workspace route runs through `requireWorkspaceMember`, which confirms the logged-in user actually belongs to the workspace in the URL before anything else executes.
- Task and comment operations independently verify the resource belongs to the `:projectId` in the URL (`assertTaskBelongsToProject` / `assertColumnBelongsToProject`), preventing IDs from one project/workspace being used against another.
- Invitations use a cryptographically random 32-byte token (`crypto.randomBytes`) and can only be accepted by a logged-in user whose account email matches the invited email — looked up fresh from the database, not trusted from the JWT.

## Roadmap

- **Phase 3:** Activity feed, Notifications, Search, Analytics
- **Phase 4:** AI task breakdown, Socket.IO real-time board updates