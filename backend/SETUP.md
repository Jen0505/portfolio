# Activate Jen's enquiry emails

The form is implemented, but actual delivery is **not active** until the email service is configured. A static HTML host alone cannot send email. Direct email, WhatsApp and LinkedIn links work independently.

## Included open-source backend

This package contains a customised MIT-licensed FormBee email-only backend (see NOTICE.md and LICENSE). It sends enquiries only to **jensebastian2001@gmail.com**. The notification includes the visitor's message, role, company, email, and preferred WhatsApp number or LinkedIn profile. Reply-To is the visitor's validated email.

1. Use Node.js 22 or later. Run `npm ci --prefix backend`.
2. Copy `backend/.env.example` to `backend/.env`. Fill in the SMTP provider, username, verified sender and SMTP password in this private file or in your hosting provider's secret settings. Do not send passwords in chat or embed them in contact-config.json.
3. Set `PUBLIC_ORIGIN` to the exact HTTPS portfolio origin (no trailing slash). Set `TRUST_PROXY_HOPS` only for your host's known proxy topology. Leave it blank for direct hosting.
4. Run `npm start --prefix backend`. It serves the portfolio and backend together on port 8787 (or your host's PORT). For local checks use `PUBLIC_ORIGIN=http://127.0.0.1:8787` and `HOST=127.0.0.1`.
5. Publish that service behind HTTPS. For Docker, run `docker build -f backend/Dockerfile -t jen-portfolio .` from the package root and supply the private environment variables at runtime. Never copy .env into the image.
6. The contact page checks `/formbee/health` before enabling Send enquiry. The server verifies SMTP connectivity on startup. After changing SMTP settings, restart it.
7. Send one clearly labelled test enquiry and confirm it reaches Jen's inbox. Check spam if needed. SMTP acceptance is not proof of inbox delivery; the UI deliberately says the email service accepted the enquiry.

The server serves only the three public HTML files. Do not replace its allowlist with an unrestricted static-files handler: configuration and source are private. The default deployment assumes one server instance. Rate limits and duplicate suppression are in memory; they reset on restart. Add persistent shared rate/deduplication storage before scaling horizontally. SMTP supplies its own delivery handling after acceptance; this service has no persistent retry queue.

## Hosted FormBee instead

Create/verify a form with Jen's recipient address in your FormBee account. Obtain its **public submission endpoint** and configure origin restrictions there. Only after the account is activated, replace `endpoint` in contact-config.json with the exact endpoint supplied by FormBee and set `healthEndpoint` to null. Run `python3 build.py` and publish both HTML pages.

This site currently targets the included JSON email-only API. Hosted FormBee accounts may require their own API key, form ID or CAPTCHA configuration. Confirm the account's integration example before switching; do not assume an arbitrary hosted endpoint is compatible. No account, endpoint or SMTP credentials were available during implementation.

## Verification

`npm test --prefix backend` exercises fixed recipient, Reply-To, notification fields, duplicate suppression, validation, unconfigured service, SMTP failures, rate limiting and private-file protection with a fake transport. No real mail is sent by these tests. Browser testing also covered success/failure and the retained email-app fallback with a local-only fake mail service. The test harness is not in the delivery package.

WhatsApp uses +61 470 517 150 via https://wa.me/61470517150. The phone must be registered with WhatsApp; account ownership/registration has not been verified. Links open a prepared conversation, not an automatically sent message. LinkedIn opens Jen's supplied profile; the visitor completes the connection request in LinkedIn. These clicks do not silently email Jen or report that a social connection was completed.
