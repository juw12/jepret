# Jepret

**Camera sitting idle? Photos in, stock upload files out.** Free, open source, and your photos never leave your computer.

## Get the app

| Where | How |
|---|---|
| **Windows** | Download [**Jepret.exe**](https://github.com/juw12/jepret/releases/latest/download/Jepret.exe) and double-click it. No installer, works offline. Unsigned, so SmartScreen may ask: *More info → Run anyway*. |
| **Android / phone** | Open https://juw12.github.io/jepret/ in Chrome → menu → *Add to Home screen*. It then opens like an app and works offline. |
| **Any computer** | Open https://juw12.github.io/jepret/ in Chrome or Edge and click **Install app** in the top bar (or just use the page). |

All three are the same app: after the first open nothing needs the internet, and photos never leave your device.

Jepret is for people with a mirrorless or DSLR camera, a full-time job and little time. It does the boring part of selling photos on stock sites:

1. **Pick your photos:** the ones your camera sent to your phone, or the SD card folder (or try the demo photos).
2. **Culling, automatic:** removes blurry shots and near-duplicate burst frames, flags photos under 4 MP (Adobe Stock's minimum).
3. **Scenes, automatic:** photos shot close together in time are grouped, so you describe each scene once in 3-5 words.
4. **Keywords:** your words are expanded with a stock keyword dictionary, location packs (Batam, Bali, Jakarta, ...) and facts from the image (orientation, colours, empty space for text). Up to 49 keywords and a title under 70 characters, editable.
5. **Export:** `adobe_stock.csv` and `shutterstock.csv` in each site's CSV upload format, plus an optional copy of the keepers into a folder (Chrome/Edge).

See [`sample/`](sample/) for real output made from the demo photos.

## Straight from the camera to your phone (no SD card)

Sony cameras like the a6400 can send photos to your phone over Wi-Fi with **Imaging Edge Mobile** or **Creators' App**.
Open Jepret on the phone, tap **Choose photos** and select them from the gallery.

- **Set the transfer size to Original first.** The apps send **2M** copies by default (about 2 MP), which is below
  Adobe Stock's 4 MP minimum. Jepret warns you when a batch looks like 2M copies.
- RAW files are converted to JPEG when sent to the phone; that is fine for stock.
- Jepret reads the shooting time from each photo's EXIF data, so scenes and burst duplicates still group correctly even
  though the phone gives every transferred file the same date.

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
`sw.js` caches the app so it works offline. `app/` wraps the same files into `Jepret.exe` with [Tauri 2](https://tauri.app) (WebView2);
GitHub Actions (`.github/workflows/windows.yml`) builds it on every change and attaches it to the latest release.
To build locally: install Rust, then run `./app/build.ps1`.

## Not in v1 (on purpose)

Paid plans, automatic upload to stock sites, video keywording, AI image recognition, face search for events, a store-listed (Play Store) Android app.

MIT licence. Made in Batam.
