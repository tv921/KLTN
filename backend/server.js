const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/search.routes');
const documentRoutes = require('./routes/document.routes');
const path = require('path');
require('dotenv').config();

const app = express();

// Cấu hình CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/api', searchRoutes);
app.use('/api', documentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));