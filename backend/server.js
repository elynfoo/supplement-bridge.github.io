const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'healthsupp-dev-secret-change-in-prod';

// ==================== MOCK DATA ====================

let products = [
  {
    id: 1, name: 'Vitamin D3 1000IU', category: 'vitamins', price: 12.99, stock: 142,
    image: 'https://via.placeholder.com/150?text=Vitamin+D3',
    description: 'Supports bone health and immune function',
    ingredients: ['Cholecalciferol (Vitamin D3)', 'Olive Oil', 'Softgel Capsule'],
    tags: ['immunity', 'bones', 'elderly', 'vegan'],
    certifications: ['GMP Certified', 'Non-GMO'],
    rating: 4.6, reviewCount: 218
  },
  {
    id: 2, name: 'Omega-3 Fish Oil', category: 'supplements', price: 18.99, stock: 87,
    image: 'https://via.placeholder.com/150?text=Fish+Oil',
    description: 'Supports heart and brain health',
    ingredients: ['Fish Oil (EPA 180mg / DHA 120mg)', 'Gelatin', 'Glycerin', 'Vitamin E'],
    tags: ['heart-health', 'brain', 'athletes'],
    certifications: ['GMP Certified', 'NSF Certified'],
    rating: 4.4, reviewCount: 163
  },
  {
    id: 3, name: 'Probiotics 50B CFU', category: 'supplements', price: 24.99, stock: 8,
    image: 'https://via.placeholder.com/150?text=Probiotics',
    description: 'Promotes digestive and gut health',
    ingredients: ['Lactobacillus acidophilus', 'Bifidobacterium longum', 'Bifidobacterium bifidum', 'Prebiotic FOS'],
    tags: ['digestive', 'seniors', 'athletes', 'vegan'],
    certifications: ['GMP Certified', 'Non-GMO'],
    rating: 4.7, reviewCount: 291
  },
  {
    id: 4, name: 'Multivitamin Complete', category: 'vitamins', price: 15.99, stock: 203,
    image: 'https://via.placeholder.com/150?text=Multivitamin',
    description: 'Daily essential vitamins and minerals',
    ingredients: ['Vitamin A 900mcg', 'Vitamin C 90mg', 'Vitamin D3 10mcg', 'Iron 8mg', 'Calcium 200mg', 'Zinc 11mg'],
    tags: ['immunity', 'energy', 'general-wellness', 'vegan'],
    certifications: ['GMP Certified', 'USP Verified'],
    rating: 4.3, reviewCount: 445
  },
  {
    id: 5, name: 'Magnesium Glycinate', category: 'minerals', price: 16.99, stock: 0,
    image: 'https://via.placeholder.com/150?text=Magnesium',
    description: 'Supports muscle relaxation and sleep quality',
    ingredients: ['Magnesium Glycinate 400mg', 'Microcrystalline Cellulose', 'Vegetable Capsule'],
    tags: ['sleep', 'stress', 'muscles', 'vegan'],
    certifications: ['GMP Certified', 'Non-GMO'],
    rating: 4.8, reviewCount: 372
  },
  {
    id: 6, name: 'Vitamin C 1000mg', category: 'vitamins', price: 11.99, stock: 180,
    image: 'https://via.placeholder.com/150?text=Vitamin+C',
    description: 'High-potency antioxidant for immune defence and collagen production',
    ingredients: ['Ascorbic Acid 1000mg', 'Rose Hip Extract 50mg', 'Microcrystalline Cellulose'],
    tags: ['immunity', 'energy', 'general-wellness', 'vegan'],
    certifications: ['GMP Certified', 'Non-GMO', 'Vegan'],
    rating: 4.5, reviewCount: 312
  },
  {
    id: 7, name: 'Zinc + Copper Complex', category: 'minerals', price: 9.99, stock: 95,
    image: 'https://via.placeholder.com/150?text=Zinc+Copper',
    description: 'Supports immune function, skin health, and hormone balance',
    ingredients: ['Zinc Bisglycinate 15mg', 'Copper Gluconate 1mg', 'Vegetable Capsule'],
    tags: ['immunity', 'skin', 'general-wellness', 'vegan'],
    certifications: ['GMP Certified', 'Non-GMO'],
    rating: 4.4, reviewCount: 147
  },
  {
    id: 8, name: 'Ashwagandha 600mg (KSM-66)', category: 'herbs', price: 21.99, stock: 64,
    image: 'https://via.placeholder.com/150?text=Ashwagandha',
    description: 'Clinically studied adaptogen for stress relief, energy and focus',
    ingredients: ['Ashwagandha Root Extract KSM-66 600mg (2.5% Withanolides)', 'Organic Brown Rice Flour', 'Vegetable Capsule'],
    tags: ['stress', 'energy', 'sleep', 'vegan'],
    certifications: ['GMP Certified', 'NSF Certified', 'Non-GMO', 'Organic'],
    rating: 4.9, reviewCount: 508
  },
  {
    id: 9, name: 'Collagen Peptides 10g', category: 'supplements', price: 29.99, stock: 51,
    image: 'https://via.placeholder.com/150?text=Collagen',
    description: 'Hydrolysed bovine collagen for skin elasticity and joint support',
    ingredients: ['Hydrolysed Bovine Collagen Peptides 10g (Type I & III)', 'Vitamin C 50mg'],
    tags: ['skin', 'joints', 'general-wellness'],
    certifications: ['GMP Certified', 'NSF Certified'],
    rating: 4.6, reviewCount: 229
  },
  {
    id: 10, name: 'Vitamin B Complex', category: 'vitamins', price: 13.99, stock: 128,
    image: 'https://via.placeholder.com/150?text=B+Complex',
    description: 'Complete B vitamin blend for energy metabolism and nerve health',
    ingredients: ['Vitamin B1 (Thiamine) 25mg', 'Vitamin B2 (Riboflavin) 25mg', 'Vitamin B3 (Niacin) 50mg', 'Vitamin B5 25mg', 'Vitamin B6 25mg', 'Vitamin B7 (Biotin) 300mcg', 'Vitamin B9 (Folate) 400mcg', 'Vitamin B12 (Methylcobalamin) 500mcg'],
    tags: ['energy', 'brain', 'general-wellness', 'vegan'],
    certifications: ['GMP Certified', 'Non-GMO', 'Vegan'],
    rating: 4.5, reviewCount: 186
  }
];

let users = [
  {
    id: 1, firstName: 'Admin', lastName: 'User',
    email: 'admin@healthsupp.com',
    password: bcrypt.hashSync('Admin123!', 10),
    isAdmin: true
  },
  {
    id: 2, firstName: 'Demo', lastName: 'Customer',
    email: 'demo@customer.com',
    password: bcrypt.hashSync('Demo123!', 10),
    isAdmin: false
  }
];

let orders = [];
let nextUserId = 3;
let nextOrderId = 1;

// SSE clients for admin real-time feed
const sseClients = [];

function broadcastSSE(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try { client.write(msg); } catch (_) {}
  });
}

// ==================== QUIZ DATA ====================

const quizQuestions = [
  {
    id: 1, question: 'What is your primary health concern?',
    options: [
      { text: 'Energy & Fatigue', value: 'energy' },
      { text: 'Digestion & Gut Health', value: 'digestive' },
      { text: 'Heart & Brain Health', value: 'heart-health' },
      { text: 'Immunity & Wellness', value: 'immunity' }
    ]
  },
  {
    id: 2, question: 'What is your age group?',
    options: [
      { text: 'Under 30', value: 'young' },
      { text: '30-50', value: 'adult' },
      { text: '50-65', value: 'senior' },
      { text: '65+', value: 'elderly' }
    ]
  },
  {
    id: 3, question: 'Are you an athlete or exercise regularly?',
    options: [
      { text: 'Yes, regularly', value: 'athletes' },
      { text: 'Sometimes', value: 'moderate' },
      { text: 'Not really', value: 'sedentary' }
    ]
  },
  {
    id: 4, question: 'What best describes your diet?',
    options: [
      { text: 'Vegan / Plant-based', value: 'vegan' },
      { text: 'Vegetarian', value: 'vegetarian' },
      { text: 'Omnivore (eat everything)', value: 'omnivore' },
      { text: 'Keto / Low-carb', value: 'keto' }
    ]
  }
];

const tagReasons = {
  immunity: 'supports your immune system',
  energy: 'helps boost energy levels',
  digestive: 'promotes gut and digestive health',
  'heart-health': 'supports cardiovascular health',
  brain: 'enhances cognitive function',
  sleep: 'improves sleep quality',
  stress: 'helps manage stress and cortisol',
  muscles: 'supports muscle recovery',
  bones: 'strengthens bone density',
  skin: 'promotes skin health and elasticity',
  joints: 'supports joint comfort and flexibility',
  'general-wellness': 'supports overall daily wellness',
  vegan: 'is suitable for your plant-based diet',
  elderly: 'is recommended for your age group',
  seniors: 'is well-suited for your age group',
  athletes: 'is ideal for active individuals',
};

const ingredients = [
  {
    id: 1, name: 'Vitamin D3 (Cholecalciferol)', category: 'Vitamin',
    what_it_is: 'A fat-soluble vitamin produced naturally by the skin when exposed to sunlight. Supplement form is derived from lanolin (sheep wool) or lichen (vegan).',
    uses: 'Supports calcium absorption, bone density, immune function, and mood regulation. Widely recommended for people in low-sunlight regions.',
    dosage: 'Typical daily dose: 1,000-2,000 IU for maintenance. Up to 4,000 IU considered safe for most adults. Best taken with a fat-containing meal.',
    cautions: 'Excessive intake (above 10,000 IU/day long-term) can cause toxicity. Those with granulomatous disease or hypercalcaemia should consult a doctor first.'
  },
  {
    id: 2, name: 'Omega-3 Fatty Acids (EPA / DHA)', category: 'Essential Fat',
    what_it_is: 'Polyunsaturated fats found primarily in oily fish (salmon, mackerel, sardines) and algae. EPA and DHA are the active forms the body uses directly.',
    uses: 'Supports heart health, reduces triglycerides, supports brain and eye function, and has anti-inflammatory properties.',
    dosage: 'Typical dose: 1,000-3,000 mg combined EPA+DHA per day. Take with food to reduce fishy aftertaste.',
    cautions: 'May thin blood at high doses - check with a doctor if taking blood thinners. Fish-based supplements are not suitable for vegans; look for algae-based alternatives.'
  },
  {
    id: 3, name: 'Probiotics (Lactobacillus / Bifidobacterium)', category: 'Live Culture',
    what_it_is: 'Beneficial live bacteria and yeasts that naturally inhabit the gut. Common strains include Lactobacillus acidophilus and Bifidobacterium longum.',
    uses: 'Supports digestive health, helps restore gut flora after antibiotics, may reduce bloating, supports immune function and may improve mood via the gut-brain axis.',
    dosage: 'Typical dose: 1-50 billion CFU per day depending on the condition. For general gut health, 5-10 billion CFU is adequate.',
    cautions: 'Usually safe for healthy adults. People who are immunocompromised should consult a doctor before use. Some may experience temporary bloating when starting.'
  },
  {
    id: 4, name: 'Vitamin C (Ascorbic Acid)', category: 'Vitamin',
    what_it_is: 'A water-soluble antioxidant vitamin that the human body cannot produce on its own. Must be obtained through diet or supplementation.',
    uses: 'Supports immune function, collagen synthesis, wound healing, iron absorption, and acts as a powerful antioxidant protecting cells from oxidative stress.',
    dosage: 'Typical dose: 500-1,000 mg per day. Upper tolerable limit is 2,000 mg/day. Split doses are more effective at higher amounts.',
    cautions: 'High doses (above 2,000 mg/day) may cause digestive upset or diarrhoea. Those with kidney stones (oxalate type) or kidney disease should limit intake.'
  },
  {
    id: 5, name: 'Magnesium (Glycinate / Citrate)', category: 'Mineral',
    what_it_is: 'An essential mineral involved in over 300 enzymatic reactions. Magnesium glycinate and citrate are highly bioavailable forms. Found in nuts, seeds, leafy greens and legumes.',
    uses: 'Supports muscle relaxation, sleep quality, stress reduction, bone health, and blood sugar regulation. Commonly used for restless legs, muscle cramps and anxiety.',
    dosage: 'Typical dose: 200-400 mg elemental magnesium per day. Take in the evening for best sleep benefit. Glycinate form is gentlest on the stomach.',
    cautions: 'High doses (above 350 mg from supplements) may cause loose stools. People with kidney disease should consult a doctor as kidneys regulate magnesium excretion.'
  },
  {
    id: 6, name: 'Zinc', category: 'Mineral',
    what_it_is: 'An essential trace mineral found in meat, shellfish, legumes and seeds. The body does not store zinc so daily intake is important.',
    uses: 'Supports immune function, wound healing, testosterone production, sense of taste and smell, and skin health. Commonly taken during cold and flu season.',
    dosage: 'Typical dose: 8-15 mg per day (RDA). Therapeutic immune support: 15-30 mg. Best taken with food to reduce nausea.',
    cautions: 'Long-term high doses (above 40 mg/day) can deplete copper levels. Zinc can interact with antibiotics - space doses at least 2 hours apart.'
  },
  {
    id: 7, name: 'Ashwagandha (Withania somnifera)', category: 'Adaptogen Herb',
    what_it_is: 'An ancient Ayurvedic herb classified as an adaptogen - it helps the body adapt to stress. KSM-66 and Sensoril are the most clinically studied root extracts.',
    uses: 'Reduces cortisol levels, helps manage chronic stress and anxiety, supports energy, improves sleep quality, and may support thyroid and testosterone levels.',
    dosage: 'Typical dose: 300-600 mg of root extract per day. Can be taken morning or evening. KSM-66 and Sensoril are standardised extracts with clinical backing.',
    cautions: 'May interact with thyroid medications, immunosuppressants and sedatives. Avoid during pregnancy. Not suitable for autoimmune thyroid conditions without medical supervision.'
  },
  {
    id: 8, name: 'Collagen Peptides', category: 'Protein',
    what_it_is: 'Hydrolysed collagen from bovine (cow) or marine (fish) sources, broken down into small peptides for better absorption. Collagen is the most abundant structural protein in the body.',
    uses: 'Supports skin elasticity and hydration, joint comfort and cartilage health, bone density, and muscle mass. Popular for anti-ageing and sports recovery.',
    dosage: 'Typical dose: 5-15 g per day. Most studies show benefits at 10 g/day for skin and joints over 8-12 weeks. Dissolves easily in hot or cold liquids.',
    cautions: 'Derived from animal sources - not suitable for vegans or vegetarians. Those with fish or bovine allergies should choose their source carefully. Not a complete protein.'
  },
  {
    id: 9, name: 'Vitamin B Complex', category: 'Vitamin',
    what_it_is: 'A group of 8 water-soluble vitamins: B1, B2, B3, B5, B6, B7 (Biotin), B9 (Folate), and B12. Taken together as they work synergistically.',
    uses: 'Supports energy metabolism, nerve function, red blood cell production, mood, and cognitive health. Particularly important for vegans who may be deficient in B12.',
    dosage: 'Doses vary by vitamin. Most B complex supplements provide 100% or more of the RDA for each B vitamin. Take with food to reduce nausea.',
    cautions: 'High-dose B3 (niacin) can cause flushing. B6 above 100 mg/day long-term can cause nerve damage. Ensure folate is in methylfolate form for those with MTHFR gene variants.'
  },
  {
    id: 10, name: 'Iron (Ferrous Bisglycinate)', category: 'Mineral',
    what_it_is: 'An essential mineral critical for haemoglobin production and oxygen transport. Ferrous bisglycinate is a chelated form with better absorption and fewer side effects than ferrous sulphate.',
    uses: 'Treats and prevents iron deficiency anaemia. Supports energy levels, concentration, and immune function. Particularly important for women, pregnant individuals, and athletes.',
    dosage: 'Therapeutic dose for deficiency: 100-200 mg elemental iron per day (split). Take with vitamin C for best absorption. Do not take with calcium, tea, or coffee.',
    cautions: 'Do not supplement without confirmed deficiency (blood test) as excess iron is harmful. Can cause constipation, nausea, and dark stools. Keep away from children - iron overdose is dangerous.'
  }
];

// ==================== MIDDLEWARE ====================

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  });
}

// ==================== AUTH ====================

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return res.status(409).json({ error: 'An account with this email already exists' });

  const user = {
    id: nextUserId++, firstName, lastName,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    isAdmin: false
  };
  users.push(user);

  const token = jwt.sign(
    { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: false },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.status(201).json({ token, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: false });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign(
    { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin },
    JWT_SECRET, { expiresIn: '7d' }
  );
  res.json({ token, firstName: user.firstName, lastName: user.lastName, email: user.email, isAdmin: user.isAdmin });
});

app.get('/api/auth/me', authMiddleware, (req, res) => res.json(req.user));

// ==================== PRODUCTS ====================

app.get('/api/products', (req, res) => {
  res.json(products.map(({ stock, ...p }) => p));
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const { stock, ...pub } = product;
  res.json(pub);
});

app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = products
    .filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.ingredients.some(i => i.toLowerCase().includes(query))
    )
    .map(({ stock, ...p }) => p);
  res.json(results);
});

// ==================== QUIZ ====================

app.get('/api/quiz', (req, res) => res.json(quizQuestions));

app.post('/api/quiz/submit', (req, res) => {
  const { answers } = req.body;
  const tags = Object.values(answers).filter(Boolean);
  const recommendations = products
    .filter(p => p.tags.some(tag => tags.includes(tag)))
    .map(({ stock, ...p }) => {
      const matchedTags = p.tags.filter(tag => tags.includes(tag));
      const reasonParts = matchedTags.map(tag => tagReasons[tag]).filter(Boolean).slice(0, 2);
      const reason = reasonParts.length > 0
        ? `Recommended because it ${reasonParts.join(' and ')}.`
        : 'A great supplement for your overall wellness.';
      return { ...p, reason };
    })
    .slice(0, 5);
  res.json({
    recommendations,
    personalizedMessage: `Based on your profile, we recommend these supplements for ${answers[0] || 'general wellness'}.`
  });
});

app.get('/api/ingredients', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const results = query
    ? ingredients.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query) ||
        i.uses.toLowerCase().includes(query)
      )
    : ingredients;
  res.json(results);
});

// ==================== CHECKOUT ====================

app.post('/api/checkout', authMiddleware, (req, res) => {
  const { cartItems, customerInfo } = req.body;
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  cartItems.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });

  const order = {
    id: `ORD-${String(nextOrderId++).padStart(4, '0')}`,
    userId: req.user.id,
    customerName: `${req.user.firstName} ${req.user.lastName}`,
    customerEmail: req.user.email,
    shippingAddress: customerInfo,
    items: cartItems,
    total: parseFloat(total.toFixed(2)),
    status: 'pending',
    placedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString()
  };
  orders.unshift(order);
  broadcastSSE('new_order', order);

  res.json({
    orderId: order.id,
    status: 'success',
    total: order.total.toFixed(2),
    estimatedDelivery: order.estimatedDelivery,
    message: 'Order placed successfully!'
  });
});

app.get('/api/orders/my', authMiddleware, (req, res) => {
  res.json(orders.filter(o => o.userId === req.user.id));
});

// ==================== ADMIN ====================

// SSE cannot send Authorization headers — accept token via query param for this endpoint only
app.get('/api/admin/events', (req, res) => {
  const token = req.query.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  let user;
  try { user = jwt.verify(token, JWT_SECRET); } catch { return res.status(401).json({ error: 'Invalid token' }); }
  if (!user.isAdmin) return res.status(403).json({ error: 'Admin access required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected' })}\n\n`);
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx > -1) sseClients.splice(idx, 1);
  });
});

app.get('/api/admin/stats', adminMiddleware, (req, res) => {
  res.json({
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.reduce((s, o) => s + o.total, 0).toFixed(2),
    lowStockProducts: products.filter(p => p.stock <= 10).length
  });
});

app.get('/api/admin/products', adminMiddleware, (req, res) => res.json(products));

app.post('/api/admin/products', adminMiddleware, (req, res) => {
  const { name, category, price, stock, description, ingredients, tags } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price are required' });
  const newProduct = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name, category: category || 'supplements',
    price: parseFloat(price), stock: parseInt(stock) || 0,
    image: `https://via.placeholder.com/150?text=${encodeURIComponent(name)}`,
    description: description || '',
    ingredients: Array.isArray(ingredients)
      ? ingredients
      : (ingredients || '').split(',').map(s => s.trim()).filter(Boolean),
    tags: Array.isArray(tags)
      ? tags
      : (tags || '').split(',').map(s => s.trim()).filter(Boolean)
  };
  products.push(newProduct);
  broadcastSSE('product_added', newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/admin/products/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  broadcastSSE('product_updated', products[idx]);
  res.json(products[idx]);
});

app.delete('/api/admin/products/:id', adminMiddleware, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const [removed] = products.splice(idx, 1);
  broadcastSSE('product_deleted', { id: removed.id });
  res.json({ message: 'Product deleted' });
});

app.put('/api/admin/products/:id/stock', adminMiddleware, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.stock = Math.max(0, parseInt(req.body.stock));
  broadcastSSE('stock_updated', { id: product.id, name: product.name, stock: product.stock });
  res.json(product);
});

app.get('/api/admin/orders', adminMiddleware, (req, res) => res.json(orders));

app.put('/api/admin/orders/:id/status', adminMiddleware, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(req.body.status))
    return res.status(400).json({ error: 'Invalid status' });
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  broadcastSSE('order_updated', { id: order.id, status: order.status });
  res.json(order);
});

// ==================== HEALTH ====================

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ==================== SERVE REACT FRONTEND ====================

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`  Admin: admin@healthsupp.com / Admin123!`);
  console.log(`  Demo customer: demo@customer.com / Demo123!`);
});
