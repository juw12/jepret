// "Earn offline with your camera": local paid gigs an a6400 owner in Indonesia can take on.
// Rates are ranges seen in Indonesian photographer listings and price lists (2024-25), not promises.
// Each gig has a ready WhatsApp message so the first offer takes one tap, and most have quote
// defaults so the quote maker can turn a "yes" into a clear price with a deposit (DP).

export const EARN = {
  en: {
    title: "Earn offline with your camera",
    intro: "Stock pays little per photo now. Local clients pay per job, and the same camera is enough. Below are 11 ways to earn in person, then a quote maker for when someone says yes. Rates are ranges from Indonesian listings (2024-25); check what people charge in your area.",
    copy: "Copy message",
    copied: "Copied",
    whatsapp: "Open in WhatsApp",
    rateLabel: "Typical rate",
    gearLabel: "a6400 setup",
    jepretLabel: "How Jepret helps",
    quoteThis: "Make a quote",
    quote: {
      title: "Quote maker",
      intro: "When a client says yes, send one clear message with the price, the deposit (DP) and when they get the photos. A 50 % DP protects you if they cancel.",
      client: "Client name",
      service: "Job",
      date: "Date",
      price: "Price (Rp)",
      deposit: "Deposit (%)",
      days: "Days to deliver",
      yourName: "Your name",
      dateLater: "to be agreed",
      clientFallback: "there",
      serviceFallback: "photo session",
      sameDay: "on the day of the shoot",
      afterDays: (days) => `photos ready ${days} day${days === 1 ? "" : "s"} after the shoot`,
      message: ({ client, by, service, date, price, deposit, depositAmount, rest, delivery }) =>
        `Hi ${client}! Here is my quote${by}:\n` +
        `- Job: ${service}\n` +
        `- Date: ${date}\n` +
        `- Price: ${price}\n` +
        `- Deposit to book (DP ${deposit}%): ${depositAmount}; the rest (${rest}) on delivery\n` +
        `- Delivery: ${delivery}\n` +
        `Reply OK and I'll send the payment details. Thank you!`,
    },
    gigs: [
      {
        name: "Product photos for online sellers",
        who: "Shopee, Tokopedia and TikTok Shop sellers, home businesses, UMKM",
        rate: "Rp 50,000 - 500,000 per photo; packages from about Rp 299,000 for 10 photos",
        gear: "Tripod, ISO 100, f/8, 2 s timer. White card or paper as background, window light from the side, white card on the other side to fill shadows.",
        jepret: "Culls the set, then Client proofs makes watermarked previews to send before payment.",
        message: "Hi! I'm a photographer in {city}. I shoot clean product photos for online shops (white background or lifestyle). Intro price: 10 photos for Rp 299,000, edited and ready for Shopee/Tokopedia. Can I send a few examples?",
        quote: { price: 299000, days: 3 },
      },
      {
        name: "Menu photos for food delivery apps",
        who: "Warung, cafés and home kitchens on GoFood, GrabFood and ShopeeFood",
        rate: "Rp 500,000 - 1,200,000 per session (about 10-20 dishes)",
        gear: "Shoot near a window before the lunch rush, 45° or straight-down angle, f/4-5.6, tripod. Wipe plates, add steam or a sauce drizzle last.",
        jepret: "Burst duplicates are removed, so you pick one best frame per dish fast; proofs go to the owner the same day.",
        message: "Hi! I noticed {business} on GoFood. Better menu photos usually get more orders. I can shoot your menu at your place in about 2 hours, Rp 750,000 for up to 15 dishes, photos ready the next day. Interested?",
        quote: { price: 750000, days: 1 },
      },
      {
        name: "Graduation and portrait sessions",
        who: "Wisuda students, families, couples, job-application headshots",
        rate: "Rp 300,000 - 3,000,000 per session, depending on hours and number of edited photos",
        gear: "Real-time Eye AF on, aperture as wide as the lens allows, shade or golden hour. Kit lens works; a cheap 50 mm f/1.8 helps a lot.",
        jepret: "Blurry and blinking frames drop out; watermarked proofs let the client choose favourites before you edit.",
        message: "Hi! Graduation coming up? I offer wisuda photo sessions around campus: 1 hour, 20 edited photos, Rp 450,000. Weekends available. Want to see my samples?",
        quote: { price: 450000, days: 3 },
      },
      {
        name: "Small events",
        who: "Birthdays, aqiqah, engagement (lamaran), office gatherings, church and community events",
        rate: "Rp 500,000 - 3,000,000 per hour in listings; small private events often go for a flat half-day price",
        gear: "Shutter 1/125 s or faster, auto ISO up to 6400, continuous AF. Bring a spare battery (NP-FW50) and a second SD card.",
        jepret: "A 500-shot card becomes a short list in minutes: duplicates and blurry shots are gone before you start editing.",
        message: "Hi! I photograph small events (birthdays, aqiqah, lamaran, office events) in {city}. 3 hours of coverage with 100+ edited photos for Rp 1,200,000. Is your date still open?",
        quote: { price: 1200000, days: 3 },
      },
      {
        name: "Kos, room and property listings",
        who: "Kos owners, rental agents, homestays and Airbnb hosts",
        rate: "No published rates found. Our guess: Rp 150,000 - 300,000 per room or unit. Treat this as an assumption and ask locally.",
        gear: "Widest zoom (16 mm on the kit lens), tripod at chest height, lights on, curtains open, verticals straight.",
        jepret: "Scenes group by room automatically, so delivering 'kamar 1, kamar 2...' takes no sorting.",
        message: "Hi! Bright, clear photos help rooms rent faster. I can photograph your kos/rooms for listings: Rp 200,000 per room, photos the next day. Want me to come by?",
        quote: { price: 200000, days: 1 },
      },
      {
        name: "Sell photos of runners and park visitors (FotoYu)",
        who: "Car-free day runners, running clubs, fun runs, cyclists and people at parks or landmarks. They find their own photos by face in the FotoYu app and pay there.",
        rate: "Rp 9,000 per photo on a new account; Rp 20,000 - 100,000 per photo after ID verification. You keep about 84-90 %.",
        gear: "Shutter 1/1000 s, AF-C with tracking, burst Hi, kit lens at 50 mm or a 55-210 mm. Stand where runners come toward you with the sun behind you. Leave out anyone who waves you off, and don't sell photos of children.",
        jepret: "Cuts a 1,000-frame morning down to the sharp ones before you upload; repeated burst frames of the same runner are removed.",
        message: "Hi! I'm a photographer in {city}. I'd like to photograph your club's next Sunday run at no cost to the club; runners can find and buy their own photos in the FotoYu app (from Rp 9,000). May I join?",
      },
      {
        name: "Headshot day at offices and factories",
        who: "HR teams, staff who need ID-card or LinkedIn photos, job seekers. Industrial estates have many offices close together.",
        rate: "Single headshots are listed from Rp 200,000 per person. A group day at one company is cheaper per head; our guess is Rp 75,000 - 150,000 per person for 10+ people. Treat that as an assumption and ask locally.",
        gear: "Plain light wall or grey cloth, window light or one flash bounced off the ceiling, kit lens at 50 mm f/5.6 (or a 50 mm f/1.8), Eye AF, camera at eye height.",
        jepret: "Each person's frames group together, blinks and blur drop out, so you deliver the best 2 per person quickly; proofs let each person choose.",
        message: "Hi! I offer an on-site headshot day for your team: I set up in a meeting room, about 5 minutes per person, 2 edited photos each for ID cards and LinkedIn. Rp 1,500,000 for up to 15 people. Would HR be interested?",
        quote: { price: 1500000, days: 3 },
      },
      {
        name: "Short videos (Reels / TikTok) for small businesses",
        who: "Cafés, salons, gyms, clothing shops and UMKM that post on Instagram and TikTok",
        rate: "Rp 100,000 - 3,000,000 per video in listings; monthly packages are common",
        gear: "4K 30p, shutter 1/60 s, a normal picture profile (not S-Log) so edits stay quick, flip screen up, a clip-on mic. Edit on the phone in CapCut.",
        jepret: "Jepret handles the stills from the same visit, so you can sell photos and videos from one trip.",
        message: "Hi! I make short Reels/TikTok videos for local businesses in {city}: 3 videos of 15-30 seconds, edited with music and text, filmed at your place in one visit, Rp 1,000,000. Can I show you some examples?",
        quote: { price: 1000000, days: 3 },
      },
      {
        name: "Photo booth with instant prints at events",
        who: "Weddings, kindergarten and school graduations, company family days, bazaars",
        rate: "Photo booth packages Rp 1,100,000 - 7,650,000 per event; graduation booths charge Rp 30,000 - 60,000 per child print",
        gear: "a6400 on a tripod, one light or a bright window, a plain backdrop. Extra cost: a portable photo printer and paper. Imaging Edge Mobile sends each shot to the phone for printing.",
        jepret: "After the event the whole set is culled, and the host gets one clean folder of keepers.",
        message: "Hi! I run a photo booth with instant prints for events in {city}: 3 hours, unlimited shots, a printed photo for each guest and all digital files for you, Rp 1,800,000. Is your date still free?",
        quote: { price: 1800000, days: 2 },
      },
      {
        name: "Rent out your a6400 on days you don't use it",
        who: "Students, content creators, people shooting a trip or a family event",
        rate: "Rental shops list the a6400 at Rp 150,000 - 400,000 per day",
        gear: "Rent only to people you know, or ask for an ID card copy and a cash deposit. Photograph the camera and note the shutter count before and after; write down every item that goes out.",
        jepret: "Not needed for this one: it just lets the camera earn on idle days.",
        message: "Hi! I'm renting out my Sony a6400 with kit lens, battery and SD card: Rp 150,000 per day, ID card copy and deposit required. Which date do you need it?",
        quote: { price: 150000, days: 0 },
      },
      {
        name: "Beginner camera lessons",
        who: "New camera owners, parents, small-business owners who want better product or family photos",
        rate: "No published rates found. Our guess: Rp 150,000 - 300,000 per 2-hour private session. Treat this as an assumption.",
        gear: "Teach on their own camera: shooting modes, aperture/shutter/ISO, focus modes, then a 30-minute photo walk. Hand out a one-page cheat sheet.",
        jepret: "End the lesson with Jepret: picking the keepers is the step beginners skip.",
        message: "Hi! Just got a camera? I teach 2-hour beginner sessions in {city} on your own camera: settings, focus, light and a short photo walk. Rp 200,000 per person. Want a weekend slot?",
        quote: { price: 200000, days: 0 },
      },
    ],
  },
  id: {
    title: "Cari uang offline dengan kameramu",
    intro: "Stock sekarang bayar kecil per foto. Klien lokal bayar per pekerjaan, dan kamera yang sama sudah cukup. Di bawah ada 11 cara cari uang secara langsung, lalu pembuat penawaran harga untuk saat klien bilang ya. Tarif adalah rentang dari listing di Indonesia (2024-25); cek harga di daerahmu.",
    copy: "Salin pesan",
    copied: "Tersalin",
    whatsapp: "Buka di WhatsApp",
    rateLabel: "Tarif umum",
    gearLabel: "Setelan a6400",
    jepretLabel: "Bantuan Jepret",
    quoteThis: "Buat penawaran",
    quote: {
      title: "Pembuat penawaran harga",
      intro: "Saat klien setuju, kirim satu pesan jelas berisi harga, DP dan kapan foto jadi. DP 50 % melindungi kamu kalau klien batal.",
      client: "Nama klien",
      service: "Pekerjaan",
      date: "Tanggal",
      price: "Harga (Rp)",
      deposit: "DP (%)",
      days: "Hari sampai foto jadi",
      yourName: "Nama kamu",
      dateLater: "menyusul",
      clientFallback: "Kak",
      serviceFallback: "sesi foto",
      sameDay: "di hari pemotretan",
      afterDays: (days) => `foto jadi ${days} hari setelah pemotretan`,
      message: ({ client, by, service, date, price, deposit, depositAmount, rest, delivery }) =>
        `Halo ${client}! Berikut penawaran saya${by}:\n` +
        `- Pekerjaan: ${service}\n` +
        `- Tanggal: ${date}\n` +
        `- Harga: ${price}\n` +
        `- DP untuk booking (${deposit}%): ${depositAmount}; sisanya (${rest}) saat hasil diserahkan\n` +
        `- Hasil: ${delivery}\n` +
        `Balas OK, nanti saya kirim info pembayaran. Terima kasih!`,
    },
    gigs: [
      {
        name: "Foto produk untuk penjual online",
        who: "Penjual Shopee, Tokopedia dan TikTok Shop, usaha rumahan, UMKM",
        rate: "Rp 50.000 - 500.000 per foto; paket mulai sekitar Rp 299.000 untuk 10 foto",
        gear: "Tripod, ISO 100, f/8, timer 2 detik. Latar kertas atau karton putih, cahaya jendela dari samping, karton putih di sisi lain untuk mengisi bayangan.",
        jepret: "Menyaring hasil, lalu Proof klien membuat preview ber-watermark untuk dikirim sebelum dibayar.",
        message: "Halo! Saya fotografer di {city}. Saya foto produk yang rapi untuk toko online (latar putih atau lifestyle). Harga perkenalan: 10 foto Rp 299.000, sudah diedit dan siap untuk Shopee/Tokopedia. Boleh saya kirim beberapa contoh?",
        quote: { price: 299000, days: 3 },
      },
      {
        name: "Foto menu untuk aplikasi pesan antar",
        who: "Warung, kafe dan dapur rumahan di GoFood, GrabFood dan ShopeeFood",
        rate: "Rp 500.000 - 1.200.000 per sesi (sekitar 10-20 menu)",
        gear: "Foto dekat jendela sebelum jam makan siang, sudut 45° atau dari atas, f/4-5.6, tripod. Lap piring, tambahkan uap atau saus di akhir.",
        jepret: "Foto dobel dibuang, jadi cepat pilih satu terbaik per menu; proof bisa dikirim ke pemilik hari itu juga.",
        message: "Halo! Saya lihat {business} di GoFood. Foto menu yang bagus biasanya menambah pesanan. Saya bisa foto menu di tempat sekitar 2 jam, Rp 750.000 untuk maksimal 15 menu, foto jadi besoknya. Tertarik?",
        quote: { price: 750000, days: 1 },
      },
      {
        name: "Sesi foto wisuda dan portrait",
        who: "Mahasiswa wisuda, keluarga, pasangan, foto lamaran kerja",
        rate: "Rp 300.000 - 3.000.000 per sesi, tergantung durasi dan jumlah foto edit",
        gear: "Real-time Eye AF aktif, bukaan selebar mungkin, tempat teduh atau golden hour. Lensa kit cukup; lensa 50 mm f/1.8 murah sangat membantu.",
        jepret: "Foto blur dan mata tertutup tersaring; proof ber-watermark membuat klien bisa pilih favorit sebelum kamu edit.",
        message: "Halo! Mau wisuda? Saya buka sesi foto wisuda di sekitar kampus: 1 jam, 20 foto edit, Rp 450.000. Bisa akhir pekan. Mau lihat contoh foto saya?",
        quote: { price: 450000, days: 3 },
      },
      {
        name: "Acara kecil",
        who: "Ulang tahun, aqiqah, lamaran, gathering kantor, acara gereja dan komunitas",
        rate: "Rp 500.000 - 3.000.000 per jam di listing; acara pribadi kecil sering pakai harga paket setengah hari",
        gear: "Shutter 1/125 detik atau lebih cepat, auto ISO sampai 6400, AF continuous. Bawa baterai cadangan (NP-FW50) dan SD card kedua.",
        jepret: "Kartu berisi 500 foto jadi daftar pendek dalam beberapa menit: foto dobel dan blur sudah hilang sebelum mulai edit.",
        message: "Halo! Saya foto acara kecil (ulang tahun, aqiqah, lamaran, acara kantor) di {city}. Liputan 3 jam dengan 100+ foto edit Rp 1.200.000. Tanggalnya masih kosong?",
        quote: { price: 1200000, days: 3 },
      },
      {
        name: "Foto kos, kamar dan properti",
        who: "Pemilik kos, agen sewa, homestay dan host Airbnb",
        rate: "Tidak ada tarif yang dipublikasikan. Perkiraan kami: Rp 150.000 - 300.000 per kamar atau unit. Anggap ini asumsi dan tanya harga lokal.",
        gear: "Zoom paling lebar (16 mm di lensa kit), tripod setinggi dada, lampu nyala, gorden dibuka, garis vertikal lurus.",
        jepret: "Adegan otomatis dikelompokkan per kamar, jadi kirim 'kamar 1, kamar 2...' tanpa perlu menyortir.",
        message: "Halo! Foto yang terang dan jelas membuat kamar lebih cepat tersewa. Saya bisa foto kos/kamar Anda untuk iklan: Rp 200.000 per kamar, foto jadi besoknya. Mau saya datang?",
        quote: { price: 200000, days: 1 },
      },
      {
        name: "Jual foto pelari dan pengunjung taman (FotoYu)",
        who: "Pelari car free day, klub lari, fun run, pesepeda, orang di taman atau ikon kota. Mereka mencari fotonya sendiri lewat wajah di aplikasi FotoYu dan membayar di sana.",
        rate: "Rp 9.000 per foto untuk akun baru; Rp 20.000 - 100.000 per foto setelah verifikasi KTP. Kamu dapat sekitar 84-90 %.",
        gear: "Shutter 1/1000 detik, AF-C dengan tracking, burst Hi, lensa kit di 50 mm atau 55-210 mm. Berdiri di tempat pelari datang ke arahmu dengan matahari di belakangmu. Jangan foto orang yang menolak, dan jangan jual foto anak-anak.",
        jepret: "Memangkas 1.000 foto satu pagi jadi yang tajam saja sebelum upload; foto burst berulang dari pelari yang sama dibuang.",
        message: "Halo! Saya fotografer di {city}. Saya ingin memotret lari Minggu klub Anda tanpa biaya untuk klub; pelari bisa cari dan beli fotonya sendiri di aplikasi FotoYu (mulai Rp 9.000). Boleh saya ikut?",
      },
      {
        name: "Hari foto headshot di kantor dan pabrik",
        who: "Tim HRD, karyawan yang butuh foto ID card atau LinkedIn, pencari kerja. Kawasan industri punya banyak kantor berdekatan.",
        rate: "Headshot perorangan di listing mulai Rp 200.000 per orang. Hari foto grup di satu perusahaan lebih murah per orang; perkiraan kami Rp 75.000 - 150.000 per orang untuk 10+ orang. Anggap itu asumsi dan tanya harga lokal.",
        gear: "Dinding polos terang atau kain abu-abu, cahaya jendela atau satu flash dipantulkan ke plafon, lensa kit di 50 mm f/5.6 (atau 50 mm f/1.8), Eye AF, kamera setinggi mata.",
        jepret: "Foto tiap orang terkelompok, mata tertutup dan blur tersaring, jadi 2 foto terbaik per orang cepat dikirim; proof membuat tiap orang bisa memilih.",
        message: "Halo! Saya menawarkan hari foto headshot di kantor untuk tim Anda: saya siapkan di ruang meeting, sekitar 5 menit per orang, 2 foto edit per orang untuk ID card dan LinkedIn. Rp 1.500.000 untuk maksimal 15 orang. Apakah HRD tertarik?",
        quote: { price: 1500000, days: 3 },
      },
      {
        name: "Video pendek (Reels / TikTok) untuk usaha kecil",
        who: "Kafe, salon, gym, toko baju dan UMKM yang posting di Instagram dan TikTok",
        rate: "Rp 100.000 - 3.000.000 per video di listing; paket bulanan sering dipakai",
        gear: "4K 30p, shutter 1/60 detik, picture profile biasa (bukan S-Log) supaya edit cepat, layar flip ke atas, mic clip-on. Edit di HP pakai CapCut.",
        jepret: "Jepret mengurus foto dari kunjungan yang sama, jadi kamu bisa jual foto dan video dari satu kali datang.",
        message: "Halo! Saya buat video pendek Reels/TikTok untuk usaha lokal di {city}: 3 video 15-30 detik, sudah diedit dengan musik dan teks, direkam di tempat Anda dalam satu kunjungan, Rp 1.000.000. Boleh saya tunjukkan contohnya?",
        quote: { price: 1000000, days: 3 },
      },
      {
        name: "Photo booth cetak langsung di acara",
        who: "Pernikahan, wisuda TK dan sekolah, family day kantor, bazar",
        rate: "Paket photo booth Rp 1.100.000 - 7.650.000 per acara; booth wisuda memasang Rp 30.000 - 60.000 per cetakan per anak",
        gear: "a6400 di tripod, satu lampu atau jendela terang, backdrop polos. Biaya tambahan: printer foto portabel dan kertasnya. Imaging Edge Mobile mengirim tiap foto ke HP untuk dicetak.",
        jepret: "Setelah acara semua foto disaring, dan tuan rumah dapat satu folder rapi berisi foto terbaik.",
        message: "Halo! Saya punya photo booth cetak langsung untuk acara di {city}: 3 jam, foto sepuasnya, satu cetakan untuk tiap tamu dan semua file digital untuk Anda, Rp 1.800.000. Tanggalnya masih kosong?",
        quote: { price: 1800000, days: 2 },
      },
      {
        name: "Sewakan a6400 saat tidak dipakai",
        who: "Mahasiswa, kreator konten, orang yang mau foto liburan atau acara keluarga",
        rate: "Rental kamera memasang a6400 Rp 150.000 - 400.000 per hari",
        gear: "Sewakan hanya ke orang yang kamu kenal, atau minta fotokopi KTP dan deposit tunai. Foto kondisi kamera dan catat shutter count sebelum dan sesudah; tulis semua barang yang dibawa.",
        jepret: "Tidak perlu untuk yang ini: kamera tetap menghasilkan di hari kosong.",
        message: "Halo! Saya menyewakan Sony a6400 dengan lensa kit, baterai dan SD card: Rp 150.000 per hari, wajib fotokopi KTP dan deposit. Butuh tanggal berapa?",
        quote: { price: 150000, days: 0 },
      },
      {
        name: "Kelas kamera untuk pemula",
        who: "Pemilik kamera baru, orang tua, pemilik usaha yang ingin foto produk atau keluarga lebih bagus",
        rate: "Tidak ada tarif yang dipublikasikan. Perkiraan kami: Rp 150.000 - 300.000 per sesi privat 2 jam. Anggap ini asumsi.",
        gear: "Ajarkan di kamera mereka sendiri: mode foto, aperture/shutter/ISO, mode fokus, lalu photo walk 30 menit. Bagikan contekan satu halaman.",
        jepret: "Tutup kelas dengan Jepret: memilih foto terbaik adalah langkah yang sering dilewati pemula.",
        message: "Halo! Baru punya kamera? Saya mengajar kelas pemula 2 jam di {city} pakai kamera Anda sendiri: setelan, fokus, cahaya dan photo walk singkat. Rp 200.000 per orang. Mau jadwal akhir pekan?",
        quote: { price: 200000, days: 0 },
      },
    ],
  },
};

/** Fill {city} and {business} placeholders; unknown ones stay readable. */
export function fillMessage(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] || { city: "Batam", business: "your shop" }[key] || match);
}

/** "Rp 1.500.000": Indonesian thousands separators, whatever the UI language. */
export function formatRupiah(amount) {
  const rounded = Math.max(0, Math.round(Number(amount) || 0));
  return `Rp ${rounded.toLocaleString("id-ID")}`;
}

/** Readable date for a quote; "" means the date is still open. */
function formatQuoteDate(isoDate, lang, laterText) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || "");
  if (!match) return laterText;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Build the quote message a client receives on WhatsApp.
 * Deposit is a whole percentage clamped to 0-100; the rest is due on delivery.
 */
export function buildQuote(lang, fields = {}) {
  const text = (EARN[lang] || EARN.en).quote;
  const price = Math.max(0, Math.round(Number(fields.price) || 0));
  const deposit = Math.min(100, Math.max(0, Math.round(Number(fields.deposit ?? 50))));
  const depositAmount = Math.round((price * deposit) / 100);
  const days = Math.max(0, Math.round(Number(fields.days) || 0));
  const yourName = (fields.yourName || "").trim();
  return {
    price,
    deposit,
    depositAmount,
    rest: price - depositAmount,
    message: text.message({
      client: (fields.client || "").trim() || text.clientFallback,
      by: yourName ? ` (${yourName})` : "",
      service: (fields.service || "").trim() || text.serviceFallback,
      date: formatQuoteDate(fields.date, lang, text.dateLater),
      price: formatRupiah(price),
      deposit,
      depositAmount: formatRupiah(depositAmount),
      rest: formatRupiah(price - depositAmount),
      delivery: days > 0 ? text.afterDays(days) : text.sameDay,
    }),
  };
}

// The quote draft survives a language switch (renderEarn rebuilds the whole section).
const quoteDraft = { client: "", service: "", date: "", price: "", deposit: "50", days: "3", yourName: "" };

function copyButton(label, copiedLabel, getText) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "secondary";
  button.textContent = label;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getText());
      button.textContent = copiedLabel;
      setTimeout(() => {
        button.textContent = label;
      }, 1500);
    } catch (error) {
      console.warn("clipboard", error);
    }
  });
  return button;
}

function whatsappLink(label, message) {
  const link = document.createElement("a");
  link.className = "secondary button-link";
  link.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = label;
  return link;
}

/** Quote maker: a small form whose preview is the exact WhatsApp message. */
function renderQuoteMaker(text, lang) {
  const labels = text.quote;
  const section = document.createElement("section");
  section.className = "quote-maker";
  section.id = "quote-maker";
  const heading = document.createElement("h4");
  heading.textContent = labels.title;
  const intro = document.createElement("p");
  intro.className = "muted";
  intro.textContent = labels.intro;
  const form = document.createElement("div");
  form.className = "quote-fields";
  const fieldSpecs = [
    ["client", "text", ""],
    ["service", "text", ""],
    ["date", "date", ""],
    ["price", "number", "1000"],
    ["deposit", "number", "5"],
    ["days", "number", "1"],
    ["yourName", "text", ""],
  ];
  const inputs = {};
  fieldSpecs.forEach(([key, type, step]) => {
    const label = document.createElement("label");
    const caption = document.createElement("span");
    caption.textContent = labels[key];
    const input = document.createElement("input");
    input.type = type;
    input.name = `quote-${key}`;
    input.className = `quote-${key}`;
    if (type === "number") {
      input.min = "0";
      input.step = step;
      input.inputMode = "numeric";
    }
    if (key === "deposit") input.max = "100";
    input.value = quoteDraft[key];
    label.append(caption, input);
    form.appendChild(label);
    inputs[key] = input;
  });
  const preview = document.createElement("blockquote");
  preview.className = "quote-preview";
  preview.setAttribute("aria-live", "polite");
  const actions = document.createElement("div");
  actions.className = "cta";
  let currentMessage = "";
  const copy = copyButton(text.copy, text.copied, () => currentMessage);
  const whatsapp = whatsappLink(text.whatsapp, "");
  actions.append(copy, whatsapp);
  const update = () => {
    Object.keys(inputs).forEach((key) => {
      quoteDraft[key] = inputs[key].value;
    });
    currentMessage = buildQuote(lang, quoteDraft).message;
    preview.textContent = currentMessage;
    whatsapp.href = `https://wa.me/?text=${encodeURIComponent(currentMessage)}`;
  };
  Object.values(inputs).forEach((input) => input.addEventListener("input", update));
  update();
  section.append(heading, intro, form, preview, actions);
  /** Fill the form from a gig card and bring it into view. */
  section.prefill = (gig) => {
    inputs.service.value = gig.name;
    inputs.price.value = String(gig.quote.price);
    inputs.days.value = String(gig.quote.days);
    update();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    inputs.client.focus({ preventScroll: true });
  };
  return section;
}

/** Render the gig cards and the quote maker; the language is passed in. */
export function renderEarn(container, lang, values = {}) {
  const text = EARN[lang] || EARN.en;
  container.replaceChildren();
  const intro = document.createElement("p");
  intro.className = "muted";
  intro.textContent = text.intro;
  container.appendChild(intro);
  const quoteMaker = renderQuoteMaker(text, lang);
  const grid = document.createElement("div");
  grid.className = "gigs";
  text.gigs.forEach((gig) => {
    const card = document.createElement("article");
    card.className = "gig";
    const heading = document.createElement("h4");
    heading.textContent = gig.name;
    const who = document.createElement("p");
    who.className = "muted";
    who.textContent = gig.who;
    const facts = document.createElement("dl");
    [[text.rateLabel, gig.rate], [text.gearLabel, gig.gear], [text.jepretLabel, gig.jepret]].forEach(([label, value]) => {
      const term = document.createElement("dt");
      term.textContent = label;
      const detail = document.createElement("dd");
      detail.textContent = value;
      facts.append(term, detail);
    });
    const message = fillMessage(gig.message, values);
    const quote = document.createElement("blockquote");
    quote.textContent = message;
    const actions = document.createElement("div");
    actions.className = "cta";
    actions.append(copyButton(text.copy, text.copied, () => message), whatsappLink(text.whatsapp, message));
    if (gig.quote) {
      const makeQuote = document.createElement("button");
      makeQuote.type = "button";
      makeQuote.className = "secondary make-quote";
      makeQuote.textContent = text.quoteThis;
      makeQuote.addEventListener("click", () => quoteMaker.prefill(gig));
      actions.appendChild(makeQuote);
    }
    card.append(heading, who, facts, quote, actions);
    grid.appendChild(card);
  });
  container.append(grid, quoteMaker);
}
