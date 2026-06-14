const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); 
const interviewRoutes = require('./routes/interviewRoutes');

const conversationRoutes = require('./routes/conversationRoutes');

const userRoutes = require('./routes/userRoutes');

dotenv.config();

const connectDB = require('./config/db');

const app = express();  


connectDB();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartLearning backend running' });
});


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/certificate', require('./routes/certificateRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));

app.use('/api/users', userRoutes);

app.use('/api/interview', interviewRoutes);


app.use('/uploads/interviews', express.static(path.join(__dirname, 'uploads/interviews')));


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}


app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, 'uploads/interviews')}`);
});



app.use('/api/conversation', conversationRoutes);

