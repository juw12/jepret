import {
  ADOBE_CATEGORIES, adobeCsv, buildMetadata, colourWords, differenceHash, groupByTime,
  judge, sharpness, shutterstockCsv, toGray, validateItem,
} from "./core.js";
import { DICTIONARY, LOCATIONS, SHOT_LIST } from "./vocab.js";

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
    headline: "Camera sitting idle? SD card in, stock upload files out.",
    lead: "Jepret removes blurry and duplicate shots, writes titles and keywords, and makes the CSV files Adobe Stock and Shutterstock ask for.",
    pick: "Choose SD card folder", demo: "Try with demo photos", install: "Install app",
    getapp: "Get the app:", getwin: "Windows (Jepret.exe)",
    getphone: "Phone: open this page in Chrome, then menu › Add to Home screen",
    s1: "Pick the DCIM folder on your card", s2: "Check the picks, type 3-5 words per scene",
    s3: "Download the CSV, upload photos + CSV to the stock site",
    honest: "Honest note: AI images flooded stock sites and earnings per photo fell. Jepret does not promise passive income; it removes the boring part so testing stock costs you little time.",
    exportTitle: "Export", keepList: "Keeper list", saveFolder: "Copy keepers + CSV to a folder",
    shotTitle: "Shot list: what to shoot this week", privacy: "Nothing is uploaded. All analysis runs in this browser tab.",
    describe: "Describe the scene (3-5 words)", location: "Location", category: "Adobe category",
    people: "Recognisable people in these photos (marks them editorial)", title: "Title", keywords: "Keywords",
    reading: "Reading photo", of: "of", scene: "Scene", photos: "photos", kept: "kept",
    keep: "keep", blurry: "blurry", duplicate: "duplicate", small: "too small", rejected: "rejected",
    summary: (k, r, g) => `${k} keepers, ${r} rejected, ${g} scenes. Click a photo to keep or reject it.`,
    ready: (n) => `${n} photos ready to export.`, needWords: (n) => `${n} scene(s) still need a description.`,
    none: "No JPG photos found in that folder.", kwCount: (n) => `${n} / 49 keywords`,
  },
  id: {
    eyebrow: "Gratis · open source · foto tetap di komputermu",
    headline: "Kamera nganggur? Masukkan SD card, keluar file siap upload ke stock.",
    lead: "Jepret membuang foto blur dan dobel, menulis judul dan kata kunci, dan membuat file CSV yang diminta Adobe Stock dan Shutterstock.",
    pick: "Pilih folder SD card", demo: "Coba dengan foto demo", install: "Pasang aplikasi",
    getapp: "Unduh aplikasi:", getwin: "Windows (Jepret.exe)",
    getphone: "HP: buka halaman ini di Chrome, lalu menu › Tambahkan ke layar utama",
    s1: "Pilih folder DCIM di kartu", s2: "Cek pilihan, ketik 3-5 kata per adegan",
    s3: "Unduh CSV, upload foto + CSV ke situs stock",
    honest: "Jujur saja: gambar AI membanjiri situs stock dan penghasilan per foto turun. Jepret tidak menjanjikan passive income; ia menghapus bagian membosankan supaya mencoba stock tidak makan banyak waktu.",
    exportTitle: "Ekspor", keepList: "Daftar foto terpilih", saveFolder: "Salin foto terpilih + CSV ke folder",
    shotTitle: "Daftar foto: apa yang difoto minggu ini", privacy: "Tidak ada yang diunggah. Semua analisis berjalan di tab browser ini.",
    describe: "Jelaskan adegan (3-5 kata)", location: "Lokasi", category: "Kategori Adobe",
    people: "Ada orang yang bisa dikenali (ditandai editorial)", title: "Judul", keywords: "Kata kunci",
    reading: "Membaca foto", of: "dari", scene: "Adegan", photos: "foto", kept: "dipilih",
    keep: "simpan", blurry: "blur", duplicate: "dobel", small: "terlalu kecil", rejected: "dibuang",
    summary: (k, r, g) => `${k} dipilih, ${r} dibuang, ${g} adegan. Klik foto untuk simpan atau buang.`,
    ready: (n) => `${n} foto siap diekspor.`, needWords: (n) => `${n} adegan masih perlu deskripsi.`,
    none: "Tidak ada foto JPG di folder itu.", kwCount: (n) => `${n} / 49 kata kunci`,
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
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, 800 / Math.max(width, height));
  const w = Math.max(16, Math.round(width * scale));
  const h = Math.max(16, Math.round(height * scale));
  const canvas = makeCanvas(w, h);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0, w, h);
  const pixels = context.getImageData(0, 0, w, h).data;
  const gray = toGray(pixels, w, h);
  const sharp = sharpness(gray, w, h);

  const tiny = makeCanvas(9, 8);
  const tinyContext = tiny.getContext("2d", { willReadFrequently: true });
  tinyContext.drawImage(bitmap, 0, 0, 9, 8);
  const hash = differenceHash(toGray(tinyContext.getImageData(0, 0, 9, 8).data, 9, 8));

  const thumbScale = 360 / Math.max(width, height);
  const thumb = makeCanvas(Math.round(width * thumbScale), Math.round(height * thumbScale));
  thumb.getContext("2d").drawImage(bitmap, 0, 0, thumb.width, thumb.height);
  bitmap.close();

  return {
    name: file.name,
    file,
    time: file.lastModified,
    width,
    height,
    megapixels: (width * height) / 1e6,
    sharpness: sharp.score,
    copySpace: sharp.flatShare >= 0.3,
    orientation: width > height * 1.05 ? "horizontal" : height > width * 1.05 ? "vertical" : "square",
    colours: colourWords(pixels),
    hash,
    thumbUrl: await canvasToUrl(thumb),
  };
}

async function processFiles(fileList) {
  const files = [...fileList].filter((file) => /\.jpe?g$/i.test(file.name));
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
  $("#progress").hidden = true;
  $("#review").hidden = false;
  renderReview();
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
      `${new Date(group.start).toLocaleString()} · ${group.photos.length} ${t("photos")} · ${keptCount} ${t("kept")}`;

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
    const keywords = node.querySelector(".keywords");
    const count = node.querySelector(".kw-count");

    Object.entries(LOCATIONS).forEach(([key, value]) => {
      location.add(new Option(value.label || "-", key));
    });
    Object.entries(ADOBE_CATEGORIES).forEach(([key, value]) => {
      category.add(new Option(`${key} · ${value}`, key));
    });
    words.value = group.words;
    location.value = group.locationKey;
    category.value = String(group.category);
    people.checked = group.people;
    title.value = group.title;
    keywords.value = group.keywords.join(", ");
    count.textContent = t("kwCount", group.keywords.length);

    const regenerate = () => {
      group.words = words.value;
      group.locationKey = location.value;
      group.people = people.checked;
      refreshMetadata(group);
      title.value = group.title;
      keywords.value = group.keywords.join(", ");
      category.value = String(group.category);
      count.textContent = t("kwCount", group.keywords.length);
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
    keywords.addEventListener("input", () => {
      group.keywords = keywords.value.split(",").map((word) => word.trim().toLowerCase()).filter(Boolean).slice(0, 49);
      count.textContent = t("kwCount", group.keywords.length);
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

async function saveToFolder() {
  const folder = await window.showDirectoryPicker({ mode: "readwrite" });
  const items = readyItems();
  for (const item of items) {
    const photo = state.photos.find((p) => p.name === item.file);
    const handle = await folder.getFileHandle(photo.name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(photo.file);
    await writable.close();
  }
  for (const [name, content] of [["adobe_stock.csv", adobeCsv(items)], ["shutterstock.csv", shutterstockCsv(items)]]) {
    const handle = await folder.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  }
  $("#export-status").textContent = `${items.length} photos + 2 CSV files saved.`;
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
  await processFiles(await demoFiles());
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
  $("#demo").addEventListener("click", runDemo);
  $("#dl-adobe").addEventListener("click", () => download("adobe_stock.csv", adobeCsv(readyItems())));
  $("#dl-shutter").addEventListener("click", () => download("shutterstock.csv", shutterstockCsv(readyItems())));
  $("#dl-list").addEventListener("click", () => {
    const lines = state.photos.map((photo) => `${photo.status}\t${photo.name}\t${photo.reason || ""}`);
    download("jepret_list.txt", lines.join("\r\n"), "text/plain;charset=utf-8");
  });
  if ("showDirectoryPicker" in window) {
    $("#save-folder").hidden = false;
    $("#save-folder").addEventListener("click", () => saveToFolder().catch((error) => console.warn(error)));
  }
  if (new URLSearchParams(location.search).has("demo")) runDemo();
  window.__jepret = { state, exportItems, readyItems, adobeCsv, shutterstockCsv };
}

init();
