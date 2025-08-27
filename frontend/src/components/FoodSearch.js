import React, { useState } from 'react';
import axios from 'axios';

const FoodSearch = ({ onFoodAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingFood, setAddingFood] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/food/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setSearchResults([]);
    setSearchQuery(food.name);
  };

  const handleAddFood = async () => {
    if (!selectedFood || quantity <= 0) return;

    setAddingFood(true);
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      
      await axios.post('http://localhost:5001/api/food/entry', {
        food_name: selectedFood.name,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        serving_size: selectedFood.serving_size,
        quantity: quantity,
        date: today
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setSelectedFood(null);
      setSearchQuery('');
      setQuantity(1);
      onFoodAdded();
    } catch (error) {
      console.error('Failed to add food:', error);
      alert('Failed to add food. Please try again.');
    } finally {
      setAddingFood(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="food-search">
      <h3>Add Food</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search for foods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          onClick={handleSearch} 
          className="btn" 
          style={{ width: 'auto', marginLeft: '0.5rem' }}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && !selectedFood && (
        <div className="search-results">
          {searchResults.map((food) => (
            <div 
              key={food.id} 
              className="food-item"
              onClick={() => handleFoodSelect(food)}
            >
              <div className="food-info">
                <h4>{food.name}</h4>
                <p>{food.serving_size}</p>
              </div>
              <div className="food-calories">
                {food.calories} cal
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFood && (
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '1rem',
          marginTop: '1rem',
          backgroundColor: '#f8fafc'
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Selected: {selectedFood.name}</h4>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            {selectedFood.serving_size} • {selectedFood.calories} calories
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              className="quantity-input"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              min="0.1"
              step="0.1"
            />
            <span style={{ color: '#64748b' }}>
              = {(selectedFood.calories * quantity).toFixed(0)} calories
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleAddFood} 
              className="btn" 
              style={{ width: 'auto' }}
              disabled={addingFood || quantity <= 0}
            >
              {addingFood ? 'Adding...' : 'Add to Log'}
            </button>
            <button 
              onClick={() => {
                setSelectedFood(null);
                setSearchQuery('');
                setQuantity(1);
              }}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {searchResults.length === 0 && searchQuery && !loading && !selectedFood && (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '1rem' }}>
          No foods found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default FoodSearch;
