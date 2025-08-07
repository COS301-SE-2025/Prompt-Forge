from transformers import pipeline

# ~1.5GB - Qwen2.5-1.5B
pipe = pipeline("text-generation", model="TinyLlama/TinyLlama-1.1B-Chat-v1.0")



messages = [{"role": "user", "content": "Who are you?"}]
result = pipe(messages, max_new_tokens=100)
print(result)