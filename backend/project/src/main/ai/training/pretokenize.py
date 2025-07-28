from transformers import AutoTokenizer
from datasets import load_from_disk
import torch
import re
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_NAME = "distilroberta-base"
MAX_LENGTH = 128
INPUT_DIR = r"C:\Prompt-Forge\Prompt-Forge\backend\project\src\main\ai\training\data"
OUTPUT_DIR = r"C:\Prompt-Forge\Prompt-Forge\backend\project\src\main\ai\training\data\tokenized"

def tokenize_function(examples):
    texts = [str(text).encode('ascii', 'ignore').decode('ascii') for text in examples["text"]]
    texts = [re.sub(r'[`*_\[\]]+', ' ', text) for text in texts]
    tokenized = tokenizer(
        texts,
        padding="max_length",
        truncation=True,
        max_length=MAX_LENGTH,
        return_tensors="pt"
    )
    labels = [[float(label) for label in example] for example in examples["labels"]]
    tokenized["labels"] = torch.tensor(labels, dtype=torch.float32)
    return tokenized

if __name__ == "__main__":
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    
    logger.info("Loading datasets...")
    train_dataset = load_from_disk(os.path.join(INPUT_DIR, "train_dataset"))
    test_dataset = load_from_disk(os.path.join(INPUT_DIR, "test_dataset"))
    
    logger.info("Tokenizing datasets...")
    train_dataset = train_dataset.map(
        tokenize_function,
        batched=True,
        batch_size=1000,
        remove_columns=["text"],
        load_from_cache_file=False
    )
    test_dataset = test_dataset.map(
        tokenize_function,
        batched=True,
        batch_size=1000,
        remove_columns=["text"],
        load_from_cache_file=False
    )
    
    train_dataset.set_format("torch", columns=["input_ids", "attention_mask", "labels"])
    test_dataset.set_format("torch", columns=["input_ids", "attention_mask", "labels"])
    
    logger.info("Saving tokenized datasets...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    train_dataset.save_to_disk(os.path.join(OUTPUT_DIR, "train_dataset"))
    test_dataset.save_to_disk(os.path.join(OUTPUT_DIR, "test_dataset"))
    logger.info("Tokenized datasets saved successfully.")