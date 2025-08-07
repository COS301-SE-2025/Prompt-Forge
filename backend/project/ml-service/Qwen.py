from transformers import AutoTokenizer
from optimum.intel import AutoModelForCausalLM
import torch

model_id = "Qwen/Qwen2.5-72B-Instruct-AWQ"

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)

# Load AWQ quantized model
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    trust_remote_code=True
)
model.eval()

# Chat messages
messages = [
    {"role": "user", "content": "Who are you?"}
]

# Tokenize input
inputs = tokenizer.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_tensors="pt"
).to(model.device)

# Generate output
with torch.no_grad():
    outputs = model.generate(**inputs, max_new_tokens=40)

# Decode output
print(tokenizer.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True))
