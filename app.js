import {
  ADOBE_CATEGORIES, adobeCsv, buildMetadata, colourWords, differenceHash, embedXmp, exifTime, groupByTime,
  judge, looksLikePhoneCopies, sharpness, shrinkGray, shutterstockCsv, toGray, validateItem,
} from "./core.js";
import { DICTIONARY, LOCATIONS, SHOT_LIST } from "./vocab.js";
import { EARN, renderEarn } from "./earn.js";
import { renderOnSpot } from "./onspot.js";

const SHUTTERSTOCK_BY_ADOBE = {
  1: ["Animals/Wildlife"], 2: ["Buildings/Landmarks"], 3: ["Business/Finance"], 4: ["Food and Drink"],
  5: ["Nature"], 6: ["Abstract"], 7: ["Food and Drink"], 8: ["Backgrounds/Textures"],
  9: ["Objects"], 10: ["Industrial"], 11: ["Nature"], 12: ["People"], 13: ["People"],
  14: ["Nature"], 15: ["Religion"], 16: ["Science"], 17: ["Miscellaneous"], 18: ["Sports/Recreation"],
  19: ["Technology"], 20: ["Transportation"], 21: ["Parks/Outdoor"],
};

const TEXT = {
  en: {
    eyebrow: "Free · open source · photos stay on your computer",
    headline: "Camera sitting idle? Photos in, stock upload files out.",
    lead: "Jepret removes blurry and duplicate shots, writes titles and keywords, and makes the CSV files Adobe Stock and Shutterstock ask for.",
    pickPhotos: "Choose photos", pick: "Choose a folder (SD card)", demo: "Try with demo photos", install: "Install app",
    getapp: "Get the app:", getwin: "Windows (Jepret.exe)",
    getphone: "Phone: open this page in Chrome, then menu › Add to Home screen",
    s1: "Pick the photos your camera sent to your phone, or the DCIM folder on your SD card",
    s2: "Check the picks, type 3-5 words per scene",
    tip: "Sony camera to phone (Imaging Edge Mobile or Creators' App)? Set the transfer size to Original first. The default 2M copies are about 2 MP, below Adobe Stock's 4 MP minimum.",
    phoneHint: "These look like 2M phone-transfer copies, too small for Adobe Stock (4 MP minimum). In Imaging Edge Mobile or Creators' App set the transfer size to Original, send the photos again, then load them here.",
    s3: "Download the CSV, upload photos + CSV to the stock site",
    honest: "Honest note: AI images flooded stock sites and earnings per photo fell. Jepret does not promise passive income; it removes the boring part so testing stock costs you little time.",
    exportTitle: "Export", keepList: "Keeper list", saveFolder: "Copy keepers (words inside) + CSV to a folder",
    shotTitle: "Shot list: what to shoot this week", privacy: "Nothing is uploaded. All analysis runs on this device.",
    describe: "Describe the scene (3-5 words)", location: "Location", category: "Subject type (Adobe Stock list)",
    people: "Someone's face can be recognised (no model release, so these go in as editorial)", title: "Title", keywords: "Keywords",
    reading: "Reading photo", of: "of", scene: "Scene", photos: "photos", photo: "photo", kept: "kept",
    noKeepers: "No keepers in this scene. Click a photo to keep it and fill in its words.",
    exportOr: "or one file at a time:",
    saveHint: "You will be asked to allow saving, sometimes twice: choose Save changes, then Allow.",
    saveFailed: "Could not save to that folder. Try another folder, or use the download buttons above.",
    saved: (n) => `${n} photos + 2 CSV files saved.`,
    blurNote: "Blur is judged on a small copy of each photo. If a photo marked blurry looks sharp to you at full size, click it to keep it.",
    keep: "keep", blurry: "blurry", duplicate: "duplicate", small: "too small", rejected: "rejected",
    summary: (k, r, g) => `${k} keepers, ${r} rejected, ${g} scenes. Click a photo to keep or reject it.`,
    ready: (n) => `${n} photos ready to export.`, needWords: (n) => `${n} scene(s) still need a description.`,
    none: "No JPG photos found there.", kwCount: (n) => `${n} / 49 keywords`,
    earnLink: "Other ways to earn with your camera: local paid jobs ↓",
    kwAdd: "Add keywords, then press Enter (commas for several)", kwRemove: (w) => `Remove keyword: ${w}`,
    fillWords: "Fill in the words for me", fillAuto: "Do this by itself next time",
    fillNote: "Recognises each scene on this device; photos are not uploaded. The first time it downloads about 90 MB, then it works offline. Check the words: the AI can be wrong.",
    fillLoading: (p) => `Downloading the recogniser… ${p}%`, fillStarting: "Starting the recogniser…",
    fillScene: (i, n) => `Looking at scene ${i} of ${n}…`,
    fillDone: (n) => `Words filled in for ${n} scene(s). Check them before you upload.`,
    fillNone: "Nothing to fill in: every scene with keepers already has words.",
    fillFailed: "Could not load the recogniser (it needs internet the first time). Type the words yourself.",
    aiGuess: "AI guess, check it", otherGuesses: "Other guesses:",
    embedNote: "Saved and shared photos carry their title and keywords inside the file, so Adobe Stock and Shutterstock fill them in when you upload.",
    sharePhotos: "Share keepers to an app", shareNext: (a, b, n) => `Share next photos (${a}-${b} of ${n})`,
    shared: (n) => `${n} photos shared with their words inside.`,
    proofs: "Client proofs (watermarked)", proofName: "Name on proofs", proofsDone: (n) => `${n} watermarked proofs ready.`,
    proofMark: "PROOF",
    uploadNote: "Shutterstock: upload the shared or saved photos and the words are already filled in. Adobe Stock: upload the photos, then the CSV. Automatic upload from a PC: see tools/upload_stock.py in the README (not yet tested with a real contributor account).",
  },
  id: {
    eyebrow: "Gratis · open source · foto tetap di komputermu",
    headline: "Kamera nganggur? Masukkan foto, keluar file siap upload ke stock.",
    lead: "Jepret membuang foto blur dan dobel, menulis judul dan kata kunci, dan membuat file CSV yang diminta Adobe Stock dan Shutterstock.",
    pickPhotos: "Pilih foto", pick: "Pilih folder (SD card)", demo: "Coba dengan foto demo", install: "Pasang aplikasi",
    getapp: "Unduh aplikasi:", getwin: "Windows (Jepret.exe)",
    getphone: "HP: buka halaman ini di Chrome, lalu menu › Tambahkan ke layar utama",
    s1: "Pilih foto yang dikirim kamera ke HP, atau folder DCIM di SD card",
    s2: "Cek pilihan, ketik 3-5 kata per adegan",
    tip: "Kirim dari kamera Sony ke HP (Imaging Edge Mobile atau Creators' App)? Ubah ukuran kirim ke Original dulu. Salinan bawaan 2M hanya sekitar 2 MP, di bawah minimum Adobe Stock 4 MP.",
    phoneHint: "Foto ini sepertinya salinan 2M dari aplikasi HP, terlalu kecil untuk Adobe Stock (minimum 4 MP). Di Imaging Edge Mobile atau Creators' App ubah ukuran kirim ke Original, kirim ulang, lalu muat di sini.",
    s3: "Unduh CSV, upload foto + CSV ke situs stock",
    honest: "Jujur saja: gambar AI membanjiri situs stock dan penghasilan per foto turun. Jepret tidak menjanjikan passive income; ia menghapus bagian membosankan supaya mencoba stock tidak makan banyak waktu.",
    exportTitle: "Ekspor", keepList: "Daftar foto terpilih", saveFolder: "Salin foto terpilih (dengan kata) + CSV ke folder",
    shotTitle: "Daftar foto: apa yang difoto minggu ini", privacy: "Tidak ada yang diunggah. Semua analisis berjalan di perangkat ini.",
    describe: "Jelaskan adegan (3-5 kata)", location: "Lokasi", category: "Jenis subjek (daftar Adobe Stock)",
    people: "Ada wajah orang yang jelas (tanpa izin model, jadi dikirim sebagai editorial)", title: "Judul", keywords: "Kata kunci",
    reading: "Membaca foto", of: "dari", scene: "Adegan", photos: "foto", photo: "foto", kept: "dipilih",
    noKeepers: "Tidak ada foto terpilih di adegan ini. Klik foto untuk menyimpannya dan isi kata-katanya.",
    exportOr: "atau satu file per satu:",
    saveHint: "Kamu akan diminta izin menyimpan, kadang dua kali: pilih Save changes, lalu Allow.",
    saveFailed: "Gagal menyimpan ke folder itu. Coba folder lain, atau pakai tombol unduh di atas.",
    saved: (n) => `${n} foto + 2 file CSV tersimpan.`,
    blurNote: "Blur dinilai dari salinan kecil tiap foto. Kalau foto bertanda blur terlihat tajam di ukuran penuh, klik untuk menyimpannya.",
    keep: "simpan", blurry: "blur", duplicate: "dobel", small: "terlalu kecil", rejected: "dibuang",
    summary: (k, r, g) => `${k} dipilih, ${r} dibuang, ${g} adegan. Klik foto untuk simpan atau buang.`,
    ready: (n) => `${n} foto siap diekspor.`, needWords: (n) => `${n} adegan masih perlu deskripsi.`,
    none: "Tidak ada foto JPG di sana.", kwCount: (n) => `${n} / 49 kata kunci`,
    earnLink: "Cara lain cari uang dengan kameramu: kerja lokal berbayar ↓",
    kwAdd: "Tambah kata kunci, lalu tekan Enter (pakai koma untuk beberapa)", kwRemove: (w) => `Hapus kata kunci: ${w}`,
    fillWords: "Isikan kata-katanya untukku", fillAuto: "Lakukan otomatis lain kali",
    fillNote: "Mengenali tiap adegan di perangkat ini; foto tidak diunggah. Pertama kali mengunduh sekitar 90 MB, setelah itu bisa offline. Cek kata-katanya: AI bisa salah.",
    fillLoading: (p) => `Mengunduh pengenal gambar… ${p}%`, fillStarting: "Menyiapkan pengenal gambar…",
    fillScene: (i, n) => `Melihat adegan ${i} dari ${n}…`,
    fillDone: (n) => `Kata-kata terisi untuk ${n} adegan. Cek dulu sebelum upload.`,
    fillNone: "Tidak ada yang perlu diisi: semua adegan dengan foto terpilih sudah punya kata.",
    fillFailed: "Gagal memuat pengenal gambar (perlu internet saat pertama kali). Ketik kata-katanya sendiri.",
    aiGuess: "tebakan AI, cek dulu", otherGuesses: "Tebakan lain:",
    embedNote: "Foto yang disimpan dan dibagikan membawa judul dan kata kunci di dalam file, jadi Adobe Stock dan Shutterstock mengisinya otomatis saat upload.",
    sharePhotos: "Bagikan foto terpilih ke aplikasi", shareNext: (a, b, n) => `Bagikan foto berikutnya (${a}-${b} dari ${n})`,
    shared: (n) => `${n} foto dibagikan dengan kata-katanya di dalam file.`,
    proofs: "Proof klien (ber-watermark)", proofName: "Nama di proof", proofsDone: (n) => `${n} proof ber-watermark siap.`,
    proofMark: "PROOF",
    uploadNote: "Shutterstock: upload foto yang dibagikan atau disimpan dan kata-katanya sudah terisi. Adobe Stock: upload fotonya, lalu CSV-nya. Upload otomatis dari PC: lihat tools/upload_stock.py di README (belum dites dengan akun kontributor asli).",
  },
};

const state = { photos: [], groups: [], lang: "en" };
const $ = (selector) => document.querySelector(selector);
const t = (key, ...args) => {
  const value = TEXT[state.lang][key] ?? TEXT.en[key];
  return typeof value === "function" ? value(...args) : value;
};

// ---------------------------------------------------------------- settings

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  $("#lang").textContent = state.lang === "en" ? "ID" : "EN";
  $("#earn-title").textContent = EARN[state.lang].title;
  renderOnSpot($("#onspot"), state.lang);
  renderEarn($("#earn"), state.lang);
  if (state.groups.length) renderReview();
}

function initSettings() {
  const savedTheme = localStorage.getItem("jepret-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = savedTheme || (prefersDark ? "dark" : "light");
  $("#theme").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("jepret-theme", next);
  });
  state.lang = localStorage.getItem("jepret-lang") || (navigator.language.startsWith("id") ? "id" : "en");
  $("#lang").addEventListener("click", () => {
    state.lang = state.lang === "en" ? "id" : "en";
    localStorage.setItem("jepret-lang", state.lang);
    applyLanguage();
  });
  applyLanguage();
}

// ---------------------------------------------------------------- analysis

function makeCanvas(width, height) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

async function canvasToUrl(canvas) {
  const blob = canvas.convertToBlob
    ? await canvas.convertToBlob({ type: "image/jpeg", quality: 0.72 })
    : await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  return URL.createObjectURL(blob);
}

async function analyse(file) {
  // EXIF sits in the first 64 KB; phone transfers reset the file date, so prefer the shooting time.
  const shotTime = exifTime(await file.slice(0, 128 * 1024).arrayBuffer());
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, 800 / Math.max(width, height));
  const w = Math.max(16, Math.round(width * scale));
  const h = Math.max(16, Math.round(height * scale));
  const canvas = makeCanvas(w, h);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, w, h);
  const pixels = context.getImageData(0, 0, w, h).data;
  const gray = toGray(pixels, w, h);
  const sharp = sharpness(gray, w, h);

  const hash = differenceHash(shrinkGray(gray, w, h));
  const look = shrinkGray(gray, w, h, 32, 24);

  const thumbScale = 360 / Math.max(width, height);
  const thumb = makeCanvas(Math.round(width * thumbScale), Math.round(height * thumbScale));
  thumb.getContext("2d").drawImage(bitmap, 0, 0, thumb.width, thumb.height);
  bitmap.close();

  return {
    name: file.name,
    file,
    time: shotTime ?? file.lastModified,
    width,
    height,
    megapixels: (width * height) / 1e6,
    sharpness: sharp.score,
    copySpace: sharp.flatShare >= 0.3,
    orientation: width > height * 1.05 ? "horizontal" : height > width * 1.05 ? "vertical" : "square",
    colours: colourWords(pixels),
    hash,
    look,
    thumbUrl: await canvasToUrl(thumb),
  };
}

async function processFiles(fileList, { autoFill = true } = {}) {
  const files = [...fileList].filter((file) => file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name));
  if (!files.length) {
    alert(t("none"));
    return;
  }
  $("#start").hidden = true;
  $("#review").hidden = true;
  $("#progress").hidden = false;
  state.photos = [];
  for (let index = 0; index < files.length; index += 1) {
    $("#progress-text").textContent = `${t("reading")} ${index + 1} ${t("of")} ${files.length}: ${files[index].name}`;
    $("#progress-bar").style.width = `${((index + 1) / files.length) * 100}%`;
    try {
      state.photos.push(await analyse(files[index]));
    } catch (error) {
      console.warn("skipped", files[index].name, error);
    }
  }
  state.photos.sort((a, b) => a.time - b.time || a.name.localeCompare(b.name));
  judge(state.photos);
  state.groups = groupByTime(state.photos).map((group) => ({
    ...group, words: "", locationKey: "", people: false, category: null, manualCategory: false, title: "", keywords: [],
  }));
  state.groups.forEach(refreshMetadata);
  state.shareFrom = 0;
  $("#progress").hidden = true;
  $("#review").hidden = false;
  $("#fill-status").textContent = "";
  renderReview();
  if (autoFill && localStorage.getItem("jepret-autowords") === "1") fillWords();
}

// ---------------------------------------------------------------- words from the photos (on-device AI)

async function fillWords() {
  const button = $("#fill-words");
  const status = $("#fill-status");
  const waiting = state.groups.filter((group) => !group.words && group.photos.some((photo) => photo.status === "keep"));
  if (!waiting.length) {
    status.textContent = t("fillNone");
    return;
  }
  button.disabled = true;
  status.textContent = t("fillStarting");
  try {
    const { describeGroups } = await import("./describe.js");
    const results = await describeGroups(state.groups, {
      onProgress: ({ stage, share, index, total }) => {
        if (stage === "download") status.textContent = t("fillLoading", Math.round(share * 100));
        if (stage === "scene") status.textContent = t("fillScene", index + 1, total);
      },
    });
    let filled = 0;
    state.groups.forEach((group) => {
      const result = results[group.id];
      if (!result) return;
      group.guesses = result.ranked.map((item) => item.label).filter((label) => !result.words.includes(label));
      if (result.words.length) filled += 1;
      refreshMetadata(group);
    });
    renderReview();
    status.textContent = t("fillDone", filled);
  } catch (error) {
    console.warn("recogniser", error);
    status.textContent = t("fillFailed");
  } finally {
    button.disabled = false;
  }
}

// ---------------------------------------------------------------- metadata

function refreshMetadata(group) {
  const sample = group.photos.find((photo) => photo.status === "keep") || group.photos[0];
  const result = buildMetadata({
    words: group.words,
    locationKey: group.locationKey,
    people: group.people,
    orientation: sample.orientation,
    colours: sample.colours,
    copySpace: sample.copySpace,
  }, DICTIONARY, LOCATIONS);
  group.title = group.words ? result.title : "";
  group.keywords = group.words ? result.keywords : [];
  if (!group.manualCategory) group.category = result.category;
}

function exportItems() {
  const items = [];
  state.groups.forEach((group) => {
    group.photos.filter((photo) => photo.status === "keep").forEach((photo) => {
      items.push({
        file: photo.name,
        title: group.title,
        keywords: group.keywords,
        category: group.category,
        editorial: group.people,
        shutterstockCategories: SHUTTERSTOCK_BY_ADOBE[group.category] || [],
      });
    });
  });
  return items;
}

// ---------------------------------------------------------------- rendering

function renderReview() {
  const keepers = state.photos.filter((photo) => photo.status === "keep").length;
  $("#summary").textContent = t("summary", keepers, state.photos.length - keepers, state.groups.length);
  const phoneHint = $("#phone-hint");
  phoneHint.hidden = !looksLikePhoneCopies(state.photos);
  phoneHint.textContent = t("phoneHint");
  let blurNote = $("#blur-note");
  if (!blurNote) {
    blurNote = document.createElement("p");
    blurNote.id = "blur-note";
    blurNote.className = "muted";
    $("#summary").after(blurNote);
  }
  blurNote.textContent = t("blurNote");
  blurNote.hidden = !state.photos.some((photo) => photo.status === "blurry");
  const container = $("#groups");
  container.replaceChildren();
  const template = $("#group-template");

  state.groups.forEach((group) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelectorAll("[data-i18n]").forEach((label) => {
      label.textContent = t(label.dataset.i18n);
    });
    const keptCount = group.photos.filter((photo) => photo.status === "keep").length;
    node.querySelector("h3").textContent = `${t("scene")} ${group.id}`;
    node.querySelector(".group-meta").textContent =
      `${new Date(group.start).toLocaleString()} · ${group.photos.length} ${t(group.photos.length === 1 ? "photo" : "photos")} · ${keptCount} ${t("kept")}`;

    if (keptCount === 0) {
      // Nothing to upload from this scene: keep the card short and say why.
      node.classList.add("empty");
      node.querySelector(".fields").hidden = true;
      node.querySelector(".output").hidden = true;
      const note = document.createElement("p");
      note.className = "muted empty-note";
      note.textContent = t("noKeepers");
      node.querySelector(".thumbs").after(note);
    }

    const thumbs = node.querySelector(".thumbs");
    group.photos.forEach((photo) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `thumb ${photo.status}`;
      button.title = photo.reason ? `${photo.name}: ${photo.reason}` : photo.name;
      button.innerHTML = `<img alt="" loading="lazy"><span class="badge"></span><span class="fname"></span>`;
      button.querySelector("img").src = photo.thumbUrl;
      button.querySelector(".badge").textContent = t(photo.status);
      button.querySelector(".fname").textContent = photo.name;
      button.addEventListener("click", () => {
        if (photo.status === "keep") {
          photo.status = photo.autoStatus && photo.autoStatus !== "keep" ? photo.autoStatus : "rejected";
          if (photo.status === "rejected") photo.reason = "rejected by you";
        } else {
          photo.autoStatus = photo.autoStatus || photo.status;
          photo.status = "keep";
        }
        renderReview();
      });
      thumbs.appendChild(button);
    });

    const words = node.querySelector(".words");
    const location = node.querySelector(".location");
    const category = node.querySelector(".category");
    const people = node.querySelector(".people");
    const title = node.querySelector(".title");
    const chips = node.querySelector(".kw-chips");
    const addKeyword = node.querySelector(".kw-add");
    const count = node.querySelector(".kw-count");
    addKeyword.placeholder = t("kwAdd");
    const renderKeywords = () => {
      chips.replaceChildren();
      group.keywords.forEach((word, index) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "kw-chip";
        chip.setAttribute("role", "listitem");
        chip.setAttribute("aria-label", t("kwRemove", word));
        chip.title = t("kwRemove", word);
        chip.textContent = `${word} ×`;
        chip.addEventListener("click", () => {
          group.keywords.splice(index, 1);
          renderKeywords();
        });
        chips.appendChild(chip);
      });
      count.textContent = t("kwCount", group.keywords.length);
    };
    const takeTyped = () => {
      const typed = addKeyword.value.split(",").map((word) => word.trim().toLowerCase()).filter(Boolean);
      if (!typed.length) return;
      typed.forEach((word) => {
        if (!group.keywords.includes(word) && group.keywords.length < 49) group.keywords.push(word);
      });
      addKeyword.value = "";
      renderKeywords();
    };
    addKeyword.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        takeTyped();
      }
    });
    addKeyword.addEventListener("input", () => {
      if (addKeyword.value.includes(",")) takeTyped();
    });
    addKeyword.addEventListener("blur", takeTyped);

    Object.entries(LOCATIONS).forEach(([key, value]) => {
      location.add(new Option(value.label || "-", key));
    });
    Object.entries(ADOBE_CATEGORIES).forEach(([key, value]) => {
      category.add(new Option(`${key} · ${value}`, key));
    });
    words.value = group.words;
    const wordsLabel = words.closest("label");
    if (group.autoWords) {
      const badge = document.createElement("span");
      badge.className = "ai-badge";
      badge.textContent = t("aiGuess");
      wordsLabel.querySelector("span").append(" ", badge);
    }
    if (group.guesses && group.guesses.length) {
      const chips = document.createElement("div");
      chips.className = "chips";
      chips.append(t("otherGuesses"), " ");
      group.guesses.forEach((guess) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = `+ ${guess}`;
        chip.addEventListener("click", () => {
          words.value = `${words.value} ${guess}`.trim();
          group.guesses = group.guesses.filter((item) => item !== guess);
          chip.remove();
          regenerate();
        });
        chips.appendChild(chip);
      });
      wordsLabel.after(chips);
    }
    location.value = group.locationKey;
    category.value = String(group.category);
    people.checked = group.people;
    title.value = group.title;
    renderKeywords();

    const regenerate = () => {
      group.words = words.value;
      group.autoWords = false;
      group.locationKey = location.value;
      group.people = people.checked;
      refreshMetadata(group);
      title.value = group.title;
      renderKeywords();
      category.value = String(group.category);
      updateExportStatus();
    };
    words.addEventListener("input", regenerate);
    location.addEventListener("change", regenerate);
    people.addEventListener("change", regenerate);
    category.addEventListener("change", () => {
      group.category = Number(category.value);
      group.manualCategory = true;
    });
    title.addEventListener("input", () => {
      group.title = title.value;
    });
    container.appendChild(node);
  });
  updateExportStatus();
}

function updateExportStatus() {
  const items = exportItems();
  const missing = state.groups.filter((group) => !group.words && group.photos.some((p) => p.status === "keep")).length;
  const problems = items.filter((item) => validateItem(item).length).length;
  let status = t("ready", items.length - problems);
  if (missing) status += " " + t("needWords", missing);
  $("#export-status").textContent = status;
  if (!$("#share-photos").hidden) updateShareLabel();
}

// ---------------------------------------------------------------- export

function download(name, content, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function readyItems() {
  return exportItems().filter((item) => validateItem(item).length === 0);
}

/** The photo file with its title and keywords written inside (XMP + IPTC), so stock sites fill them in. */
async function taggedFile(item) {
  const photo = state.photos.find((p) => p.name === item.file);
  try {
    const bytes = new Uint8Array(await photo.file.arrayBuffer());
    const tagged = embedXmp(bytes, { title: item.title, description: item.title, keywords: item.keywords });
    return new File([tagged], photo.name, { type: "image/jpeg", lastModified: photo.file.lastModified });
  } catch (error) {
    console.warn("could not embed words in", photo.name, error);
    return photo.file;
  }
}

async function saveToFolder() {
  const folder = await window.showDirectoryPicker({ mode: "readwrite" });
  const items = readyItems();
  for (const item of items) {
    const file = await taggedFile(item);
    const handle = await folder.getFileHandle(file.name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(file);
    await writable.close();
  }
  for (const [name, content] of [["adobe_stock.csv", adobeCsv(items)], ["shutterstock.csv", shutterstockCsv(items)]]) {
    const handle = await folder.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }
  $("#export-status").textContent = t("saved", items.length);
}

const SHARE_BATCH = 10;

/** Phone path: hand the keepers (words inside) to the share sheet, 10 at a time. */
async function shareKeepers() {
  const items = readyItems();
  if (!items.length) return;
  if (state.shareFrom >= items.length) state.shareFrom = 0;
  const batch = items.slice(state.shareFrom, state.shareFrom + SHARE_BATCH);
  const files = [];
  for (const item of batch) files.push(await taggedFile(item));
  await navigator.share({ files });
  state.shareFrom += batch.length;
  $("#export-status").textContent = t("shared", state.shareFrom);
  updateShareLabel();
}

function updateShareLabel() {
  const button = $("#share-photos");
  const total = readyItems().length;
  const from = state.shareFrom || 0;
  button.textContent = from > 0 && from < total
    ? t("shareNext", from + 1, Math.min(from + SHARE_BATCH, total), total)
    : t("sharePhotos");
}

/** Watermarked preview (long side 2000 px) for sending to a client before payment. */
async function proofFile(photo, name) {
  const bitmap = await createImageBitmap(photo.file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = makeCanvas(width, height);
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const label = name ? `${t("proofMark")} · ${name}` : t("proofMark");
  const size = Math.round(Math.max(width, height) / 22);
  context.font = `700 ${size}px system-ui, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 7);
  const step = size * 4;
  for (let y = -height; y <= height; y += step) {
    for (let x = -width; x <= width; x += context.measureText(label).width + size * 2) {
      context.fillStyle = "rgba(255,255,255,0.28)";
      context.fillText(label, x, y);
      context.fillStyle = "rgba(0,0,0,0.18)";
      context.fillText(label, x + 2, y + 2);
    }
  }
  context.restore();
  const blob = canvas.convertToBlob
    ? await canvas.convertToBlob({ type: "image/jpeg", quality: 0.8 })
    : await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  return new File([blob], `proof_${photo.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
}

async function makeProofs() {
  const name = $("#proof-name").value.trim();
  localStorage.setItem("jepret-proof-name", name);
  const keepers = state.photos.filter((photo) => photo.status === "keep");
  if (!keepers.length) return;
  const folder = "showDirectoryPicker" in window ? await window.showDirectoryPicker({ mode: "readwrite" }) : null;
  const files = [];
  for (let index = 0; index < keepers.length; index += 1) {
    $("#export-status").textContent = `${t("reading")} ${index + 1} ${t("of")} ${keepers.length}`;
    const file = await proofFile(keepers[index], name);
    if (folder) {
      const handle = await folder.getFileHandle(file.name, { create: true });
      const writable = await handle.createWritable();
      await writable.write(file);
      await writable.close();
    } else {
      files.push(file);
    }
  }
  if (!folder) {
    if (navigator.canShare && navigator.canShare({ files: files.slice(0, SHARE_BATCH) })) {
      await navigator.share({ files: files.slice(0, SHARE_BATCH) });
    } else {
      files.forEach((file) => download(file.name, file, "image/jpeg"));
    }
  }
  $("#export-status").textContent = t("proofsDone", keepers.length);
}

// ---------------------------------------------------------------- demo photos

async function demoFiles() {
  const scenes = [
    { name: "sunrise", sky: ["#f6b26b", "#e06666"], ground: "#274e6b" },
    { name: "market", sky: ["#93c47d", "#38761d"], ground: "#b45f06" },
  ];
  const files = [];
  let clock = Date.now() - 3 * 3600000;
  for (const [sceneIndex, scene] of scenes.entries()) {
    for (let frame = 0; frame < 4; frame += 1) {
      const small = sceneIndex === 1 && frame === 3;
      const width = small ? 1200 : 3000;
      const height = small ? 800 : 2000;
      const canvas = makeCanvas(width, height);
      const context = canvas.getContext("2d");
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, scene.sky[0]);
      gradient.addColorStop(1, scene.sky[1]);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      context.fillStyle = scene.ground;
      context.fillRect(0, height * 0.62, width, height * 0.38);
      const offset = frame === 1 ? 6 : frame * 140;
      if (frame === 3) {
        context.fillStyle = scene.ground;
        context.fillRect(0, 0, width * 0.35, height);
      }
      for (let i = 0; i < 260; i += 1) {
        const x = (i * 97 + offset) % width;
        const y = height * 0.62 + ((i * 53) % (height * 0.36));
        context.fillStyle = i % 2 ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)";
        context.fillRect(x, y, 10 + (i % 7) * 6, 4 + (i % 5) * 3);
      }
      context.fillStyle = "#fff6d5";
      context.beginPath();
      context.arc(width * 0.7, height * 0.3, height * 0.08, 0, Math.PI * 2);
      context.fill();
      if (frame === 2) {
        const blurred = makeCanvas(width, height);
        const blurredContext = blurred.getContext("2d");
        blurredContext.filter = "blur(18px)";
        blurredContext.drawImage(canvas, 0, 0);
        context.drawImage(blurred, 0, 0);
      }
      const blob = canvas.convertToBlob
        ? await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 })
        : await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      clock += frame === 0 && sceneIndex > 0 ? 45 * 60000 : 20000;
      files.push(new File([blob], `DSC0${sceneIndex}${frame}01.JPG`, { type: "image/jpeg", lastModified: clock }));
    }
  }
  return files;
}

// ---------------------------------------------------------------- wiring

function renderShotList() {
  const container = $("#shots");
  SHOT_LIST.forEach((block) => {
    const heading = document.createElement("h4");
    heading.textContent = block.when;
    const list = document.createElement("ul");
    block.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    container.append(heading, list);
  });
}

async function runDemo() {
  await processFiles(await demoFiles(), { autoFill: false });
  if (state.groups[0]) {
    state.groups[0].words = "sunrise beach";
    state.groups[0].locationKey = "batam";
    refreshMetadata(state.groups[0]);
  }
  if (state.groups[1]) {
    state.groups[1].words = "night market street food";
    state.groups[1].locationKey = "batam";
    refreshMetadata(state.groups[1]);
  }
  renderReview();
  if (new URLSearchParams(location.search).has("report")) {
    const items = readyItems();
    await fetch("/report", {
      method: "POST",
      body: JSON.stringify({
        summary: $("#summary").textContent,
        exportStatus: $("#export-status").textContent,
        photos: state.photos.map((photo) => ({
          name: photo.name, status: photo.status, reason: photo.reason,
          megapixels: Number(photo.megapixels.toFixed(1)), sharpness: Math.round(photo.sharpness),
        })),
        groups: state.groups.map((group) => ({ title: group.title, category: group.category, keywords: group.keywords })),
        adobeCsv: adobeCsv(items),
        shutterstockCsv: shutterstockCsv(items),
        embedded: await (async () => {
          const { readXmp, readIptc } = await import("./core.js");
          if (!items.length) return null;
          const bytes = new Uint8Array(await (await taggedFile(items[0])).arrayBuffer());
          return { xmp: readXmp(bytes), iptc: readIptc(bytes) };
        })(),
      }),
    });
  }
}

// Installable app: offline cache + "Install app" button where the browser supports it.
function initInstall() {
  const isWeb = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (isWeb && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((error) => console.warn("service worker", error));
  }
  let deferredPrompt = null;
  const button = $("#install");
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    button.hidden = false;
  });
  button.addEventListener("click", async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    button.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    button.hidden = true;
  });
}

function init() {
  initSettings();
  initInstall();
  renderShotList();
  $("#picker").addEventListener("change", (event) => processFiles(event.target.files));
  $("#picker-photos").addEventListener("change", (event) => processFiles(event.target.files));
  if (window.matchMedia("(pointer: coarse)").matches) {
    $("#folder-label").hidden = true;
  }
  $("#demo").addEventListener("click", runDemo);
  const autoFill = $("#fill-auto");
  autoFill.checked = localStorage.getItem("jepret-autowords") === "1";
  autoFill.addEventListener("change", () => {
    localStorage.setItem("jepret-autowords", autoFill.checked ? "1" : "0");
  });
  $("#fill-words").addEventListener("click", () => fillWords());
  $("#earn-jump").addEventListener("click", () => {
    $("#earn-panel details").open = true;
  });
  $("#proof-name").value = localStorage.getItem("jepret-proof-name") || "";
  $("#make-proofs").addEventListener("click", () => {
    makeProofs().catch((error) => {
      console.warn(error);
      if (error.name !== "AbortError") $("#export-status").textContent = t("saveFailed");
    });
  });
  // Phones (no folder access): the share sheet hands the photos to Drive, WhatsApp or a stock app.
  const canShareFiles = navigator.canShare && navigator.canShare({ files: [new File(["x"], "x.jpg", { type: "image/jpeg" })] });
  if (canShareFiles && !("showDirectoryPicker" in window)) {
    $("#share-photos").hidden = false;
    $("#share-photos").addEventListener("click", () => {
      shareKeepers().catch((error) => {
        console.warn(error);
        if (error.name !== "AbortError") $("#export-status").textContent = t("saveFailed");
      });
    });
  }
  $("#dl-adobe").addEventListener("click", () => download("adobe_stock.csv", adobeCsv(readyItems())));
  $("#dl-shutter").addEventListener("click", () => download("shutterstock.csv", shutterstockCsv(readyItems())));
  $("#dl-list").addEventListener("click", () => {
    const lines = state.photos.map((photo) => `${photo.status}\t${photo.name}\t${photo.reason || ""}`);
    download("jepret_list.txt", lines.join("\r\n"), "text/plain;charset=utf-8");
  });
  if ("showDirectoryPicker" in window) {
    // One obvious main action where the browser can write a folder; single files stay as a fallback.
    $("#save-folder").hidden = false;
    $("#export-or").hidden = false;
    $("#dl-adobe").className = "secondary";
    $("#save-folder").addEventListener("click", () => {
    $("#export-status").textContent = t("saveHint");
    saveToFolder().catch((error) => {
      console.warn(error);
      updateExportStatus();
      if (error.name !== "AbortError") $("#export-status").textContent = t("saveFailed");
    });
  });
  }
  if (new URLSearchParams(location.search).has("demo")) runDemo();
  window.__jepret = { state, exportItems, readyItems, adobeCsv, shutterstockCsv, taggedFile, proofFile, fillWords };
}

init();
