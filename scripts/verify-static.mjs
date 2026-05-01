import { existsSync, readFileSync } from "node:fs";

const required = [
  "index.html",
  "writing/index.html",
  "writing/styles.css",
  "assets/demo-DAIWMtZW.js",
  "assets/theme-B7qELJBH.js",
  "assets/theme-F4O1NOfc.css",
  "assets/demo-8tO82GB9.css",
  "assets/favicon-BEOn3xRR.svg",
  "og-image.png",
];

for (const file of required) {
  if (!existsSync(file)) {
    throw new Error(`Missing required static asset: ${file}`);
  }
}

const home = readFileSync("index.html", "utf8");
const post = readFileSync("writing/index.html", "utf8");

if (!home.includes('href="/writing/"')) {
  throw new Error("Home page is missing the Writing link.");
}

if (!post.includes("Parallel Sessions, Shared Substrate")) {
  throw new Error("Writing page is missing the post title.");
}

console.log("Static verification passed.");
