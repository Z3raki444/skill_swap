# Installation Manual

## Project Name

SkillSwap: A Web-Based Peer-to-Peer Skill Exchange Platform for Students

## System Requirements

- Node.js 18 or higher
- npm
- Modern web browser such as Chrome, Edge, Firefox, or Safari
- Optional: Docker and Docker Compose

## Local Installation Steps

1. Download or clone the project.

```bash
git clone https://github.com/<your-username>/skillswap.git
cd skillswap
```

2. Install all project dependencies.

```bash
npm install
```

3. Start the application.

```bash
npm start
```

4. Open the app in the browser.

```text
http://localhost:3000
```

## Database Setup

The SQLite database is created automatically as `database.db` when the app starts. The application also inserts demo data automatically if the database is empty.

Manual database initialization:

```bash
npm run init-db
```

Reset and seed the database:

```bash
npm run reset-db
```

## Demo Login

Use the following demo account:

```text
Email: praveen@example.com
Password: Password123
```

Other demo users:

```text
anna@example.com
david@example.com
sara@example.com
leon@example.com
maria@example.com
```

All demo users use the password `Password123`.

## Docker Installation

1. Build and start the container.

```bash
docker-compose up --build
```

2. Open the application.

```text
http://localhost:3000
```

3. Stop the application.

```bash
docker-compose down
```

## Common Problems

### Cannot find module error

Run:

```bash
npm install
```

### Port already in use

Start with another port:

```bash
PORT=4000 npm start
```

On Windows PowerShell:

```powershell
$env:PORT=4000; npm start
```
