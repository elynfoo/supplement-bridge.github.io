import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Browse from './components/Browse';
import Quiz from './components/Quiz';
import Recommendations from './components/Recommendations';
import ProductView from './components/ProductView';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import AuthModal from './components/AuthModal';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || '';

// Route /admin to the admin dashboard without React Router
if (window.location.pathname.startsWith('/admin')) {
  const AdminApp = React.lazy(() => import('./admin/Admin'));
  import('react-dom/client').then(({ createRoot }) => {
    createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <React.Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
          <AdminApp />
        </React.Suspense>
      </React.StrictMode>
    );
  });
}

export default function App() {
  const [screen, setScreen] = useState('browse');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hs_user')); } catch { return null; }
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      alert('Failed to load products. Check if backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      return existing
        ? prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { ...product, quantity }];
    });
    alert('Added to cart!');
  };

  const handleRemoveFromCart = (productId) => setCart(prev => prev.filter(i => i.id !== productId));

  const handleUpdateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) return handleRemoveFromCart(productId);
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  // Gate checkout behind authentication
  const handleGoToCheckout = () => {
    if (!user) {
      setPendingCheckout(true);
      setShowAuth(true);
    } else {
      setScreen('checkout');
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('hs_user', JSON.stringify(userData));
    setShowAuth(false);
    if (pendingCheckout) {
      setPendingCheckout(false);
      setScreen('checkout');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hs_user');
    if (screen === 'checkout') setScreen('cart');
  };

  const handleSubmitQuiz = async (answers) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/quiz/submit`, { answers });
      setRecommendations(res.data.recommendations);
      setScreen('recommendations');
    } catch (err) {
      console.error('Quiz submission failed:', err);
      alert('Failed to process quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (customerInfo) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/checkout`,
        { cartItems: cart, customerInfo },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrder(res.data);
      setCart([]);
      setScreen('order-confirmation');
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired - re-prompt login
        setUser(null);
        localStorage.removeItem('hs_user');
        setPendingCheckout(true);
        setShowAuth(true);
      } else {
        alert('Checkout failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => { setScreen('browse'); setSelectedProduct(null); };

  if (loading && screen === 'browse' && products.length === 0) {
    return <div className="container"><h2>Loading products...</h2></div>;
  }

  return (
    <div className="app">
      <Header
        screen={screen} cartCount={cart.length} user={user}
        goHome={goHome} onCartClick={() => setScreen('cart')}
        onSignIn={() => setShowAuth(true)} onLogout={handleLogout}
      />

      <main className="main-content">
        {screen === 'browse' && (
          <Browse
            products={products}
            onSelectProduct={(p) => { setSelectedProduct(p); setScreen('product-view'); }}
            onStartQuiz={() => setScreen('quiz')}
          />
        )}
        {screen === 'quiz' && <Quiz onSubmit={handleSubmitQuiz} loading={loading} />}
        {screen === 'recommendations' && (
          <Recommendations
            recommendations={recommendations}
            onSelectProduct={(p) => { setSelectedProduct(p); setScreen('product-view'); }}
            onContinueShopping={() => setScreen('browse')}
          />
        )}
        {screen === 'product-view' && selectedProduct && (
          <ProductView product={selectedProduct} onAddToCart={handleAddToCart} onBack={() => setScreen('browse')} />
        )}
        {screen === 'cart' && (
          <Cart
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={handleRemoveFromCart}
            onCheckout={handleGoToCheckout}
            onContinueShopping={() => setScreen('browse')}
          />
        )}
        {screen === 'checkout' && (
          <Checkout
            cartItems={cart} user={user}
            onSubmit={handleCheckout} loading={loading}
            onCancel={() => setScreen('cart')}
          />
        )}
        {screen === 'order-confirmation' && order && (
          <OrderConfirmation order={order} onDone={goHome} />
        )}
      </main>

      {showAuth && (
        <AuthModal
          message="Sign in or create an account to complete your order"
          onSuccess={handleAuthSuccess}
          onClose={() => { setShowAuth(false); setPendingCheckout(false); }}
        />
      )}
    </div>
  );
}

function Header({ screen, cartCount, user, goHome, onCartClick, onSignIn, onLogout }) {
  const screenNames = {
    browse: 'HealthSupp', quiz: 'Health Quiz', recommendations: 'Recommendations',
    'product-view': 'Product', cart: 'Cart', checkout: 'Checkout',
    'order-confirmation': 'Order Confirmed'
  };

  return (
    <header className="header">
      <button className="header-home" onClick={goHome}>HealthSupp</button>
      <h1>{screenNames[screen] || 'HealthSupp'}</h1>
      <div className="header-right">
        {user ? (
          <span className="header-user">
            Hi, {user.firstName}
            <button className="header-logout" onClick={onLogout}>Sign out</button>
          </span>
        ) : (
          <button className="header-signin" onClick={onSignIn}>Sign in</button>
        )}
        <button className="header-cart" onClick={onCartClick}>Cart {cartCount}</button>
      </div>
    </header>
  );
}

