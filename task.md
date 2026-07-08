# COD Pre-orders & Security Hardening Checklist

- [x] **Database Schema & Logic Sync**
  - [x] Added columns `payment_type`, `deposit_amount`, `remaining_amount`, `deposit_status`, and `verified_phone` to the orders table.
  - [x] Implemented phone OTP verification logic for Cash on Delivery.
  - [x] Set COD orders initially as `pending_payment` until ₹200 deposit is captured.
- [x] **User Interface Updates**
  - [x] Added COD deposit, balance due, and OTP verification status badge to admin order pages.
  - [x] Added paid booking deposit and remaining balance breakdown to customer order tracking page.
- [x] **Sentry Error Monitoring**
  - [x] Configured Sentry client, server, and edge options.
  - [x] Set up error filtering for localhost and browser extensions.
  - [x] Implemented contextual tagging (`user_id`, `payment_method`, `order_id`).
- [x] **Security Hardening Verification**
  - [x] Test 1: Invalid Razorpay webhook signatures rejected with 400.
  - [x] Test 2: Standardized security headers (CSP, HSTS, XFO: DENY, nosniff).
  - [x] Test 3: Enforced database SSL modes.
  - [x] Test 4: Concurrency row locking using Drizzle `.for('update')`.
  - [x] Test 5: Rate limiting triggers 429 response codes.
