// "Sell face to face": tools for selling photos in person at a spot (bridge, beach, park, car-free day).
// Everything runs on the phone and is stored in localStorage, so it works with no signal:
// a big bilingual price sign to show people, your QRIS image, a sales counter for the day,
// and a WhatsApp hand-off that keeps the buyer's number for repeat work.

const STORAGE_KEY = "jepret-onspot-v1";

const DEFAULTS = {
  price: 25000,
  bundleQty: 3,
  bundlePrice: 60000,
  name: "",
  spot: "",
  qris: "",
  sales: [],
};

export const ONSPOT = {
  en: {
    title: "Sell face to face (on the spot)",
    intro: "Stand at a busy spot, offer a photo, show it on the camera screen, take cash or QRIS, and send it to their phone there and then. Street photographers sell single photos for about Rp 9,000 - 100,000; set your own price below. Works without signal.",
    setupTitle: "1. Your price and sign",
    price: "Price per photo (Rp)",
    bundleQty: "Bundle: number of photos",
    bundlePrice: "Bundle price (Rp)",
    name: "Your name or Instagram",
    spot: "Where you are today",
    qris: "Your QRIS image (from your bank or e-wallet app)",
    qrisSaved: "QRIS saved on this phone.",
    qrisRemove: "Remove QRIS",
    showSign: "Show price sign to customer",
    closeSign: "Close",
    signHint: "Tap anywhere to close",
    tallyTitle: "2. Sales today",
    qty: "Photos sold",
    addCash: "+ Cash",
    addQris: "+ QRIS",
    undo: "Undo last",
    exportCsv: "Download sales (CSV)",
    today: (count, photos, total, cash, qris) =>
      `${count} sale${count === 1 ? "" : "s"}, ${photos} photo${photos === 1 ? "" : "s"}: ${total} (cash ${cash}, QRIS ${qris})`,
    nothingYet: "No sales yet today.",
    sendTitle: "3. Send photos and keep the customer",
    phone: "Customer's WhatsApp number",
    sendWa: "Open their WhatsApp chat",
    sendHint: "Move the photos to your phone first: on the a6400 use Send to Smartphone with Imaging Edge Mobile or Creators' App, then attach them in the chat. Saving the number lets you offer graduation, family or event shoots later.",
    thanks: ({ spot, name }) =>
      `Hi! Thank you for taking photos with me${spot ? ` at ${spot}` : ""} today. Here are your photos. If you ever need graduation, family or event photos, just message me here.${name ? ` - ${name}` : ""}`,
    pitchTitle: "What to say (and how to stay welcome)",
    pitch: [
      "Open with a sample, not a price: show the camera screen with a good shot of the spot and say \"Want one like this of you? I send it straight to your phone.\"",
      "Shoot 3-5 frames, show them on the camera screen, and let them choose. They pay only for the ones they want.",
      "Show the price sign and your QRIS, take payment, then send the photos while they are still there.",
      "Ask before you shoot. Leave people alone after one \"no\", and never photograph children without a parent saying yes.",
      "Some places (malls, private parks, hotel grounds) need permission from the manager. Public spots usually don't, but be polite to security and other sellers.",
    ],
    spotsTitle: "Busy spots in Batam to try",
    spots: "Barelang Bridge at sunset; the Welcome to Batam sign at Bukit Clara; Engku Putri square during car-free day on Sunday morning; Ocarina and Coastarina beachfront on weekends; Harbour Bay and the ferry terminals where Singapore visitors arrive; the big mosques and Nagoya on holidays.",
  },
  id: {
    title: "Jual langsung di tempat (tatap muka)",
    intro: "Berdiri di tempat ramai, tawarkan foto, tunjukkan hasilnya di layar kamera, terima tunai atau QRIS, dan kirim ke HP mereka saat itu juga. Fotografer jalanan menjual satu foto sekitar Rp 9.000 - 100.000; atur harga sendiri di bawah. Bisa dipakai tanpa sinyal.",
    setupTitle: "1. Harga dan papan harga",
    price: "Harga per foto (Rp)",
    bundleQty: "Paket: jumlah foto",
    bundlePrice: "Harga paket (Rp)",
    name: "Nama atau Instagram kamu",
    spot: "Lokasi hari ini",
    qris: "Gambar QRIS kamu (dari aplikasi bank atau e-wallet)",
    qrisSaved: "QRIS tersimpan di HP ini.",
    qrisRemove: "Hapus QRIS",
    showSign: "Tampilkan papan harga ke pelanggan",
    closeSign: "Tutup",
    signHint: "Ketuk di mana saja untuk menutup",
    tallyTitle: "2. Penjualan hari ini",
    qty: "Jumlah foto terjual",
    addCash: "+ Tunai",
    addQris: "+ QRIS",
    undo: "Batalkan terakhir",
    exportCsv: "Unduh penjualan (CSV)",
    today: (count, photos, total, cash, qris) =>
      `${count} penjualan, ${photos} foto: ${total} (tunai ${cash}, QRIS ${qris})`,
    nothingYet: "Belum ada penjualan hari ini.",
    sendTitle: "3. Kirim foto dan simpan pelanggan",
    phone: "Nomor WhatsApp pelanggan",
    sendWa: "Buka chat WhatsApp-nya",
    sendHint: "Pindahkan foto ke HP dulu: di a6400 pakai Send to Smartphone dengan Imaging Edge Mobile atau Creators' App, lalu lampirkan di chat. Dengan menyimpan nomornya, kamu bisa menawarkan foto wisuda, keluarga atau acara nanti.",
    thanks: ({ spot, name }) =>
      `Halo! Terima kasih sudah foto bersama saya${spot ? ` di ${spot}` : ""} hari ini. Ini foto-foto Anda. Kalau nanti butuh foto wisuda, keluarga atau acara, kabari saya di sini ya.${name ? ` - ${name}` : ""}`,
    pitchTitle: "Apa yang diucapkan (dan supaya tetap diterima)",
    pitch: [
      "Buka dengan contoh, bukan harga: tunjukkan layar kamera berisi foto bagus tempat itu dan bilang \"Mau difoto seperti ini? Langsung saya kirim ke HP.\"",
      "Ambil 3-5 foto, tunjukkan di layar kamera, biarkan mereka memilih. Mereka hanya bayar yang mereka mau.",
      "Tunjukkan papan harga dan QRIS, terima pembayaran, lalu kirim foto selagi mereka masih di situ.",
      "Minta izin sebelum memotret. Jangan memaksa setelah satu kali \"tidak\", dan jangan memotret anak tanpa izin orang tuanya.",
      "Beberapa tempat (mal, taman swasta, area hotel) perlu izin pengelola. Tempat umum biasanya tidak, tapi tetap sopan ke satpam dan pedagang lain.",
    ],
    spotsTitle: "Tempat ramai di Batam untuk dicoba",
    spots: "Jembatan Barelang saat sunset; tulisan Welcome to Batam di Bukit Clara; Dataran Engku Putri saat car free day Minggu pagi; tepi pantai Ocarina dan Coastarina di akhir pekan; Harbour Bay dan terminal feri tempat turis Singapura datang; masjid-masjid besar dan Nagoya saat hari libur.",
  },
};

/** "Rp 25.000" with Indonesian separators. */
export function rupiah(amount) {
  return `Rp ${Math.max(0, Math.round(Number(amount) || 0)).toLocaleString("id-ID")}`;
}

/** Price for a number of photos: as many bundles as fit, the rest at the single price. */
export function priceFor(qty, settings = DEFAULTS) {
  const photos = Math.max(0, Math.floor(Number(qty) || 0));
  const single = Math.max(0, Number(settings.price) || 0);
  const bundleQty = Math.max(0, Math.floor(Number(settings.bundleQty) || 0));
  const bundlePrice = Math.max(0, Number(settings.bundlePrice) || 0);
  if (bundleQty < 2 || bundlePrice <= 0) return photos * single;
  const bundles = Math.floor(photos / bundleQty);
  return bundles * bundlePrice + (photos - bundles * bundleQty) * single;
}

/** Indonesian mobile number to wa.me form: "0812-3456 789" -> "628123456789". Empty if it can't be a number. */
export function normalizePhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return digits.length >= 9 && digits.length <= 15 ? digits : "";
}

function todayKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch (error) {
    return { ...DEFAULTS };
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn("onspot save", error);
    return false;
  }
}

/** Shrink the QRIS picture so it fits in localStorage but stays sharp enough to scan. */
function readQris(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const picture = new Image();
    picture.onload = () => {
      const scale = Math.min(1, 900 / Math.max(picture.width, picture.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(picture.width * scale);
      canvas.height = Math.round(picture.height * scale);
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;
      context.drawImage(picture, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    picture.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("not an image"));
    };
    picture.src = url;
  });
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function field(labelText, input) {
  const label = element("label");
  label.append(element("span", "", labelText), input);
  return label;
}

function numberInput(name, value, step) {
  const input = element("input", `onspot-${name}`);
  input.type = "number";
  input.min = "0";
  input.step = step;
  input.inputMode = "numeric";
  input.value = String(value);
  return input;
}

/** Full-screen bilingual sign: big enough to read at arm's length in sunlight. */
function openSign(data, text) {
  const overlay = element("div", "onspot-sign");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.tabIndex = -1;
  const lines = [
    ["sign-title", "Foto kamera profesional"],
    ["sign-sub", "Professional camera photos"],
  ];
  if (Number(data.bundleQty) >= 2 && Number(data.bundlePrice) > 0) {
    lines.push(["sign-bundle", `${data.bundleQty} foto ${rupiah(data.bundlePrice)}`]);
  }
  lines.push(["sign-sub", "Langsung dikirim ke HP Anda · Sent straight to your phone"]);
  lines.push(["sign-sub", "Pilih dulu, bayar yang Anda suka · Choose first, pay for the ones you like"]);
  const price = element("p", "sign-price", rupiah(data.price));
  price.appendChild(element("span", "sign-unit", " / foto"));
  lines.forEach(([className, value], index) => {
    overlay.appendChild(element("p", className, value));
    if (index === 1) overlay.appendChild(price);
  });
  if (data.qris) {
    const qris = element("img", "sign-qris");
    qris.src = data.qris;
    qris.alt = "QRIS";
    overlay.appendChild(qris);
  }
  if (data.name) overlay.appendChild(element("p", "sign-name", data.name));
  overlay.appendChild(element("p", "sign-hint", text.signHint));
  const close = () => {
    document.removeEventListener("keydown", onKey);
    overlay.remove();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.appendChild(overlay);
  overlay.focus();
  if (overlay.requestFullscreen) overlay.requestFullscreen().catch(() => {});
}

/** Render the face-to-face selling tools into a container. */
export function renderOnSpot(container, lang) {
  const text = ONSPOT[lang] || ONSPOT.en;
  const data = load();
  container.replaceChildren();
  container.classList.add("onspot");

  container.appendChild(element("h4", "", text.title));
  container.appendChild(element("p", "muted", text.intro));

  // 1. Price and sign
  const setup = element("div", "onspot-block");
  setup.appendChild(element("h5", "", text.setupTitle));
  const grid = element("div", "onspot-fields");
  const priceInput = numberInput("price", data.price, "1000");
  const bundleQtyInput = numberInput("bundle-qty", data.bundleQty, "1");
  const bundlePriceInput = numberInput("bundle-price", data.bundlePrice, "1000");
  const nameInput = element("input", "onspot-name");
  nameInput.value = data.name;
  const spotInput = element("input", "onspot-spot");
  spotInput.value = data.spot;
  grid.append(
    field(text.price, priceInput),
    field(text.bundleQty, bundleQtyInput),
    field(text.bundlePrice, bundlePriceInput),
    field(text.name, nameInput),
    field(text.spot, spotInput),
  );
  const qrisInput = element("input", "onspot-qris");
  qrisInput.type = "file";
  qrisInput.accept = "image/*";
  const qrisStatus = element("p", "muted onspot-qris-status");
  const qrisRemove = element("button", "secondary", text.qrisRemove);
  qrisRemove.type = "button";
  const showQrisState = () => {
    qrisStatus.textContent = data.qris ? text.qrisSaved : "";
    qrisRemove.hidden = !data.qris;
  };
  qrisInput.addEventListener("change", async () => {
    const file = qrisInput.files && qrisInput.files[0];
    if (!file) return;
    try {
      data.qris = await readQris(file);
      if (!save(data)) data.qris = "";
    } catch (error) {
      console.warn("qris", error);
    }
    qrisInput.value = "";
    showQrisState();
  });
  qrisRemove.addEventListener("click", () => {
    data.qris = "";
    save(data);
    showQrisState();
  });
  const showSign = element("button", "primary onspot-show-sign", text.showSign);
  showSign.type = "button";
  showSign.addEventListener("click", () => openSign(data, text));
  setup.append(grid, field(text.qris, qrisInput), qrisStatus, qrisRemove, showSign);
  showQrisState();

  // 2. Sales today
  const tally = element("div", "onspot-block");
  tally.appendChild(element("h5", "", text.tallyTitle));
  const qtyInput = numberInput("qty", 1, "1");
  qtyInput.min = "1";
  const amountPreview = element("span", "onspot-amount");
  const qtyRow = element("div", "onspot-row");
  qtyRow.append(field(text.qty, qtyInput), amountPreview);
  const buttons = element("div", "cta");
  const addCash = element("button", "primary onspot-add-cash", text.addCash);
  const addQris = element("button", "primary onspot-add-qris", text.addQris);
  const undo = element("button", "secondary onspot-undo", text.undo);
  const exportCsv = element("button", "secondary onspot-export", text.exportCsv);
  [addCash, addQris, undo, exportCsv].forEach((button) => {
    button.type = "button";
  });
  buttons.append(addCash, addQris, undo, exportCsv);
  const summary = element("p", "onspot-summary");
  summary.setAttribute("aria-live", "polite");
  tally.append(qtyRow, buttons, summary);

  const todaysSales = () => data.sales.filter((sale) => sale.day === todayKey());
  const refresh = () => {
    amountPreview.textContent = rupiah(priceFor(qtyInput.value, data));
    const sales = todaysSales();
    if (!sales.length) {
      summary.textContent = text.nothingYet;
    } else {
      const sum = (method) => sales.filter((sale) => !method || sale.method === method).reduce((total, sale) => total + sale.amount, 0);
      const photos = sales.reduce((total, sale) => total + sale.qty, 0);
      summary.textContent = text.today(sales.length, photos, rupiah(sum()), rupiah(sum("cash")), rupiah(sum("qris")));
    }
    undo.disabled = !sales.length;
    exportCsv.disabled = !sales.length;
  };
  const addSale = (method) => {
    const qty = Math.max(1, Math.floor(Number(qtyInput.value) || 1));
    data.sales.push({ day: todayKey(), time: new Date().toTimeString().slice(0, 5), qty, amount: priceFor(qty, data), method, spot: data.spot });
    save(data);
    qtyInput.value = "1";
    refresh();
  };
  addCash.addEventListener("click", () => addSale("cash"));
  addQris.addEventListener("click", () => addSale("qris"));
  undo.addEventListener("click", () => {
    const sales = todaysSales();
    if (!sales.length) return;
    data.sales.splice(data.sales.lastIndexOf(sales[sales.length - 1]), 1);
    save(data);
    refresh();
  });
  exportCsv.addEventListener("click", () => {
    const rows = [["date", "time", "spot", "photos", "amount_rp", "payment"]];
    todaysSales().forEach((sale) => rows.push([sale.day, sale.time, sale.spot || "", sale.qty, sale.amount, sale.method]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const link = element("a");
    link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv" }));
    link.download = `jepret_sales_${todayKey()}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 1000);
  });

  // Settings are saved as they are typed, and the amount preview follows.
  const settingsInputs = [
    [priceInput, "price", Number],
    [bundleQtyInput, "bundleQty", Number],
    [bundlePriceInput, "bundlePrice", Number],
    [nameInput, "name", String],
    [spotInput, "spot", String],
  ];
  settingsInputs.forEach(([input, key, cast]) => {
    input.addEventListener("input", () => {
      data[key] = cast === Number ? Math.max(0, Number(input.value) || 0) : input.value.trim();
      save(data);
      refresh();
      updateWa();
    });
  });
  qtyInput.addEventListener("input", refresh);

  // 3. Send and keep the customer
  const send = element("div", "onspot-block");
  send.appendChild(element("h5", "", text.sendTitle));
  const phoneInput = element("input", "onspot-phone");
  phoneInput.type = "tel";
  phoneInput.inputMode = "tel";
  phoneInput.placeholder = "0812 3456 7890";
  const waLink = element("a", "secondary button-link onspot-wa", text.sendWa);
  waLink.target = "_blank";
  waLink.rel = "noopener";
  const updateWa = () => {
    const number = normalizePhone(phoneInput.value);
    const message = text.thanks({ spot: data.spot, name: data.name });
    waLink.href = number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : "#";
    waLink.setAttribute("aria-disabled", number ? "false" : "true");
    waLink.classList.toggle("disabled", !number);
  };
  waLink.addEventListener("click", (event) => {
    if (!normalizePhone(phoneInput.value)) event.preventDefault();
  });
  phoneInput.addEventListener("input", updateWa);
  send.append(field(text.phone, phoneInput), waLink, element("p", "muted", text.sendHint));

  // How to pitch, and where
  const pitch = element("details", "onspot-pitch");
  pitch.appendChild(element("summary", "", text.pitchTitle));
  const list = element("ol");
  text.pitch.forEach((line) => list.appendChild(element("li", "", line)));
  pitch.append(list, element("h5", "", text.spotsTitle), element("p", "", text.spots));

  container.append(setup, tally, send, pitch);
  refresh();
  updateWa();
}
