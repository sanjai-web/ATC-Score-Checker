const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',   // frontend dev
        'http://localhost:5174',   // admin dev (Vite uses 5174 if 5173 is taken)
        'http://localhost:4173',   // vite preview
        /\.onrender\.com$/,        // any Render-hosted frontend
        /\.vercel\.app$/,          // Vercel deployments
        /\.netlify\.app$/,         // Netlify deployments
    ],
    credentials: true,
}));
app.use(express.json());

const analyzeRoutes = require('./routes/analyze');
app.use('/api', analyzeRoutes);

// PDF Proxy — fetches Cloudinary PDF server-side and serves it inline
// This bypasses browser CORS and Content-Type issues with Cloudinary raw/image URLs
app.get('/api/pdf-proxy', (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing url parameter');

    const parsedUrl = new URL(decodeURIComponent(url));
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    protocol.get(parsedUrl.toString(), (upstream) => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        // Forward content-length if available so browser shows progress
        if (upstream.headers['content-length']) {
            res.setHeader('Content-Length', upstream.headers['content-length']);
        }
        upstream.pipe(res);
    }).on('error', (err) => {
        console.error('PDF proxy error:', err.message);
        res.status(500).send('Failed to fetch PDF');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
