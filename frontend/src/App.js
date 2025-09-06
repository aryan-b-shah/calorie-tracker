import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        try {
          // Verify token with backend
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setUser({ token, userId });
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      }
      setLoading(false);
    };
    
    verifyToken();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userId', userData.userId);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" /> : <Register onLogin={login} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
