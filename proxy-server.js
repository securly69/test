const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Serve static files from the public directory (index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint to dynamically forward requests
app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    // Create a new proxy middleware dynamically
    const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        onError: (err, req, res) => {
            console.error('Proxy error:', err);
            res.status(500).send('Proxy encountered an error.');
        }
    });

    proxy(req, res, next);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
