Happy - Tracking link implementation

This branch adds a minimal Node.js / Express implementation that provides a clickable tracking link which collects browser/device metadata (for consenting users) and logs it to clicks.log.

Files added
- package.json
- index.js
- public/track.html
- public/client.js
- .gitignore
- clicks.log (created on first write)

How it works
- Public link: GET /t/:id
  - Server logs immediate info (IP, headers) and serves public/track.html
  - The client page collects navigator info (userAgent, platform, screen size, connection), attempts geolocation (prompts user), posts to POST /collect, then redirects to the destination URL.
- POST /collect
  - Appends the collected payload to clicks.log along with server-obtained IP and timestamp.

Configuration
- DESTINATION_URL environment variable: set the final redirect destination (default: https://example.com)
- PORT environment variable: server port (default: 3000)

Run locally
1. Install dependencies: npm install
2. Start: DESTINATION_URL="https://example.com" npm start
3. Open http://localhost:3000/t/TEST123 to test

Important privacy & legal notes
- This implementation collects only browser-available metadata (IP, headers, userAgent, screen size, connection info) and optionally geolocation if the user grants permission. It does NOT and CANNOT collect phone numbers, IMEI, IMSI, local MAC addresses, contacts, or other privileged device identifiers from a web link.
- You MUST inform users and obtain their explicit consent before collecting geolocation or other personal data. Follow applicable laws (GDPR, CCPA, local regulations).
- Do not use this code for unlawful tracking, targeted harassment, or any activity that violates user privacy or terms of service.

Next steps / suggestions
- Use HTTPS in production (required for geolocation and secure transmission).
- Replace file-based logging with a database for production (SQLite/Postgres). Ensure access controls on logs.
- Add rate-limiting, input validation, and retention policies.

