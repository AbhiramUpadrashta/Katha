# Records every panel of every Katha story with AI4Bharat's Indic Parler-TTS (Apache-2.0),
# a natural, expressive Indian voice model. Only new or changed lines are recorded.
#   python tools/voices.py <lang>      (lang = en | hi | te)
import hashlib, json, os, subprocess, sys
import soundfile as sf, torch
from transformers import AutoTokenizer
from parler_tts import ParlerTTSForConditionalGeneration

LANG = sys.argv[1]
SPEAKER = {
    "en": "Mary speaks in a warm, gentle Indian English storytelling voice, at a relaxed pace, with very clear, close-sounding audio and no background noise.",
    "hi": "Divya speaks in a warm, expressive Hindi storytelling voice, at a relaxed pace, with very clear, close-sounding audio and no background noise.",
    "te": "Lalitha speaks in a warm, expressive Telugu storytelling voice, at a relaxed pace, with very clear, close-sounding audio and no background noise.",
}[LANG]
OUT = f"docs/app/audio/{LANG}"
os.makedirs(OUT, exist_ok=True)
lines = json.loads(subprocess.check_output(["node", "tools/lines.js", LANG]))
index_path = f"{OUT}/index.json"
index = json.load(open(index_path)) if os.path.exists(index_path) else {}
todo = [l for l in lines if index.get(l["key"]) != hashlib.sha1((SPEAKER + l["text"]).encode()).hexdigest()[:12]]
print(f"{LANG}: {len(todo)} of {len(lines)} lines to record", flush=True)
if todo:
    torch.set_num_threads(os.cpu_count() or 4)
    model = ParlerTTSForConditionalGeneration.from_pretrained("ai4bharat/indic-parler-tts").eval()
    tok = AutoTokenizer.from_pretrained("ai4bharat/indic-parler-tts")
    dtok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    desc = dtok(SPEAKER, return_tensors="pt")
    for n, l in enumerate(todo, 1):
        prompt = tok(l["text"], return_tensors="pt")
        with torch.no_grad():
            audio = model.generate(input_ids=desc.input_ids, attention_mask=desc.attention_mask,
                                   prompt_input_ids=prompt.input_ids, prompt_attention_mask=prompt.attention_mask)
        wav = f"/tmp/{l['key']}.wav"
        sf.write(wav, audio.cpu().numpy().squeeze(), model.config.sampling_rate)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-b:a", "64k", f"{OUT}/{l['key']}.mp3"], check=True)
        index[l["key"]] = hashlib.sha1((SPEAKER + l["text"]).encode()).hexdigest()[:12]
        json.dump(index, open(index_path, "w"), indent=0, sort_keys=True)
        print(f"  {n}/{len(todo)} {l['key']}", flush=True)
# drop recordings of lines that no longer exist
keys = {l["key"] for l in lines}
for k in list(index):
    if k not in keys:
        index.pop(k)
        try: os.remove(f"{OUT}/{k}.mp3")
        except FileNotFoundError: pass
json.dump(index, open(index_path, "w"), indent=0, sort_keys=True)
