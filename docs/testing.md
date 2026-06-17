# Testing Documentation

## Testing Approach

SkillSwap was tested manually using browser-based functional testing. Each major feature was tested using meaningful demo data and real user flows.

## Test Data

Demo password for all users:

```text
Password123
```

| User | Email | Offered Skill Example | Wants to Learn |
|---|---|---|---|
| Praveen Muthukumar | praveen@example.com | Python Basics | German speaking practice |
| Anna Schneider | anna@example.com | German A1 Conversation | Excel |
| David Miller | david@example.com | CV and LinkedIn Review | Web development |
| Sara Khan | sara@example.com | Presentation Design | Mathematics support |
| Leon Fischer | leon@example.com | HTML and CSS | Public speaking |
| Maria Gomez | maria@example.com | Excel Formulas | German grammar |

## Manual Test Cases

| ID | Test Case | Steps | Expected Result | Status |
|---|---|---|---|---|
| TC-01 | Register new user | Open Register, enter valid details, submit | User account is created and dashboard opens | Pass |
| TC-02 | Duplicate email validation | Register using an existing email | Error message is displayed | Pass |
| TC-03 | Login with correct credentials | Enter valid email and password | User is redirected to dashboard | Pass |
| TC-04 | Login with wrong password | Enter valid email and wrong password | Error message is displayed | Pass |
| TC-05 | Protected page access | Open `/dashboard` without login | User is redirected to login page | Pass |
| TC-06 | Update profile | Edit course, bio, wanted skills, availability | Updated data appears on profile page | Pass |
| TC-07 | Add skill | Open Add Skill, fill all required fields, submit | Skill appears in Browse Skills and Profile | Pass |
| TC-08 | Edit own skill | Open Profile, click Edit, update skill details | Updated skill is saved | Pass |
| TC-09 | Delete own skill | Open Profile, click Delete | Skill is removed from profile and browse page | Pass |
| TC-10 | Browse skills | Open Browse Skills | List of skills appears | Pass |
| TC-11 | Search skills | Search for `Python` | Python-related skills are shown | Pass |
| TC-12 | Filter category | Select `Language` category | Only language skills are shown | Pass |
| TC-13 | View skill details | Open a skill card | Full skill and teacher details are shown | Pass |
| TC-14 | Send request | Open another user's skill and submit request | New request appears in My Requests | Pass |
| TC-15 | Prevent self-request | Open own skill | Request form is not shown | Pass |
| TC-16 | Accept request | Login as receiver and accept pending request | Request status changes to Accepted | Pass |
| TC-17 | Reject request | Login as receiver and reject pending request | Request status changes to Rejected | Pass |
| TC-18 | Complete request | Mark accepted request as completed | Request status changes to Completed | Pass |
| TC-19 | Submit review | Submit rating and comment for completed request | Review appears on Reviews page | Pass |
| TC-20 | Responsive navigation | Open app on small screen and click menu button | Navigation opens and closes correctly | Pass |

## Additional Testing Notes

- Passwords are hashed and are not visible in plain text in the database.
- Session-protected routes redirect unauthenticated users to login.
- Users can edit and delete only their own skills.
- Users cannot send a request to their own skill.
- Reviews are limited to completed requests.
