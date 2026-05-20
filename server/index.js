import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import './config/loadEnv.js';
import { validateEnv } from './config/validateEnv.js';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { checkDatabaseConnection } from './db/checkConnection.js';

validateEnv();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// التعديل هنا: إعداد الـ CORS الديناميكي الجديد
app.use(
  cors({
    origin: (origin, callback) => {
      // السماح بالطلبات بدون origin (زي الـ Postman أو أدوات الاختبار)
      // أو الطلبات القادمة من localhost أو أي دومين ينتهي بـ .vercel.app
      if (!origin || origin.startsWith('http://localhost') || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  const db = await checkDatabaseConnection();
  if (!db.ok) {
    return res.status(503).json({
      status: 'degraded',
      message: 'API is running but the database is not ready',
      database: db.message,
      hint: 'Run: cd server && npm run db:init',
    });
  }
  res.json({ status: 'ok', message: 'TaskFlow API is running', database: 'connected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`TaskFlow server running on http://localhost:${PORT}`);
  const db = await checkDatabaseConnection();
  if (!db.ok) {
    console.error('\n⚠ Database not ready:', db.message);
    console.error('  Fix: cd server && npm run db:init\n');
  }
});