# GitLab Release Manager

A web application for creating and managing merge requests across multiple GitLab projects at once.

## Features

- Connect with your GitLab personal access token
- Browse and search your GitLab projects
- Create merge requests for multiple projects at once
- Configure per-project target branches
- View merge request status (open, closed)
- Close existing merge requests
- Secure token handling (client-side encryption, session storage option)

## Architecture

This application consists of two main components:

1. **Frontend**: Next.js application with React, Tailwind CSS, and shadcn UI
2. **Backend**: Bun server with Elysia framework for API handling

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

## Security

- GitLab tokens are encrypted before storage
- Option to store token in session storage (cleared when browser closes)
- No tokens are stored on the server, only used transiently
- All API requests are proxied through the backend for improved security

## License

MIT