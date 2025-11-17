#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const rootDir = __dirname;
const inputFile = path.join(rootDir, "script.js");
const distDir = path.join(rootDir, "dist");
const minifiedFile = path.join(distDir, "leave-balance-calculator.min.js");
const bookmarkletFile = path.join(
  distDir,
  "leave-balance-calculator.bookmarklet.txt"
);

async function build() {
  const source = fs.readFileSync(inputFile, "utf8");

  const result = await esbuild.transform(source, {
    loader: "js",
    target: "es2019",
    minify: true,
  });

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(minifiedFile, result.code, "utf8");

  const bookmarklet = `javascript:(()=>{${result.code}})();`;
  fs.writeFileSync(bookmarkletFile, bookmarklet, "utf8");

  console.log("Minified script written to", path.relative(rootDir, minifiedFile));
  console.log(
    "Bookmarklet written to",
    path.relative(rootDir, bookmarkletFile)
  );
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
