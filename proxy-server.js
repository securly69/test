const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint to forward requests to target URL
app.use('/proxy', (req, res, next) => {
    const targetUrl = req.query.url;
    if (targetUrl) {
        const proxy = createProxyMiddleware({
            target: targetUrl,
            changeOrigin: true,
            pathRewrite: {
                '^/proxy': '', // Rewrite /proxy to the actual target URL
            },
            onProxyRes: (proxyRes, req, res) => {
                // Handle CSS links
                if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/css')) {
                    let body = [];
                    proxyRes.on('data', (chunk) => {
                        body.push(chunk);
                    });

                    proxyRes.on('end', () => {
                        body = Buffer.concat(body).toString();
                        body = body.replace(/url\(([^)]+)\)/g, (match, url) => {
                            // Rewrite the URL to go through the proxy
                            if (!url.startsWith('http')) {
                                return match;
                            }
                            const newUrl = '/proxy?url=' + encodeURIComponent(url);
                            return `url(${newUrl})`;
                        });
                        res.set(proxyRes.headers);
                        res.status(proxyRes.statusCode).end(body);
                    });
                } else {
                    res.set(proxyRes.headers);
                    res.status(proxyRes.statusCode).end(proxyRes.body);
                }
            },
            onError: (err, req, res) => {
                console.error('Proxy error:', err);
                res.status(500).send('Proxy encountered an error.');
            },
            // Additional handling for WebSocket (YouTube)
            ws: true,
            changeOrigin: true,
        });

        // Forward the request to the proxy
        proxy(req, res, next);
    } else {
        res.status(400).send('URL is required');
    }
});

// Listen on a dynamic port assigned by Vercel
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
