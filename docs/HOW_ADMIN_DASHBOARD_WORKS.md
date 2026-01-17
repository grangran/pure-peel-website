# How the Admin Dashboard Works

**Last Updated:** January 2025

---

## 🎯 What is the Admin Dashboard?

The admin dashboard is a **private page on your website** where you can:
- View all customer orders
- Update order statuses
- Add tracking numbers
- Process refunds
- See order statistics

**It's NOT Stripe or Canada Post** - it's your own custom order management system.

---

## 🔐 How to Access It

### **URL:**
```
https://purepeelco.com/admin
```

### **Login Process:**
1. Go to the URL above
2. Enter your admin password
3. Click "Login"
4. You'll see all orders

### **Password:**
- Set in Render environment variables as `ADMIN_PASSWORD`
- If not set, default is `admin123` (change this!)
- Password is sent with every API request for security

---

## 📊 What You See When You Log In

### **1. Statistics Dashboard (Top Section)**
Shows at a glance:
- **Total Orders** - All orders ever received
- **Pending** - Orders waiting to be processed
- **Processing** - Orders being prepared
- **Shipped** - Orders that have been shipped
- **Total Revenue** - Sum of all order totals

### **2. Order List (Main Table)**
Shows all orders with:
- Order ID (e.g., `PP-12345678`)
- Customer name and email
- Number of items
- Total amount
- Current status (pending, processing, shipped, etc.)
- Order date
- Action buttons

### **3. Filter Options**
Filter orders by status:
- All Orders
- Pending
- Processing
- Shipped
- Delivered
- Cancelled

---

## 🔄 How Orders Get Into the Dashboard

### **Automatic Process:**

1. **Customer places order:**
   - Customer goes through checkout
   - Enters shipping information
   - Completes payment on Stripe

2. **Stripe processes payment:**
   - Payment is successful
   - Stripe sends webhook to your backend

3. **Backend saves order:**
   - Order is saved to `data/orders.json`
   - Order confirmation email sent to customer
   - Admin notification email sent to you

4. **Order appears in dashboard:**
   - Refresh the admin page
   - New order shows up in the list
   - Status is "pending"

**Orders are saved automatically - you don't need to do anything!**

---

## 🛠️ What You Can Do in the Dashboard

### **1. View Order Details**
- Click **"View"** button next to any order
- See complete order information:
  - Customer name, email, phone
  - Full shipping address
  - All items ordered
  - Price breakdown (subtotal, shipping, tax, total)
  - Payment status
  - Tracking number (if added)
  - Order notes (if customer left any)

### **2. Update Order Status**
- Use the dropdown menu in the "Status" column
- Select new status:
  - **Pending** → Order just received
  - **Processing** → You're preparing the order
  - **Shipped** → Order is in the mail
  - **Delivered** → Customer received it
  - **Cancelled** → Order cancelled

**When you mark as "shipped":**
- System prompts you for tracking number
- Enter tracking number (optional)
- Click "Update"
- **Shipping notification email is sent automatically to customer** ✅

### **3. Process Refunds**
- Click **"Refund"** button on a paid order
- Choose:
  - Full refund (entire order amount)
  - Partial refund (enter specific amount)
- Select refund reason
- Confirm refund
- Refund is processed via Stripe
- Customer receives refund automatically

### **4. Filter Orders**
- Use the status filter dropdown
- View only orders with specific status
- Useful for:
  - Finding pending orders to process
  - Checking shipped orders
  - Reviewing cancelled orders

---

## 📧 How Shipping Emails Work

### **When You Mark Order as "Shipped":**

1. **You update status:**
   - Select "shipped" from dropdown
   - Enter tracking number (optional)
   - Click "Update"

2. **Backend processes:**
   - Order status updated in database
   - System checks if shipping email already sent
   - If not sent, sends shipping notification email

3. **Customer receives email:**
   - Subject: "Your Order Has Shipped - [ORDER_ID]"
   - Includes tracking number
   - Links to order tracking page
   - Estimated delivery time

**The email is sent automatically - you don't need to send it manually!**

---

## 🔒 Security

### **How Authentication Works:**

1. **Password Protection:**
   - Password stored in Render as `ADMIN_PASSWORD`
   - Never stored in code or git
   - Sent with every API request

2. **API Authentication:**
   - Backend checks password on every request
   - Invalid password = 401 Unauthorized
   - Valid password = access granted

3. **Session:**
   - Password stored in browser (not secure, but simple)
   - Used for all API calls
   - Logout clears it

### **Security Recommendations:**
- ✅ Use strong password (at least 12 characters)
- ✅ Change default password (`admin123`)
- ✅ Don't share password
- ✅ Access only from secure networks
- ⚠️ Consider upgrading to JWT tokens later (for production)

---

## 💾 Where Orders Are Stored

### **File: `data/orders.json`**

**Location:** On your Render server (backend)

**Structure:**
```json
[
  {
    "id": "PP-12345678",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [...],
    "total": 45.99,
    "status": "pending",
    "createdAt": "2025-01-27T10:30:00Z",
    ...
  }
]
```

**Notes:**
- File is created automatically
- Not in git (excluded via `.gitignore`)
- Contains all order data
- Backed up by Render (if configured)

---

## 🔄 Complete Workflow Example

### **Step 1: Customer Places Order**
- Customer completes checkout
- Payment processed by Stripe
- Order saved automatically
- **You receive admin notification email**

### **Step 2: You Check Dashboard**
- Go to `https://purepeelco.com/admin`
- Login with password
- See new order in "Pending" status
- Click "View" to see full details

### **Step 3: You Prepare Order**
- Update status to "Processing"
- Pack the items
- Create shipping label (Canada Post website)

### **Step 4: You Ship Order**
- Update status to "Shipped"
- Enter tracking number
- Click "Update"
- **Customer receives shipping notification email automatically** ✅

### **Step 5: Order Delivered**
- When customer receives it
- Update status to "Delivered"
- Order is complete

---

## 🎨 Dashboard Features

### **Real-Time Updates:**
- Dashboard refreshes every 30 seconds
- New orders appear automatically
- Statistics update in real-time

### **Order Details Modal:**
- Click "View" to see full order
- All customer information
- Complete shipping address
- Item breakdown
- Price totals
- Refund history (if any)

### **Status Badges:**
- Color-coded status indicators:
  - 🟡 Yellow = Pending
  - 🔵 Blue = Processing
  - 🟣 Purple = Shipped
  - 🟢 Green = Delivered
  - 🔴 Red = Cancelled

### **Responsive Design:**
- Works on desktop and mobile
- Table scrolls horizontally on small screens
- Touch-friendly buttons

---

## 🚨 Troubleshooting

### **Can't Login:**
- Check `ADMIN_PASSWORD` is set in Render
- Default password is `admin123` if not set
- Make sure backend server is running
- Check browser console for errors

### **No Orders Showing:**
- Check that orders are being saved
- Verify `data/orders.json` exists on server
- Check server logs for errors
- Make sure Stripe webhook is working

### **Shipping Email Not Sent:**
- Check that order status is "shipped"
- Verify tracking number was entered
- Check server logs for email errors
- Verify Resend is configured correctly

### **Can't Update Order:**
- Make sure you're logged in
- Check that password is correct
- Verify backend server is running
- Check browser console for errors

---

## 📱 Mobile Access

The dashboard works on mobile too:
- Go to `https://purepeelco.com/admin` on your phone
- Login with password
- View and manage orders on the go
- Update statuses from anywhere

---

## 🔄 API Endpoints (Technical)

The dashboard uses these backend endpoints:

- `GET /api/admin/orders` - Get all orders (requires password)
- `GET /api/admin/orders?status=pending` - Filter by status
- `GET /api/admin/stats` - Get statistics
- `PATCH /api/admin/orders/:orderId/status` - Update order status
- `POST /api/admin/orders/:orderId/refund` - Process refund

All endpoints require `x-admin-password` header with your password.

---

## 📝 Summary

**The admin dashboard is:**
- ✅ Your own order management system
- ✅ Accessible at `/admin` on your website
- ✅ Password-protected
- ✅ Shows all orders automatically
- ✅ Lets you update statuses and add tracking
- ✅ Sends shipping emails automatically when you mark as "shipped"

**It's NOT:**
- ❌ Stripe dashboard (that's for payments)
- ❌ Canada Post dashboard (that's for labels)
- ❌ A separate app (it's part of your website)

**Think of it as your "order inbox" where you manage all customer orders!**

---

## 🎯 Quick Start Guide

1. **Set password in Render:**
   ```env
   ADMIN_PASSWORD=your_secure_password_here
   ```

2. **Access dashboard:**
   - Go to `https://purepeelco.com/admin`
   - Enter password
   - View orders

3. **When order comes in:**
   - Order appears automatically
   - Click "View" to see details
   - Update status as you process it
   - Mark as "shipped" when ready
   - Customer gets email automatically ✅

---

**That's it! The dashboard is your command center for managing orders.**
