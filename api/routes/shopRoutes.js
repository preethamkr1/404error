const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory "database" for MVP
// Shop: { id, name, location: [lat, lng], address, status, ownerEmail, password, upiId }
let shops = [];

// Register a shop
router.post('/register', (req, res) => {
  const { name, address, lat, lng, ownerEmail, password, upiId } = req.body;
  if (!name || !ownerEmail || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if exists
  const exists = shops.find(s => s.ownerEmail === ownerEmail);
  if (exists) return res.status(400).json({ error: 'Shop owner already registered' });

  const newShop = {
    id: `shop-${crypto.randomBytes(4).toString('hex')}`,
    name,
    address: address || '',
    location: [parseFloat(lat) || 17.4401, parseFloat(lng) || 78.3489], // Default if not provided
    status: 'closed', // Default
    ownerEmail,
    password, // Store as plaintext only for MVP!
    upiId: upiId || ''
  };

  shops.push(newShop);
  res.json({ 
    success: true, 
    shop: { 
      id: newShop.id, 
      name: newShop.name, 
      status: newShop.status,
      ownerEmail: newShop.ownerEmail,
      upiId: newShop.upiId
    } 
  });
});

// Shop Login
router.post('/login', (req, res) => {
  const { ownerEmail, password } = req.body;
  const shop = shops.find(s => s.ownerEmail === ownerEmail && s.password === password);
  
  if (!shop) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // MVP: just return the shop info to act as session
  res.json({ 
    success: true, 
    shop: { 
      id: shop.id, 
      name: shop.name, 
      status: shop.status, 
      ownerEmail: shop.ownerEmail,
      upiId: shop.upiId
    } 
  });
});

// Change Status
router.post('/:shopId/status', (req, res) => {
  const { shopId } = req.params;
  const { status } = req.body; // 'free', 'moderate', 'busy', 'closed'

  if (!['free', 'moderate', 'busy', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const shopIndex = shops.findIndex(s => s.id === shopId);
  if (shopIndex === -1) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  shops[shopIndex].status = status;
  res.json({ success: true, status });
});

// Get Nearby Shops
router.get('/nearby', (req, res) => {
  const { lat, lng, radius } = req.query;
  
  // For MVP, just return all shops. In a real app we'd calculate Haversine distance
  // Or if we strictly want radius filtering:
  const targetLat = parseFloat(lat);
  const targetLng = parseFloat(lng);
  
  let nearbyShops = shops.map(s => ({
    id: s.id,
    name: s.name,
    address: s.address,
    location: s.location,
    status: s.status,
    upiId: s.upiId
  }));

  // if lat and lng provided, we could sort by distance (simple euclidean for MVP)
  if (!isNaN(targetLat) && !isNaN(targetLng)) {
    nearbyShops.sort((a, b) => {
      const distA = Math.pow(a.location[0] - targetLat, 2) + Math.pow(a.location[1] - targetLng, 2);
      const distB = Math.pow(b.location[0] - targetLat, 2) + Math.pow(b.location[1] - targetLng, 2);
      return distA - distB;
    });
  }

  res.json({ shops: nearbyShops });
});

router.getShop = (id) => shops.find(s => s.id === id);

module.exports = router;
 