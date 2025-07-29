from datasets import load_dataset, Dataset
import random
import re
from typing import List, Dict
from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
from collections import Counter
import logging
from huggingface_hub import login
from tqdm import tqdm
import torch

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Refined category definitions with reduced overlap and specific keywords
CATEGORY_DEFINITIONS = {
    "coding": {
        "keywords": [
            "python", "javascript", "java", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust",
            "typescript", "scala", "perl", "haskell", "elixir", "clojure", "dart",
            "algorithm", "debug", "syntax", "variable", "loop", "class", "object", "array",
            "string", "integer", "boolean", "recursion", "inheritance", "polymorphism",
            "api", "framework", "library", "compiler", "interpreter",
            "git", "docker", "kubernetes", "jenkins", "ansible", "terraform", "pytest", "junit",
            "html", "css", "react", "angular", "vue", "django", "flask", "node.js", "express",
            "spring", "rest api", "graphql", "websocket",
            "sql", "nosql", "mongodb", "postgresql", "mysql", "redis", "pandas", "numpy",
            "pyspark", "tensorflow", "pytorch", "scikit-learn"
        ],
        "patterns": [
            r"how to (write|implement|debug|fix).* (code|algorithm|program)",
            r"(best|efficient) way to.* (code|program)",
            r"error (in|with) (python|javascript|java|c\+\+|code)",
            r"how (does|do) (python|javascript|java|c\+\+).* work",
            r"difference between.* and.* in (python|javascript|java|c\+\+)"
        ],
        "exclude": ["medical", "biology", "chemistry", "business plan", "marketing strategy"]
    },
    "science": {
        "keywords": [
            "physics", "chemistry", "biology", "astronomy", "geology", "meteorology", "oceanography",
            "paleontology", "genetics", "neuroscience", "biochemistry", "quantum physics",
            "thermodynamics", "electromagnetism",
            "hypothesis", "experiment", "scientific method", "peer review", "observation",
            "data analysis", "statistical significance", "control group", "reproducibility",
            "molecule", "atom", "cell", "organism", "evolution", "gravity", "relativity", "entropy",
            "dna", "rna", "protein", "mitosis", "meiosis", "photosynthesis",
            "microscope", "telescope", "spectrometer", "centrifuge", "pcr", "crispr"
        ],
        "patterns": [
            r"scientific (study|research|experiment|method).* (show|demonstrate|prove)",
            r"(physics|chemistry|biology|astronomy) of.*",
            r"how (does|do).* (work|function) scientifically",
            r"according to (research|studies)",
            r"statistically significant"
        ],
        "exclude": ["code", "programming", "business", "marketing"]
    },
    "technology": {
        "keywords": [
            "artificial intelligence", "machine learning", "deep learning", "neural network",
            "computer vision", "natural language processing", "llm", "large language model",
            "transformer model", "reinforcement learning", "generative ai",
            "cpu", "gpu", "tpu", "quantum computer", "raspberry pi", "arduino", "iot",
            "microcontroller", "fpga",
            "blockchain", "cryptocurrency", "bitcoin", "ethereum", "smart contract", "web3",
            "virtual reality", "augmented reality", "5g", "nanotechnology", "robotics",
            "aws", "azure", "google cloud", "kubernetes", "docker", "terraform", "ansible",
            "ci/cd", "devops", "microservices", "cloud computing"
        ],
        "patterns": [
            r"(ai|artificial intelligence|machine learning).* model",
            r"how (does|do).* (blockchain|bitcoin|vr|ar) work",
            r"best (cloud|aws|azure|gcp).* (service|solution)",
            r"implementing.* (iot|internet of things)",
            r"future of.* (technology|computing)"
        ],
        "exclude": ["medical procedure", "biology", "chemistry experiment"]
    },
    "health": {
        "keywords": [
            "medicine", "cardiology", "neurology", "oncology", "pediatrics", "psychiatry",
            "dermatology", "orthopedics", "radiology",
            "diabetes", "hypertension", "arthritis", "asthma", "cancer", "depression",
            "anxiety", "alzheimer's", "parkinson's", "stroke", "covid-19",
            "vaccine", "antibiotic", "chemotherapy", "surgery", "physical therapy",
            "immunotherapy", "insulin", "antidepressant",
            "nutrition", "exercise", "yoga", "meditation", "mental health", "diet",
            "weight loss",
            "heart", "brain", "lungs", "liver", "kidneys", "pancreas", "bones"
        ],
        "patterns": [
            r"(symptoms|signs) of.* (disease|condition|illness)",
            r"how to treat.* (disease|condition|pain)",
            r"best (diet|exercise|treatment) for.*",
            r"(side effects|risks) of.* (medication|drug|treatment)",
            r"difference between.* and.* (disease|condition)"
        ],
        "exclude": ["code", "programming", "business", "technology"]
    },
    "business": {
        "keywords": [
            "entrepreneurship", "startup", "venture capital", "ipo", "mergers and acquisitions",
            "market analysis", "supply chain", "logistics", "human resources", "business ethics",
            "accounting", "financial statements", "balance sheet", "income statement",
            "cash flow", "valuation", "return on investment", "profit margin",
            "digital marketing", "seo", "social media marketing", "content marketing",
            "branding", "market segmentation", "customer acquisition", "kpi", "roi",
            "swot analysis", "pest analysis", "porter's five forces", "lean startup",
            "agile methodology", "risk management"
        ],
        "patterns": [
            r"how to (start|launch|grow).* (business|startup)",
            r"(marketing|sales|financial).* strategy",
            r"best (practices|ways) to.* (market|sell|advertise)",
            r"(swot|pest|market) analysis of.*",
            r"difference between.* and.* (business model|strategy)"
        ],
        "exclude": ["medical", "science", "programming"]
    }
}

SUBJECT_CATEGORIES = list(CATEGORY_DEFINITIONS.keys())
MAX_EXAMPLES_PER_DATASET = 10000  # Limit examples per dataset for testing

def load_and_prepare() -> dict:
    """Load and prepare dataset with domain-specific datasets"""
    try:
        # Authenticate with Hugging Face if needed
        try:
            import os
            hf_token = os.getenv("HF_TOKEN")
            if hf_token:
                login(hf_token)
                logger.info("Authenticated with Hugging Face using HF_TOKEN")
            else:
                logger.warning("No HF_TOKEN found. Some datasets may require authentication.")
        except ImportError:
            logger.warning("huggingface_hub not installed. Skipping authentication.")

        # Load domain-specific datasets from Hugging Face
        datasets = []
        dataset_configs = [
            ("mikex86/stackoverflow-posts", "train[:1%]"),  # Coding
            ("pubmed_qa", "pqa_labeled", "train"),  # Science/Health
            ("sciq", "train[:5%]"),  # Science
            ("ag_news", "train[:5%]"),  # Technology
            ("cnn_dailymail", "3.0.0", "train[:1%]"),  # Business
            ("financial_phrasebank", "train", {"trust_remote_code": True}),  # Business
            ("wikipedia", "20220301.en", "train[:1%]"),  # All categories
            ("codeparrot/github-code", "train[:1%]", {"trust_remote_code": True})  # Coding/Technology
        ]

        for config in dataset_configs:
            try:
                if len(config) == 2:
                    dataset_name, split = config
                    ds = load_dataset(dataset_name, split=split)
                elif len(config) == 3:
                    dataset_name, config_name, split = config
                    ds = load_dataset(dataset_name, config_name, split=split)
                else:
                    dataset_name, split, kwargs = config
                    ds = load_dataset(dataset_name, split=split, **kwargs)
                datasets.append(ds)
                logger.info(f"Successfully loaded dataset: {dataset_name}")
            except Exception as e:
                logger.error(f"Failed to load dataset {config[0]}: {str(e)}")
                continue

        if not datasets:
            raise ValueError("No datasets were successfully loaded. Check dataset names and access permissions.")

        examples = []
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Batch process prompts for efficiency
        for dataset in datasets:
            texts = []
            invalid_reasons = Counter()
            for item in tqdm(dataset, desc=f"Processing dataset {dataset.info.dataset_name}", total=min(len(dataset), MAX_EXAMPLES_PER_DATASET)):
                text = extract_text(item)
                if not is_valid_text(text):
                    if len(text) < 10:
                        invalid_reasons["too_short"] += 1
                    elif len(text) > 1024:
                        invalid_reasons["too_long"] += 1
                    elif len(text.split()) < 3:
                        invalid_reasons["too_few_words"] += 1
                    elif any(bad in text.lower() for bad in ["http://", "https://", "<", ">", "lol", "wtf"]):
                        invalid_reasons["invalid_tokens"] += 1
                    continue
                texts.append(text)
                if len(texts) >= MAX_EXAMPLES_PER_DATASET:
                    break
            
            if not texts:
                logger.warning(f"No valid texts found in dataset {dataset.info.dataset_name}. Invalid reasons: {invalid_reasons}")
                continue
            
            # Batch encode prompts
            logger.info(f"Encoding {len(texts)} prompts from {dataset.info.dataset_name}")
            prompt_embeddings = embedder.encode(texts, batch_size=32, show_progress_bar=True)
            
            for text, prompt_embedding in zip(texts, prompt_embeddings):
                labels = categorize_prompt(text, prompt_embedding, embedder)
                if sum(labels) >= 1:  # Allow multi-label examples
                    examples.append({
                        "text": clean_text(text),
                        "labels": [float(label) for label in labels],  # Store as float32
                        "length": len(text)
                    })
        
        # Balance dataset with oversampling
        processed_data = process_examples(examples)
        
        # Split train/test
        random.shuffle(processed_data)
        split_idx = int(0.85 * len(processed_data))
        
        train_data = processed_data[:split_idx]
        test_data = processed_data[split_idx:]
        
        logger.info(f"Final dataset sizes - Train: {len(train_data)}, Test: {len(test_data)}")
        logger.info(f"Category distribution: {get_category_distribution(processed_data)}")
        
        return {
            "train": Dataset.from_dict({
                "text": [item["text"] for item in train_data],
                "labels": [item["labels"] for item in train_data]
            }),
            "test": Dataset.from_dict({
                "text": [item["text"] for item in test_data],
                "labels": [item["labels"] for item in test_data]
            })
        }
    
    except Exception as e:
        logger.error(f"Error in data preparation: {str(e)}")
        raise

def extract_text(item: Dict) -> str:
    """Extract text from different dataset formats"""
    if "question" in item:
        text = item["question"]  # pubmed_qa, sciq
    elif "title" in item:
        text = item["title"]  # mikex86/stackoverflow-posts
    elif "highlights" in item:
        text = item["highlights"]  # cnn_dailymail
    elif "sentence" in item:
        text = item["sentence"]  # financial_phrasebank
    elif "text" in item:
        text = item["text"]  # wikipedia, ag_news
    elif "prompt" in item:
        text = item["prompt"]  # pisterlabs/promptset
    elif "Body" in item:
        text = item["Body"]  # mikex86/stackoverflow-posts
    elif "code" in item:
        text = item["code"]  # codeparrot/github-code
    else:
        text = ""
    return str(text).strip()

def is_valid_text(text: str) -> bool:
    """Validate text meets quality criteria"""
    return (10 <= len(text) <= 1024 and
            len(text.split()) >= 3 and
            not any(bad in text.lower() for bad in ["http://", "https://", "<", ">", "lol", "wtf"]))

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    text = re.sub(r'\s+', ' ', text)
    text = text.encode('ascii', 'ignore').decode()
    return text.strip()

def categorize_prompt(prompt: str, prompt_embedding: np.ndarray, embedder: SentenceTransformer) -> List[int]:
    """Comprehensive categorization with precomputed embedding"""
    prompt_lower = prompt.lower()
    labels = [0] * len(SUBJECT_CATEGORIES)
    scores = [0.0] * len(SUBJECT_CATEGORIES)
    
    # Compute category embeddings only once (cached globally)
    global category_embeddings
    if 'category_embeddings' not in globals():
        category_embeddings = {cat: embedder.encode([cat])[0] for cat in SUBJECT_CATEGORIES}
    
    # Score each category
    for i, cat in enumerate(SUBJECT_CATEGORIES):
        definition = CATEGORY_DEFINITIONS[cat]
        
        # Keyword scoring
        for keyword in definition["keywords"]:
            if re.search(rf'\b{re.escape(keyword)}\b', prompt_lower):
                scores[i] += 1.0
                
        # Pattern matching
        for pattern in definition.get("patterns", []):
            if re.search(pattern, prompt_lower):
                scores[i] += 2.0
                
        # Exclusion penalty
        for keyword in definition.get("exclude", []):
            if re.search(rf'\b{re.escape(keyword)}\b', prompt_lower):
                scores[i] -= 2.0
        
        # Embedding similarity score
        similarity = np.dot(prompt_embedding, category_embeddings[cat]) / (
            np.linalg.norm(prompt_embedding) * np.linalg.norm(category_embeddings[cat])
        )
        scores[i] += similarity * 2.0
    
    # Normalize scores
    max_score = max(scores) if scores else 1.0
    scores = [s/max_score for s in scores]
    
    # Assign multiple labels
    labels = [1 if score >= 0.5 else 0 for score in scores]
    
    # If no labels, assign top category
    if sum(labels) == 0 and scores:
        max_idx = scores.index(max(scores))
        labels[max_idx] = 1
    
    return labels

def process_examples(examples: List[Dict]) -> List[Dict]:
    """Balance dataset with oversampling"""
    # Filter by length (middle 90% to retain more data)
    lengths = [ex["length"] for ex in examples]
    q5, q95 = np.percentile(lengths, [5, 95])
    filtered = [ex for ex in examples if q5 <= ex["length"] <= q95]
    
    # Oversample minority classes
    category_counts = Counter()
    for ex in filtered:
        for i, label in enumerate(ex["labels"]):
            if label == 1:
                category_counts[i] += 1
    
    max_count = max(category_counts.values()) if category_counts else 1
    balanced_examples = []
    
    category_groups = {i: [] for i in range(len(SUBJECT_CATEGORIES))}
    for ex in filtered:
        for i, label in enumerate(ex["labels"]):
            if label == 1:
                category_groups[i].append(ex)
    
    for category_idx, group in category_groups.items():
        if len(group) == 0:
            continue
        oversampled = random.choices(group, k=max_count)
        balanced_examples.extend(oversampled)
    
    return balanced_examples

def get_category_distribution(examples: List[Dict]) -> Dict:
    """Calculate category distribution"""
    distribution = {cat: 0 for cat in SUBJECT_CATEGORIES}
    for ex in examples:
        for i, label in enumerate(ex["labels"]):
            if label == 1:
                distribution[SUBJECT_CATEGORIES[i]] += 1
    return distribution

if __name__ == "__main__":
    try:
        datasets = load_and_prepare()
        datasets["train"].save_to_disk("data/train_dataset")
        datasets["test"].save_to_disk("data/test_dataset")
        logger.info("Datasets prepared and saved successfully")
    except Exception as e:
        logger.error(f"Failed to prepare datasets: {str(e)}")
        raise