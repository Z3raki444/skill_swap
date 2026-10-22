# SkillSwap: A Web-Based Peer-to-Peer Skill Exchange Platform for Students

SkillSwap is a full-stack web application that helps students exchange skills without payment. A student can offer a skill such as Python, German conversation, Excel, CV writing, presentation design, mathematics, or web development, and request another student's skill in return.

## Features

- User registration with password hashing
- Session-based login and logout
- Protected dashboard for logged-in users
- Editable user profile
- Add, view, edit, and delete skills
- Browse skills using keyword search and category filter
- Skill detail page with teacher information
- Send peer-to-peer swap requests
- Accept, reject, and complete requests
- Review and rating system for completed swaps
- Meaningful demo data for direct testing
- Responsive browser-based user interface
- Docker support using docker-compose

## Technology Stack

- Frontend: HTML, CSS, JavaScript, EJS templates
- Backend: Node.js and Express.js
- Database: SQLite
- Authentication: express-session and bcryptjs password hashing
- Other libraries: express-ejs-layouts, sqlite3

## Installation

1. Clone or download the project.

```bash
git clone https://github.com/Z3raki444/skill_swap.git
cd skill_swap
```

2. Install dependencies.

```bash
npm install
```

3. Start the application.

```bash
npm start
```

4. Open the application in your browser.

```text
http://localhost:3000
```

The database is created automatically when the application starts. If the database is empty, demo data is inserted automatically.

## Reset Demo Database

```bash
npm run reset-db
npm start
```

## Demo Login Credentials

All demo users use the same password:

```text
Password: Password123
```

Example accounts:

```text
praveen@example.com
anna@example.com
david@example.com
sara@example.com
leon@example.com
maria@example.com
```

## Docker Instructions

Build and start the app with Docker Compose:

```bash
docker-compose up --build
```

Then open:

```text
http://localhost:3000
```

Stop the containers:

```bash
docker-compose down
```

## Project Structure

```text
skillswap/
├── server.js
├── package.json
├── package-lock.json
├── database.db
├── db/
│   ├── init.js
│   └── seed.js
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
├── views/
│   ├── layout.ejs
│   ├── index.ejs
│   ├── register.ejs
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── profile.ejs
│   ├── skills.ejs
│   ├── add-skill.ejs
│   ├── skill-details.ejs
│   ├── requests.ejs
│   └── reviews.ejs
├── docs/
│   ├── installation_manual.md
│   ├── requirements.md
│   ├── architecture.md
│   ├── testing.md
│   └── technical_debt.md
├── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

## GitHub Submission Note

For portfolio submission, upload the complete project folder to a public GitHub repository and include the repository link in the required `.txt` file. Do not modify the GitHub repository after final submission if your university instructions prohibit changes.

## Screenshots

Add screenshots here after running the project:

- Home page
- Login page
- Dashboard
- Browse Skills
- Skill Details
- My Requests
- Profile

## Quality checks and implementation notes

A [GitHub Actions CI workflow](.github/workflows/ci.yml) installs dependencies, checks JavaScript syntax and initializes/seeds SQLite on each push and pull request.

See [local verification and production limitations](docs/VERIFICATION.md). Seed passwords and the default session secret are suitable **only for local demos**, not for a public deployment.

If this project has been submitted for coursework, review your university's post-submission modification rules **before merging** portfolio changes.
