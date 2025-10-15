require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT;

connectDB();

// Middleware
app.use(express.json());

// Route test
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.use('/api/auth', authRoutes);

app.all(/.*/, (req, res) => {
  throw new Error('Route not found');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});