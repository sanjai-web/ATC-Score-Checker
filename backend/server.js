const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4173',
        /\.onrender\.com$/,
        /\.vercel\.app$/,
        /\.netlify\.app$/,
    ],
    credentials: true,
}));
app.use(express.json());

const analyzeRoutes = require('./routes/analyze');
app.use('/api', analyzeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
