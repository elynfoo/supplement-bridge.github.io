import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IngredientLibrary.css';

const API_URL = process.env.REACT_APP_API_URL || '';

const CATEGORY_COLORS = {
  'Vitamin':         { bg: '#E8F5E9', text: '#2E7D32' },
  'Mineral':         { bg: '#E3F2FD', text: '#1565C0' },
  'Essential Fat':   { bg: '#FFF3E0', text: '#E65100' },
  'Live Culture':    { bg: '#F3E5F5', text: '#6A1B9A' },
  'Adaptogen Herb':  { bg: '#E8F5E9', text: '#1B5E20' },
  'Protein':         { bg: '#FCE4EC', text: '#880E4F' },
};

function CategoryBadge({ category }) {
  const style = CATEGORY_COLORS[category] || { bg: '#f5f5f5', text: '#555' };
  return (
    <span className="lib-category-badge" style={{ background: style.bg, color: style.text }}>
      {category}
    </span>
  );
}

function IngredientCard({ ingredient, isOpen, onToggle }) {
  return (
    <div className={`lib-card ${isOpen ? 'open' : ''}`}>
      <button className="lib-card-header" onClick={onToggle}>
        <div className="lib-card-title">
          <span className="lib-name">{ingredient.name}</span>
          <CategoryBadge category={ingredient.category} />
        </div>
        <span className="lib-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="lib-card-body">
          <div className="lib-section">
            <h4>What it is</h4>
            <p>{ingredient.what_it_is}</p>
          </div>
          <div className="lib-section">
            <h4>Common uses</h4>
            <p>{ingredient.uses}</p>
          </div>
          <div className="lib-section lib-dosage">
            <h4>Dosage guidance</h4>
            <p>{ingredient.dosage}</p>
          </div>
          <div className="lib-section lib-cautions">
            <h4>Things to be aware of</h4>
            <p>{ingredient.cautions}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IngredientLibrary({ onBack }) {
  const [ingredients, setIngredients] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetchIngredients('');
  }, []);

  const fetchIngredients = async (q) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/ingredients${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      setIngredients(res.data);
    } catch (err) {
      console.error('Failed to load ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    fetchIngredients(q);
    setOpenId(null);
  };

  const handleToggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="lib-container">
      <button className="back-button" onClick={onBack}>← Back to Browse</button>
      <div className="lib-header">
        <h2>Ingredient Education Library</h2>
        <p>Look up common supplement ingredients — written in plain, jargon-free language.</p>
      </div>

      <input
        type="text"
        className="lib-search"
        placeholder="Search by ingredient name, category, or use..."
        value={query}
        onChange={handleSearch}
      />

      {loading ? (
        <p className="lib-loading">Loading ingredients...</p>
      ) : ingredients.length === 0 ? (
        <p className="lib-empty">No ingredients found for "{query}".</p>
      ) : (
        <div className="lib-list">
          {ingredients.map(ing => (
            <IngredientCard
              key={ing.id}
              ingredient={ing}
              isOpen={openId === ing.id}
              onToggle={() => handleToggle(ing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
