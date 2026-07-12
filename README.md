# Captain A1 Security Services

Static website for Captain A1 Security Services, a private security and facility support provider based in Ajmer, Rajasthan.

## Pages

- `index.html` - homepage, service overview, certifications, testimonials, and consultation call to action
- `about.html` - company story, operating principles, detailed services, and client/location highlights
- `contact.html` - full contact form, contact details, and embedded map
- `jaipur.html` - Jaipur Head Office location page with address, services, and embedded Google Map
- `guard-hiring-ajmer.html` - Hindi-first Google Ads landing page for urgent security guard hiring in Ajmer

## Run Locally

Install dependencies and start the static server:

```bash
npm install
npm start
```

The site is also static, so it can be hosted by GitHub Pages or any static hosting provider.

## Security Notes

- Browser-side Content Security Policy, referrer policy, and permissions policy are included in every page.
- `serve.json` adds equivalent local preview headers when using the `serve` package.
- The Web3Forms access key is necessarily visible because this is a static website. For stronger protection, move form submission behind a small backend endpoint.

## Legal Notice

This website, its branding, content, code, images, contact details, and business identity belong to Captain A1 Security Services. Unauthorized copying, cloning, reuse, redistribution, impersonation, or misrepresentation of this website or business is strictly prohibited and may result in legal action.

See `LEGAL_NOTICE.md` for the full notice.
