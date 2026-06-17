# Technical Debt and Future Improvements

## Current Limitations

1. The application uses a simple monolithic Express.js structure. This is suitable for a student project but can be split into controllers, services, and models in a larger system.
2. SQLite is sufficient for local usage and small deployments, but a production version may require PostgreSQL or MySQL.
3. Authentication is session-based and simple. A production version should include email verification, password reset, stronger session secrets, and HTTPS-only cookies.
4. There is no real-time chat between matched students.
5. There is no calendar integration for scheduling swap sessions.
6. Reviews are linked to completed requests but do not include detailed moderation controls.
7. The current search is based on SQL LIKE queries and does not include advanced ranking.
8. The application does not currently upload profile images.
9. The Docker setup is simple and uses local SQLite storage inside the container unless a volume is configured.
10. Automated unit and integration tests are not included in this first version.

## Future Improvements

1. Add direct messaging between students.
2. Add calendar-based scheduling for accepted swaps.
3. Add email notifications for new requests and status changes.
4. Add profile images and skill badges.
5. Add admin moderation for inappropriate content.
6. Add advanced search with tags and sorting by rating.
7. Add REST API endpoints for future mobile app support.
8. Add automated tests using Jest and Supertest.
9. Add deployment configuration for Render, Railway, or Fly.io.
10. Improve accessibility testing and keyboard navigation.
