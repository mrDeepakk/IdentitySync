# IdentitySync

[![Deploy on Render](https://img.shields.io/badge/Live%20Demo-Render-blue)](https://identitysync.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black)](https://github.com/mrDeepakk/IdentitySync)

## 🔹 Overview
IdentitySync is a contact identity reconciliation system that enables users to identify, retrieve, and store contact details using email and phone numbers. The system ensures data consistency and avoids duplication through intelligent matching.

## 🚀 Features
- **Identify contacts** based on email or phone number.
- **Create new contacts** if none exist.
- **RESTful API** built with Express.js & TypeScript.
- **Database integration** with Prisma & PostgreSQL.

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Deployment:** Render.com

## 🔧 Setup & Installation
### Prerequisites
- **Node.js** v16+  
- **PostgreSQL** (or use a cloud DB)

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/mrDeepakk/IdentitySync.git
cd IdentitySync
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file and add your database connection string:
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/your_database"
```

### 4️⃣ Run Prisma Migrations
```sh
npx prisma migrate dev --name init
npx prisma generate
```

### 5️⃣ Start the Server
For development:
```sh
npm run dev
```
For production:
```sh
npm run build && npm start
```

## 📡 API Endpoints
### 1️⃣ Identify Contact
**POST /identify**
- **Request:**
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Contact identified successfully.",
  "data": {
    "contact": {
      "primaryContactId": 39,
      "emails": [
        "user@example.com"
      ],
      "phoneNumbers": [
        "1234567890"
      ],
      "secondaryContactIds": []
    }
  }
}
```

### 2️⃣ Create Contact (If Not Found)
If no matching contact exists, the system creates a new one automatically.

## ✅ Future Enhancements
- **Caching for performance improvement**
- **Duplicate merging logic**
- **User authentication & roles**
- **Web UI for contact management**

## 🤝 Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to your branch (`git push origin feature-name`).
5. Open a Pull Request.

---
Made with ❤️ by **Deepak Kumar**

