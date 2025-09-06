import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    sex: '',
    height: '',
    weight: '',
    activity_level: '',
    target_calories: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTargetCalories = () => {
    const { age, sex, height, weight, activity_level } = formData;
    if (!age || !sex || !height || !weight || !activity_level) return '';

    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr;
    if (sex === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,      // Little or no exercise
      lightly_active: 1.375, // Light exercise 1-3 days/week
      moderately_active: 1.55, // Moderate exercise 3-5 days/week
      very_active: 1.725,   // Hard exercise 6-7 days/week
      extremely_active: 1.9  // Very hard exercise, physical job
    };

    const tdee = bmr * activityMultipliers[activity_level];
    return Math.round(tdee);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      setLoading(false);
      return;
    }
    
    if (!/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one number');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/register`, registrationData);
      onLogin(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const targetCalories = calculateTargetCalories();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="13"
                max="120"
                placeholder="Age"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sex">Sex</label>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="height">Height (cm)</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                min="100"
                max="250"
                placeholder="Height in cm"
              />
            </div>
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                min="30"
                max="300"
                step="0.1"
                placeholder="Weight in kg"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="activity_level">Activity Level</label>
            <select
              id="activity_level"
              name="activity_level"
              value={formData.activity_level}
              onChange={handleChange}
              required
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
              <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
              <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="target_calories">Target Calories per Day</label>
            <input
              type="number"
              id="target_calories"
              name="target_calories"
              value={formData.target_calories || targetCalories}
              onChange={handleChange}
              required
              min="800"
              max="5000"
              placeholder="Target calories"
            />
            {targetCalories && (
              <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Suggested: {targetCalories} calories based on your profile
              </small>
            )}
          </div>

          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
