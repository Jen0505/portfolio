# Source and modifications

This email backend adapts the FormBee email-only Express/Nodemailer implementation.
Upstream: https://github.com/FormBee/FormBee/blob/afd53c971dd6b36719eb24baae7d33ebc1a45e6a/docker-images/email-only/index.ts
License: MIT, reproduced in LICENSE.

Changes: JavaScript implementation, fixed recipient Jen, Reply-To, server-side validation, explicit origins, request limits, honeypot, duplicate suppression, truthful delivery responses, SMTP readiness, no personal-data logging, and allowlisted static files. It is an independently customised deployment, not the hosted FormBee service.
