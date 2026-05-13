import React, { useState } from 'react';
import axios from 'axios';
import './Browse.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function StarRating({ rating }) {
  return (
    <span className="browse-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="browse-rating-value">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function Browse({ products, onSelectProduct, onStartQuiz, onOpenLibrary, compareList, onToggleCompare }) {
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
        <button className="quiz-button" onClick={onStartQuiz}>Take Health Quiz</button>
        <button className="library-button" onClick={onOpenLibrary}>Ingredient Library</button>
      </div>

      {searching && <p>Searching...</p>}

      <div className="products-grid">
        {displayedProducts.length > 0 ? (
          displayedProducts.map(product => {
            const inCompare = compareList.some(p => p.id === product.id);
            const compareDisabled = !inCompare && compareList.length >= 3;
            return (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" onClick={() => onSelectProduct(product)} />
                <div className="product-card-body" onClick={() => onSelectProduct(product)}>
                  <h3>{product.name}</h3>
                  {product.rating && <StarRating rating={product.rating} />}
                  <p className="product-description">{product.description}</p>
                  <div className="product-tags">
                    {product.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  {product.certifications && (
                    <div className="product-certs">
                      {product.certifications.slice(0, 2).map(c => (
                        <span key={c} className="cert-badge">{c}</span>
                      ))}
                    </div>
                  )}
                  <p className="product-price">${product.price.toFixed(2)}</p>
                </div>
                <div className="product-card-actions">
                  <button className="view-button" onClick={() => onSelectProduct(product)}>View Details</button>
                  <button
                    className={`compare-toggle ${inCompare ? 'in-compare' : ''}`}
                    onClick={() => onToggleCompare(product)}
                    disabled={compareDisabled}
                    title={compareDisabled ? 'Max 3 products for comparison' : ''}
                  >
                    {inCompare ? '✓ Comparing' : '+ Compare'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {compareList.length >= 2 && (
        <div className="compare-bar">
          <span>{compareList.length} products selected</span>
          <button className="compare-bar-btn" onClick={() => onSelectProduct(null, 'compare')}>
            Compare Now
          </button>
        </div>
      )}
    </div>
  );
}

