from transformers import pipeline
from sentence_transformers import SentenceTransformer, util

class HuggingFaceModels:
    def __init__(self):
        self.generator = pipeline("text-generation", model="gpt2", max_length=50)
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")

    def generate_categories(self, text: str) -> list[str]:
        prompt = f"Suggest creative categories for this prompt: {text}\nCategories:"
        raw = self.generator(prompt, num_return_sequences=1)[0]["generated_text"]
        raw_line = raw.split("Categories:")[-1]
        candidates = [w.strip().lower() for w in raw_line.replace(".", "").replace(",", "").split()]
        unique = list(dict.fromkeys([w for w in candidates if w.isalpha()]))
        return self.remove_duplicates(unique)

    def remove_duplicates(self, candidates: list[str], threshold: float = 0.8) -> list[str]:
        embeddings = self.embedder.encode(candidates, convert_to_tensor=True)
        kept, seen = [], set()

        for i, cat in enumerate(candidates):
            if cat in seen:
                continue
            similar = util.pytorch_cos_sim(embeddings[i], embeddings)[0]
            for j, score in enumerate(similar):
                if score > threshold:
                    seen.add(candidates[j])
            kept.append(cat)
        return kept[:5]

hf = HuggingFaceModels()
