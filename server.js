const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
require('./services/worker.js');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
const contactListRoutes = require('./routes/contactListRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/lists', contactListRoutes);
app.use('/api/campaigns', campaignRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
