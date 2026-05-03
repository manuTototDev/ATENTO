const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MÁXIMA SEGURIDAD DESDE EL DÍA 1
// ==========================================

// 1. Helmet: Configura headers de seguridad HTTP automáticamente
app.use(helmet());

// 2. CORS: Restringe quién puede hacer peticiones a nuestra API
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Necesario para enviar cookies de sesión de forma segura
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body Parser
app.use(express.json({ limit: '10kb' })); // Limita tamaño del body para prevenir ataques DoS

// 4. Rate Limiting: Previene ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 min
  message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ==========================================
// RUTAS (Ejemplo)
// ==========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor Atento funcionando seguro.' });
});

app.listen(PORT, () => {
  console.log(`[Seguridad Activada] Servidor de Atento corriendo en puerto ${PORT}`);
});
