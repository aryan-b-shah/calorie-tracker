import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/user/${user.userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(formData);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setError('');
    setSuccess('');
  };

  const targetCalories = calculateTargetCalories();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>Calorie Tracker</h1>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile" className="active">Profile</Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="profile-form">
          <h2>Profile Settings</h2>
          
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          {success && <div style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile?.email || ''}
              disabled
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Email cannot be changed
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={editing ? formData.age || '' : profile?.age || ''}
                onChange={handleChange}
                disabled={!editing}
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
                value={editing ? formData.sex || '' : profile?.sex || ''}
                onChange={handleChange}
                disabled={!editing}
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
                value={editing ? formData.height || '' : profile?.height || ''}
                onChange={handleChange}
                disabled={!editing}
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
                value={editing ? formData.weight || '' : profile?.weight || ''}
                onChange={handleChange}
                disabled={!editing}
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
              value={editing ? formData.activity_level || '' : profile?.activity_level || ''}
              onChange={handleChange}
              disabled={!editing}
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
              value={editing ? (formData.target_calories || targetCalories) : (profile?.target_calories || '')}
              onChange={handleChange}
              disabled={!editing}
              min="800"
              max="5000"
              placeholder="Target calories"
            />
            {editing && targetCalories && (
              <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Suggested: {targetCalories} calories based on your profile
              </small>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {editing ? (
              <>
                <button 
                  onClick={handleSave} 
                  className="btn save-btn" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={handleCancel}
                  style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setEditing(true)}
                className="btn"
                style={{ flex: 1 }}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
