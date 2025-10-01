const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDb = require('./config/db');
require("./cronJobs");

// Load environment variables
dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://cabs-kolc.onrender.com"], // allow local + deployed frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true, // if you use cookies
}));

app.use(express.json());

// Routes
const carRoutes = require('./controllers/cars');
const usersRoutes = require('./controllers/user');
const cartRoutes = require('./controllers/cart');
const hireRoutes = require("./controllers/hire");
const mpesaRoutes = require("./controllers/mpesa");

app.use("/api/cars", carRoutes);
app.use('/api/auth', usersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/hire', hireRoutes);
app.use("/api/mpesa", mpesaRoutes);

// ✅ Serve React frontend (client/dist)
const __dirname1 = path.resolve(); // get project root
app.use(express.static(path.join(__dirname1, "..", "client", "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname1, "..", "client", "dist", "index.html"));
});

// Start server after DB connection
const port = process.env.PORT || 4052;

const runServer = async () => {
  await connectDb();
  app.listen(port, () => {
    console.log(`🚀 App is running on port ${port}`);
  });
};

runServer();
