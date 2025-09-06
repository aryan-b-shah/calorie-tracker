# Calorie Tracker Web App

## 🧠 Overview

A full-stack nutrition management platform that helps users track calories, nutrients, and progress toward their health goals. Built with modern technologies and designed with a mobile-first, responsive UI.

## 👨‍💻 Author
- Aryan Shah

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Registration/Login**: Email/password authentication with bcrypt hashing
- **JWT Sessions**: Secure token-based authentication with configurable expiration
- **User Profiles**: Comprehensive profile setup including age, sex, height, weight, activity level
- **BMR Calculation**: Automatic daily calorie target calculation using Mifflin-St Jeor Equation

### 🍽️ Food Management
- **Real Food Database**: Integration with Nutritionix API for accurate nutritional information
- **Smart Search**: Instant food search with autocomplete and filtering
- **Nutrition Tracking**: Track calories, protein, carbs, fat, fiber, sugar, and sodium
- **Serving Management**: Adjust quantities and serving sizes for accurate tracking

### 📊 Progress & Analytics
- **Daily Dashboard**: Real-time calorie progress with visual indicators
- **Weekly Charts**: Interactive charts showing calorie trends over time
- **Macro Breakdown**: Detailed breakdown of protein, carbs, and fat intake
- **Progress Visualization**: Beautiful charts and progress bars

### 🎨 Modern UI/UX
- **Responsive Design**: Web-first approach that works on all devices
- **Clean Interface**: Modern, intuitive design with smooth animations
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark/Light Theme**: Comfortable viewing in any lighting condition

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **SQLite3** - Lightweight, serverless database
- **bcryptjs** - Secure password hashing
- **jsonwebtoken** - JWT authentication
- **axios** - HTTP client for API calls
- **dotenv** - Environment variable management

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Recharts** - Beautiful chart components
- **CSS3** - Modern styling with Flexbox and Grid

### APIs
- **Nutritionix API** - Comprehensive food and nutrition database
- **JWT** - Secure authentication tokens

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Nutritionix API** credentials (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/calorie-tracker.git
cd calorie-tracker
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```bash
# Nutritionix API Credentials
NUTRITIONIX_APP_ID=your_app_id_here
NUTRITIONIX_APP_KEY=your_app_key_here

# Server Port
PORT=5001
```

**Get Nutritionix API credentials:**
1. Visit [https://www.nutritionix.com/business/api](https://www.nutritionix.com/business/api)
2. Sign up for a free account
3. Get your App ID and App Key

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
npm start
# Server will run on http://localhost:5001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# React app will run on http://localhost:3000
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### User Management
- `GET /api/user/:id` - Get user profile
- `PUT /api/user/:id` - Update user profile

### Food Management
- `GET /api/food/search?query=<food>` - Search foods via Nutritionix
- `POST /api/food/entry` - Add food to daily log
- `GET /api/food/entries/:date` - Get daily food entries
- `PUT /api/food/entry/:id` - Update food entry
- `DELETE /api/food/entry/:id` - Delete food entry

### Analytics
- `GET /api/food/daily-total/:date` - Get daily nutrition totals
- `GET /api/food/weekly-progress` - Get weekly progress data

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  age INTEGER,
  sex TEXT,
  height REAL,
  weight REAL,
  activity_level TEXT,
  target_calories INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Food Entries Table
```sql
CREATE TABLE food_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein REAL,
  carbs REAL,
  fat REAL,
  serving_size TEXT,
  quantity REAL NOT NULL,
  date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Daily Totals Table
```sql
CREATE TABLE daily_totals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT UNIQUE NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_protein REAL DEFAULT 0,
  total_carbs REAL DEFAULT 0,
  total_fat REAL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🎯 Usage Guide

### Getting Started
1. **Create Account**: Sign up with your email and basic information
2. **Complete Profile**: Enter your age, height, weight, and activity level
3. **Set Goals**: Use the suggested calorie target or set your own
4. **Start Tracking**: Search for foods and add them to your daily log

### Adding Foods
1. Use the search bar to find foods (e.g., "apple", "chicken breast")
2. Select a food from the search results
3. Adjust the quantity if needed
4. Click "Add to Log" to record your meal

### Managing Your Log
- **Edit Entries**: Click the edit button to adjust serving quantities
- **Delete Entries**: Remove foods you no longer want to track
- **View Progress**: Monitor your daily progress toward your calorie goal

### Tracking Progress
- **Daily Summary**: See your current calorie intake vs. goal
- **Weekly Charts**: View trends and patterns over time
- **Macro Analysis**: Understand your protein, carb, and fat distribution

## 🔧 Development

### Project Structure
```
calorie-tracker/
├── backend/
│   ├── server.js          # Express server and API endpoints
│   └── users.db          # SQLite database
├── frontend/
│   ├── public/
│   │   └── index.html    # HTML template
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js        # Main app component
│   │   ├── App.css       # Styles
│   │   └── index.js      # Entry point
│   └── package.json      # Frontend dependencies
├── .env                   # Environment variables
└── package.json          # Backend dependencies
```
