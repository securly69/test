const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
let activeUsers = 0;
const MAX_USERS = 2;

app.use(express.static('public'));

app.use('/proxy', (req, res, next) => {
    if (activeUsers >= MAX_USERS) {
        return res.status(503).send('Server is at full capacity. Try again later.');
    }
    activeUsers++;
    res.on('close', () => {
        activeUsers--;
    });
    next();
});

app.use('/proxy', createProxyMiddleware({
    target: req => req.query.url,
    changeOrigin: true,
    pathRewrite: { '^/proxy': '' },
    onError: (err, req, res) => {
        res.status(500).send('Error connecting to target.');
    }
}));

app.listen(PORT, () => {
    console.log(`MadEgg Proxy running at http://localhost:${PORT}`);
});
