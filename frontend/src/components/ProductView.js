import React, { useState } from 'react';
import './ProductView.css';

function StarRating({ rating, reviewCount }) {
  return (
    <div className="pv-rating">
      <span className="pv-stars">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
        ))}
      </span>
      <span className="pv-rating-text">{rating.toFixed(1)} ({reviewCount} reviews)</span>
    </div>
  );
}

export default function ProductView({ product, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="product-view-container">
      <button className="back-button" onClick={onBack}>← Back</button>

      <div className="product-view-content">
        <div className="product-image-section">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-details-section">
          <h1>{product.name}</h1>
          <p className="category">{product.category}</p>

          {product.rating && <StarRating rating={product.rating} reviewCount={product.reviewCount} />}

          {product.certifications && product.certifications.length > 0 && (
            <div className="pv-certifications">
              {product.certifications.map(c => (
                <span key={c} className="pv-cert-badge">{c}</span>
              ))}
            </div>
          )}

          <div className="price-section">
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="description">{product.description}</p>
          </div>

          <div className="tags-section">
            <h3>Best For:</h3>
            <div className="tags">
              {product.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="ingredients-section">
            <h3>Key Ingredients:</h3>
            <ul>
              {product.ingredients.map((ingredient, idx) => (
                <li key={idx}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div className="cart-section">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
            <button className="add-to-cart-button" onClick={handleAddToCart}>
              Add to Cart (${(product.price * quantity).toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
