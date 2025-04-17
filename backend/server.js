const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Debug biến môi trường
console.log('Environment Variables in server.js:', {
  PORT: process.env.PORT,
  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
  ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
  ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD,
  MONGODB_URI: process.env.MONGODB_URI
});

const app = express();

app.use(express.json());
app.use(cors());
app.use(require('./middlewares/errorHandler'));

// Kết nối MongoDB (tùy chọn)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Load routes sau khi dotenv config
const searchRoutes = require('./routes/search.routes');
app.use('/api', searchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));