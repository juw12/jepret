"""Build the on-device scene recogniser used by "Fill in words for me".

Runs in GitHub Actions (open internet). Downloads the quantised CLIP ViT-B/32 vision model,
pre-computes text embeddings for every word Jepret knows (vocab.js) plus a few generic subjects,
and writes:
  models/clip-vision-q8.onnx   image encoder, run in the browser with onnxruntime-web
  models/clip-labels.json      label list + normalised 512-d text embeddings
  models/selftest.json         top labels for the demo photos, as a sanity check
"""
import json
import re
from pathlib import Path

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from PIL import Image
from tokenizers import Tokenizer
import urllib.request

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "models"
MODEL_ID = "Xenova/clip-vit-base-patch32"
MEAN = np.array([0.48145466, 0.4578275, 0.40821073], dtype=np.float32)
STD = np.array([0.26862954, 0.26130258, 0.27577711], dtype=np.float32)

# Words a generic CLIP prompt would misread get a short visual description instead.
PROMPTS = {
    "kelong": "a wooden fishing platform on stilts in the sea",
    "fishing village": "a fishing village with stilt houses over the water",
    "rendang": "a plate of beef rendang curry",
    "sambal": "a bowl of red chili sambal sauce",
    "tempeh": "fried tempeh slices",
    "satay": "satay skewers on a grill",
    "sate": "satay skewers on a grill",
    "nasi goreng": "a plate of nasi goreng fried rice",
    "durian": "a spiky durian fruit",
    "rupiah": "Indonesian rupiah banknotes",
    "batik": "batik fabric with a traditional pattern",
    "fun run": "people running in a fun run race",
    "blue hour": "a city at blue hour twilight",
    "night market": "a busy night market with food stalls",
    "street food": "street food being cooked at a roadside stall",
    "texture": "a close-up abstract texture",
    "background": "a plain background with empty space",
    "industrial": "an industrial area with factories",
    "container": "shipping containers at a port",
    "crane": "a construction or port crane",
    "monstera": "a monstera plant leaf",
    "hands": "close-up of hands",
    "money": "money and coins",
}
SELFTEST_URLS = [
    "https://upload.wikimedia.org/wikipedia/commons/1/1e/Brachydiplax_chalybea_female_06685.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/4/4d/Butterfly_pea_%28_Centrosema_pubescens%2901569.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/d/d8/Kadalundi_Bird_Sanctuary_Ardea_alba_09138.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Michotamia_aurata_04248.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b2/Orthetrum_sabina_00467.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/5b/Piper_nigrum_04236.jpg"
]
# Subjects not in the dictionary that still make good scene words.
EXTRA = [
    "insect", "butterfly", "dragonfly", "spider", "dog", "car", "bus", "train", "airplane",
    "building", "house", "church", "office", "shop", "interior", "tree", "leaf", "grass", "sky",
    "river", "lake", "park", "garden", "portrait", "child", "family", "people", "wedding",
    "graduation", "sport", "football", "landscape", "macro", "snow", "desert", "frog", "lizard",
]


def vocabulary():
    source = (REPO / "vocab.js").read_text(encoding="utf-8")
    dictionary_part = source.split("export const LOCATIONS")[0]
    words = re.findall(r'^\s*"([^"]+)":\s*entry\(', dictionary_part, re.M)
    location_part = source.split("export const LOCATIONS")[1]
    places = set(re.findall(r'^\s*"([^"]+)":\s*\{', location_part, re.M))
    labels = [word for word in words if word not in places and word not in ("harbour",)]
    labels += [word for word in EXTRA if word not in labels]
    return labels


def preprocess(path):
    image = Image.open(path).convert("RGB")
    width, height = image.size
    scale = 224 / min(width, height)
    image = image.resize((max(224, round(width * scale)), max(224, round(height * scale))), Image.BICUBIC)
    left = (image.width - 224) // 2
    top = (image.height - 224) // 2
    image = image.crop((left, top, left + 224, top + 224))
    array = (np.asarray(image, dtype=np.float32) / 255.0 - MEAN) / STD
    return array.transpose(2, 0, 1)[None]


def main():
    OUT.mkdir(exist_ok=True)
    vision_path = hf_hub_download(MODEL_ID, "onnx/vision_model_quantized.onnx")
    text_path = hf_hub_download(MODEL_ID, "onnx/text_model_quantized.onnx")
    tokenizer = Tokenizer.from_file(hf_hub_download(MODEL_ID, "tokenizer.json"))
    tokenizer.enable_padding(length=77, pad_id=49407)
    tokenizer.enable_truncation(max_length=77)

    labels = vocabulary()
    prompts = [PROMPTS.get(label, f"a photo of {label}") for label in labels]
    encoded = tokenizer.encode_batch(prompts)
    input_ids = np.array([item.ids for item in encoded], dtype=np.int64)
    attention = np.array([item.attention_mask for item in encoded], dtype=np.int64)
    text_session = ort.InferenceSession(text_path)
    text_inputs = {"input_ids": input_ids}
    if "attention_mask" in [inp.name for inp in text_session.get_inputs()]:
        text_inputs["attention_mask"] = attention
    text_out = dict(zip([o.name for o in text_session.get_outputs()], text_session.run(None, text_inputs)))
    text_embeds = text_out.get("text_embeds")
    text_embeds = text_embeds / np.linalg.norm(text_embeds, axis=1, keepdims=True)

    vision_session = ort.InferenceSession(vision_path)
    vision_input = vision_session.get_inputs()[0].name
    vision_output = [o.name for o in vision_session.get_outputs()]

    selftest = {}
    samples = []
    for url in SELFTEST_URLS:
        target = Path("/tmp") / url.rsplit("/", 1)[-1]
        request = urllib.request.Request(url, headers={"User-Agent": "jepret-selftest/1.0 (github.com/juw12/jepret)"})
        try:
            target.write_bytes(urllib.request.urlopen(request, timeout=60).read())
            samples.append(target)
        except Exception as error:
            print("skip", url, error)
    for sample in samples:
        outputs = dict(zip(vision_output, vision_session.run(None, {vision_input: preprocess(sample)})))
        embed = outputs["image_embeds"][0]
        embed = embed / np.linalg.norm(embed)
        logits = 100.0 * text_embeds @ embed
        probs = np.exp(logits - logits.max())
        probs /= probs.sum()
        top = np.argsort(-probs)[:5]
        selftest[sample.name] = [[labels[i], round(float(probs[i]), 3)] for i in top]

    (OUT / "clip-vision-q8.onnx").write_bytes(Path(vision_path).read_bytes())
    (OUT / "clip-labels.json").write_text(json.dumps({
        "model": MODEL_ID,
        "input": vision_input,
        "output": "image_embeds",
        "mean": MEAN.tolist(),
        "std": STD.tolist(),
        "labels": labels,
        "embeddings": [[round(float(v), 5) for v in row] for row in text_embeds],
    }), encoding="utf-8")
    (OUT / "selftest.json").write_text(json.dumps({
        "vision_inputs": [i.name for i in vision_session.get_inputs()],
        "vision_outputs": vision_output,
        "labels": len(labels),
        "samples": selftest,
    }, indent=1), encoding="utf-8")
    print(json.dumps(selftest, indent=1))


if __name__ == "__main__":
    main()
