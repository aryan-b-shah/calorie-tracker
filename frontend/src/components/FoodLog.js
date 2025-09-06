import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FoodLog = ({ date, onFoodUpdated, onFoodDeleted }) => {
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);

  useEffect(() => {
    fetchFoodEntries();
  }, [date]);

  const fetchFoodEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/food/entries/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoodEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch food entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setEditQuantity(entry.quantity);
  };

  const handleSave = async (entryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/food/entry/${entryId}`, {
        quantity: editQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingId(null);
      onFoodUpdated();
      fetchFoodEntries();
    } catch (error) {
      console.error('Failed to update food entry:', error);
      alert('Failed to update food entry. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditQuantity(1);
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this food entry?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/food/entry/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onFoodDeleted();
      fetchFoodEntries();
    } catch (error) {
      console.error('Failed to delete food entry:', error);
      alert('Failed to delete food entry. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="food-log">
        <h3>Today's Food Log</h3>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="food-log">
      <h3>Today's Food Log - {formatDate(date)}</h3>
      
      {foodEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <p>No foods logged yet today.</p>
          <p>Use the search above to add your first meal!</p>
        </div>
      ) : (
        <div>
          {foodEntries.map((entry) => (
            <div key={entry.id} className="log-item">
              <div className="log-item-info">
                <h4>{entry.food_name}</h4>
                <p>
                  {entry.serving_size} • {entry.quantity} serving{entry.quantity !== 1 ? 's' : ''} • 
                  <span style={{ color: '#667eea', fontWeight: '600' }}>
                    {' '}{(entry.calories * entry.quantity).toFixed(0)} calories
                  </span>
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Protein: {(entry.protein * entry.quantity).toFixed(1)}g • 
                  Carbs: {(entry.carbs * entry.quantity).toFixed(1)}g • 
                  Fat: {(entry.fat * entry.quantity).toFixed(1)}g
                </p>
              </div>
              
              <div className="log-item-actions">
                {editingId === entry.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      className="quantity-input"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
                      min="0.1"
                      step="0.1"
                    />
                    <button 
                      onClick={() => handleSave(entry.id)}
                      className="action-btn"
                      style={{ color: '#10b981' }}
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="action-btn"
                      style={{ color: '#64748b' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEdit(entry)}
                      className="action-btn edit-btn"
                      title="Edit quantity"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="action-btn delete-btn"
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <strong>Total for today:</strong> {foodEntries.reduce((sum, entry) => sum + (entry.calories * entry.quantity), 0).toFixed(0)} calories
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLog;
