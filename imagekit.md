```md
# Image Optimization Context — ImageKit.io (JavaScript SDK)
## Antigravity AI Code Editor Context File

---

## Purpose

This document provides **technical context** for implementing an **Image Optimization System** inside the **Antigravity AI Code Editor** using the **ImageKit JavaScript SDK**.

The goal is to enable AI-assisted development workflows where images and videos are:

- Automatically optimized
- Responsively delivered
- Dynamically transformed
- Securely uploaded
- Performance optimized without manual compression

This context should be used by AI agents, automation modules, and developer tooling inside Antigravity.

---

## Core Concept

ImageKit transforms media **on demand using URL-based transformations** instead of storing multiple resized versions.

**Philosophy:**

```

Upload once → Transform dynamically → Deliver optimized media everywhere

```

No offline compression pipeline required.

---

## System Architecture

```

Client (Browser / App)
↓
Antigravity Backend (Signature Generator)
↓
ImageKit Storage + CDN
↓
Dynamic Transformations via URL
↓
Optimized Delivery to End User

```

---

## SDK Overview

**Package**

```

@imagekit/javascript

````

**Installation**

```bash
npm install @imagekit/javascript
````

**Import**

```javascript
import {
  buildSrc,
  buildTransformationString,
  upload,
  getResponsiveImageAttributes
} from "@imagekit/javascript";
```

---

## Key Capabilities

### 1. URL Generation

Generate optimized image URLs dynamically.

```javascript
buildSrc({
  urlEndpoint: "https://ik.imagekit.io/your_id",
  src: "/photo.jpg",
  transformation: [
    { width: 800 },
    { quality: 80 },
    { format: "auto" }
  ]
});
```

Result:

```
https://ik.imagekit.io/your_id/photo.jpg?tr=w-800,q-80,f-auto
```

---

### 2. Responsive Images (Recommended)

Automatically generate responsive `src`, `srcSet`, and `sizes`.

```javascript
const image = getResponsiveImageAttributes({
  urlEndpoint: "https://ik.imagekit.io/demo",
  src: "sample.jpg",
  width: 400,
  sizes: "(min-width:800px) 33vw, 100vw"
});
```

Benefits:

* Device-aware delivery
* Reduced bandwidth
* Faster page load
* Retina display optimization

---

### 3. Transformations

Transformations are chained sequentially.

```javascript
transformation: [
  { width: 400, height: 300 },
  { crop: "at_max" },
  { rotation: 90 }
]
```

Common optimization parameters:

| Feature             | Parameter     |
| ------------------- | ------------- |
| Resize              | width, height |
| Compression         | quality       |
| Format conversion   | format        |
| DPR scaling         | dpr           |
| Blur                | blur          |
| Sharpen             | sharpen       |
| Crop                | crop          |
| Progressive loading | progressive   |

---

### 4. AI Transformations

ImageKit supports AI-powered processing.

```javascript
buildSrc({
  urlEndpoint,
  src: "/product.jpg",
  transformation: [
    { aiRemoveBackground: true },
    { aiUpscale: true },
    { aiDropShadow: true }
  ]
});
```

Use cases:

* Product images
* Portrait enhancement
* Auto cleanup
* Background removal

---

### 5. Overlay System

Add dynamic layers without editing images.

#### Image Overlay

```javascript
{
  overlay: {
    type: "image",
    input: "logo.png",
    transformation: [{ width: 100 }]
  }
}
```

#### Text Overlay

```javascript
{
  overlay: {
    type: "text",
    text: "Antigravity",
    transformation: [{ fontSize: 24 }]
  }
}
```

Supported overlay types:

* text
* image
* video
* subtitle
* solidColor

---

### 6. Arithmetic Transformations

Dynamic calculations supported.

```javascript
{ width: "iw_div_2" }
```

Example meaning:

```
width = original image width / 2
```

---

## Upload Workflow (Secure)

Uploads require server-generated authentication.

### Client Upload

```javascript
upload({
  file,
  fileName: file.name,
  token,
  signature,
  expire,
  publicKey
});
```

### Backend Signature Generation (Node.js)

```javascript
import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

const authParams = imagekit.helper.getAuthenticationParameters();
```

**Security Rule**

* Private API key MUST remain server-side.
* Never expose private keys in frontend code.

---

## Optimization Presets (Recommended)

### Photography Website (Large Originals)

```javascript
transformation: [
  { width: "iw_div_2" },
  { quality: 85 },
  { format: "auto" },
  { progressive: true }
]
```

---

### Thumbnail Preset

```javascript
[
  { width: 300 },
  { height: 300 },
  { crop: "at_max" },
  { quality: 80 }
]
```

---

### Fullscreen Hero Image

```javascript
[
  { width: 1920 },
  { quality: 90 },
  { format: "auto" }
]
```

---

## Responsive Delivery Logic

ImageKit determines optimal images using:

* Device width
* DPR (device pixel ratio)
* Breakpoints
* `sizes` attribute parsing

Strategies:

| Input          | Strategy                   |
| -------------- | -------------------------- |
| width only     | DPR-based                  |
| sizes provided | Width-based                |
| none           | Full breakpoint generation |

---

## Error Handling

Upload errors exposed as structured classes:

* `ImageKitInvalidRequestError`
* `ImageKitAbortError`
* `ImageKitUploadNetworkError`
* `ImageKitServerError`

Allows intelligent retry handling in Antigravity.

---

## Best Practices for Antigravity Integration

* Always use `format: "auto"`
* Prefer responsive images over fixed dimensions
* Enable lazy loading
* Avoid storing multiple image sizes
* Cache aggressively via CDN
* Generate URLs dynamically instead of hardcoding

---

## Performance Model

Traditional:

```
Edit → Compress → Export sizes → Upload multiple files
```

ImageKit Model:

```
Upload original → Transform via URL → CDN cache → Instant delivery
```

---

## Intended Usage Inside Antigravity AI Editor

AI agents should:

* Generate optimized URLs automatically
* Suggest transformations based on layout
* Auto-create responsive image attributes
* Enforce secure upload patterns
* Recommend performance presets
* Avoid manual compression workflows

---

## Summary

ImageKit converts image optimization from a **manual asset pipeline** into a **dynamic rendering system**.

Images become programmable resources rather than static files.

Antigravity should treat media as:

```
Composable + Transformable + Context-Aware Assets
```

---

```
```