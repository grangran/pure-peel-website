# Running the site locally

## Option 1: Dev server (hot reload)

From the **pure-peel** folder (not the parent "Pure Peel Co. Website" folder):

```bash
cd "/Users/matthewgranato/Downloads/Pure Peel Co. Website/pure-peel"
npm run dev
```

Then open the URL shown in the terminal (e.g. **http://127.0.0.1:5174** or **http://localhost:5174**).

- If you see "Port 5174 is in use", Vite will print the next port (e.g. 5175). Use that URL.
- Try **http://127.0.0.1:5174** if **http://localhost:5174** doesn’t load.

## Option 2: Build + preview (if dev server fails)

Build once, then serve the built site:

```bash
cd "/Users/matthewgranato/Downloads/Pure Peel Co. Website/pure-peel"
npm run start
```

Then open **http://127.0.0.1:4173** (or the URL printed in the terminal).

Or in two steps:

```bash
npm run build
npm run preview:4173
```

Then open **http://127.0.0.1:4173**.

## Checklist if it still doesn’t work

1. **Right folder** – You must be in the `pure-peel` folder (the one that contains `package.json` and `vite.config.js`).
2. **Dependencies** – Run `npm install` once if you haven’t.
3. **Copy the exact URL** – Use the full URL from the terminal (including port).
4. **Browser** – Try a new tab or a different browser; avoid a cached or old tab.
5. **Firewall / VPN** – Temporarily disable or try another network if localhost is blocked.

## Shipping (Chit Chats)

For automatic labels after checkout, set in `.env` (see `utils/chitchatsShipping.js` for full list):

- `CHITCHATS_ACCESS_TOKEN` — API token from Chit Chats developer settings  
- `CHITCHATS_CLIENT_ID` — numeric client ID  

Optional: `SHIPPING_ORIGIN_ADDRESS`, `SHIPPING_ORIGIN_POSTAL_CODE`, `SHIPPING_ORIGIN_CITY`, `SHIPPING_ORIGIN_PROVINCE`, `SHIPPING_ORIGIN_PHONE`, and `CHITCHATS_USE_STAGING=true` for staging API.

## Email list & unsubscribe (compliance)

Welcome / list emails include `List-Unsubscribe` (mailto + HTTPS) and `List-Unsubscribe-Post` for one-click (RFC 8058). Users can also unsubscribe at `/unsubscribe` or via `GET/POST /api/unsubscribe`.

- `RESEND_API_KEY` — Used to sign unsubscribe tokens (or set `UNSUBSCRIBE_SECRET` explicitly).  
- `UNSUBSCRIBE_SECRET` — Optional; overrides signing key for tokens.  
- `PUBLIC_API_URL` — Optional; base URL for API links in emails if the API host differs from `FRONTEND_URL` (e.g. API on Render, site on another domain).  
- `COMPLIANCE_MAILING_ADDRESS` — Optional; physical mailing/postal line shown in list email footers (recommended for CAN-SPAM-style “valid postal address” for commercial email).  
- `ADMIN_EMAIL` — Used in the `mailto:` `List-Unsubscribe` header (defaults to `support@purepeelco.com`).
- `LIST_WELCOME_SUBJECT_EN` / `LIST_WELCOME_SUBJECT_FR` — Optional; override the welcome list email subject line. Defaults match the current templates (e.g. “You're on the list — Pure Peel Co.”).
