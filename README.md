# 🍔 FastFeast — Fast Food Ordering App

A full-stack fast food ordering web app with an admin panel, real-time order management, Mapbox delivery location picker, and Stripe payments.

---

## 🚀 Features

### 👤 User Side
- Browse menu by category (Pizza, Burger, Pasta, Fries)
- Add items to cart and place orders
- Select delivery location via **Mapbox** interactive map
- Pay securely via **Stripe** (card payments)
- View past orders and their statuses

### 🛠️ Admin Panel
- View analytics: total orders, total users, total revenue, monthly growth
- Manage orders: mark as **Pending / Preparing / Completed / Cancelled**
- Full menu management: **Add / Edit / Delete** items
- Toggle item availability (show/hide from menu)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Axios, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT |
| Payments | Stripe |
| Maps | Mapbox GL JS |
| Styling | CSS Modules |

---

## 📸 Screenshots

### Home
<p align="center">
  <img width="800" src="https://github.com/user-attachments/assets/e060e27b-de80-4c4a-abe8-3a0560ac8e82" />
</p>

### Login / Register
![Auth](https://github.com/user-attachments/assets/a847b0ab-a664-461b-80d2-76f8d85a0153)

![Auth](https://github.com/user-attachments/assets/10ce7abd-950a-417c-bf00-686f702d76c1)

### Stripe Checkout
![Checkout](https://github.com/user-attachments/assets/8baac571-27a5-496d-aba5-4dde339dfc2a)

### Order Placed
![Orders](https://github.com/user-attachments/assets/440209da-9e60-463d-aa23-e7f4e13a8733)

### Order History
![History](https://github.com/user-attachments/assets/dd4e2acd-ff13-440f-a4b8-388f1830c4d7)


### Admin Dashboard
![Admin Menu](https://github.com/user-attachments/assets/09c03947-0d6b-4caa-b6cb-711ff5f9c571)

![Modal](https://github.com/user-attachments/assets/64a55adc-a783-4c84-a469-d0c3bfbc928f)

![Modal](https://github.com/user-attachments/assets/7c6ac91a-2d8a-49e7-8068-8d0cea4b664a)


---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Stripe account
- Mapbox account

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/fastfeast.git
cd fastfeast
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
```

Start the server:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd client
npm install
```

Create a `.env` file in `/client`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_MAPBOX_TOKEN=your_mapbox_public_token
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

Start the app:

```bash
npm start
```

---

## 📁 Project Structure

```
fastfeast/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
├── server/               # Express backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   └── cart.js
│   ├── models/
│   ├── middleware/
│   └── server.js
```

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe secret key (server) |
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_MAPBOX_TOKEN` | Mapbox public token |
| `REACT_APP_STRIPE_PUBLIC_KEY` | Stripe publishable key |

---
 
## 🔑 Demo Credentials
 
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | Admin123@ |
| User | Create your own account via Register | — |
 
---

## 👨‍💻 Author

Built by **Muhammad Umer Ijaz** — feel free to fork and build on it!
