const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(
  "/proxy",
  createProxyMiddleware({
    target: "https://google.com", // Default target (won't be used)
    router: (req) => {
      const targetUrl = req.query.url; // Example: /proxy?url=https://example.com
      return targetUrl || "https://google.com"; // Fallback target
    },
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyRes: (proxyRes, req, res) => {
      let body = [];
      proxyRes.on("data", (chunk) => {
        body.push(chunk);
      });

      proxyRes.on("end", () => {
        body = Buffer.concat(body);
        res.set(proxyRes.headers);
        res.status(proxyRes.statusCode).end(body);
      });
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err);
      res.status(500).send("Proxy encountered an error.");
    },
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
