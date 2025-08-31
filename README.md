# 48-bit Timestamp Generator (UUIDv7-style)

## Task

- Build the fastest, correct, and well-engineered **48-bit timestamp** generator (UUIDv7-style timestamp field)  
- Encode generated timestamp in Base64URL format, so we will get 8 characters timestamp containing 48-bit timestamp  
- Focus on performance and maintainability  

---

## Overview

This project provides a **minimal Node.js v22 implementation** of a 48-bit UUIDv7-style timestamp generator:

- **48-bit field**: milliseconds since Unix epoch, masked to 48 bits  
- **Base64URL encoding**: custom implementation, no `Buffer.toString('base64')`, alphabet `A–Z a–z 0–9 - _`  
- **Output**: always exactly **8 characters**  
- **Performance**: optimized bit extraction, benchmark test ensures >50k generations per 10s  
- **Maintainability**: small, self-contained codebase with unit tests  

---

## Features

- Deterministic encoding of timestamps to Base64URL  
- Edge case coverage: epoch (`AAAAAAAA`), max 48-bit value (`________`)  
- Native test harness without external dependencies  
- Performance test with live output of number of generations in 10s  

---

## Setup & Requirements

- **Node.js**: v22.x  
- **npm**: v10.x (bundled with Node v22)  
- **Dependencies**: none  

---

## Usage

Generate a timestamp:

```js
const { generateTimestamp48 } = require('./timestamp.js');

console.log(generateTimestamp48()); 
// Example: "AfP6yM2Z"
