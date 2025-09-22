const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoute');
const userDetailsRoutes = require('./routes/userDetailsRoute');
const exercisePlanRoutes = require('./routes/exercisePlanRoutes');
const exerciseTrackingRoutes = require('./routes/exerciseTrackingRoutes');
const dayTrackerRoutes = require('./routes/dayTrackerRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use("/api/userdetails", userDetailsRoutes);
app.use('/api/exercise-plans', exercisePlanRoutes);
app.use('/api/exercise-tracking', exerciseTrackingRoutes);
app.use('/api/day-trackers', dayTrackerRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});