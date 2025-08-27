# 🍎 Calorie Tracker Web App

A production-ready MVP of a Calorie Tracker Web App built with Node.js, Express, SQLite, and React. Track your daily calorie intake, monitor your nutrition goals, and visualize your progress over time with real nutritional data from Nutritionix API.

![Calorie Tracker](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

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
- **Responsive Design**: Mobile-first approach that works on all devices
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

# JWT Secret (optional for development)
JWT_SECRET=your-super-secret-key

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

### Available Scripts
```bash
# Root directory
npm start          # Start backend server
npm run dev        # Start backend with nodemon
npm run build      # Build frontend for production
npm run install-all # Install all dependencies

# Frontend directory
npm start          # Start React development server
npm run build      # Build for production
npm test           # Run tests
```

### Environment Variables
- `NUTRITIONIX_APP_ID` - Your Nutritionix API App ID
- `NUTRITIONIX_APP_KEY` - Your Nutritionix API App Key
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5001)

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ..
npm start
```

### Environment Setup
Ensure your production environment has:
- All required environment variables
- Proper JWT secret
- Valid Nutritionix API credentials
- Database write permissions

### Recommended Hosting
- **Backend**: Heroku, Railway, or DigitalOcean
- **Frontend**: Vercel, Netlify, or GitHub Pages
- **Database**: SQLite (development) or PostgreSQL (production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 5001 is available
- Verify `.env` file exists and has correct values
- Ensure all dependencies are installed

**Frontend won't start:**
- Check if port 3000 is available
- Verify all frontend dependencies are installed
- Check for syntax errors in React components

**API calls failing:**
- Verify backend server is running
- Check Nutritionix API credentials
- Ensure JWT token is valid

**Database errors:**
- Check file permissions for `users.db`
- Verify SQLite is properly installed
- Check database schema

## 📈 Future Enhancements

- [ ] **Barcode Scanner** - Scan food packages for quick entry
- [ ] **Meal Planning** - Plan meals in advance
- [ ] **Recipe Builder** - Create and save custom recipes
- [ ] **Social Features** - Share progress with friends
- [ ] **Mobile App** - Native iOS and Android applications
- [ ] **Export Data** - Download nutrition data for analysis
- [ ] **Goal Tracking** - Weight and fitness goal management
- [ ] **Notifications** - Reminders and progress alerts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Nutritionix** - For providing comprehensive nutritional data
- **React Team** - For the amazing frontend framework
- **Express.js** - For the robust backend framework
- **Open Source Community** - For all the amazing packages

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/calorie-tracker/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem
4. Provide your environment details

---

**Built with ❤️ for health-conscious individuals who want to take control of their nutrition journey.**

*Star this repository if you find it helpful! ⭐*
