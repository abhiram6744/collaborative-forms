# 📝 Collaborative Form Filling System

A real-time collaborative form filling platform (like Google Docs for forms) where multiple users can edit a **single shared response** together. Designed for surveys, data entry, and collaborative editing tasks.

## 🚀 Demo

- 🌐 Frontend: [http://localhost:3000](http://localhost:3000)
- 🛠 Backend API: [http://localhost:5000](http://localhost:5000)

---

## 🏗️ Tech Stack

| Layer         | Technology                        |
|---------------|------------------------------------|
| **Frontend**  | React.js, Socket.IO Client         |
| **Backend**   | Node.js, Express.js, Sequelize     |
| **Database**  | PostgreSQL (via Sequelize ORM)     |
| **Realtime**  | Socket.IO + Redis (field locking)  |
| **Authentication** | JWT + Role-based middleware |
| **Deployment**| Docker + Docker Compose            |

---

## 📁 Project Structure

```bash
collaborative-forms/
├── backend/        # Node.js + Express + WebSockets
├── frontend/       # React UI for real-time forms
├── docker-compose.yml
└── README.md       # You're reading it 😄
