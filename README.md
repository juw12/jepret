# Jepret

**Camera sitting idle? SD card in, stock upload files out.** Free, open source, and your photos never leave your computer.

**Use it:** https://juw12.github.io/jepret/ (runs in Chrome or Edge, nothing to install)

Jepret is for people with a mirrorless or DSLR camera, a full-time job and little time. It does the boring part of selling photos on stock sites:

1. **Pick the SD card folder** (or try the demo photos).
2. **Culling, automatic:** removes blurry shots and near-duplicate burst frames, flags photos under 4 MP (Adobe Stock's minimum).
3. **Scenes, automatic:** photos shot close together in time are grouped, so you describe each scene once in 3-5 words.
4. **Keywords:** your words are expanded with a stock keyword dictionary, location packs (Batam, Bali, Jakarta, ...) and facts from the image (orientation, colours, empty space for text). Up to 49 keywords and a title under 70 characters, editable.
5. **Export:** `adobe_stock.csv` and `shutterstock.csv` in each site's CSV upload format, plus an optional copy of the keepers into a folder (Chrome/Edge).

See [`sample/`](sample/) for real output made from the demo photos.

## Honest expectations

AI images now make up a large share of stock sites and earnings per photo have fallen (e.g. [PetaPixel, May 2025](https://petapixel.com/2025/05/22/almost-half-of-the-images-on-adobe-stock-are-ai-generated/)). Jepret does not promise passive income. It removes the boring part so testing stock costs you little time. Real local places, food and daily life are what still has a chance; the built-in shot list points you there.

## Privacy

Everything runs in the browser tab: photo analysis uses the canvas API on your computer. No account, no server, no upload.

## How the checks work

- **Blur:** Laplacian variance of the sharpest tiles of a downscaled copy, so a sharp subject on a soft background still counts as sharp. The bar is relative to the batch (30 % of the median, capped at 60).
- **Duplicates:** 64-bit difference hash; frames within 60 s of each other and at most 6 bits apart are a burst, and only the sharpest is kept.
- **You decide:** click any photo to keep or reject it.

## Develop

Plain HTML, CSS and ES modules, no build step and no dependencies.

```
python -m http.server 8000      # then open http://localhost:8000
                                 # tests: http://localhost:8000/test.html
```

`core.js` holds the pure logic (tested in `test.html`), `vocab.js` the keyword dictionary, locations and shot list, `app.js` the UI.

## Not in v1 (on purpose)

Paid plans, automatic upload to stock sites, video keywording, AI image recognition, face search for events, mobile app.

MIT licence. Made in Batam.
