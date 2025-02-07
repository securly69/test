const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
let activeUsers = 0;
const MAX_USERS = 2;

app.use(express.static('public'));

// Middleware to enforce user limit
app.use('/proxy', (req, res, next) => {
    if (!req.query.url) {
        return res.status(400).send('Missing target URL.');
    }
    if (activeUsers >= MAX_USERS) {
        return res.status(503).send('Server is at full capacity. Try again later.');
    }
    activeUsers++;
    res.on('close', () => {
        activeUsers--;
    });
    next();
});

// Proxy middleware
app.use('/proxy', createProxyMiddleware({
    target: '', // Dynamic target
    changeOrigin: true,
    router: req => req.query.url, // Use the requested URL dynamically
    pathRewrite: { '^/proxy': '' },
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).send('Error connecting to target.');
    }
}));

app.listen(PORT, () => {
    console.log(`MadEgg Proxy running at http://localhost:${PORT}`);
});
