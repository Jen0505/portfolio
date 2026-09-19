# Jen Sebastian — Social Media Portfolio

Open **index.html** or **jen_sebastian_portfolio.html** in any browser. Keep **contact.html** in the same folder for the dedicated Contact Me page. Use **Jen-Sebastian-Portfolio.zip** to share the complete two-page website. Images and downloads are embedded; no installation is needed. Email, SMS, calls and LinkedIn require an appropriate app or internet connection.

`index.html` contains the same portfolio for static website hosting.

## Editing

Edit `portfolio.template.html` or `contact.template.html`, then run `python3 build.py` to regenerate the HTML delivery files and complete ZIP package. The builder uses only Python's standard library. Source photographs are in `assets/`.

## Content and credits

- Professional background, contact information, tools, responsibilities and career results are taken from the supplied original `jen_sebastian_portfolio.html`.
- Brand images are extracted from the supplied `Blairsom Presentation Oct 25.pdf`. They are brand/creator images, not portraits of Jen or claims of photography by Jen.
- The social gallery now contains three supplied Instagram/Facebook screenshots. Account views can be filtered by brand and opened in full.
- All seven additional September 2026 images are included: three account screenshots, two personal portraits, the Monash event photograph, and the automotive exhibition photograph. Originals are embedded without pixel edits; CSS frames control presentation.
- The profile screenshot shows 10.3K Instagram followers and 128 posts. This is labelled as an account snapshot rather than personally acquired growth.
- Monash project context reflects Jen’s subsequent clarification: representing Monash University in BCG CSR and Monash Global Projects, exploring marketing opportunities for an Aboriginal brand. No award or client results are invented.
- The deck's body text states 10K+ followers across Instagram and Facebook. That is used as October 2025 brand context, not personal growth attribution. The inconsistent “10,000k+” heading is not repeated.
- Career metrics are supplied claims, not independently verified analytics. Reporting dates and exports were not provided. Ambiguous revenue attribution from the old HTML is omitted.
- Visual inspiration: Pragya Kapur’s [Social Media Manager – Portfolio](https://www.behance.net/gallery/232011043/Social-Media-Manager-Portfolio). The implementation, layout, copy and interactions here are original; the reference's images and personal details are not reused.

## Features

Responsive desktop and mobile layout; keyboard-accessible case-study dialogs; brand filters and full-image dialogs; expandable process sections; mobile navigation; email, telephone and LinkedIn links; copy-email control with a fallback message; reduced-motion support; print styles.

## Industry and LinkedIn highlights

The September 2026 update includes Jen’s supplied LinkedIn post screenshot about participation in the Australia & Asia Go Global Expo at WTC Melbourne with AU KingCare and Blairsom. A direct link opens the original post. The public web fetch did not return the post, so the supplied screenshot is the content source.

Two further supplied screenshots show Global Victoria event coverage. Jen subsequently clarified that these images show representation of AU KingCare at the Global Victoria Summit in Melbourne. The portfolio uses that context, distinguishes it from the expo post, and does not attribute Global Victoria’s engagement numbers to Jen. The role label now reflects “Marketing & Sales Coordinator” shown in the supplied LinkedIn screenshot.

The two Global Victoria screenshots are embedded unchanged, with CSS thumbnail framing and full-image dialogs. macOS blocked access to the temporary LinkedIn screenshot path, so its visible text is adapted into a native HTML card instead of embedding the screenshot.

## Job-search contact flow and services

- Six service/capability areas cover brand positioning, campaign and product development, social media, newsletters/email, account management, and print/logistics coordination.
- Supplied AU KingCare logo and two Blairsom newsletter examples are embedded. The supplied brand presentation is available as an embedded PDF download.
- Quick-connect buttons open an accessible dialog with direct email, telephone, SMS, LinkedIn, and copy-email actions. Escape closes the dialog and focus returns to its trigger.
- The dedicated contact page includes a downloadable contact card, an online enquiry form, and an email-app/Gmail fallback. The online form targets the included customised FormBee backend and remains disabled until SMTP is connected. On submission the service forwards the enquiry to Jen; it stores no enquiry bodies and uses in-memory duplicate suppression. See backend/SETUP.md for activation. Email-app drafts require the visitor to review and send them.
- Telephone and SMS use +61470517150; the displayed Australian number is 0470 517 150.
- To publish, host index.html and contact.html together. This task has created local files, not a public deployment.

## LinkedIn feed options (checked 19 September 2026)

The portfolio deliberately labels the Expo card as a selected LinkedIn post and links to the original and Jen's profile. It is not an automatically synchronised feed. The supplied Expo post contains multiple photographs; LinkedIn's official help currently excludes multi-photo posts and reposts with commentary from embedding.

- Official free embeds for eligible public posts: https://www.linkedin.com/help/linkedin/answer/a529065
- Open-source GPLv2+ example, LinkedIn Feed for Elementor: https://github.com/khmahfuzhasan/LinkedIn-Feed-for-Elementor — this requires WordPress/Elementor and manually selected post URLs/embed codes. Its README explicitly says it cannot fetch a personal profile's posts automatically. It is not installed in this standalone HTML site.
- Official Posts API: https://learn.microsoft.com/en-au/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-03 — personal post reading requires restricted r_member_social permission. A genuine automatic feed needs approved API access, authentication and a server-side integration. Never put access tokens in the public HTML.

For future eligible posts, obtain the official code from LinkedIn's desktop “Embed this post” menu and add it with a descriptive iframe title and a permanent original-post link. Do not fabricate embed availability from a post ID or label curated content “live”.

The updated hero leads with Jen's name and marketing specialisation. The persistent contact widget opens a compact dialog with all direct contact channels, an email-draft link, keyboard dismissal, and focus restoration. Desktop 1280px and mobile 320px layouts were checked; no horizontal overflow was found at 320px.

## Email trigger and WhatsApp update

- Source and setup: backend/SETUP.md. Deliverable: Jen-Sebastian-Email-Backend.zip (public pages and backend source; excludes credentials, node_modules, and the preview test harness).
- WhatsApp and LinkedIn are direct visitor-controlled connections on the contact page and quick-contact widget. Phone/SMS/email options remain available.
- The form collects a preferred reply channel and, when appropriate, WhatsApp number or LinkedIn profile URL. Those details are included in Jen's notification.
- Status: backend implemented and simulated delivery tests passed; live email activation and inbox verification remain pending because no hosting/account/SMTP credentials were supplied.
