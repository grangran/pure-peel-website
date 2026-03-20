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
