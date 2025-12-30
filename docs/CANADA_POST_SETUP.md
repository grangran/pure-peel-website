# Canada Post API Setup Instructions

Based on your Canada Post developer portal, here's how to configure your API credentials:

## Your API Credentials

From your Canada Post developer portal:

### Development (Sandbox) - Use for Testing
- **Username**: `ea9261d93ea53e40`
- **Password**: `47ab410a52b371ae13fc6b`
- **Customer Number**: `0001238590`

### Production - Use for Live Orders
- **Username**: `e66359fc2eb7d4c2`
- **Password**: `14d81da04ebb17bb918d48`
- **Customer Number**: `0001238590`

## Environment Variables Setup

Add these to your `.env` file:

### For Development/Testing:
```env
CANADA_POST_USERNAME=ea9261d93ea53e40
CANADA_POST_PASSWORD=47ab410a52b371ae13fc6b
CANADA_POST_CUSTOMER_NUMBER=0001238590
CANADA_POST_USE_PRODUCTION=false
```

### For Production:
```env
CANADA_POST_USERNAME=e66359fc2eb7d4c2
CANADA_POST_PASSWORD=14d81da04ebb17bb918d48
CANADA_POST_CUSTOMER_NUMBER=0001238590
CANADA_POST_USE_PRODUCTION=true
```

### Shipping Origin Address:
```env
SHIPPING_ORIGIN_POSTAL_CODE=YOUR_POSTAL_CODE
SHIPPING_ORIGIN_CITY=YOUR_CITY
SHIPPING_ORIGIN_PROVINCE=YOUR_PROVINCE
```

Replace `YOUR_POSTAL_CODE`, `YOUR_CITY`, and `YOUR_PROVINCE` with your actual shipping origin address.

## Important Notes

1. **Development vs Production**: 
   - Use Development credentials for testing
   - Switch to Production credentials only when ready for live orders

2. **Sandbox Environment**: 
   - The development key works against the sandbox environment
   - Sandbox is a replica of production with test data
   - Perfect for testing without affecting real orders

3. **Security**: 
   - Never commit your `.env` file to git
   - Keep your production credentials secure
   - Rotate passwords if compromised

## Testing

1. Start your backend server:
   ```bash
   npm run server
   ```

2. Test the shipping rates endpoint:
   - Go to checkout
   - Enter a Canadian address
   - Shipping rates should be fetched from Canada Post API

3. Check server logs:
   - If you see "Canada Post API error", check your credentials
   - If rates appear, the integration is working!

## Troubleshooting

### "Canada Post API error" in logs
- Verify credentials are correct in `.env`
- Check that customer number matches your account
- Ensure you're using development credentials for sandbox

### Rates not appearing
- Check browser console for errors
- Verify backend server is running
- Check that `VITE_API_URL` points to your backend

### XML parsing errors
- The server includes basic XML parsing
- For better reliability, consider installing `xml2js`:
  ```bash
  npm install xml2js
  ```
- Then update the `parseCanadaPostResponse` function to use it

## Next Steps

1. Add your shipping origin address to `.env`
2. Test with development credentials first
3. Once working, switch to production credentials
4. Monitor API usage in Canada Post developer portal
5. Consider implementing shipping label generation next

