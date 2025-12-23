# YummyAI 🍽️

A Vietnamese-first AI-powered meal decision chatbot that helps you decide what to cook today through natural conversation.

## 📖 About

YummyAI is designed specifically for Vietnamese users who struggle with "hôm nay ăn gì?" (what should I eat today?). It provides intelligent meal suggestions, step-by-step recipes, and a personal Cook Book to save your favorite dishes.

## ✨ Features

- 💬 **Chat Interface** - Natural conversation in Vietnamese
- 🤖 **AI-Powered Suggestions** - Smart meal recommendations via OpenRouter API
- 👨‍🍳 **Detailed Recipes** - Step-by-step instructions for beginners
- 📚 **Cook Book** - Save and organize your favorite recipes
- 🔐 **Google OAuth** - Secure authentication with your Google account
- 💾 **Chat History** - Review past conversations (90 days retention)
- 📱 **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

### Frontend

- React with Vite
- ShadCN UI + Tailwind CSS
- React Router
- Axios

### Backend

- Spring Boot 3.x (Java 17+)
- Spring Security + JWT
- OpenRouter API Integration

### Database

- Supabase (PostgreSQL)

## 📋 Prerequisites

- Node.js 18+
- Java 17+
- MongoDB/PostgreSQL (Supabase)
- OpenRouter API key
- Google OAuth credentials

## 🚀 Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

## 📚 Project Structure

```
YummyAI/
├── frontend/          # React + Vite + ShadCN UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
├── backend/           # Spring Boot API
│   ├── src/
│   │   ├── controller/
│   │   ├── service/
│   │   └── repository/
├── PRD.md           # Product Requirements Document
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- OpenRouter for AI API
- ShadCN UI for beautiful components
- Supabase for database hosting
