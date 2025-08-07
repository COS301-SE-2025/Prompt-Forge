from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "TheBloke/Qwen3-Coder-30B-AWQ"  # Quantized version

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)

# Load model (4-bit quantized)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    trust_remote_code=True,
    torch_dtype=torch.float16  # Must be float16 or auto
)
model.eval()

# Chat function
def chat(messages, max_tokens=200):
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_tensors="pt"
    ).to(model.device)

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id
        )

    return tokenizer.decode(output[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True)

# Test
messages = [
    {"role": "user", "content": "Who are you?"}
]
print(chat(messages))
