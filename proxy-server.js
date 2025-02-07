// proxy-server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3000;

// Serve static files from the "public" folder
app.use(express.static('public'));

// Set up proxy middleware (modify target as needed)
app.use('/proxy', createProxyMiddleware({
  target: 'https://example.com', // Change this to your desired target URL
  changeOrigin: true,
  pathRewrite: {
    '^/proxy': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying request: ${req.url}`);
  }
}));

app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
