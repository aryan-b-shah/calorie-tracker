import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FoodSearch from './FoodSearch';
import FoodLog from './FoodLog';

const Dashboard = ({ user, onLogout }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [dailyTotal, setDailyTotal] = useState({ total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchUserProfile();
    fetchDailyTotal();
    fetchWeeklyProgress();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    }
  };

  const fetchDailyTotal = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/food/daily-total/${today}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDailyTotal(response.data);
    } catch (error) {
      console.error('Failed to fetch daily total:', error);
    }
  };

  const fetchWeeklyProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/food/weekly-progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeeklyProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch weekly progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodAdded = () => {
    fetchDailyTotal();
  };

  const handleFoodUpdated = () => {
    fetchDailyTotal();
  };

  const handleFoodDeleted = () => {
    fetchDailyTotal();
  };

  const getProgressPercentage = () => {
    if (!userProfile?.target_calories) return 0;
    return Math.min((dailyTotal.total_calories / userProfile.target_calories) * 100, 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Calorie Tracker</h1>
        <div className="nav-links">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
            Profile
          </Link>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Today's Summary</h3>
            <div className="calorie-summary">
              <div className="calorie-circle">
                <div className="amount">{dailyTotal.total_calories}</div>
                <div className="label">calories</div>
              </div>
              <div style={{ flex: 1, marginLeft: '1rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Goal:</strong> {userProfile?.target_calories || 0} calories
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                  {getProgressPercentage().toFixed(1)}% of daily goal
                </div>
              </div>
            </div>
            <div className="macro-breakdown">
              <div className="macro-item">
                <div className="amount">{dailyTotal.total_protein.toFixed(1)}g</div>
                <div className="label">Protein</div>
              </div>
              <div className="macro-item">
                <div className="amount">{dailyTotal.total_carbs.toFixed(1)}g</div>
                <div className="label">Carbs</div>
              </div>
              <div className="macro-item">
                <div className="amount">{dailyTotal.total_fat.toFixed(1)}g</div>
                <div className="label">Fat</div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={formatDate}
                  formatter={(value) => [`${value} calories`, 'Calories']}
                />
                <Line 
                  type="monotone" 
                  dataKey="total_calories" 
                  stroke="#667eea" 
                  strokeWidth={2}
                  dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {weeklyProgress.length === 0 && (
              <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>
                No data available yet. Start logging your meals to see your progress!
              </div>
            )}
          </div>
        </div>

        <FoodSearch onFoodAdded={handleFoodAdded} />

        <FoodLog 
          date={today}
          onFoodUpdated={handleFoodUpdated}
          onFoodDeleted={handleFoodDeleted}
        />
      </div>
    </div>
  );
};

export default Dashboard;
