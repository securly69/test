const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { JSDOM } = require('jsdom');

const app = express();
const PORT = process.env.PORT || 3000;
let activeUsers = 0;
const MAX_USERS = 2;

app.use(express.static('public')); // Serve static files

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

// Proxy middleware with HTML Rewriting
app.use('/proxy', createProxyMiddleware({
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes: async (proxyRes, req, res) => {
        let body = '';
        proxyRes.on('data', chunk => { body += chunk; });
        proxyRes.on('end', () => {
            try {
                const targetUrl = new URL(req.query.url);
                if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                    // Rewrite links in HTML
                    const dom = new JSDOM(body);
                    const document = dom.window.document;

                    // Update <a> hrefs to use proxy
                    document.querySelectorAll('a').forEach(anchor => {
                        if (anchor.href.startsWith(targetUrl.origin)) {
                            const relativePath = anchor.href.replace(targetUrl.origin, '');
                            anchor.href = `/proxy?url=${encodeURIComponent(targetUrl.origin + relativePath)}`;
                        }
                    });

                    // Update <form> actions to use proxy (for searches)
                    document.querySelectorAll('form').forEach(form => {
                        if (form.action.startsWith(targetUrl.origin)) {
                            const relativePath = form.action.replace(targetUrl.origin, '');
                            form.action = `/proxy?url=${encodeURIComponent(targetUrl.origin + relativePath)}`;
                        }
                    });

                    res.setHeader('Content-Type', 'text/html');
                    return res.send(dom.serialize());
                }
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                res.end(body);
            } catch (error) {
                console.error('Error processing response:', error);
                res.status(500).send('Error processing proxy response.');
            }
        });
    },
    router: req => req.query.url,
    pathRewrite: { '^/proxy': '' },
}));

// Handle external links correctly (redirect to actual website)
app.get('/open', (req, res) => {
    if (req.query.url) {
        res.redirect(req.query.url);
    } else {
        res.status(400).send('Missing URL parameter');
    }
});

app.listen(PORT, () => {
    console.log(`MadEgg Proxy running at http://localhost:${PORT}`);
});
