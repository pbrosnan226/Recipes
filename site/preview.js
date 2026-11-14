#!/usr/bin/env node
// Serves site/dist at http://localhost:8888 for a local look (run `npm run build` first).
const http = require("http");
const fs = require("fs");
const path = require("path");
const dist = path.join(__dirname, "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".txt": "text/plain" };
const port = Number(process.env.PORT) || 8888;
http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.join(dist, path.normalize(p));
    if (!file.startsWith(dist) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "X-Robots-Tag": "noindex" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Preview at http://localhost:${port}`));
