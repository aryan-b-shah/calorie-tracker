require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');

// Nutritionix API credentials
const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID || 'your-app-id-here';
const NUTRITIONIX_APP_KEY = process.env.NUTRITIONIX_APP_KEY || 'your-app-key-here';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Database setup
const db = new sqlite3.Database('./users.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS food_entries (
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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS daily_totals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT UNIQUE NOT NULL,
    total_calories INTEGER DEFAULT 0,
    total_protein REAL DEFAULT 0,
    total_carbs REAL DEFAULT 0,
    total_fat REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, age, sex, height, weight, activity_level, target_calories } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, age, sex, height, weight, activity_level, target_calories) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, age, sex, height, weight, activity_level, target_calories],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        
        const token = jwt.sign({ userId: this.lastID }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({ token, userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    res.json({ token, userId: user.id, user: { email: user.email, age: user.age, sex: user.sex, height: user.height, weight: user.weight, activity_level: user.activity_level, target_calories: user.target_calories } });
  });
});

app.get('/api/user/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT id, email, age, sex, height, weight, activity_level, target_calories FROM users WHERE id = ?', [id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

app.put('/api/user/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { age, sex, height, weight, activity_level, target_calories } = req.body;
  
  db.run(
    'UPDATE users SET age = ?, sex = ?, height = ?, weight = ?, activity_level = ?, target_calories = ? WHERE id = ?',
    [age, sex, height, weight, activity_level, target_calories, id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Food search endpoint using Nutritionix API
app.get('/api/food/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    // Call Nutritionix Instant Search API
    const response = await axios.get('https://trackapi.nutritionix.com/v2/search/instant', {
      headers: {
        'x-app-id': NUTRITIONIX_APP_ID,
        'x-app-key': NUTRITIONIX_APP_KEY
      },
      params: {
        query: query.trim(),
        branded: false, // Focus on common foods, not branded products
        detailed: true
      }
    });

    // Process and format the results
    const foods = response.data.common.map((food, index) => {
      // Extract nutrients from the detailed response
      const nutrients = food.full_nutrients || [];
      
      return {
        id: index + 1,
        name: food.food_name,
        calories: Math.round(food.full_nutrients?.find(n => n.attr_id === 208)?.value || 0),
        protein: Math.round((food.full_nutrients?.find(n => n.attr_id === 203)?.value || 0) * 10) / 10,
        carbs: Math.round((food.full_nutrients?.find(n => n.attr_id === 205)?.value || 0) * 10) / 10,
        fat: Math.round((food.full_nutrients?.find(n => n.attr_id === 204)?.value || 0) * 10) / 10,
        serving_size: food.serving_unit || '1 serving',
        // Store the full food data for detailed nutrition info
        full_nutrients: food.full_nutrients
      };
    });

    res.json(foods);
  } catch (error) {
    console.error('Nutritionix API error:', error.response?.data || error.message);
    
    // Fallback to mock data if API fails
    const fallbackResults = [
      {
        id: 1,
        name: 'Apple',
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        serving_size: '1 medium apple'
      },
      {
        id: 2,
        name: 'Chicken Breast',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        serving_size: '3 oz cooked'
      }
    ].filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json(fallbackResults);
  }
});

// Get detailed nutrition info for a specific food
app.get('/api/food/nutrition/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    
    // Call Nutritionix Natural Language API for detailed nutrition
    const response = await axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients', 
      { query: query },
      {
        headers: {
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_APP_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.foods && response.data.foods.length > 0) {
      const food = response.data.foods[0];
      
      const nutrition = {
        name: food.food_name,
        calories: Math.round(food.nf_calories || 0),
        protein: Math.round((food.nf_protein || 0) * 10) / 10,
        carbs: Math.round((food.nf_total_carbohydrate || 0) * 10) / 10,
        fat: Math.round((food.nf_total_fat || 0) * 10) / 10,
        fiber: Math.round((food.nf_dietary_fiber || 0) * 10) / 10,
        sugar: Math.round((food.nf_sugars || 0) * 10) / 10,
        sodium: Math.round(food.nf_sodium || 0),
        serving_size: food.serving_qty + ' ' + food.serving_unit,
        serving_qty: food.serving_qty,
        serving_unit: food.serving_unit
      };
      
      res.json(nutrition);
    } else {
      res.status(404).json({ error: 'Food not found' });
    }
  } catch (error) {
    console.error('Nutritionix Natural Language API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get nutrition info' });
  }
});

// Add food entry
app.post('/api/food/entry', authenticateToken, (req, res) => {
  const { food_name, calories, protein, carbs, fat, serving_size, quantity, date } = req.body;
  const user_id = req.user.userId;
  
  db.run(
    'INSERT INTO food_entries (user_id, food_name, calories, protein, carbs, fat, serving_size, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [user_id, food_name, calories, protein, carbs, fat, serving_size, quantity, date],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add food entry' });
      
      // Update daily totals
      const totalCalories = calories * quantity;
      const totalProtein = protein * quantity;
      const totalCarbs = carbs * quantity;
      const totalFat = fat * quantity;
      
      db.run(
        'INSERT OR REPLACE INTO daily_totals (user_id, date, total_calories, total_protein, total_carbs, total_fat) VALUES (?, ?, COALESCE((SELECT total_calories FROM daily_totals WHERE user_id = ? AND date = ?), 0) + ?, COALESCE((SELECT total_protein FROM daily_totals WHERE user_id = ? AND date = ?), 0) + ?, COALESCE((SELECT total_carbs FROM daily_totals WHERE user_id = ? AND date = ?), 0) + ?, COALESCE((SELECT total_fat FROM daily_totals WHERE user_id = ? AND date = ?), 0) + ?)',
        [user_id, date, user_id, date, totalCalories, user_id, date, totalProtein, user_id, date, totalCarbs, user_id, date, totalFat],
        function(err) {
          if (err) console.error('Failed to update daily totals:', err);
        }
      );
      
      res.json({ message: 'Food entry added successfully', entryId: this.lastID });
    }
  );
});

// Get food entries for a specific date
app.get('/api/food/entries/:date', authenticateToken, (req, res) => {
  const { date } = req.params;
  const user_id = req.user.userId;
  
  db.all(
    'SELECT * FROM food_entries WHERE user_id = ? AND date = ? ORDER BY created_at DESC',
    [user_id, date],
    (err, entries) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch food entries' });
      res.json(entries);
    }
  );
});

// Get daily totals for a specific date
app.get('/api/food/daily-total/:date', authenticateToken, (req, res) => {
  const { date } = req.params;
  const user_id = req.user.userId;
  
  db.get(
    'SELECT * FROM daily_totals WHERE user_id = ? AND date = ?',
    [user_id, date],
    (err, total) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch daily total' });
      res.json(total || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
    }
  );
});

// Get weekly progress data
app.get('/api/food/weekly-progress', authenticateToken, (req, res) => {
  const user_id = req.user.userId;
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  db.all(
    'SELECT date, total_calories FROM daily_totals WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date',
    [user_id, weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]],
    (err, totals) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch weekly progress' });
      res.json(totals);
    }
  );
});

// Update food entry
app.put('/api/food/entry/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const user_id = req.user.userId;
  
  db.run(
    'UPDATE food_entries SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, id, user_id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update food entry' });
      if (this.changes === 0) return res.status(404).json({ error: 'Food entry not found' });
      res.json({ message: 'Food entry updated successfully' });
    }
  );
});

// Delete food entry
app.delete('/api/food/entry/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.userId;
  
  db.run(
    'DELETE FROM food_entries WHERE id = ? AND user_id = ?',
    [id, user_id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete food entry' });
      if (this.changes === 0) return res.status(404).json({ error: 'Food entry not found' });
      res.json({ message: 'Food entry deleted successfully' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
