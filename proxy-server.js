const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for external websites (e.g., YouTube)
app.use('/proxy', (req, res, next) => {
    let targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send('Error: No URL provided. Use /proxy?url=<website>');
    }

    // Ensure the URL includes "http://" or "https://"
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
    }

    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ws: true,  // WebSockets support (important for dynamic sites)
        onProxyReq: (proxyReq, req) => {
            proxyReq.setHeader('Referer', targetUrl);
            proxyReq.setHeader('Origin', targetUrl);
        },
        onError: (err, req, res) => {
            console.error("Proxy Error:", err);
            res.status(500).send("Proxy encountered an error.");
        }
    })(req, res, next);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running at http://localhost:${PORT}`);
});
