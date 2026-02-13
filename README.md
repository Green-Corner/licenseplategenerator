# Arizona License Plate Generator

Simple embeddable web app to generate Arizona-style license plate examples.

## Features
- Background color picker
- Overlay image upload
- Three customizable text fields
- Live canvas preview
- Download as PNG

## Run locally
Open `index.html` in a browser.

If your browser blocks local image upload previews with direct file open, run a local server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Embed on another page
Host this folder and embed it with an iframe:

```html
<iframe
  src="https://your-domain.com/licenseplategenerator/"
  title="Arizona License Plate Generator"
  width="100%"
  height="760"
  style="border:0;"
></iframe>
```
