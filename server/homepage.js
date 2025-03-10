const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();     

connectDB();

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
 
