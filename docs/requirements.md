# Requirements Specification

## Project Objective

The objective of SkillSwap is to provide a browser-based platform where students can exchange skills with each other without payment. The application supports peer-to-peer learning by allowing students to offer skills, browse available skills, send swap requests, manage request statuses, and provide reviews after completed exchanges.

## Target Users

- University students
- International students
- Beginner programmers
- Students preparing for exams
- Students looking for career support
- Students interested in language or communication practice

## User Roles

### Visitor

A visitor can open the home page, view the project concept, register, or log in.

### Registered Student

A registered student can manage a profile, add offered skills, browse skills, send requests, manage received requests, complete swaps, and write reviews.

## Functional Requirements

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-01 | Register account | Users can create an account using name, email, password, course, and bio. | High |
| FR-02 | Password hashing | Passwords must be hashed before storage. | High |
| FR-03 | Login and logout | Users can log in and log out using session-based authentication. | High |
| FR-04 | Protected pages | Dashboard, profile, skills, requests, and reviews must require login. | High |
| FR-05 | Dashboard | Users can see a summary of skills offered and request counts. | High |
| FR-06 | Profile update | Users can update name, course, bio, wanted skills, and availability. | High |
| FR-07 | Add skill | Users can add a skill they can teach. | High |
| FR-08 | Browse skills | Users can browse all available skills. | High |
| FR-09 | Search and filter | Users can search by keyword and filter by category. | Medium |
| FR-10 | Skill details | Users can view skill details and teacher profile summary. | High |
| FR-11 | Send request | Users can send a skill swap request to another student. | High |
| FR-12 | Manage requests | Users can accept, reject, complete, and review requests. | High |
| FR-13 | Review system | Users can leave rating and feedback after completed swaps. | Medium |
| FR-14 | CRUD for skills | Users can create, read, update, and delete their own skills. | High |
| FR-15 | Demo data | The app must include meaningful sample users, skills, and requests. | High |

## Non-Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| NFR-01 | Usability | The interface must be simple, clear, and self-explanatory. |
| NFR-02 | Responsiveness | The app must work on desktop and mobile browsers. |
| NFR-03 | Security | Passwords must not be stored in plain text. |
| NFR-04 | Maintainability | Code must be organized into clear folders and documented. |
| NFR-05 | Portability | The app must run locally using npm and with Docker Compose. |
| NFR-06 | Performance | Basic pages should load quickly for a small student community. |
| NFR-07 | Reliability | The database should be initialized automatically if missing. |

## Main Use Cases

### Use Case 1: Register as a Student

1. Visitor opens the register page.
2. Visitor enters name, email, password, course, and bio.
3. System hashes the password.
4. System creates the account and starts a session.
5. User is redirected to the dashboard.

### Use Case 2: Add a Skill

1. Student opens Add Skill.
2. Student enters title, category, description, level, and availability.
3. System validates required fields.
4. System stores the skill in the database.
5. Skill becomes visible in Browse Skills.

### Use Case 3: Send a Swap Request

1. Student browses skills.
2. Student opens a skill detail page.
3. Student enters a request message and offered exchange skill.
4. System creates a request with status Pending.
5. Teacher can accept or reject the request.

### Use Case 4: Complete and Review a Swap

1. Student or teacher marks an accepted request as completed.
2. System updates status to Completed.
3. Participants can leave a rating and comment.
4. Review appears on the reviews page and teacher profile.
