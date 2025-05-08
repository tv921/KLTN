const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/search.routes');
const documentRoutes = require('./routes/document.routes');
require('dotenv').config();

const app = express();

// Cấu hình CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', searchRoutes);
app.use('/api', documentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));