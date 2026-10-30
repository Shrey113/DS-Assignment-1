import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import bloodBankRoutes from './routes/bloodbank.routes.js';
import allDsRoutes from './routes/all_ds_rout.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/blood-banks', bloodBankRoutes);
app.use('/api/ds', allDsRoutes);

app.use((err, req, res, next) => {
  console.error('[Server Error Handler]', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Database error occurred'
  });
});

export default app;
