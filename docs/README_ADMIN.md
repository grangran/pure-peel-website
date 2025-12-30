# Admin Order Management System

## Overview

The order management system allows you to view, track, and manage all customer orders from your website.

## Accessing the Admin Dashboard

1. Navigate to `/admin` on your website (e.g., `http://localhost:5173/admin`)
2. Enter the admin password (default: `admin123`)
3. You'll see all orders with statistics and management options

## Features

### Dashboard Statistics
- **Total Orders**: Total number of orders received
- **Pending**: Orders awaiting processing
- **Processing**: Orders being prepared
- **Shipped**: Orders that have been shipped
- **Total Revenue**: Sum of all order totals

### Order Management
- **View Orders**: See all orders in a table format
- **Filter by Status**: Filter orders by their current status
- **View Details**: Click "View" to see complete order information including:
  - Customer information
  - Shipping address
  - Order items
  - Payment details
  - Order totals
- **Update Status**: Change order status directly from the table

### Order Statuses
- **Pending**: New order, not yet processed
- **Processing**: Order is being prepared
- **Shipped**: Order has been shipped
- **Delivered**: Order has been delivered
- **Cancelled**: Order has been cancelled

## Setting Admin Password

The default password is `admin123`. To change it:

1. Open your `.env` file
2. Add or update: `ADMIN_PASSWORD=your_secure_password`
3. Restart your server

**Important**: Use a strong password in production!

## Order Storage

Orders are stored in `data/orders.json` in your project root. This file:
- Is automatically created when the first order is received
- Contains all order information
- Is excluded from git (see `.gitignore`)

## How Orders Are Saved

Orders are automatically saved when:
1. **Stripe Webhook**: When Stripe sends a `checkout.session.completed` event
2. **Checkout Verification**: As a fallback, when a customer returns from Stripe checkout

## API Endpoints

All admin endpoints require authentication via password header:

- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders?status=pending` - Filter by status
- `GET /api/admin/orders/:orderId` - Get specific order
- `PATCH /api/admin/orders/:orderId/status` - Update order status
- `GET /api/admin/stats` - Get order statistics

## Security Notes

- The current authentication is basic password protection
- For production, consider implementing:
  - JWT tokens
  - Session-based authentication
  - Role-based access control
  - HTTPS only access

## Troubleshooting

### No orders showing up
- Check that your server is running
- Verify orders are being saved in `data/orders.json`
- Check server logs for errors

### Can't login
- Verify the password matches `ADMIN_PASSWORD` in `.env`
- Default password is `admin123` if not set
- Make sure backend server is running

### Orders not saving
- Check server logs for errors
- Verify webhook is configured in Stripe dashboard
- Check file permissions for `data/` directory

