#!/usr/bin/env node
/**
 * Mã hóa TMDB API key để dán vào js/config.js (TMDB_API_KEY_ENCODED).
 * Usage: node scripts/encode-key.js "your_api_key"
 */

const SALT = "CineHub_tmdb_v1";

function encode(plain) {
  const xored = [...plain]
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
    )
    .join("");
  return Buffer.from(xored, "binary").toString("base64");
}

const key = process.argv[2];
if (!key) {
  console.error('Usage: node scripts/encode-key.js "your_tmdb_api_key"');
  process.exit(1);
}

console.log(encode(key));
