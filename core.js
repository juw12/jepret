// Jepret core: pure functions (no DOM) so they can be tested on their own.

export const LIMITS = {
  minMegapixels: 4,          // Adobe Stock minimum
  phoneCopyMegapixels: [1.5, 2.6], // Sony phone-transfer "2M" copies land in this range
  maxTitleChars: 70,         // Adobe Stock CSV title limit
  maxKeywords: 49,
  maxFilenameChars: 30,      // Adobe Stock CSV filename limit
  duplicateDistance: 6,      // dHash bits (0..64)
  duplicateSimilarity: 0.85, // aligned 32x24 look match (0..1); survives handheld drift and exposure steps
  burstSeconds: 60,
  maxBlurBar: 60,             // Laplacian score on the 800 px copy; sharp camera shots score 150+          // only frames this close in time can be burst duplicates
  groupGapMinutes: 10,       // photos closer than this belong to one scene
};

export const ADOBE_CATEGORIES = {
  1: "Animals", 2: "Buildings and Architecture", 3: "Business", 4: "Drinks",
  5: "The Environment", 6: "States of Mind", 7: "Food", 8: "Graphic Resources",
  9: "Hobbies and Leisure", 10: "Industry", 11: "Landscapes", 12: "Lifestyle",
  13: "People", 14: "Plants and Flowers", 15: "Culture and Religion", 16: "Science",
  17: "Social Issues", 18: "Sports", 19: "Technology", 20: "Transport", 21: "Travel",
};

// ---------------------------------------------------------------- image measures

/** Grayscale Float32Array from RGBA pixel data. */
export function toGray(rgba, width, height) {
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < gray.length; i += 1, p += 4) {
    gray[i] = 0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2];
  }
  return gray;
}

/**
 * Sharpness = Laplacian variance of the sharpest tiles.
 * Using the best tiles keeps shallow depth-of-field shots (sharp subject, soft background) as sharp.
 */
export function sharpness(gray, width, height, tiles = 6) {
  const tileSums = new Float64Array(tiles * tiles);
  const tileSquares = new Float64Array(tiles * tiles);
  const tileCounts = new Float64Array(tiles * tiles);
  let flatTiles = 0;
  for (let y = 1; y < height - 1; y += 1) {
    const tileRow = Math.min(tiles - 1, Math.floor((y * tiles) / height));
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const lap = gray[i - 1] + gray[i + 1] + gray[i - width] + gray[i + width] - 4 * gray[i];
      const tile = tileRow * tiles + Math.min(tiles - 1, Math.floor((x * tiles) / width));
      tileSums[tile] += lap;
      tileSquares[tile] += lap * lap;
      tileCounts[tile] += 1;
    }
  }
  const variances = [];
  for (let t = 0; t < tileSums.length; t += 1) {
    if (tileCounts[t] === 0) continue;
    const mean = tileSums[t] / tileCounts[t];
    const variance = tileSquares[t] / tileCounts[t] - mean * mean;
    variances.push(variance);
    if (variance < 15) flatTiles += 1;
  }
  variances.sort((a, b) => b - a);
  const best = variances.slice(0, Math.max(2, Math.floor(variances.length / 10)));
  const score = best.reduce((sum, v) => sum + v, 0) / best.length;
  return { score, flatShare: flatTiles / Math.max(1, variances.length) };
}

/**
 * Box-average a grayscale image down to outW x outH.
 * Averaging every pixel (not sampling a few) keeps the duplicate hash stable when one frame is softer or noisier.
 */
export function shrinkGray(gray, width, height, outW = 9, outH = 8) {
  const sums = new Float64Array(outW * outH);
  const counts = new Float64Array(outW * outH);
  for (let y = 0; y < height; y += 1) {
    const row = Math.min(outH - 1, Math.floor((y * outH) / height));
    for (let x = 0; x < width; x += 1) {
      const cell = row * outW + Math.min(outW - 1, Math.floor((x * outW) / width));
      sums[cell] += gray[y * width + x];
      counts[cell] += 1;
    }
  }
  return sums.map((sum, i) => (counts[i] ? sum / counts[i] : 0));
}

/** 64-bit difference hash as a BigInt, from a 9x8 grayscale thumbnail. */
export function differenceHash(gray9x8) {
  let hash = 0n;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const left = gray9x8[row * 9 + col];
      const right = gray9x8[row * 9 + col + 1];
      hash = (hash << 1n) | (right > left ? 1n : 0n);
    }
  }
  return hash;
}

/**
 * How alike two 32x24 grayscale thumbnails are (0..1), allowing a small shift between them.
 * A handheld burst drifts 2-5 % between frames, which breaks a 9x8 dHash; normalised correlation over
 * the best of a few small offsets (about 9 % sideways, 8 % up/down) does not, and ignores exposure steps.
 */
export function alignedSimilarity(a, b, width = 32, height = 24, maxDx = 3, maxDy = 2) {
  let best = -1;
  for (let dy = -maxDy; dy <= maxDy; dy += 1) {
    for (let dx = -maxDx; dx <= maxDx; dx += 1) {
      const x0 = Math.max(0, dx);
      const x1 = width + Math.min(0, dx);
      const y0 = Math.max(0, dy);
      const y1 = height + Math.min(0, dy);
      const count = (x1 - x0) * (y1 - y0);
      let sumA = 0;
      let sumB = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          sumA += a[y * width + x];
          sumB += b[(y - dy) * width + (x - dx)];
        }
      }
      const meanA = sumA / count;
      const meanB = sumB / count;
      let cross = 0;
      let varA = 0;
      let varB = 0;
      for (let y = y0; y < y1; y += 1) {
        for (let x = x0; x < x1; x += 1) {
          const va = a[y * width + x] - meanA;
          const vb = b[(y - dy) * width + (x - dx)] - meanB;
          cross += va * vb;
          varA += va * va;
          varB += vb * vb;
        }
      }
      if (varA > 0 && varB > 0) best = Math.max(best, cross / Math.sqrt(varA * varB));
    }
  }
  return best;
}

/** Same scene within a burst: matching hash, or matching look after allowing for a small shift. */
export function looksAlike(a, b) {
  if (hammingDistance(a.hash, b.hash) <= LIMITS.duplicateDistance) return true;
  return Boolean(a.look && b.look) && alignedSimilarity(a.look, b.look) >= LIMITS.duplicateSimilarity;
}

export function hammingDistance(a, b) {
  let x = a ^ b;
  let count = 0;
  while (x > 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

/** Dominant colour names from RGBA data (coarse, for keywords). */
export function colourWords(rgba) {
  const buckets = { red: 0, orange: 0, yellow: 0, green: 0, blue: 0, purple: 0 };
  let colourful = 0;
  let bright = 0;
  let total = 0;
  for (let p = 0; p < rgba.length; p += 16) {
    const r = rgba[p] / 255;
    const g = rgba[p + 1] / 255;
    const b = rgba[p + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    total += 1;
    bright += max;
    if (max - min < 0.18 || max < 0.15) continue;
    colourful += 1;
    let hue;
    if (max === r) hue = ((g - b) / (max - min)) % 6;
    else if (max === g) hue = (b - r) / (max - min) + 2;
    else hue = (r - g) / (max - min) + 4;
    hue = (hue * 60 + 360) % 360;
    if (hue < 15 || hue >= 330) buckets.red += 1;
    else if (hue < 40) buckets.orange += 1;
    else if (hue < 70) buckets.yellow += 1;
    else if (hue < 170) buckets.green += 1;
    else if (hue < 260) buckets.blue += 1;
    else buckets.purple += 1;
  }
  const words = Object.entries(buckets)
    .filter(([, count]) => count / Math.max(1, total) > 0.18)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  if (colourful / Math.max(1, total) > 0.55) words.push("colorful");
  if (bright / Math.max(1, total) < 0.3) words.push("dark");
  return words.slice(0, 3);
}

// ---------------------------------------------------------------- judging

/**
 * Decide keep/reject for analysed photos (sorted by capture time).
 * Blur uses a batch-relative bar so one camera's settings don't break it.
 * The bar comes from the 75th-percentile score, so it holds even when most of a batch is soft.
 */
export function judge(photos) {
  const scores = photos.map((p) => p.sharpness).filter((s) => s > 0).sort((a, b) => a - b);
  const median = scores.length ? scores[Math.floor(scores.length / 2)] : 0;
  const upper = scores.length ? scores[Math.min(scores.length - 1, Math.floor(scores.length * 0.75))] : 0;
  const blurBar = Math.min(LIMITS.maxBlurBar, upper * 0.3);
  let previousKept = null;
  for (const photo of photos) {
    photo.status = "keep";
    photo.reason = "";
    if (photo.megapixels < LIMITS.minMegapixels) {
      photo.status = "small";
      photo.reason = `${photo.megapixels.toFixed(1)} MP (min 4 MP)`;
      continue;
    }
    if (photo.sharpness < blurBar) {
      photo.status = "blurry";
      photo.reason = `sharpness ${Math.round(photo.sharpness)}`;
      continue;
    }
    const sameBurst = previousKept
      && Math.abs((photo.time ?? 0) - (previousKept.time ?? 0)) <= LIMITS.burstSeconds * 1000;
    if (sameBurst && looksAlike(previousKept, photo)) {
      if (photo.sharpness > previousKept.sharpness) {
        previousKept.status = "duplicate";
        previousKept.reason = `less sharp than ${photo.name}`;
        previousKept = photo;
      } else {
        photo.status = "duplicate";
        photo.reason = `less sharp than ${previousKept.name}`;
      }
      continue;
    }
    previousKept = photo;
  }
  return { median, upper, blurBar };
}

/** Group photos into scenes by capture-time gaps. */
export function groupByTime(photos, gapMinutes = LIMITS.groupGapMinutes) {
  const sorted = [...photos].sort((a, b) => a.time - b.time);
  const groups = [];
  let current = null;
  for (const photo of sorted) {
    if (!current || photo.time - current.end > gapMinutes * 60000) {
      current = { id: groups.length + 1, photos: [], start: photo.time, end: photo.time };
      groups.push(current);
    }
    current.photos.push(photo);
    current.end = photo.time;
  }
  return groups;
}

// ---------------------------------------------------------------- keywords

function normalise(word) {
  return word.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\s-]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Build a title and keywords from a few user words, a location and image facts.
 * dictionary: { word: { related: [...], category: n } }, locations: { key: { label, words } }
 */
export function buildMetadata({ words, locationKey, people, orientation, colours, copySpace }, dictionary, locations) {
  const userWords = normalise(words || "").split(/[,\s]+/).filter(Boolean);
  const phrase = normalise(words || "");
  const location = locations[locationKey] || null;
  const keywords = [];
  const add = (word) => {
    const clean = normalise(word);
    if (clean && !keywords.includes(clean)) keywords.push(clean);
  };

  // Multi-word dictionary entries first ("street food"), then single words.
  // A matched phrase consumes its words, so "street food" does not also trigger "street".
  const matched = [];
  const consumed = new Set();
  for (const entry of Object.keys(dictionary).filter((key) => key.includes(" ")).sort((a, b) => b.length - a.length)) {
    if (` ${phrase} `.includes(` ${entry} `)) {
      matched.push(entry);
      entry.split(" ").forEach((word) => consumed.add(word));
    }
  }
  for (const entry of Object.keys(dictionary).filter((key) => !key.includes(" "))) {
    if (userWords.includes(entry) && !consumed.has(entry)) matched.push(entry);
  }

  userWords.forEach(add);
  matched.forEach(add);
  if (location) location.words.forEach(add);
  matched.forEach((entry) => dictionary[entry].related.forEach(add));
  (colours || []).forEach(add);
  add(orientation);
  if (copySpace) add("copy space");
  if (people === false) {
    add("nobody");
    add("no people");
  }
  if (matched.some((entryName) => dictionary[entryName].outdoor)) add("outdoors");
  add("photography");

  const categoryVotes = {};
  matched.forEach((entry) => {
    const category = dictionary[entry].category;
    if (category) categoryVotes[category] = (categoryVotes[category] || 0) + 1;
  });
  const bestCategory = Object.entries(categoryVotes).sort((a, b) => b[1] - a[1])[0];
  const category = bestCategory ? Number(bestCategory[0]) : 21;

  let title = phrase ? phrase.charAt(0).toUpperCase() + phrase.slice(1) : "Photo";
  if (location && location.label) title += ` in ${location.label}`;
  if (title.length > LIMITS.maxTitleChars) title = title.slice(0, LIMITS.maxTitleChars).replace(/\s+\S*$/, "");

  return { title, keywords: keywords.slice(0, LIMITS.maxKeywords), category };
}

// ---------------------------------------------------------------- csv export

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRows(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export function validateItem(item) {
  const problems = [];
  if (!item.title) problems.push("missing title");
  if (item.title && item.title.length > LIMITS.maxTitleChars) problems.push("title too long");
  if (item.keywords.length < 5) problems.push("fewer than 5 keywords");
  if (item.keywords.length > LIMITS.maxKeywords) problems.push("too many keywords");
  if (!ADOBE_CATEGORIES[item.category]) problems.push("category must be 1-21");
  if (item.file.length > LIMITS.maxFilenameChars) problems.push("file name over 30 characters");
  return problems;
}

export function adobeCsv(items) {
  const rows = [["Filename", "Title", "Keywords", "Category", "Releases"]];
  items.forEach((item) => rows.push([item.file, item.title, item.keywords.join(", "), item.category, ""]));
  return csvRows(rows);
}

export function shutterstockCsv(items) {
  const rows = [["Filename", "Description", "Keywords", "Categories", "Editorial", "Mature content", "illustration"]];
  items.forEach((item) => rows.push([
    item.file,
    item.title,
    item.keywords.join(","),
    (item.shutterstockCategories || []).slice(0, 2).join(","),
    item.editorial ? "yes" : "no",
    "no",
    "no",
  ]));
  return csvRows(rows);
}


// ---------------------------------------------------------------- shooting time

// EXIF DateTimeOriginal (falling back to DateTime) as a local-time timestamp in ms, or null.
// Phone transfers (Imaging Edge Mobile, Creators' App, gallery copies) set the file date to the
// moment of transfer, so the real shooting time has to come from EXIF.
export function exifTime(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    if ((marker & 0xff00) !== 0xff00) return null;
    const length = view.getUint16(offset + 2);
    const isExif = marker === 0xffe1
      && offset + 10 <= view.byteLength
      && view.getUint32(offset + 4) === 0x45786966; // "Exif"
    if (isExif) {
      return readTiffTime(view, offset + 10, Math.min(view.byteLength, offset + 2 + length));
    }
    if (marker === 0xffda) return null; // image data starts: no EXIF before it
    offset += 2 + length;
  }
  return null;
}

function readTiffTime(view, start, end) {
  if (start + 8 > end) return null;
  const order = view.getUint16(start);
  const little = order === 0x4949;
  if (!little && order !== 0x4d4d) return null;
  const u16 = (at) => view.getUint16(at, little);
  const u32 = (at) => view.getUint32(at, little);

  const readIfd = (ifdOffset) => {
    const at = start + ifdOffset;
    const tags = {};
    if (at + 2 > end) return tags;
    const count = u16(at);
    for (let index = 0; index < count; index += 1) {
      const entry = at + 2 + index * 12;
      if (entry + 12 > end) break;
      tags[u16(entry)] = { type: u16(entry + 2), count: u32(entry + 4), value: entry + 8 };
    }
    return tags;
  };

  const dateText = (tag) => {
    if (!tag || tag.type !== 2 || tag.count < 19) return null;
    const at = tag.count > 4 ? start + u32(tag.value) : tag.value;
    if (at + 19 > end) return null;
    let text = "";
    for (let index = 0; index < 19; index += 1) {
      text += String.fromCharCode(view.getUint8(at + index));
    }
    return text;
  };

  const ifd0 = readIfd(u32(start + 4));
  let text = null;
  if (ifd0[0x8769]) {
    const exifIfd = readIfd(u32(ifd0[0x8769].value));
    text = dateText(exifIfd[0x9003]);
  }
  if (!text) text = dateText(ifd0[0x0132]);
  const match = text && /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(text);
  if (!match) return null;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  if (year < 1990) return null;
  const time = new Date(year, month - 1, day, hour, minute, second).getTime();
  return Number.isFinite(time) ? time : null;
}

// True when most photos look like the "2M" copies that Sony's phone apps send by default.
export function looksLikePhoneCopies(photos) {
  const [low, high] = LIMITS.phoneCopyMegapixels;
  const copies = photos.filter((photo) => photo.megapixels >= low && photo.megapixels < high);
  return copies.length >= 2 && copies.length >= photos.length / 2;
}
