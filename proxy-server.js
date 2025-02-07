const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const url = require("url");
const mime = require("mime");
const { URL } = require("url");

const MAX_USERS = 2;
let activeUsers = 0;

function checkUserLimit(req, res) {
  if (activeUsers >= MAX_USERS) {
    res.statusCode = 503;
    res.end("Server is at full capacity. Please try again later.");
    return false;
  }
  return true;
}

const proxyServer = http.createServer((req, res) => {
  if (!checkUserLimit(req, res)) return;

  const parsedUrl = url.parse(req.url, true);
  const targetUrl = parsedUrl.query.url;
  const targetHost = new URL(targetUrl).host;

  activeUsers++;

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (parsedUrl.pathname.startsWith("/proxy")) {
    if (targetUrl) {
      const protocol = targetUrl.startsWith("https") ? https : http;
      protocol.get(targetUrl, (targetRes) => {
        // Handle response types to prevent issues with MIME types
        res.statusCode = targetRes.statusCode;

        // Set the Content-Type from the target response headers, or set a default
        const contentType = targetRes.headers["content-type"] || "text/html";
        res.setHeader("Content-Type", contentType);

        // Proxy the target response body
        targetRes.pipe(res);

        targetRes.on("end", () => {
          activeUsers--;
        });
      }).on("error", (e) => {
        res.statusCode = 500;
        res.end("Error retrieving the page");
        activeUsers--;
      });
    } else {
      res.statusCode = 400;
      res.end("Missing target URL parameter");
    }
  } else {
    res.statusCode = 404;
    res.end("Not found");
    activeUsers--;
  }
});

proxyServer.listen(8080, () => {
  console.log("Proxy server is listening on port 8080");
});
