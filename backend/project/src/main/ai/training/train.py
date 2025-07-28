import re
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
    DataCollatorWithPadding,
    EarlyStoppingCallback,
    AutoConfig
)
from datasets import load_from_disk
import torch
import torch.nn as nn
import numpy as np
from sklearn.metrics import f1_score, precision_recall_fscore_support, accuracy_score
import os
import json
import logging
from huggingface_hub import login

from prepare_data import CATEGORY_DEFINITIONS

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
MODEL_NAME = "distilroberta-base"
BATCH_SIZE = 4  # Optimized for CPU
LEARNING_RATE = 2e-5
MAX_LENGTH = 128
NUM_EPOCHS = 3
CATEGORIES = list(CATEGORY_DEFINITIONS.keys())
OUTPUT_DIR = r"C:\Prompt-Forge\Prompt-Forge\backend\project\src\main\ai\training\fine_tuned_model"

class SingleLabelTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        labels = inputs.pop("labels")
        if labels.dtype != torch.long:
            logger.warning(f"Labels dtype is {labels.dtype}, converting to long")
            labels = labels.argmax(dim=-1)
        # Check PyTorch version for BF16 support
        use_bf16 = False
        if hasattr(torch, 'bfloat16') and int(torch.__version__.split('.')[0]) >= 1 and int(torch.__version__.split('.')[1]) >= 10:
            use_bf16 = True
            logger.info("Using BF16 mixed precision")
        with torch.cpu.amp.autocast(enabled=use_bf16):
            outputs = model(**inputs)
            logits = outputs.logits
        loss_fct = nn.CrossEntropyLoss()
        loss = loss_fct(logits, labels)
        return (loss, outputs) if return_outputs else loss

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    labels = np.argmax(labels, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average=None, zero_division=0
    )
    macro_precision = np.mean(precision)
    macro_recall = np.mean(recall)
    macro_f1 = np.mean(f1)
    micro_f1 = f1_score(labels, preds, average='micro', zero_division=0)
    acc = accuracy_score(labels, preds)
    metrics = {
        'accuracy': acc,
        'f1_macro': macro_f1,
        'f1_micro': micro_f1,
        'precision_macro': macro_precision,
        'recall_macro': macro_recall
    }
    for i, cat in enumerate(CATEGORIES):
        metrics[f'f1_{cat}'] = f1[i]
        metrics[f'precision_{cat}'] = precision[i]
        metrics[f'recall_{cat}'] = recall[i]
    return metrics

def verify_labels(dataset, name="dataset"):
    label_counts = np.sum([example["labels"] for example in dataset], axis=0)
    logger.info(f"{name} label distribution: {dict(zip(CATEGORIES, label_counts))}")
    logger.info(f"{name} total samples: {len(dataset)}")
    logger.info(f"{name} samples with no labels: {sum(1 for x in dataset['labels'] if sum(x) == 0)}")
    logger.info(f"{name} samples with single label: {sum(1 for x in dataset['labels'] if sum(x) == 1)}")

def main():
    # Log PyTorch version
    logger.info(f"PyTorch version: {torch.__version__}")

    try:
        hf_token = os.getenv("HF_TOKEN")
        if hf_token:
            login(hf_token)
            logger.info("Authenticated with Hugging Face using HF_TOKEN")
        else:
            logger.warning("No HF_TOKEN found. Some datasets may require authentication.")
    except ImportError:
        logger.warning("huggingface_hub not installed. Skipping authentication.")

    logger.info("=== Loading Datasets ===")
    try:
        train_dataset = load_from_disk("data/tokenized/train_dataset")
        test_dataset = load_from_disk("data/tokenized/test_dataset")
        logger.info(f"Train dataset type: {type(train_dataset)}")
        logger.info(f"Train dataset features: {train_dataset.features}")
        logger.info(f"First train example: {train_dataset[0]}")
    except Exception as e:
        logger.error(f"Failed to load datasets: {str(e)}")
        raise

    logger.info("\n=== Verifying Label Distributions ===")
    verify_labels(train_dataset, "Training set")
    verify_labels(test_dataset, "Test set")
    
    logger.info("\n=== Initializing Tokenizer ===")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    except Exception as e:
        logger.error(f"Failed to initialize tokenizer: {str(e)}")
        raise
    
    logger.info("\n=== Initializing Model ===")
    try:
        config = AutoConfig.from_pretrained(
            MODEL_NAME,
            num_labels=len(CATEGORIES),
            problem_type="single_label_classification",
            id2label={str(i): cat for i, cat in enumerate(CATEGORIES)},
            label2id={cat: i for i, cat in enumerate(CATEGORIES)}
        )
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME,
            config=config
        )
        model.gradient_checkpointing_enable()  # Reduce memory usage
    except Exception as e:
        logger.error(f"Failed to initialize model: {str(e)}")
        raise
    
    logger.info("\n=== Training Arguments ===")
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        eval_strategy="epoch",
        save_strategy="epoch",
        learning_rate=LEARNING_RATE,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        num_train_epochs=NUM_EPOCHS,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="f1_macro",
        greater_is_better=True,
        fp16=False,
        logging_steps=100,
        report_to="none",
        save_total_limit=2,
        seed=42,
        lr_scheduler_type="cosine",
        warmup_ratio=0.1,
        gradient_accumulation_steps=1,
        dataloader_num_workers=0,
        dataloader_pin_memory=False
    )
    
    logger.info("\n=== Data Collator ===")
    data_collator = DataCollatorWithPadding(
        tokenizer=tokenizer,
        padding="max_length",
        max_length=MAX_LENGTH
    )
    
    logger.info("\n=== Starting Training ===")
    try:
        trainer = SingleLabelTrainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=test_dataset,
            compute_metrics=compute_metrics,
            data_collator=data_collator,
            callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
        )
        if trainer.train_dataset is None:
            raise ValueError("trainer.train_dataset is None before training")
        trainer.train()
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise
    
    logger.info("\n=== Saving Model ===")
    try:
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        logger.info(f"Attempting to save model to {OUTPUT_DIR}")
        model.save_pretrained(OUTPUT_DIR)
        tokenizer.save_pretrained(OUTPUT_DIR)
        config = {
            "id2label": {str(i): cat for i, cat in enumerate(CATEGORIES)},
            "label2id": {cat: i for i, cat in enumerate(CATEGORIES)},
            "problem_type": "single_label_classification"
        }
        with open(os.path.join(OUTPUT_DIR, "config.json"), "w") as f:
            json.dump(config, f, indent=2)
        logger.info(f"Model and tokenizer saved successfully to {OUTPUT_DIR}")
    except Exception as e:
        logger.error(f"Failed to save model: {str(e)}")
        raise
    
    logger.info("\n=== Final Evaluation ===")
    try:
        eval_results = trainer.evaluate()
        logger.info("\nFinal Metrics:")
        for key, value in eval_results.items():
            if key.startswith("eval_"):
                logger.info(f"{key[5:]}: {value:.4f}")
    except Exception as e:
        logger.error(f"Evaluation failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()