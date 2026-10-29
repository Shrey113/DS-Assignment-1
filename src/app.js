import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import gujaratRoutes from './routes/gujarat.routes.js';
import requestRoutes from './routes/request.routes.js';
import bloodBankRoutes from './routes/bloodbank.routes.js';
import allDsRoutes from './core/data_structures/all_ds_rout.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server logger
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.originalUrl}`);
  next();
});

// routes
app.use('/api/gujarat', gujaratRoutes);
app.use('/api/donors', gujaratRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/blood-banks', bloodBankRoutes);
app.use('/api/ds', allDsRoutes);

// other endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'BloodLink Backend' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Database error occurred'
  });
});

export default app;
