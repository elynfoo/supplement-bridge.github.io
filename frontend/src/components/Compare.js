import React from 'react';
import './Compare.css';

const ROWS = [
  { key: 'price',          label: 'Price',          render: p => `$${p.price.toFixed(2)}` },
  { key: 'rating',         label: 'Rating',         render: p => p.rating ? <Stars rating={p.rating} count={p.reviewCount} /> : '—' },
  { key: 'category',       label: 'Category',       render: p => <span className="cmp-capitalize">{p.category}</span> },
  { key: 'certifications', label: 'Certifications', render: p => p.certifications?.length
      ? p.certifications.map(c => <span key={c} className="cmp-cert">{c}</span>)
      : '—' },
  { key: 'ingredients',    label: 'Ingredients',    render: p => (
      <ul className="cmp-ingredients">
        {p.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
      </ul>
    ) },
  { key: 'tags',           label: 'Best For',       render: p => (
      <div className="cmp-tags">
        {p.tags.map(t => <span key={t} className="cmp-tag">{t}</span>)}
      </div>
    ) },
];

function Stars({ rating, count }) {
  return (
    <span className="cmp-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="cmp-rating-text">{rating.toFixed(1)} ({count})</span>
    </span>
  );
}

export default function Compare({ products, onAddToCart, onBack }) {
  if (products.length < 2) {
    return (
      <div className="compare-container">
        <button className="back-button" onClick={onBack}>← Back</button>
        <p>Select at least 2 products to compare.</p>
      </div>
    );
  }

  return (
    <div className="compare-container">
      <button className="back-button" onClick={onBack}>← Back to Browse</button>
      <h2 className="compare-title">Product Comparison</h2>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-label-col"></th>
              {products.map(p => (
                <th key={p.id} className="compare-product-col">
                  <img src={p.image} alt={p.name} className="cmp-thumb" />
                  <div className="cmp-name">{p.name}</div>
                  <button className="cmp-add-btn" onClick={() => onAddToCart(p)}>
                    Add to Cart
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.key}>
                <td className="compare-row-label">{row.label}</td>
                {products.map(p => (
                  <td key={p.id} className="compare-row-value">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
