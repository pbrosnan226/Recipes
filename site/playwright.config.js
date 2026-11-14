const { defineConfig, devices } = require("@playwright/test");
// Tests run on iPhone 17 only (WebKit). The fixture site (port 8899) is built from controlled notes in a temp folder;
// the real site (port 8888) is the vault's own build, served by `npm run preview` after `npm run build`.
module.exports = defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.js/,
  workers: 1,
  projects: [{ name: "iPhone 17", use: { ...devices["iPhone 17"] } }],
  webServer: [
    { command: "node tests/support/fixture-server.js", url: "http://localhost:8899/index.html", reuseExistingServer: true, timeout: 60000 },
    { command: "npm run build && npm run preview", url: "http://localhost:8888/index.html", reuseExistingServer: true, timeout: 120000 },
  ],
});
