import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

# Get API key from environment
api_key = os.getenv("HF_TOKEN")
if not api_key:
    raise ValueError("Hugging Face API key not found. Please set HF in your .env file.")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=api_key,
)

stream = client.chat.completions.create(
    model="Qwen/Qwen3-Coder-30B-A3B-Instruct:fireworks-ai",
    messages=[
        {"role": "user", "content": "What is the capital of France?"}
    ],
    stream=True,
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")