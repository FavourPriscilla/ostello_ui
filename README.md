# Ostello UI — Hostel Discovery & Booking Frontend

> **Learning Project** — A React 19 + Vite 6 single-page application that
> talks to the Ostello REST API. Built by MUSASIZI KENNETH to help students
> understand how modern frontend applications are structured and how they
> communicate with a backend API.

---

## Table of Contents

1. [What is This App?](#what-is-this-app)
2. [What You Will Learn](#what-you-will-learn)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Setup — Step by Step](#setup--step-by-step)
7. [Environment Variables](#environment-variables)
8. [Pages & Features](#pages--features)
9. [How the Frontend Talks to the API](#how-the-frontend-talks-to-the-api)
10. [Authentication Flow](#authentication-flow)
11. [Role-Based Access](#role-based-access)
12. [Key Concepts Explained](#key-concepts-explained)
13. [Available Scripts](#available-scripts)

---

## What is This App?

Ostello UI is the student-facing web application for the Ostello hostel
platform. Depending on the logged-in user's role it shows different pages:

- **Students** browse hostels, view rooms, make bookings, pay, and leave reviews.
- **Custodians** (hostel owners) manage their hostels and rooms, and
  approve or decline booking requests.
- **Admins** manage all users across the platform.

---

## What You Will Learn

- **React fundamentals** — components, props, state, effects
- **React Router v7** — client-side routing, protected routes, role guards
- **API calls from React** — `fetch`, async/await, error handling
- **JWT authentication** in a SPA — storing tokens, decoding payloads,
  attaching `Authorization` headers
- **Material-UI (MUI) v7** — a component library for building professional UIs
- **Responsive design** — adapting layouts for mobile and desktop
- **Global state** — lifting state to `AppRouter`, passing via props
- **Vite** — a fast modern build tool and development server

---

## Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| **React** | 19 | UI component framework |
| **Vite** | 6 | Build tool and dev server |
| **React Router DOM** | 7 | Client-side page routing |
| **MUI (Material-UI)** | 7 | Pre-built, accessible UI components |
| **MUI Icons** | 7 | Thousands of SVG icons |
| **Recharts** | 3 | Chart library (used in Dashboard) |

---

## Project Structure

```
ostello_ui/
│
├── index.html              ← Single HTML page — React mounts into <div id="root">
├── vite.config.js          ← Vite build configuration
├── package.json            ← npm metadata & scripts
│
└── src/
    ├── main.jsx            ← Entry point: renders <App /> into the DOM
    ├── App.jsx             ← Wraps the whole app (theme provider, global styles)
    ├── AppRouter.jsx       ← All route definitions + auth/role guards
    ├── theme.js            ← Global brand colours (BRAND, STATUS_COLORS, etc.)
    │
    ├── assets/             ← Static images and SVGs
    │
    ├── components/         ← Small reusable pieces used across pages
    │   └── Toast.jsx       ← Pop-up notification (success / error / warning)
    │
    ├── hooks/              ← Custom React hooks (reusable stateful logic)
    │   └── useToast.js     ← Controls Toast visibility and message
    │
    ├── layouts/            ← Full-page wrappers that provide the app shell
    │   ├── MainLayout.jsx  ← Legacy simple layout
    │   └── ModernLayout.jsx← Current layout: sidebar navigation + topbar
    │
    ├── pages/              ← One file per "screen" in the app
    │   ├── Login.jsx       ← Email + password login form
    │   ├── Register.jsx    ← New account registration form
    │   ├── Dashboard.jsx   ← Role-specific overview with KPI cards
    │   ├── HostelList.jsx  ← Search + browse all hostels (STUDENT / ADMIN)
    │   ├── HostelDetail.jsx← Single hostel: rooms, booking form, reviews
    │   ├── MyBookings.jsx  ← Student's booking history + status tabs
    │   ├── ManageHostels.jsx← Custodian CRUD for hostels + rooms
    │   ├── BookingRequests.jsx← Custodian approve/decline requests
    │   └── Users.jsx       ← Admin user management (grid + table views)
    │
    └── utils/
        └── api.js          ← ALL backend API calls live here (single source of truth)
```

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| **Node.js** | v18 | https://nodejs.org |
| **npm** | v9 | Comes with Node.js |
| **ostello_api** running | — | The UI is useless without the backend |

Check your versions:

```bash
node --version   # v18.x.x or higher
npm --version    # 9.x.x or higher
```

---

## Setup — Step by Step

> **Important:** Start the backend API first. The UI makes API calls to
> `http://localhost:3000`. If the API is not running you will see network
> errors in the browser.

### Step 1 — Start the backend (in a separate terminal)

```bash
cd ostello_api
npm start        # starts the Express server on http://localhost:3000
```

### Step 2 — Install frontend dependencies

Open a **new terminal** tab and run:

```bash
cd ostello_ui
npm install
```

### Step 3 — Start the development server

```bash
npm run dev
```

Vite will start a local server. You should see output like:

```
  VITE v6.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Step 4 — Open the app

Navigate to **http://localhost:5173** in your browser.

Log in with any of the seeded accounts (password is `password123` for all):

| Email | Role |
|-------|------|
| `alice@student.com` | Student |
| `john@ostello.com` | Custodian |
| `admin@ostello.com` | Admin |

---

## Environment Variables

By default the app calls the API at `http://localhost:3000`. If you need to
point it at a different host (e.g. a deployed server), create a file named
`.env` in the `ostello_ui/` directory:

```dotenv
# The base URL of your Ostello API server
VITE_API_BASE_URL=http://localhost:3000
```

Then update `src/utils/api.js` to read this value:

```js
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

> **Why `VITE_` prefix?** Vite only exposes environment variables that start
> with `VITE_` to your browser code — other variables stay server-side only.
> This prevents secrets from leaking into the built bundle.

---

## Pages & Features

### Public pages (no login required)

| Page | Path | What it does |
|------|------|-------------|
| Login | `/login` | Email + password form, stores JWT in localStorage |
| Register | `/register` | Creates a new account with role selection |

### Student pages

| Page | Path | Key features |
|------|------|-------------|
| Dashboard | `/dashboard` | Booking count KPI cards, quick links |
| Browse Hostels | `/hostels` | Search by name, price range filter, amenity chips |
| Hostel Detail | `/hostels/:id` | Room list, booking form, photo carousel, reviews |
| My Bookings | `/my-bookings` | Status filter tabs, Pay / Cancel actions |

### Custodian pages

| Page | Path | Key features |
|------|------|-------------|
| Dashboard | `/dashboard` | Stats: total rooms, active bookings, pending requests |
| Manage Hostels | `/manage-hostels` | Create / edit / delete hostels and rooms |
| Booking Requests | `/booking-requests` | Status tabs, Approve / Decline buttons |

### Admin pages

| Page | Path | Key features |
|------|------|-------------|
| Dashboard | `/dashboard` | Platform-wide hostel and user counts |
| Users | `/users` | Grid and table view, edit role, delete user |

---

## How the Frontend Talks to the API

All API communication lives in **`src/utils/api.js`**.

Each function follows the same pattern:

```js
// Example: fetch all hostels
export async function searchHostels(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/api/hostels?${query}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    return data;
}
```

1. Build the URL (with any query parameters)
2. Call `fetch()`
3. Parse the JSON response
4. If `res.ok` is false (status 400–599), throw an error so the calling
   component can show a message to the user
5. Otherwise return the data

Protected endpoints also include the JWT:

```js
export async function getMyBookings(token) {
    const res = await fetch(`${BASE}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    // ...
}
```

---

## Authentication Flow

```
1. User fills in Login form
        ↓
2. Login.jsx calls api.login(email, password)
        ↓
3. API responds with { token, user }
        ↓
4. AppRouter stores token in:
   - React state  (so components re-render)
   - localStorage (so it survives a page refresh)
        ↓
5. decodeToken() reads the JWT payload (base64) to get { id, email, role }
   — no extra API call needed
        ↓
6. Every protected API call attaches:
   Authorization: Bearer <token>
        ↓
7. On logout: token cleared from state + localStorage → redirected to /login
```

---

## Role-Based Access

`AppRouter.jsx` wraps role-restricted routes in a `<RoleRoute>` guard:

```jsx
<Route path="/my-bookings" element={
    <Page token={token} user={user} handleLogout={handleLogout}>
        <RoleRoute user={user} roles={['STUDENT']}>
            <MyBookings token={token} />
        </RoleRoute>
    </Page>
} />
```

If a CUSTODIAN navigates to `/my-bookings`, `RoleRoute` redirects them to
`/dashboard` immediately. This mirrors the backend's `authorize()` middleware
— both layers check the role.

The sidebar navigation in `ModernLayout.jsx` also filters menu items by role,
so users only see links relevant to them.

---

## Key Concepts Explained

### What is a SPA (Single-Page Application)?

The browser loads `index.html` **once**. After that, React Router intercepts
link clicks and swaps out the page content without a full browser reload. This
makes navigation feel instant.

### Why store the JWT in localStorage?

`localStorage` persists across page refreshes and browser tabs. The alternative
— storing it in React state only — would log the user out every time they
refresh the page.

> **Security note:** localStorage is readable by JavaScript, making it
> vulnerable to XSS attacks. For a production app, consider using an
> `httpOnly` cookie instead. For a learning project, localStorage is fine.

### What is a custom hook (`useToast`)?

A custom hook is a regular JavaScript function whose name starts with `use`
and which calls other React hooks. `useToast` encapsulates the toast
`open/close/message` state so any page can show notifications without
copy-pasting the same state logic:

```js
const { toast, showToast, hideToast } = useToast();
showToast('Booking confirmed!', 'success', 'Done');
```

### Why does `ModernLayout` use a `Drawer`?

On desktop (≥ 960 px) the sidebar is always visible (`variant="permanent"`).
On mobile it slides in as an overlay when the user taps the hamburger icon
(`variant="temporary"`). This is the standard responsive navigation pattern.

### What is MUI's `sx` prop?

Instead of writing a separate CSS file, MUI's `sx` prop lets you write styles
directly on a component as a JavaScript object:

```jsx
<Box sx={{ bgcolor: '#0E7C6B', borderRadius: 2, p: 3 }}>
```

It supports responsive values, theme tokens, and pseudo-selectors like `&:hover`.

---

## Available Scripts

```bash
# Start the development server with hot-reload
npm run dev

# Check for code style issues (ESLint)
npm run lint

# Build an optimised production bundle into dist/
npm run build

# Preview the production build locally
npm run preview
```

---

*Happy Coding! 🚀 — Start by reading `AppRouter.jsx` to understand how all
the pages connect, then dive into individual page files.*


A modern, beautiful, and robust ReactJS frontend built with Vite, designed to connect seamlessly to an Express/MySQL backend API for user management.

## Features
- User listing, update, and delete functionality
- Responsive and attractive UI using Material-UI (MUI)
- Fast development and build with Vite
- Easy integration with RESTful backend APIs

## Project Structure
```
├── public/                # Static assets
├── src/
│   ├── assets/            # Images and icons
│   ├── components/        # Reusable UI components
│   ├── layouts/           # Layout wrappers (MainLayout, ModernLayout)
│   ├── pages/             # Page components (Dashboard, Users, Login, Register, Chapters)
│   ├── utils/             # Utility functions (e.g., api.js for backend calls)
│   ├── App.jsx            # Main app component
│   ├── AppRouter.jsx      # Routing setup
│   ├── main.jsx           # Entry point
│   └── ...
├── package.json           # Project metadata and dependencies
├── vite.config.js         # Vite configuration
├── README.md              # Project documentation
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone this repository or copy the project files.
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. Open your browser and navigate to the local server URL (usually http://localhost:5173).

### Building for Production
```sh
npm run build
# or
yarn build
```
The production-ready files will be in the `dist/` directory.

## API Integration
- All user management features connect to an Express backend (see `src/utils/api.js` for API calls).
- Update the API base URL in `api.js` as needed to match your backend server.

## Customization
- UI components are built with Material-UI for easy theming and customization.
- Layouts and pages can be extended or replaced as your project grows.

## Folder Descriptions
- `components/`: Reusable UI elements (buttons, forms, tables, etc.)
- `layouts/`: Page wrappers for consistent look and feel
- `pages/`: Main application pages (Users, Dashboard, Login, etc.)
- `utils/`: Helper functions and API logic

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
This project is open source and available under the MIT License.

---

For more details, see the code comments and folder structure. Happy coding!

