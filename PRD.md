# YummyAI - Product Requirements Document

## Project Overview

**Project Name:** YummyAI

**Version:** 1.0

**Status:** Ready for Implementation

**Last Updated:** December 23, 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Target Audience](#target-audience)
4. [Product Vision](#product-vision)
5. [Key Features](#key-features)
6. [User Stories](#user-stories)
7. [Functional Requirements](#functional-requirements)
8. [Non-Functional Requirements](#non-functional-requirements)
9. [Technical Requirements](#technical-requirements)
10. [Content Strategy](#content-strategy)
11. [UI/UX Requirements](#uiux-requirements)
12. [Success Metrics](#success-metrics)
13. [Future Enhancements](#future-enhancements)

---

## Executive Summary

YummyAI is a **Vietnamese-first** chatbot that helps people decide what to cook through natural conversation. The platform is designed specifically for Vietnamese users, with all content and interactions in Vietnamese. It features a sidebar navigation with two main tabs: **Chat** for meal suggestions and **Cook Book** for saving favorite recipes. The focus is on beginner-friendly Vietnamese recipes with simple cooking instructions. Users can chat with YummyAI in Vietnamese to get meal ideas, then save their favorite recipes to their personal Cook Book for easy access later.

**Key Differentiator:** Unlike other meal decision tools that are primarily in English, YummyAI is built from the ground up for Vietnamese users, with natural Vietnamese language support and culturally relevant recipe suggestions.

_Note: This section will be updated after requirements gathering_

---

## Problem Statement

### The Problem

- Many home cooks face "decision paralysis" when trying to decide what to cook
- The abundance of recipe options makes it difficult to choose a meal
- Lack of cooking experience/knowledge makes meal planning challenging
- People who aren't good at cooking need simple, easy-to-follow recipes
- Busy individuals want quick meal decisions without spending time browsing
- Need for accessible meal suggestions for all skill levels

### Current Solutions Gaps

- Most meal decision tools are in English and don't support Vietnamese
- Recipe sites are overwhelming with too many complex options
- Meal planning apps are too complex for casual daily use
- No chat-based interface for natural meal suggestions
- Most recipes assume intermediate cooking skills
- Existing tools don't allow easy saving of favorite recipes
- No Vietnamese-focused meal chatbot with recipe book feature

_Note: Will be refined based on user discussion_

---

## Target Audience

### Primary Users

- Vietnamese-speaking home cooks who are not confident in the kitchen
- Beginner cooks in Vietnam who want simple meal suggestions
- Solo cooks living alone in Vietnam
- People who cook for themselves daily
- Busy Vietnamese individuals who need quick meal decisions
- Anyone who struggles with "hôm nay ăn gì?" indecision
- Vietnamese home cooks who prefer simple, easy recipes with clear instructions
- Users who want to save and organize favorite recipes

### User Personas

**Persona 1: The Beginner Cook**

- Limited cooking experience
- Needs simple, fool-proof recipes
- Wants clear, step-by-step instructions
- Prefers meals under 30 minutes

**Persona 2: The Busy Professional**

- Limited time for meal planning
- Needs quick decision-making tool
- Wants efficient, no-fuss meals
- Appreciates variety without complexity

**Persona 3: The Solo Diner**

- Cooks for one person
- Needs portion-appropriate recipes
- Wants to avoid food waste
- Seeks variety in daily meals

_To be refined based on user discussion_

---

## Product Vision

**Vision Statement:** To be the go-to Vietnamese chatbot for meal decisions with an integrated recipe book, providing accessible meal suggestions through natural conversation while allowing users to save and organize their favorite recipes.

**Success Definition:** A Vietnamese user can chat with YummyAI in natural language, get a personalized meal suggestion within 10 seconds, feel confident to cook it, and easily save recipes to their personal Cook Book for future reference.

---

## Key Features

### Core Features (MVP)

**FR-001: Chat Interface**

- Natural language conversation in Vietnamese
- Chat-based UI with message history
- Sidebar navigation for easy tab switching
- Supports questions like "Hôm nay nên ăn gì?" (What should I eat today?)
- Context-aware responses
- Chat history stored for logged-in users (90 days retention)
- Recipe cards displayed after AI response

**FR-002: Meal Suggestion Engine**

- AI-powered meal recommendations via OpenRouter API
- Immediate suggestion when user asks for meal
- Smart filtering based on user conversation
- Random meal generation when no specific criteria given
- Displays full recipe in chat as a card

**FR-003: Google OAuth Authentication**

- Login with Google account
- User profile: email and display name from Google
- Session management with JWT tokens
- Secure authentication flow
- Logout functionality

**FR-004: Cook Book**

- Save favorite recipes from chat session (requires login)
- View saved recipes in grid layout
- Private per user (only logged-in user sees their recipes)
- Remove recipes from Cook Book
- Data stored in Supabase database (persistent across devices)
- Show recipe count in Cook Book tab

**FR-005: Recipe Display**

- Full Vietnamese recipes with step-by-step instructions
- Ingredients list (for 1-2 people)
- Cooking time and difficulty level
- Pro tips and tricks
- "Save to Cook Book" button on each recipe (login required)
- Recipe cards shown in chat after AI response

**FR-006: Basic Filtering**

- Meal type (sáng, trưa, tối - breakfast, lunch, dinner)
- Cooking time preference (nhanh, bình thường, lâu - quick, normal, long)
- Difficulty level (dễ, trung bình - easy, medium)

### Nice-to-Have Features (Future)

- Ingredient-based suggestions ("Mình có trứng và cà chua, nên làm gì?")
- Categorize recipes in Cook Book (tags, folders)
- Shopping list generation from saved recipes
- Nutritional information
- Vietnamese cuisine categories (Món Bắc, Trung, Nam)
- Search in Cook Book
- Export/import Cook Book
- Share recipes with friends

---

## User Stories

### Primary User Stories

**US-001: As a new user, I want to login with Google so I can save my favorite recipes.**

- User clicks "Đăng nhập với Google" button
- Google OAuth popup appears
- User selects Google account
- User is logged in and redirected to Chat tab
- User profile (name, email) is stored

**US-002: As a logged-in user, I want to chat with YummyAI to get meal suggestions.**

- User types "Hôm nay nên ăn gì?" in chat input
- YummyAI responds immediately with a recipe card
- Recipe card shows meal name, time, difficulty, ingredients, instructions
- User can ask follow-up questions about the recipe

**US-003: As a logged-in user, I want to save recipes to my Cook Book.**

- User sees a recipe card in chat
- User clicks "Lưu vào Cook Book" button
- Success toast: "Đã lưu thành công!" appears
- Recipe is added to user's Cook Book
- User can view saved recipes in Cook Book tab

**US-004: As a logged-in user, I want to view my saved recipes in Cook Book.**

- User switches to Cook Book tab
- Grid of saved recipe cards is displayed
- Each card shows meal name, cooking time, difficulty
- User can click "Xem chi tiết" to view full recipe
- User can click "Xóa" to remove recipe

**US-005: As a user, I want my chat history to be saved so I can review previous conversations.**

- User chats with YummyAI
- All conversations are stored in database
- When user logs in, they see previous chat history (last 90 days)
- User can clear chat history if desired

**US-006: As a logged-in user, I want to logout when I'm done.**

- User clicks logout button
- Session is cleared
- User is redirected to login screen
- User data remains in database for next login

---

## Functional Requirements

### FR-001: Google OAuth Authentication System

**Description:** Implement Google OAuth 2.0 for user authentication with Spring Security.

**Acceptance Criteria:**

- User can login with Google account
- JWT tokens are issued upon successful login
- User profile (email, name) is stored in database
- Token-based authentication for all protected endpoints
- Logout functionality clears session
- Protected endpoints return 401 for unauthenticated requests

**API Endpoints:**

- `POST /api/auth/google` - Exchange Google OAuth code for JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### FR-002: Chat and Meal Suggestion System

**Description:** Chat interface that integrates with OpenRouter API to provide meal suggestions.

**Acceptance Criteria:**

- User sends message to backend
- Backend forwards message to OpenRouter API with meal database context
- OpenRouter returns appropriate meal suggestion
- Backend stores chat history in database (for logged-in users)
- Response includes full recipe details
- Recipe card is returned to frontend

**API Endpoints:**

- `POST /api/chat` - Send message, get AI response with recipe
- `GET /api/chat/history` - Get user's chat history (last 90 days)
- `DELETE /api/chat/history` - Clear chat history

### FR-003: Cook Book Management System

**Description:** CRUD operations for managing user's saved recipes.

**Acceptance Criteria:**

- Authenticated user can save recipe to their Cook Book
- Duplicate recipes cannot be saved
- User can view all saved recipes
- User can remove recipes from Cook Book
- Recipes are private to each user

**API Endpoints:**

- `POST /api/cookbook` - Save recipe to Cook Book
- `GET /api/cookbook` - Get user's saved recipes
- `DELETE /api/cookbook/{recipeId}` - Remove recipe from Cook Book
- `GET /api/recipes/{id}` - Get specific recipe details

### FR-004: Recipe Database System

**Description:** Manage recipe database with Vietnamese meals.

**Acceptance Criteria:**

- Backend serves recipe data from Supabase
- Recipes can be queried by type, time, difficulty
- Each recipe has unique ID
- Recipe data includes all required fields

**API Endpoints:**

- `GET /api/recipes` - Get all recipes (with optional filters)
- `GET /api/recipes?mealType=sáng` - Filter by meal type
- `GET /api/recipes?time=10` - Filter by max cooking time
- `GET /api/recipes?difficulty=dễ` - Filter by difficulty

### FR-005: OpenRouter AI Integration

**Description:** Integrate OpenRouter API for intelligent meal suggestions.

**Acceptance Criteria:**

- Backend communicates with OpenRouter API
- System prompts include meal database context
- Responses are in Vietnamese
- API errors are handled gracefully
- API key is stored in environment variables

**Configuration:**

- OpenRouter API key in environment variables
- Model selection (e.g., `openai/gpt-4-turbo`, `anthropic/claude-3-haiku`)
- System prompt includes Vietnamese language instruction

---

## Non-Functional Requirements

### Performance

- Load time: < 2 seconds
- Suggestion generation: < 1 second

### Usability

- Mobile-friendly responsive design
- Simple, intuitive interface
- Maximum 2 clicks to get a suggestion

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible

---

## Technical Requirements

### Database Schema

**Table: users**

| Column     | Type         | Description           | Constraints      |
| ---------- | ------------ | --------------------- | ---------------- |
| id         | UUID         | Primary key           | PRIMARY KEY      |
| google_id  | VARCHAR(255) | Google OAuth user ID  | UNIQUE, NOT NULL |
| email      | VARCHAR(255) | User email            | UNIQUE, NOT NULL |
| name       | VARCHAR(255) | Display name          | NOT NULL         |
| avatar_url | VARCHAR(500) | Profile picture URL   | NULL             |
| created_at | TIMESTAMP    | Account creation time | DEFAULT NOW()    |
| updated_at | TIMESTAMP    | Last update time      | DEFAULT NOW()    |

**Table: recipes**

| Column       | Type         | Description            | Constraints   |
| ------------ | ------------ | ---------------------- | ------------- |
| id           | UUID         | Primary key            | PRIMARY KEY   |
| name         | VARCHAR(255) | Meal name              | NOT NULL      |
| description  | TEXT         | Brief description      | NULL          |
| cooking_time | INT          | Minutes                | NOT NULL      |
| difficulty   | VARCHAR(50)  | Easy/Medium            | NOT NULL      |
| meal_type    | VARCHAR(50)  | Breakfast/Lunch/Dinner | NOT NULL      |
| ingredients  | TEXT         | JSON array             | NOT NULL      |
| instructions | TEXT         | Step-by-step guide     | NOT NULL      |
| tips         | TEXT         | Pro tips               | NULL          |
| image_url    | VARCHAR(500) | Recipe image           | NULL          |
| created_at   | TIMESTAMP    | Creation time          | DEFAULT NOW() |

**Table: cookbook**

| Column    | Type      | Description            | Constraints                                                               |
| --------- | --------- | ---------------------- | ------------------------------------------------------------------------- |
| id        | UUID      | Primary key            | PRIMARY KEY                                                               |
| user_id   | UUID      | Foreign key to users   | NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE     |
| recipe_id | UUID      | Foreign key to recipes | NOT NULL, FOREIGN KEY(recipe_id) REFERENCES recipes(id) ON DELETE CASCADE |
| saved_at  | TIMESTAMP | When saved             | DEFAULT NOW()                                                             |

**Table: chat_history**

| Column     | Type      | Description                 | Constraints                                                                                   |
| ---------- | --------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| id         | UUID      | Primary key                 | PRIMARY KEY                                                                                   |
| user_id    | UUID      | Foreign key to users        | NULL (for unauthenticated users), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE |
| message    | TEXT      | User's message              | NOT NULL                                                                                      |
| response   | TEXT      | AI's response (with recipe) | NOT NULL                                                                                      |
| created_at | TIMESTAMP | Message timestamp           | DEFAULT NOW()                                                                                 |

**Indexes:**

- `idx_users_google_id` on users(google_id)
- `idx_recipes_meal_type` on recipes(meal_type)
- `idx_recipes_difficulty` on recipes(difficulty)
- `idx_cookbook_user_id` on cookbook(user_id)
- `idx_chat_history_user_id` on chat_history(user_id)
- `idx_chat_history_created_at` on chat_history(created_at)

### Technology Stack

**Frontend:**

- React with Vite for fast development and hot reload
- Component-based UI architecture
- ShadCN UI for rapid UI component development
- Tailwind CSS for styling (comes with ShadCN UI)
- State management with React hooks (useState, useEffect, useContext)
- Chat UI component using ShadCN components or custom implementation
- Responsive design with Tailwind CSS Grid/Flexbox
- Axios for API communication with backend
- React Router for navigation (Chat, Cook Book, Login pages)

**Backend:**

- Spring Boot 3.x with Java 17+
- RESTful API endpoints
- Spring Web for REST controllers
- OpenRouter API integration for AI chatbot
- Supabase integration for database operations
- CORS configuration for frontend-backend communication

**Database:**

- Supabase (PostgreSQL-based cloud database)
- Tables: recipes, users, cookbook
- Persistent storage across devices
- Free tier suitable for learning and MVP
- Real-time capabilities for future enhancements

**AI Integration:**

- OpenRouter API for chatbot intelligence
- Model selection (e.g., GPT-4, Claude, or cost-effective alternatives)
- Context-aware meal suggestions
- Natural language understanding for Vietnamese
- API key management through environment variables

**Language Support:**

- Full Vietnamese language support
- UTF-8 encoding for Vietnamese characters
- Vietnamese fonts and typography

### Platform Requirements

- Web-based application
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile and desktop support (responsive design)
- Vietnamese keyboard input support
- Touch-friendly on mobile devices

### Deployment

**Frontend Deployment:**

- Vercel or Netlify for React frontend
- Automated builds from Git repository
- Preview deployments for development
- Custom domain support (optional)

**Backend Deployment:**

- Railway, Render, or Heroku for Spring Boot
- Free tier suitable for learning
- Continuous integration/deployment
- Environment variables management (API keys, database URLs)

**Environment Configuration:**

- Development: Local Docker or direct Spring Boot run
- Production: Cloud deployment platforms
- Separate environments for dev/staging/production

**Vietnamese-First Priority:**

- All UI elements and user-facing text will be in Vietnamese
- No English-only fallback for Vietnamese users
- Vietnamese language support is the primary focus for MVP
- Future language support (English, etc.) will be added after Vietnamese version is stable

---

## Content Strategy

### Meal Database

- **Primary Cuisine:** Vietnamese dishes (món ăn Việt Nam)
- **Cuisines to include:** Vietnamese home cooking, fusion dishes, some Western options
- **Cooking time focus:** Primarily quick meals (10-30 minutes) with some longer options
- **Difficulty levels:** Dễ (Easy) and Trung bình (Medium) - beginner-friendly
- **Number of meals:** 30-50 meals for MVP
- **Language:** All content in Vietnamese

### Content Format

Each meal should include:

- Meal name (Vietnamese)
- Brief description (Vietnamese)
- Cooking time (thời gian nấu)
- Difficulty level (độ khó: Dễ/Trung bình)
- Ingredients list (nguyên liệu) for 1-2 people
- Step-by-step instructions (hướng dẫn chi tiết)
- Pro tips (mẹo nấu ăn)
- Meal type (loại món: Món ăn sáng/trưa/tối/ăn vặt)
- Unique ID for saving to Cook Book

### Vietnamese Meal Categories

- **Món ăn sáng:** Phở, bún mì, cháo, bánh mì, xôi
- **Món ăn trưa:** Cơm, bún, phở, mì, món ăn nhanh
- **Món ăn tối:** Các món cơm, canh, xào, kho
- **Món ăn vặt:** Bánh, snack, trái cây
- **Món miền Bắc:** Phở, bánh cuốn, chả cá
- **Món miền Trung:** Bún bò Huế, mì Quảng
- **Món miền Nam:** Cơm tấm, hủ tiếu, bánh xèo

---

## UI/UX Requirements

### Design Principles

- Simple and clean chat interface with sidebar navigation
- Natural conversation flow in Vietnamese
- Easy tab switching between Chat and Cook Book
- Intuitive save/remove recipe actions
- Visual hierarchy for easy scanning
- Warm, inviting colors that evoke food and appetite
- Vietnamese-friendly typography and spacing

### Key Screens

1. **Sidebar Navigation (Left)**

   - Tab 1: Chat (Active by default)
   - Tab 2: Cook Book
   - Visual indicators for active tab
   - Icons for easy recognition

2. **Chat Tab (Main Content)**

   - Chat message history area (scrollable)
   - Input field for typing messages
   - Send button
   - Recipe cards displayed in chat
   - "Save to Cook Book" button on each recipe

3. **Cook Book Tab (Main Content)**
   - Grid or list view of saved recipes
   - Recipe cards with:
     - Meal name
     - Quick preview (time, difficulty)
     - Image thumbnail (optional)
     - "View Recipe" button
     - "Remove" button
   - Empty state message when no recipes saved
   - Search/filter options (nice-to-have)

### Color Scheme

- Primary: Warm orange/coral tones (#FF6B6B or similar) - evoking appetite
- Secondary: Green tones (#4ECDC4) - freshness, vegetables
- Sidebar: Dark or light gray with active tab highlight
- Chat background: Light, neutral (#F8F9FA)
- Message bubbles: Different colors for user vs AI
- Accent: Vietnamese cultural elements if appropriate

### Typography

- Vietnamese-friendly fonts (Roboto, Quicksand, or similar)
- Clear, readable text at different sizes
- Proper spacing for Vietnamese diacritics
- Mobile-optimized font sizes
- Good contrast for readability

---

## Success Metrics

### Key Performance Indicators (KPIs)

- _Time to get a suggestion_
- _User satisfaction (to be measured)_
- _Repeat usage rate_

### Success Criteria

- _To be defined_

---

## Future Enhancements

### Phase 2 Features

- _[Feature ideas to be added]_

### Phase 3 Features

- _[Feature ideas to be added]_

---

## Change Log

| Date       | Version | Changes              | Author |
| ---------- | ------- | -------------------- | ------ |
| 2025-12-23 | 1.0     | Initial PRD creation | Tom    |

---

## Notes

_This PRD is a living document and will be updated as we gather more requirements and refine the product vision._
