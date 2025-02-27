# GitLab Release Manager

A web application for creating and managing merge requests across multiple GitLab projects at once.

## Features

- Connect with your GitLab personal access token
- Browse and search your GitLab projects
- Create merge requests for multiple projects at once
- Configure per-project target branches
- View all your merge requests across projects in one place
- Filter merge requests by state (open, merged, closed)
- Close existing merge requests
- Secure token handling (client-side encryption, session storage option)
- Local caching of project data for improved performance

## Architecture

This application consists of two main components:

1. **Frontend**: Next.js application with React, Tailwind CSS, and shadcn UI
   - React Query for data fetching and caching
   - LocalStorage for project data caching
   - Client-side token management

2. **Backend**: Bun server with Elysia framework for API handling
   - Proxies requests to GitLab API
   - Handles token encryption/decryption
   - Provides unified API endpoints

## Getting Started

### Prerequisites

- Node.js 18+ for the frontend
- Bun latest version for the backend

### Installation

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
cd server
bun install
```

3. Configure the environment:

Create a `.env` file in the server directory with:

```
PORT=3001
GITLAB_API_URL=https://gitlab.com/api/v4
ENCRYPTION_KEY=your_secret_key_for_encryption
```

### Development

1. Start the backend:

```bash
cd server
bun dev
```

2. Start the frontend:

```bash
npm run dev
```

Visit `http://localhost:3000` to use the application.

### Key Features

#### Merge Request Management
- Create merge requests across multiple projects with a single operation
- View all your merge requests in one unified dashboard
- Filter by state (open, merged, closed)

#### Performance Optimizations
- Local caching of project data to reduce API calls
- Cache invalidation after 24 hours or on manual refresh
- Visual indicators showing when data is served from cache

#### Security Considerations
- Option to use session storage for sensitive token data
- Project caching only stores non-sensitive information
- Tokens are never exposed to the frontend directly

## Security

- GitLab tokens are encrypted before storage
- Option to store token in session storage (cleared when browser closes)
- No tokens are stored on the server, only used transiently
- All API requests are proxied through the backend for improved security
- Project caching only stores non-sensitive information in localStorage

## License

MIT