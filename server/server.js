import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { initialMenu } from '../src/data/initialMenu.js';
import * as db from './db.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// HTTP Server & WebSocket Server integration
const server = createServer(app);
const wss = new WebSocketServer({ server });

// WebSocket connection handling
let clients = [];
wss.on('connection', (ws) => {
  clients.push(ws);
  
  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

// Helper to broadcast messages to all connected clients
const broadcast = (type, payload) => {
  const message = JSON.stringify({ type, payload });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// --- API ENDPOINTS ---

// 1. Menu APIs
app.get('/api/menu', async (req, res, next) => {
  try {
    const rows = await db.query('SELECT * FROM menu');
    res.json(rows.map(db.mapMenuItem));
  } catch (err) {
    next(err);
  }
});

app.post('/api/menu', async (req, res, next) => {
  try {
    const item = req.body;
    await db.run(`
      INSERT INTO menu (
        id, name, description, price, originalPrice, discountText, 
        category, isVeg, spicyLevel, rating, isBestSeller, isAvailable, 
        icon, image, customization
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      item.id,
      item.name,
      item.description,
      item.price,
      item.originalPrice || null,
      item.discountText || null,
      item.category,
      item.isVeg ? 1 : 0,
      item.spicyLevel || 0,
      item.rating || 4.5,
      item.isBestSeller ? 1 : 0,
      item.isAvailable ? 1 : 0,
      item.icon || null,
      item.image || null,
      item.customization ? 1 : 0
    ]);
    const updatedMenu = await db.query('SELECT * FROM menu');
    broadcast('menu_updated', updatedMenu.map(db.mapMenuItem));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

app.put('/api/menu/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = req.body;
    await db.run(`
      UPDATE menu SET 
        name = ?, description = ?, price = ?, originalPrice = ?, discountText = ?, 
        category = ?, isVeg = ?, spicyLevel = ?, rating = ?, isBestSeller = ?, 
        isAvailable = ?, icon = ?, image = ?, customization = ?
      WHERE id = ?
    `, [
      item.name,
      item.description,
      item.price,
      item.originalPrice || null,
      item.discountText || null,
      item.category,
      item.isVeg ? 1 : 0,
      item.spicyLevel || 0,
      item.rating || 4.5,
      item.isBestSeller ? 1 : 0,
      item.isAvailable ? 1 : 0,
      item.icon || null,
      item.image || null,
      item.customization ? 1 : 0,
      id
    ]);
    const updatedMenu = await db.query('SELECT * FROM menu');
    broadcast('menu_updated', updatedMenu.map(db.mapMenuItem));
    res.json(item);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/menu/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM menu WHERE id = ?', [id]);
    const updatedMenu = await db.query('SELECT * FROM menu');
    broadcast('menu_updated', updatedMenu.map(db.mapMenuItem));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post('/api/menu/reset', async (req, res, next) => {
  try {
    await db.run('DELETE FROM menu');
    for (const item of initialMenu) {
      await db.run(`
        INSERT INTO menu (
          id, name, description, price, originalPrice, discountText, 
          category, isVeg, spicyLevel, rating, isBestSeller, isAvailable, 
          icon, image, customization
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id,
        item.name,
        item.description,
        item.price,
        item.originalPrice || null,
        item.discountText || null,
        item.category,
        item.isVeg ? 1 : 0,
        item.spicyLevel || 0,
        item.rating || 4.5,
        item.isBestSeller ? 1 : 0,
        item.isAvailable ? 1 : 0,
        item.icon || null,
        item.image || null,
        item.customization ? 1 : 0
      ]);
    }
    const updatedMenu = await db.query('SELECT * FROM menu');
    broadcast('menu_updated', updatedMenu.map(db.mapMenuItem));
    res.json(updatedMenu.map(db.mapMenuItem));
  } catch (err) {
    next(err);
  }
});

// 2. Orders APIs
app.get('/api/orders', async (req, res, next) => {
  try {
    const rows = await db.query('SELECT * FROM orders ORDER BY timestamp DESC');
    res.json(rows.map(db.mapOrder));
  } catch (err) {
    next(err);
  }
});

app.post('/api/orders', async (req, res, next) => {
  try {
    const o = req.body;
    await db.run(`
      INSERT INTO orders (
        id, customerName, customerPhone, type, address, outlet, items, 
        subtotal, packagingFee, gst, deliveryCharges, total, 
        paymentMethod, paymentStatus, status, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      o.id,
      o.customerName,
      o.customerPhone,
      o.type,
      o.address,
      o.outlet,
      JSON.stringify(o.items),
      o.subtotal,
      o.packagingFee,
      o.gst,
      o.deliveryCharges,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.timestamp
    ]);
    const updatedOrders = await db.query('SELECT * FROM orders ORDER BY timestamp DESC');
    broadcast('orders_updated', updatedOrders.map(db.mapOrder));
    res.status(201).json(o);
  } catch (err) {
    next(err);
  }
});

app.put('/api/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const currentOrder = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedStatus = status !== undefined ? status : currentOrder.status;
    const updatedPaymentStatus = paymentStatus !== undefined ? paymentStatus : currentOrder.paymentStatus;

    await db.run('UPDATE orders SET status = ?, paymentStatus = ? WHERE id = ?', [
      updatedStatus,
      updatedPaymentStatus,
      id
    ]);

    const updatedOrders = await db.query('SELECT * FROM orders ORDER BY timestamp DESC');
    broadcast('orders_updated', updatedOrders.map(db.mapOrder));
    
    const responseOrder = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(db.mapOrder(responseOrder));
  } catch (err) {
    next(err);
  }
});

app.delete('/api/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM orders WHERE id = ?', [id]);
    const updatedOrders = await db.query('SELECT * FROM orders ORDER BY timestamp DESC');
    broadcast('orders_updated', updatedOrders.map(db.mapOrder));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// 3. Outlets APIs
app.get('/api/outlets', async (req, res, next) => {
  try {
    const rows = await db.query('SELECT * FROM outlets');
    const outletsMap = {};
    rows.forEach(r => {
      outletsMap[r.name] = r.status;
    });
    res.json(outletsMap);
  } catch (err) {
    next(err);
  }
});

app.put('/api/outlets/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { status } = req.body;
    await db.run('UPDATE outlets SET status = ? WHERE name = ?', [status, name]);
    
    const rows = await db.query('SELECT * FROM outlets');
    const outletsMap = {};
    rows.forEach(r => {
      outletsMap[r.name] = r.status;
    });
    broadcast('outlets_updated', outletsMap);
    res.json({ name, status });
  } catch (err) {
    next(err);
  }
});

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
