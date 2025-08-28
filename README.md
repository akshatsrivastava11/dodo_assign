
---

# 🚀 Payment & Subscription Management with Supabase + DodoPayments

This project integrates **Supabase** for user purchase tracking and **DodoPayments** for payment and subscription management in a **Next.js application**.

It provides both **frontend routes** and **backend API routes** to:

* Handle **user signups**
* Create, update, cancel, and manage **payments/subscriptions**
* Process **webhooks** from DodoPayments

---

## 📦 Features

* 🔐 User management with **Supabase**
* 💳 Payment processing with **DodoPayments API**
* 🔄 Subscription lifecycle management (create, update, cancel)
* 📡 Webhook handling for real-time updates
* 🛠 Utility services for Supabase & DodoPayments

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL="URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUPABASEANON KEY"
NEXT_DODO_PAYMENT_KEY="PAYMENTKEY"
NEXT_PUBLIC_DODO_WEBHOOK_KEY="WEBHOOKKEY"
NEXT_PUBLIC_DODO_TEST_API=https://checkout.dodopayments.com/buy/{product_id}
```

---

## 📂 Project Structure

```
├── pages/
│   ├── signup/              # Frontend signup page
│   ├── payment/             # Frontend payment page
│
├── api/
│   ├── signup/              # API route: User signup
│   ├── payments/
│   │   ├── create/          # API route: Create new payment
│   │   ├── cancel/          # API route: Cancel payment
│   │   ├── update/          # API route: Update subscription
│   │   ├── webhook/         # API route: Handle DodoPayments webhook
│
├── utils/
│   ├── dodo.ts              # DodoPayments client & customer creation
│   ├── supabase.ts          # Supabase client & DatabaseService class
│
└── README.md
```

---

## 🔌 Routes

### **Frontend Pages**

| Path       | Description           |
| ---------- | --------------------- |
| `/signup`  | User signup page      |
| `/payment` | Payment/checkout page |

### **Backend API Endpoints**

| Method | Route                   | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| POST   | `/api/signup`           | Register a new user                     |
| POST   | `/api/payments/create`  | Create a new payment                    |
| POST   | `/api/payments/cancel`  | Cancel a payment/subscription           |
| POST   | `/api/payments/update`  | Update an existing subscription         |
| POST   | `/api/payments/webhook` | Handle webhook events from DodoPayments |

---

## 🔄 Webhook Handling

* The `/api/payments/webhook` endpoint processes incoming **DodoPayments** events.
* It updates the user’s purchase/subscription records in **Supabase** using `DatabaseService`.

---

## 🛠 Development

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

---

## 📌 Tech Stack

* **Next.js** – Fullstack framework
* **Supabase** – Database & authentication
* **DodoPayments** – Payment & subscription management
* **TypeScript** – Type-safe APIs

---