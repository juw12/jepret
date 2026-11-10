// On-device scene recogniser for "Fill in words for me".
// CLIP ViT-B/32 image encoder (quantised, ~90 MB) runs in this browser tab with onnxruntime-web.
// Photos never leave the device; only the model and its runtime are downloaded once, then cached.
import { pickSceneWords } from "./core.js";

const ORT_VERSION = "1.20.1";
const ORT_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`;
const REMOTE_MODELS = "https://juw12.github.io/jepret/models/";
const CACHE = "jepret-models-v1";

let loaded = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.ort) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`could not load ${src}`));
    document.head.appendChild(script);
  });
}

async function cachedFetch(url, onProgress) {
  const cache = "caches" in window ? await caches.open(CACHE) : null;
  const hit = cache ? await cache.match(url) : null;
  if (hit) return hit.arrayBuffer();
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (onProgress && total) onProgress(received / total);
  }
  const blob = new Blob(chunks);
  if (cache) await cache.put(url, new Response(blob));
  return blob.arrayBuffer();
}

async function modelBase() {
  // Same-origin copy when served from Pages or a local checkout; otherwise the published copy.
  try {
    const probe = await fetch("models/clip-labels.json", { method: "HEAD" });
    if (probe.ok) return new URL("models/", location.href).href;
  } catch (error) {
    // fall through to the published copy
  }
  return REMOTE_MODELS;
}

export async function loadRecogniser(onProgress = () => {}) {
  if (loaded) return loaded;
  loaded = (async () => {
    await loadScript(`${ORT_BASE}ort.min.js`);
    window.ort.env.wasm.wasmPaths = ORT_BASE;
    window.ort.env.wasm.numThreads = 1;
    const base = await modelBase();
    const labelsResponse = await fetch(`${base}clip-labels.json`);
    if (!labelsResponse.ok) throw new Error("scene word list not found");
    const meta = await labelsResponse.json();
    const modelBytes = await cachedFetch(`${base}clip-vision-q8.onnx`, onProgress);
    const session = await window.ort.InferenceSession.create(modelBytes, { executionProviders: ["wasm"] });
    return { session, meta };
  })();
  try {
    return await loaded;
  } catch (error) {
    loaded = null;
    throw error;
  }
}

/** CLIP preprocessing: shortest side to 224, centre crop, normalise with CLIP mean/std. */
async function pixelTensor(file, meta) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = new OffscreenCanvas(224, 224);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 224, 224);
  bitmap.close();
  const rgba = context.getImageData(0, 0, 224, 224).data;
  const data = new Float32Array(3 * 224 * 224);
  const plane = 224 * 224;
  for (let i = 0; i < plane; i += 1) {
    for (let c = 0; c < 3; c += 1) {
      data[c * plane + i] = (rgba[i * 4 + c] / 255 - meta.mean[c]) / meta.std[c];
    }
  }
  return new window.ort.Tensor("float32", data, [1, 3, 224, 224]);
}

export async function embedFile(file) {
  const { session, meta } = await loadRecogniser();
  const output = await session.run({ [meta.input]: await pixelTensor(file, meta) });
  return Array.from(output[meta.output].data);
}

/**
 * Fill empty scene descriptions from the photos themselves.
 * Uses the two sharpest keepers of each scene; returns { groupId: { words, ranked } }.
 */
export async function describeGroups(groups, { onProgress = () => {}, overwrite = false } = {}) {
  const { meta } = await loadRecogniser((share) => onProgress({ stage: "download", share }));
  const results = {};
  const todo = groups.filter((group) => (overwrite || !group.words) && group.photos.some((photo) => photo.status === "keep"));
  for (let index = 0; index < todo.length; index += 1) {
    const group = todo[index];
    onProgress({ stage: "scene", share: index / todo.length, index, total: todo.length });
    const frames = group.photos.filter((photo) => photo.status === "keep")
      .sort((a, b) => b.sharpness - a.sharpness).slice(0, 2);
    const embeddings = [];
    for (const photo of frames) embeddings.push(await embedFile(photo.file));
    const result = pickSceneWords(embeddings, meta.labels, meta.embeddings);
    if (result.words.length) {
      group.words = result.words.join(" ");
      group.autoWords = true;
    }
    results[group.id] = result;
  }
  onProgress({ stage: "done", share: 1 });
  return results;
}
