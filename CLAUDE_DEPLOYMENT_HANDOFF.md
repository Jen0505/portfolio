# Jen Sebastian portfolio — Claude deployment handoff

## Start here

You are helping Jen publish his completed job-search portfolio on **his own GitHub account** and finish activating its enquiry emails. The site is already designed and built. Preserve the design and factual content; concentrate on deployment and verification.

Ask Jen for his **GitHub username and target repository** (or use the exact repository he supplies). Check which GitHub account is authenticated before any repository creation or push. No GitHub username or remote repository was provided during the original work. Nothing has been pushed or published yet. Do not deploy into another person's GitHub account by assumption, overwrite an existing site, or create a paid resource without Jen choosing it.

**Recommended layout:** GitHub repository holds the source; GitHub Pages publishes only `docs/`; a separate HTTPS service runs the included email backend. The original user explicitly requested an open-source form backend.

GitHub Pages is static hosting. It cannot run this Node.js email server. GitHub Free supports Pages from public repositories; private-repository Pages requires an eligible paid plan. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## Current status — be precise

| Component | Status |
| --- | --- |
| Portfolio, hero, services, case studies and contact popup | Built and responsive |
| Separate Contact Me page | Built |
| Email, phone, SMS, LinkedIn and WhatsApp links | Configured |
| Preferred reply channel in enquiry form | Email, WhatsApp or LinkedIn |
| Open-source email backend | Implemented, customised from FormBee email-only, MIT licensed |
| Backend tests | Seven tests passed with a simulated email transport |
| Browser checks | Success/failure, retained message, email fallback and mobile layout checked locally |
| Dependency audit | No vulnerabilities reported after updating Nodemailer to 10.0.10 at handoff; recheck before deploying |
| Real SMTP credentials or hosted FormBee account | Not supplied |
| Real email delivered to Jen | Not tested |
| GitHub repository / Pages deployment / public domain | Not set up |

The Send enquiry button deliberately stays disabled when `/formbee/health` does not report `{ "ready": true }`. Do not fake this state or remove the readiness check just to make the button clickable. Direct contact and the email-app fallback work while the backend is unavailable.

## Files to use

The **Jen-Sebastian-Claude-Handoff.zip** archive includes the editable source and the Markdown you are reading. Extract it before working. Do not upload ZIP files as the website.

- `portfolio.template.html`: main page source.
- `contact.template.html`: contact page source.
- `contact.js`: form validation, reply preference, submission and email-app fallback.
- `contact-config.json`: public backend URLs, not secrets.
- `assets/`: user-provided photographs, social screenshots, newsletter examples, PDF and contact card.
- `build.py`: embeds assets and contact code into `index.html`, `jen_sebastian_portfolio.html` and `contact.html`; also builds delivery ZIPs.
- `prepare-github-pages.py`: builds the website and copies only `index.html`, `contact.html` and `.nojekyll` to `docs/`.
- `backend/server.js`: email notification server and optional allowlisted static hosting.
- `backend/package.json`, `backend/package-lock.json`: locked dependencies; Node.js 22+.
- `backend/server.test.js`: simulated delivery tests; they do not send real emails.
- `backend/.env.example`: names of required private server settings.
- `backend/Dockerfile`: optional Docker deployment using repository-root build context.
- `backend/SETUP.md`: detailed email setup and operational limits.
- `backend/LICENSE`, `backend/NOTICE.md`: upstream MIT licence and source attribution. Preserve these.
- `README.md`: portfolio background, source notes and limitations.

The earlier website/backend-only ZIPs are delivery copies, not a replacement for this full editable handoff.

## 1. Inspect and prepare the repository

1. Read this file and `backend/SETUP.md`.
2. Inspect the authenticated GitHub identity and the repository Jen selected. If the repository already exists, inspect its files and branches before integrating. Preserve unrelated work.
3. Choose the existing default branch. If starting a new repository, `main` is a reasonable default.
4. Use the supplied `.gitignore`. Never commit `.env`, credentials, `node_modules`, local test harnesses, temporary files or ZIP exports. A `.gitignore` does not untrack files already committed; inspect the staged diff too.
5. Confirm Jen is comfortable with the repository visibility. Source photographs and the included presentation will be accessible in a public source repository.
6. Keep Pages publication limited to `docs/`, not the repository root or backend directory.

For a project repository such as `portfolio`, the final site will normally be `https://USERNAME.github.io/portfolio/`. A user-site repository must be named exactly `USERNAME.github.io` and normally publishes at `https://USERNAME.github.io/`. Replace USERNAME with Jen's real account name; do not infer it from LinkedIn. [Site URL rules](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

## 2. Build and publish the static portfolio

From the extracted project root:

```sh
python3 prepare-github-pages.py
```

This calls `build.py` and stages the two public pages in `docs/`. All images and downloads are embedded, so a separate public assets folder is not required.

Review and commit the appropriate source files plus `docs/`, then push to **Jen's selected repository**. In its Settings → Pages, select **Deploy from a branch**, select the actual default branch, and select **/docs**. Save and inspect the Pages deployment result. [GitHub publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Visit the actual Pages URL and its `contact.html` page. Navigation uses relative page links, so both user sites and project sites are supported. Do not replace those links with root-absolute `/contact.html`, which would break a project site.

It is acceptable to publish the portfolio first with email, WhatsApp, LinkedIn and the email-app fallback available. Tell Jen clearly if automatic email delivery is still pending. Do not describe the form as fully activated at that point.

## 3. Deploy the email backend separately

The included backend is an independently customised FormBee email-only implementation, not an existing account on the hosted FormBee service. [Upstream FormBee](https://github.com/FormBee/FormBee)

Use a Node.js host with outbound SMTP permitted. Render is one option, but its **free service blocks SMTP ports 25, 465 and 587**, so the current implementation needs an appropriate paid service or a different SMTP-capable host. Railway also restricts SMTP to its Pro plan and above. Recheck the provider's policy before selecting a plan. [Render restrictions](https://render.com/docs/free) · [Railway email networking](https://docs.railway.com/networking/outbound-networking)

For a Node service connected to the repository, keep the service root at the **repository root**:

```text
Build command: npm ci --prefix backend --omit=dev
Start command: npm start --prefix backend
Node version: 22 or a compatible supported version
```

For a Docker service, use `backend/Dockerfile` with the repository root as its build context. Do not put credentials in the image.

Set the following in the host's **private environment settings**:

| Setting | Value |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `PORT` | Usually supplied by the hosting provider; server defaults to 8787 |
| `PUBLIC_ORIGIN` | The portfolio's exact origin, e.g. `https://USERNAME.github.io` — **no `/portfolio/` path and no trailing slash** |
| `EMAIL_PROVIDER` | SMTP hostname, e.g. `smtp.gmail.com` for the Gmail route |
| `SMTP_PORT` | `465` for implicit TLS or the provider's supported STARTTLS port |
| `EMAIL_USER` | SMTP login username |
| `EMAIL_FROM` | Verified sender address permitted by that SMTP account |
| `EMAIL_PASSWORD` | Private SMTP credential or Gmail app password |
| `TRUST_PROXY_HOPS` | Only the known number of trusted proxy hops; leave unset for direct hosting |

The recipient is fixed in server code to `jensebastian2001@gmail.com`. It cannot be changed by a submitted form. The sender can be a different verified sending account. Replies use the visitor's validated email as Reply-To.

If Jen uses Gmail as the sender, Google requires 2-Step Verification before an app password can be created, and some accounts do not offer app passwords. Jen should enter the credential directly into the hosting provider's private settings, not in chat, GitHub source, browser JavaScript or `contact-config.json`. Never request his ordinary Gmail password. [Google app-password instructions](https://support.google.com/accounts/answer/185833)

If no suitable sending account exists, help Jen select one rather than inventing credentials. If using an HTTPS email API instead of SMTP, implement and test a real transport adapter; the current backend does not already have one.

On startup, the server verifies the SMTP connection. A missing or invalid SMTP configuration leaves health `ready:false`. Restart the backend after changing the configuration.

## 4. Connect GitHub Pages to the deployed backend

The default config has relative URLs intended for a server hosting both frontend and backend. **They will not work for email delivery on GitHub Pages.** Replace them with the real HTTPS backend URLs:

```json
{
  "endpoint": "https://YOUR-ACTUAL-BACKEND-HOST/formbee/email-only",
  "healthEndpoint": "https://YOUR-ACTUAL-BACKEND-HOST/formbee/health"
}
```

These placeholders are examples, not working endpoints. Use the service URL returned by the host.

Then rebuild and republish:

```sh
python3 prepare-github-pages.py
```

Commit the changed public config and generated `docs/` files, then push. Editing contact-config.json alone is insufficient: its values are embedded in the delivered HTML by build.py.

Check browser requests from the **deployed GitHub Pages site**. The backend must allow exactly that site's origin through CORS. A project site's Origin header is `https://USERNAME.github.io`, not `https://USERNAME.github.io/portfolio/`. If Jen later switches to a custom domain, update `PUBLIC_ORIGIN` accordingly.

### Hosted FormBee alternative

A hosted FormBee account may avoid maintaining this Node service. During handoff, the hosted site and docs could not be fetched reliably. No account was created. Do not assume it is available or compatible without checking.

If Jen chooses it, verify his destination email and inspect the account's actual integration example, authentication, allowed origins and CAPTCHA requirements. Adapt the payload and success handling if needed. The included frontend currently sends JSON and recognises `{ "success": true }` or the upstream email-only response `"Email sent successfully"`. Do not assume every hosted endpoint has that contract. Do not disable validation to force an apparent success.

## 5. Verify before calling it complete

Run backend tests in an environment that permits loopback HTTP listeners:

```sh
npm ci --prefix backend
npm test --prefix backend
npm audit --prefix backend --omit=dev
```

Then test the real deployment:

- Portfolio and Contact Me page load at the correct GitHub Pages URL on desktop and mobile.
- Hero and floating contact widget open correctly; Escape closes the dialog and focus returns.
- WhatsApp opens a conversation with `+61 470 517 150`. Confirm with Jen that this is registered on WhatsApp. Do not send a social message merely to test the link.
- LinkedIn opens `https://www.linkedin.com/in/jen-sebastian/`. Visitors complete their own connection request in LinkedIn.
- Health is `ready:true`, Send enquiry becomes available, and there are no mixed-content or CORS errors.
- Invalid email, missing consent and missing WhatsApp/LinkedIn reply details cannot be submitted.
- Submit one clearly labelled test enquiry to Jen with his knowledge; use a valid reply email. Confirm the notification arrives in his inbox, including message, role, company and reply preference. Check spam if necessary.
- Confirm Reply-To targets the enquirer's address. Backend acceptance alone does not prove inbox delivery.
- Test service failure in a safe local/staging environment: no false success; visitor's details stay available; email-app, WhatsApp and LinkedIn remain usable.
- Ensure no `.env`, SMTP password, test harness, or `node_modules` has entered the repository or public Pages output.

Do not report email as live until a real delivery is verified. If credentials or a paid-host choice are still missing, state exactly what remains and leave direct contact available.

## 6. Preserve this content

Name: **Jen Sebastian Varghese**. Professional focus: social media, brand marketing, campaign coordination and content. Role label: Marketing & Sales Coordinator. Location: Newcastle, NSW, Australia.

Contact details:

- Email: `jensebastian2001@gmail.com`
- Phone / SMS: `+61470517150` (displayed as `0470 517 150`)
- WhatsApp: `https://wa.me/61470517150`
- LinkedIn: `https://www.linkedin.com/in/jen-sebastian/`

Keep the supplied clarification that Jen represented **AU KingCare at the Global Victoria Summit in Melbourne**. Keep the Monash context: representing Monash University in BCG CSR and Monash Global Projects, exploring real marketing opportunities for an Aboriginal brand from a global perspective. Do not invent an award or claim employment at BCG.

Services cover positioning/design, campaign/product development, social media, newsletters/email, account management, print production and logistics. Preserve these and the real supplied images.

Career metrics are self-reported, not verified analytics. The Instagram screenshot's 10.3K followers are an account snapshot, not claimed growth personally generated by Jen.

The LinkedIn highlight is a curated summary linked to the original post, **not a live feed**. LinkedIn's help excludes multi-photo posts like the supplied Expo post from embeds. Do not add fake live indicators or unsupported iframes. [LinkedIn embedding rules](https://www.linkedin.com/help/linkedin/answer/a529065)

## Operational limits and final handback

The backend stores no enquiry bodies. Rate limiting and duplicate suppression are held in process memory for a single instance; they reset on restart. It does not implement persistent queues, CRM storage or WhatsApp/LinkedIn automation. Do not claim those features exist.

At completion give Jen:

1. His repository URL and live portfolio URL.
2. Backend host/service location and which account owns it.
3. A clear statement of whether a real email reached his inbox.
4. Any ongoing hosting cost or uncompleted activation step.
5. The editing process: templates/assets → `python3 prepare-github-pages.py` → commit/push.

## Suggested message Jen can paste into Claude

> Please read CLAUDE_DEPLOYMENT_HANDOFF.md in the attached project and continue from its current state. Help me publish the portfolio on my own GitHub Pages and activate the separate open-source email backend. Preserve the existing design and contact details. Check my GitHub account and target repository before pushing, keep credentials in private hosting settings, and verify a real enquiry reaches my inbox before reporting email delivery as live. Start by identifying which account access or hosting information is still needed.
