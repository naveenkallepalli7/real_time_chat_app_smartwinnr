# Real-Time Chat Application with WebSockets

A full-stack, real-time messaging application built on the MERN stack with Socket.io, reflecting the functionality of modern chat apps like Slack or WhatsApp.

## Key Features

- **Real-Time Communication**: Instant messaging powered by WebSockets (Socket.io) with instant delivery and live typing indicators.
- **Private & Group Chats**: Support for 1-on-1 private conversations as well as group chat rooms.
- **Media & File Sharing**: Upload and send various file types (Images, Videos, PDFs, Word/Excel documents, ZIP files, etc.).
- **Message Persistence**: All messages, chat history, and uploaded media are securely persisted in MongoDB.
- **Authentication**: Fully secured with JWT-based user login and registration.
- **Responsive UI**: The frontend is fully responsive and adaptable to different screen sizes.

---

## Tech Stack & Version Details

### Frontend
- **React.js**: ^19.2.4 (Vite ^8.0.5)
- **React Router DOM**: ^7.14.0
- **Lucide-react**: ^1.7.0
- **Axios**: ^1.14.0
- **Socket.io-client**: ^4.8.3

### Backend
- **Node.js**: Environment
- **Express.js**: ^5.2.1
- **MongoDB & Mongoose**: ^9.4.1
- **Socket.io**: ^4.8.3
- **JWT (JsonWebToken)**: ^9.0.3
- **Multer**: ^2.1.1 (for file uploads)
- **Bcryptjs**: ^3.0.3

---

## Local Setup Instructions

Follow these steps to run the project locally on your machine.

### Prerequisites
- Node.js installed on your machine (v18.x or v20.x recommended)
- A running MongoDB instance (locally or MongoDB Atlas)

### 1. Database Configuration
1. Navigate to the `backend` folder.
2. Create a `.env` file and add your MongoDB connection string and a strong JWT secret:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```

### 2. Running the Backend
Open a terminal and execute the following commands:
```bash
cd backend
npm install
npm run dev
```
The server should now be running on `http://localhost:5000`.

### 3. Running the Frontend
Open a new terminal window and execute the following commands:
```bash
cd frontend
npm install
npm run dev
```
The client will start, typically on `http://localhost:5173`. Open this URL in your web browser.

---

## Testing the Application

1. Open the application in two different browser windows (or use normal/incognito mode).
2. Register two different user accounts.
3. Search for the other user in the **Users** tab to create a private chat.
4. Go to the **Groups** tab to create or join group rooms.
5. Send messages, use the attachment (paperclip) icon to send files/images, and observe real-time delivery and message persistence across page reloads.
