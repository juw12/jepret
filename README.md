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
5. **Words, automatic if you want:** **Fill in the words for me** recognises each scene on your device (CLIP image model, about 90 MB once, then offline) and writes 1-3 scene words, with other guesses one tap away. Tick *Do this by itself next time* and it runs after every load. Check the words: it can be wrong.
6. **Export:** `adobe_stock.csv` and `shutterstock.csv` in each site's CSV upload format, plus the keepers copied to a folder (Chrome/Edge) or handed to the phone's share sheet. Every exported photo carries its title and keywords **inside the file** (XMP + IPTC), so the stock sites fill them in on upload.
7. **Client proofs:** watermarked 2000 px previews of the keepers, with your name, for paid local jobs.

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

## Uploading: what is automatic and what stays with you

| Step | Who |
|---|---|
| Culling, scenes, words, title, keywords, CSV, words inside each photo | Jepret |
| Phone: share keepers to Drive, WhatsApp or a stock contributor app | You tap Share (10 photos per tap) |
| PC: upload a saved folder to Shutterstock (FTPS) and Adobe Stock (SFTP) | `python tools/upload_stock.py <folder> --shutterstock --adobe` (add `--watch` to keep uploading new photos) |
| Create the contributor accounts, ID check, tax form | You, once |
| Press **Submit** on Shutterstock; confirm you own the photos and have releases | You, every batch (the sites require it) |
| Adobe Stock SFTP | Only after Adobe enables it for your account; until then upload in the browser |

`tools/upload_stock.py` uses Shutterstock's `ftps.shutterstock.com:21` (explicit TLS) and Adobe's `sftp.contributor.adobestock.com:22`
(needs `pip install paramiko`). Credentials come from `JEPRET_SHUTTERSTOCK_USER/PASSWORD` and `JEPRET_ADOBE_SFTP_ID/PASSWORD` or a prompt;
a `uploaded.txt` log in the folder stops double uploads. The dry run is tested; real uploads have not been tested without an account.

## Earn offline with the same camera

Stock pays little per photo now, so the app also lists local paid jobs with Indonesian rate ranges (2024-25 listings), a6400 settings and a
ready WhatsApp message for each: product photos for Shopee/Tokopedia sellers (Rp 50k-500k per photo, packages from about Rp 299k for 10),
menu photos for GoFood/GrabFood (Rp 500k-1.2 jt per session), wisuda and portraits (Rp 300k-3 jt), small events (listings Rp 500k-3 jt per hour)
and kos/property listings (no published rates found; Rp 150k-300k per room is our assumption). Client proofs make the watermarked previews.

## Privacy

Everything runs on your device: photo analysis uses the canvas API, and the scene recogniser runs in the page with onnxruntime-web.
The only downloads are the app itself, the recogniser runtime (jsDelivr) and its model (this site), once. Photos are never uploaded by Jepret;
uploads happen only when you share them or run `tools/upload_stock.py`.

## How the checks work

- **Blur:** Laplacian variance of the sharpest tiles of a downscaled copy, so a sharp subject on a soft background still counts as sharp. The bar is relative to the batch (30 % of the 75th-percentile score, capped at 60), so it still holds when most of a card is soft.
- **Duplicates:** only frames shot within 60 s of each other are compared. Two frames are a burst if their 64-bit difference hash is at most 6 bits apart, or if their 32×24 grayscale copies correlate at 0.85 or more after allowing a small shift (about 9 % sideways, 8 % up/down). The shift check matters: on real a6400 files a 2–3 % handheld drift pushed the hash past 6 bits in most frames, while the aligned check scored every simulated burst frame (drift, 1–2° tilt, ±⅓–⅔ EV) at 0.88 or more and every pair of different photos at 0.37 or less. Only the sharpest frame of a burst is kept.
- **Tested on real a6400 files:** 10 ILCE-6400 JPEGs plus strongly and mildly blurred copies (30 files). All 9 sharp originals over 4 MP were kept, all 18 blurred copies rejected, the 3.6 MP crop flagged as too small, scenes split by EXIF date. 2M phone copies of the same files triggered the transfer-size warning. The Windows exe was driven end to end on the same set, including **Copy keepers + CSV to a folder** (Windows asks twice: *Save changes*, then *Allow*); the 9 copied JPGs were byte-identical to the originals.
- **You decide:** click any photo to keep or reject it.

## Develop

Plain HTML, CSS and ES modules, no build step and no dependencies.

```
python -m http.server 8000      # then open http://localhost:8000
                                 # tests: http://localhost:8000/test.html
```

`core.js` holds the pure logic (tested in `test.html`, including the XMP/IPTC writer and scene-word picking), `vocab.js` the keyword dictionary,
locations and shot list, `describe.js` the on-device recogniser, `earn.js` the local-jobs cards, `app.js` the UI.
The recogniser model (`models/`, CLIP ViT-B/32 image encoder, 8-bit) and its word list are built by `.github/workflows/clip-model.yml`
running `tools/build_clip.py`, which also writes `models/selftest.json` from six Wikimedia Commons test photos.
`sw.js` caches the app so it works offline. `app/` wraps the same files into `Jepret.exe` with [Tauri 2](https://tauri.app) (WebView2);
GitHub Actions (`.github/workflows/windows.yml`) builds it on every change and attaches it to the latest release.
To build locally: install Rust, then run `./app/build.ps1`.

## Not included (on purpose)

Paid plans, uploads without your final Submit (the sites do not allow it), video keywording, face search for events, a store-listed (Play Store) Android app.

MIT licence. Made in Batam.
