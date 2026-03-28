# GizemTask

A kanban-based sprint board for agile teams. Create workspaces, manage sprints, and track work across To Do, In Progress, and Done columns with real-time updates.

**Live:** https://gizemtask.vercel.app

---

## Features

- **Workspaces** — Create or join workspaces via ID, switch between them from the sidebar
- **Sprint management** — Create sprints, track story points and progress
- **Kanban board** — Drag and drop tickets across columns with real-time sync
- **Backlog** — Manage unassigned tickets before pulling into a sprint
- **Tickets** — Priority levels, story points, labels, and descriptions
- **Auth** — Email/password and Google sign-in via Firebase

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router
- [Firebase](https://firebase.google.com) — Auth + Firestore real-time database
- [dnd-kit](https://dndkit.com) — Drag and drop
- [Tailwind CSS v4](https://tailwindcss.com)
- [TypeScript](https://typescriptlang.org)
- Deployed on [Vercel](https://vercel.com)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/itsmokur/gizemtask.git
cd gizemtask
npm install
```

### 2. Set up Firebase

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com), then enable:
- **Authentication** → Email/Password and Google providers
- **Firestore Database**

### 3. Configure environment variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Set Firestore rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Joining a Workspace

1. The workspace owner copies their **Workspace ID** from Settings
2. Go to the Workspaces page and click **Join by ID**
3. Paste the ID and join — you'll be redirected to the board instantly
