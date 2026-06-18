import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import apiRouter from './routes/api.js';
import { startDemoCleanupJob } from './services/demoCleanup.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── MIDDLEWARES ───
// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP temporarily if loading external assets like unsplash / vimeo, or configure properly
}));

app.use(cors({
  origin: CLIENT_URL,
  credentials: true // Crucial for signed HTTP cookies delivery
}));
app.use(express.json({ limit: '10mb' })); // Increased limit to support base64 screenshot uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── HEALTH CHECK ───
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Instituto Peruano de Compliance Web Backend', date: new Date() });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── API ROUTER BINDINGS ───
app.use('/api', apiRouter);

// ─── STATIC FILE SERVING FOR PRODUCTION ───
const NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ─── SERVER INITIALIZATION ───
app.listen(PORT, () => {
  const isDemo = process.env.DEMO_MODE !== 'false';
  console.log(`====================================================`);
  console.log(`🟢 Instituto Peruano de Compliance Web Backend running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${CLIENT_URL}`);
  console.log(`🔌 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🚀 MODO: ${isDemo ? 'DEMO (Límites activos)' : 'PRODUCCIÓN'}`);
  console.log(`====================================================`);
  
  if (!process.env.JWT_SECRET) {
    console.warn(`[WARNING] JWT_SECRET no está configurado en el archivo .env! Usando clave de desarrollo por defecto.`);
  }

  if (isDemo) {
    startDemoCleanupJob();
  }
});
