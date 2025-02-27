# GitLab MR Backend Server

This is a Bun-powered backend server for the GitLab MR application.

## Features

- Built with [Bun](https://bun.sh/) for high performance
- Uses [Elysia](https://elysiajs.com/) for API routing
- Swagger documentation included
- GitLab API integration for managing merge requests

## Getting Started

### Prerequisites

- Bun installed (latest version recommended)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Create a `.env` file with your configuration:

```
PORT=3001
GITLAB_API_URL=https://gitlab.com/api/v4
ENCRYPTION_KEY=your_secret_key_for_encryption
```

### Development

Start the development server with hot reload:

```bash
bun dev
```

### Production

Start the production server:

```bash
bun start
```

## API Documentation

Swagger documentation is available at `/swagger` when the server is running.

## Endpoints

- `POST /auth/validate` - Validate GitLab token
- `GET /projects` - Get user's GitLab projects
- `GET /projects/:id/branches` - Get branches for a project
- `GET /projects/:id/branches/:branchName/exists` - Check if a branch exists
- `POST /merge-requests/check` - Check for existing merge requests
- `POST /merge-requests/create` - Create merge requests
- `POST /merge-requests/:projectId/:mergeRequestIid/close` - Close a merge request