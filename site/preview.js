#!/usr/bin/env node
// Serves site/dist at http://localhost:8888 for a local look (run `npm run build` first).
const http = require("http");
const fs = require("fs");
const path = require("path");
const dist = path.join(__dirname, "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".txt": "text/plain", ".woff2": "font/woff2" };
const port = Number(process.env.PORT) || 8888;
http
  .createServer((req, res) => {
    // EMULATION of netlify.toml's [[redirects]] /recipes/:slug -> /recipe?name=:slug (301). A placeholder = one whole path segment.
    // Not Netlify itself (it can't run locally); keep in step with netlify.toml.
    // Like Netlify without force, a real file at the path wins (only the old notes build, `build:notes`, has recipes/*.html).
    let p;
    let name = null;
    const old = /^\/recipes\/([^/]+)$/.exec(new URL(req.url, "http://x").pathname);
    try {
      p = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (old) name = decodeURIComponent(old[1]);
    } catch (e) {
      res.writeHead(400).end("Bad request"); // malformed %-escape
      return;
    }
    if (old && !fs.existsSync(path.join(dist, "recipes", name))) {
      res.writeHead(301, { Location: "/recipe?name=" + old[1] }).end();
      return;
    }
    if (p.endsWith("/")) p += "index.html";
    else if (!path.extname(p)) p += ".html"; // like Netlify: /recipe -> recipe.html
    const file = path.join(dist, path.normalize(p));
    if (!file.startsWith(dist) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "X-Robots-Tag": "noindex" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Preview at http://localhost:${port}`));
