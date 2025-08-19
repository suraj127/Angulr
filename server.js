const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// require('./services/worker.js');

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

app.use('/api/auth', authRoutes);
app.use('/api/lists', contactListRoutes);
app.use('/api/campaigns', campaignRoutes);

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend', 'build')));

  app.get('/*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
