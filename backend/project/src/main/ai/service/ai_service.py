from typing import List
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from sentence_transformers import SentenceTransformer
import torch
import logging
from pathlib import Path
from contextlib import asynccontextmanager
import numpy as np
from sklearn.cluster import KMeans

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
BASE_DIR = Path(__file__).parent.parent
MODEL_PATH = BASE_DIR / "training" / "fine_tuned_model"
CATEGORIES = ["coding", "science", "technology", "health", "business","general"]
THRESHOLD = 0.5  # Threshold for multi-label classification

# Initialize clustering model for dynamic categorization
cluster_model = None  # Will be initialized with dummy data if needed
# Assume cluster_model is pre-trained on a diverse prompt dataset

class Classifier:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_model()
        self.initialize_cluster_model()

    def initialize_cluster_model(self):
        """Initialize and fit the cluster model with dummy data"""
        global cluster_model
        try:
            # Create dummy embeddings for each category to initialize the cluster model
            dummy_texts = [
                "python programming coding software development",  # coding
                "biology chemistry physics research experiment",   # science
                "artificial intelligence machine learning computer", # technology
                "medicine health wellness medical treatment",       # health
                "business marketing finance startup entrepreneurship" # business
            ]
            
            # Generate embeddings for dummy texts
            dummy_embeddings = self.embedder.encode(dummy_texts)
            
            # Initialize and fit the cluster model
            cluster_model = KMeans(n_clusters=len(CATEGORIES), random_state=42)
            cluster_model.fit(dummy_embeddings)
            
            logger.info("Cluster model initialized successfully with dummy data")
        except Exception as e:
            logger.error(f"Failed to initialize cluster model: {str(e)}")
            cluster_model = None

    def _keyword_based_classification(self, text: str) -> dict:
        """Fallback keyword-based classification when model is untrained"""
        text_lower = text.lower()
        
        # Define category keywords with more comprehensive coverage
        category_keywords = {
            "coding": [
                "python", "javascript", "java", "c++", "c#", "code", "programming", "software", 
                "algorithm", "debug", "syntax", "function", "variable", "class", "object", 
                "html", "css", "sql", "git", "github", "developer", "coding", "script",
                "database", "framework", "library", "api", "backend", "frontend"
            ],
            "science": [
                "biology", "chemistry", "physics", "research", "experiment", "hypothesis", 
                "scientific", "study", "data", "analysis", "theory", "molecular", "genetic", 
                "quantum", "laboratory", "specimen", "atom", "cell", "evolution", "gravity",
                "big bang", "universe", "planet", "solar system", "DNA", "RNA", "protein"
            ],
            "technology": [
                "artificial intelligence", "machine learning", "ai", "ml", "tech", "gadget", 
                "device", "computer", "smartphone", "laptop", "hardware", "innovation", 
                "digital", "cyber", "robot", "automation", "electronics", "chip", "processor",
                "internet", "wifi", "bluetooth", "app", "application", "software", "tech gadgets"
            ],
            "health": [
                "medicine", "medical", "health", "wellness", "doctor", "hospital", "treatment", 
                "disease", "symptoms", "therapy", "medication", "fitness", "nutrition", 
                "exercise", "mental health", "pain", "ache", "sick", "illness", "virus",
                "bacteria", "infection", "surgery", "diagnosis", "cure", "healing"
            ],
            "business": [
                "business", "marketing", "finance", "startup", "entrepreneur", "money", 
                "profit", "investment", "strategy", "management", "sales", "revenue", 
                "company", "corporate", "economy", "financial", "banking", "insurance",
                "market", "customer", "client", "service", "commerce", "trade"
            ]
        }
        
        # Score each category
        scores = {}
        for category, keywords in category_keywords.items():
            score = 0
            text_words = text_lower.split()
            
            for keyword in keywords:
                if keyword in text_lower:
                    # Boost score based on keyword importance and length
                    keyword_words = keyword.split()
                    boost = len(keyword_words) * 0.3 + 0.7  # Multi-word keywords get higher boost
                    
                    # Extra boost for exact word matches
                    if len(keyword_words) == 1 and keyword in text_words:
                        boost *= 1.5
                    
                    score += boost
            
            if score > 0:
                scores[category] = min(score / 2.0, 1.0)  # Normalize and cap at 1.0
        
        # Special handling for ambiguous cases
        if not scores:
            # If no clear category, try to infer from context
            if any(word in text_lower for word in ["how", "what", "why", "when", "where"]):
                # Question-like text, default to most general category
                scores["general"] = 0.4
            else:
                scores["general"] = 0.3
        
        # Sort by score and return top categories
        sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        # Only return categories with reasonable confidence
        filtered_results = [(cat, score) for cat, score in sorted_results if score >= 0.3]
        
        if not filtered_results:
            filtered_results = [("general", 0.5)]  # Ultimate fallback
        
        # Limit to top 2 categories
        if len(filtered_results) > 2:
            filtered_results = filtered_results[:2]
        
        result = {
            "categories": [cat for cat, _ in filtered_results],
            "scores": [score for _, score in filtered_results],
            "confidence": filtered_results[0][1],
            "note": "Keyword-based classification (model untrained)"
        }
        
        logger.info(f"Keyword-based classification result: {result}")
        return result

    def load_model(self):
        """Load the model and tokenizer"""
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model directory not found at {MODEL_PATH}")

        try:
            # Load tokenizer first
            self.tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH), use_fast=True)
            
            # Try to load the fine-tuned model, with fallback to base model
            self.using_base_model = False
            try:
                # Force the model to use the correct architecture
                from transformers import AutoConfig
                
                # First try to load with the correct model name
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    str(MODEL_PATH),
                    num_labels=len(CATEGORIES),
                    ignore_mismatched_sizes=True  # Allow size mismatches
                ).to(self.device)
                logger.info("Fine-tuned model loaded successfully")
                
            except Exception as model_error:
                logger.warning(f"Failed to load fine-tuned model: {model_error}")
                logger.info("Falling back to base DistilRoBERTa model")
                
                # Load base model with proper configuration
                config = AutoConfig.from_pretrained(
                    "distilroberta-base",
                    num_labels=len(CATEGORIES),
                    problem_type="single_label_classification",
                    id2label={str(i): cat for i, cat in enumerate(CATEGORIES)},
                    label2id={cat: i for i, cat in enumerate(CATEGORIES)}
                )
                
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    "distilroberta-base", 
                    config=config
                ).to(self.device)
                self.using_base_model = True  # Flag to indicate we're using untrained model
                logger.info("Base DistilRoBERTa model loaded - will use keyword-based classification")
            
            self.model.eval()
            self.embedder = SentenceTransformer('all-MiniLM-L6-v2')  # For dynamic categorization
            logger.info("Model and embedder loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise

    def predict(self, text: str) -> dict:
        """Make prediction with post-processing and dynamic categorization fallback"""
        logger.info(f"Processing request with text: {text[:200]}...")  # Log first 200 chars to avoid too long logs
        
        # If we're using the base model, go straight to keyword-based classification
        if hasattr(self, 'using_base_model') and self.using_base_model:
            logger.info("Using keyword-based classification (base model detected)")
            return self._keyword_based_classification(text)
        
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                max_length=256,
                truncation=True,
                padding=True
            ).to(self.device)

            with torch.no_grad():
                outputs = self.model(**inputs)
                
                # Check if this is the fine-tuned model or base model
                probabilities = torch.sigmoid(outputs.logits).cpu().numpy()[0]
                
                # Check if this looks like an untrained model by looking at:
                # 1. Low standard deviation (all predictions similar)
                # 2. Random-looking predictions (health dominating everything)
                prob_std = np.std(probabilities)
                health_idx = CATEGORIES.index("health") if "health" in CATEGORIES else -1
                health_dominance = probabilities[health_idx] if health_idx >= 0 else 0
                
                # If health dominates OR very low std deviation, use keyword-based classification
                if prob_std < 0.15 or (health_dominance > 0.7 and health_idx >= 0):
                    logger.warning(f"Model appears untrained (std: {prob_std:.3f}, health_score: {health_dominance:.3f}), using keyword-based classification")
                    return self._keyword_based_classification(text)

            # Process results with better thresholding
            results = []
            
            # Use dynamic threshold based on the spread of probabilities
            max_prob = np.max(probabilities)
            dynamic_threshold = max(THRESHOLD, max_prob * 0.7)  # At least 70% of max score
            
            for i, prob in enumerate(probabilities):
                if prob > dynamic_threshold:
                    results.append((CATEGORIES[i], float(prob)))

            # Post-processing: Boost scores for specific keywords
            text_lower = text.lower()
            if any(kw in text_lower for kw in ["c++", "python", "javascript", "code", "programming", "software"]):
                for i, (cat, score) in enumerate(results):
                    if cat == "coding":
                        results[i] = (cat, min(score * 1.3, 1.0))
            elif any(kw in text_lower for kw in ["artificial intelligence", "machine learning", "ai", "tech", "gadget", "computer", "digital"]):
                for i, (cat, score) in enumerate(results):
                    if cat == "technology":
                        results[i] = (cat, min(score * 1.3, 1.0))
                # If technology not in results but should be, add it
                if not any(cat == "technology" for cat, _ in results) and any(kw in text_lower for kw in ["artificial intelligence", "machine learning", "ai", "tech"]):
                    results.append(("technology", 0.8))
            elif any(kw in text_lower for kw in ["science", "experiment", "hypothesis", "research", "biology", "chemistry", "physics"]):
                for i, (cat, score) in enumerate(results):
                    if cat == "science":
                        results[i] = (cat, min(score * 1.3, 1.0))
            elif any(kw in text_lower for kw in ["business", "startup", "marketing", "money", "finance", "economy"]):
                for i, (cat, score) in enumerate(results):
                    if cat == "business":
                        results[i] = (cat, min(score * 1.3, 1.0))
            elif any(kw in text_lower for kw in ["health", "medical", "medicine", "wellness", "fitness"]):
                for i, (cat, score) in enumerate(results):
                    if cat == "health":
                        results[i] = (cat, min(score * 1.3, 1.0))

            results.sort(key=lambda x: x[1], reverse=True)
            
            # Limit to top 2 categories for cleaner results
            if len(results) > 2:
                # Keep only top 2 unless there's a significant score difference
                if len(results) > 1 and results[1][1] / results[0][1] < 0.7:
                    results = results[:1]  # Keep only top category if second is much lower
                else:
                    results = results[:2]  # Keep top 2 categories
            
            preset_result = {
                "categories": [cat for cat, _ in results],
                "scores": [score for _, score in results],
                "confidence": results[0][1] if results else 0.0
            }

            # Dynamic categorization fallback
            final_result = self.dynamic_categorize(text, preset_result)
            logger.info(f"Prediction result: {final_result}")
            return final_result

        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            return {
                "error": str(e),
                "categories": [],
                "scores": [],
                "confidence": 0.0
            }

    def dynamic_categorize(self, text: str, preset_result: dict) -> dict:
        """Fallback to dynamic clustering for low-confidence predictions"""
        if preset_result['confidence'] >= THRESHOLD and preset_result['categories']:
            return preset_result
        
        if cluster_model is None:
            logger.warning("Cluster model not initialized, returning preset result or default")
            # If preset result is empty, provide a default
            if not preset_result['categories']:
                return {
                    "categories": ["general"],  # Default fallback category
                    "scores": [0.5],
                    "confidence": 0.5,
                    "note": "Default categorization applied (cluster model unavailable)"
                }
            return preset_result
        
        try:
            # Generate embedding and predict cluster
            embedding = self.embedder.encode([text])[0]
            cluster_id = cluster_model.predict([embedding])[0]
            
            # Ensure cluster_id is within valid range
            if 0 <= cluster_id < len(CATEGORIES):
                result = {
                    "categories": [CATEGORIES[cluster_id]],
                    "scores": [0.8],  # Fixed confidence score for dynamic categorization
                    "confidence": 0.8,
                    "note": "Dynamic categorization applied"
                }
                logger.info(f"Used dynamic categorization for text: {text[:50]}...")
                return result
            else:
                logger.error(f"Invalid cluster_id {cluster_id}, returning preset result")
                return preset_result
                
        except Exception as e:
            logger.error(f"Dynamic categorization failed: {str(e)}")
            # If dynamic categorization fails and preset result is empty, provide a default
            if not preset_result['categories']:
                return {
                    "categories": ["general"],  # Default fallback category
                    "scores": [0.5],
                    "confidence": 0.5,
                    "note": "Fallback categorization applied"
                }
            return preset_result

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Starting up application...")
        app.state.classifier = Classifier()
        yield
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise

app = FastAPI(lifespan=lifespan)

class PromptRequest(BaseModel):
    text: str

class CategoryResponse(BaseModel):
    categories: List[str]
    scores: List[float]
    confidence: float
    note: str = None

@app.post("/classify", response_model=CategoryResponse)
async def classify_prompt(request: PromptRequest):
    logger.info(f"Received classification request")
    if not hasattr(app.state, 'classifier'):
        logger.error("Model not loaded when processing request")
        return {
            "error": "Model not loaded",
            "categories": [],
            "scores": [],
            "confidence": 0.0
        }
    return app.state.classifier.predict(request.text)

@app.get("/health")
async def health_check():
    status = "ready" if hasattr(app.state, 'classifier') else "unhealthy"
    device = getattr(app.state.classifier, 'device', 'none') if status == "ready" else "none"
    logger.info(f"Health check - Status: {status}, Device: {device}")
    return {
        "status": status,
        "device": device
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)