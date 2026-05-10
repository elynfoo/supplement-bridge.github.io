import React, { useState } from 'react';
import axios from 'axios';
import './Browse.css';

const API_URL = process.env.REACT_APP_API_URL || '';

export default function Browse({ products, onSelectProduct, onStartQuiz }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      try {
        setSearching(true);
        const res = await axios.get(`${API_URL}/api/search?q=${query}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    } else {
      setSearchResults(null);
    }
  };

  const displayedProducts = searchResults !== null ? searchResults : products;

  return (
    <div className="browse-container">
      <div className="hero-section">
        <h2>Welcome to HealthSupp</h2>
        <p>Premium healthcare supplements for your wellness journey</p>
      </div>

      <div className="browse-controls">
        <input
          type="text"
          placeholder="Search supplements, ingredients..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
        <button className="quiz-button" onClick={onStartQuiz}>
           Take Health Quiz
        </button>
      </div>

      {searching && <p>Searching...</p>}

      <div className="products-grid">
        {displayedProducts.length > 0 ? (
          displayedProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => onSelectProduct(product)}>
              <img src={product.image} alt={product.name} className="product-image" />
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-tags">
                {product.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <button className="view-button">View Details</button>
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}

