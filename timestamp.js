'use strict';

/**
 * RFC 4648 Base64URL alphabet (no padding).
 * @type {string}
 */
const BASE64URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** @type {bigint} */
const MASK_48N = (1n << 48n) - 1n;

/**
 * Return the 48-bit UUIDv7-style timestamp field (milliseconds since Unix epoch).
 *
 * @returns {bigint} 48-bit integer: ms since 1970-01-01T00:00:00Z (masked to 48 bits)
 */
function generateTimestamp() {
  return BigInt(Date.now()) & MASK_48N;
}

/**
 * Encode a 48-bit integer into 8 Base64URL characters.
 *
 * @param {bigint} value48 48-bit unsigned integer
 * @returns {string} 8-character Base64URL string
 */
function encode48ToBase64Url(value48) {
  let v = value48 & MASK_48N;
  const out = new Array(8);
  for (let i = 0; i < 8; i++) {
    const shift = 42n - 6n * BigInt(i);
    const sextet = Number((v >> shift) & 0x3Fn);
    out[i] = BASE64URL_ALPHABET.charAt(sextet);
  }
  return out.join('');
}

/**
 * Generate a UUIDv7-style 48-bit timestamp and encode it as Base64URL.
 *
 * @returns {string} 8-character Base64URL timestamp
 */
function generateTimestamp48() {
  return encode48ToBase64Url(generateTimestamp());
}

module.exports = { generateTimestamp48 };
