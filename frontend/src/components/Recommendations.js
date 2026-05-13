import React from 'react';
import './Recommendations.css';

function StarRating({ rating }) {
  return (
    <span className="rec-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rec-rating-value">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function Recommendations({ recommendations, onSelectProduct, onContinueShopping }) {
  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>Personalized Recommendations</h2>
        <p>Based on your health profile, we recommend these supplements for optimal wellness.</p>
      </div>

      <div className="recommendations-grid">
        {recommendations.length > 0 ? (
          recommendations.map(product => (
            <div key={product.id} className="recommendation-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              {product.rating && <StarRating rating={product.rating} />}
              <p className="rec-reason">{product.reason}</p>
              <p className="rec-description">{product.description}</p>
              <p className="rec-price">${product.price.toFixed(2)}</p>
              <button className="rec-button" onClick={() => onSelectProduct(product)}>
                View & Buy
              </button>
            </div>
          ))
        ) : (
          <p>No recommendations available at the moment.</p>
        )}
      </div>

      <button className="continue-shopping" onClick={onContinueShopping}>
        ← Continue Shopping
      </button>
    </div>
  );
}
