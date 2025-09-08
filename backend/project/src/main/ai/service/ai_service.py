from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import torch
import logging
from pathlib import Path
from contextlib import asynccontextmanager
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


PREDEFINED_CATEGORIES = [
"Web Development",
"Creative",
"Research",
"Education",
"Business",
"Marketing",
"Legal",
"Health",
"Customer Support",
"eCommerce",
"Prompt Engineering",
"Science",
"General"
]

class ZeroShotClassifier:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.categories = PREDEFINED_CATEGORIES
        self.load_models()

    def load_models(self):
        """Load zero-shot classification models"""
        try:
            # Primary zero-shot classifier
            self.zero_shot_classifier = pipeline(
                "zero-shot-classification",
                model="facebook/bart-large-mnli",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # Sentence transformer for semantic similarity
            self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
            
            logger.info(f"Zero-shot models loaded successfully. Using {len(self.categories)} predefined categories.")
            
        except Exception as e:
            logger.error(f"Failed to load zero-shot models: {str(e)}")
            raise

    def classify_with_confidence_scoring(self, text: str) -> Dict[str, Any]:
        """Perform zero-shot classification against predefined categories"""
        try:
            # Use all predefined categories
            result = self.zero_shot_classifier(text, self.categories, multi_label=True)
            
            # Extract results
            labels = result['labels']
            scores = result['scores']
            
            # Apply confidence thresholding
            threshold = 0.25  # Lower threshold since we're using fixed categories
            high_confidence_results = [
                (label, score) for label, score in zip(labels, scores) 
                if score > threshold
            ]
            
            # If no high-confidence results, use semantic similarity fallback
            if not high_confidence_results:
                logger.info("Low confidence in zero-shot classification, using semantic similarity")
                return self.semantic_similarity_fallback(text)
            
            # Limit to top 3 categories
            high_confidence_results = high_confidence_results[:3]
            
            return {
                "categories": [label for label, _ in high_confidence_results],
                "scores": [score for _, score in high_confidence_results],
                "confidence": high_confidence_results[0][1] if high_confidence_results else 0.0,
                "method": "zero-shot-classification"
            }
            
        except Exception as e:
            logger.error(f"Zero-shot classification failed: {str(e)}")
            return self.semantic_similarity_fallback(text)

    def semantic_similarity_fallback(self, text: str) -> Dict[str, Any]:
        """Fallback method using semantic similarity with predefined categories"""
        try:
            # Generate embeddings
            text_embedding = self.embedder.encode([text])
            label_embeddings = self.embedder.encode(self.categories)
            
            # Calculate cosine similarities
            from sklearn.metrics.pairwise import cosine_similarity
            similarities = cosine_similarity(text_embedding, label_embeddings)[0]
            
            # Create label-score pairs and sort
            label_scores = list(zip(self.categories, similarities))
            label_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Filter by threshold and limit results
            threshold = 0.3
            filtered_results = [(label, score) for label, score in label_scores if score > threshold][:2]
            
            if not filtered_results:
                # Default to general knowledge if no good matches
                filtered_results = [("General", 0.5)]
            
            return {
                "categories": [label for label, _ in filtered_results],
                "scores": [float(score) for _, score in filtered_results],
                "confidence": float(filtered_results[0][1]) if filtered_results else 0.5,
                "method": "semantic-similarity"
            }
            
        except Exception as e:
            logger.error(f"Semantic similarity fallback failed: {str(e)}")
            return {
                "categories": ["General"],
                "scores": [0.5],
                "confidence": 0.5,
                "method": "default-fallback"
            }

    def predict(self, text: str) -> Dict[str, Any]:
        """Main prediction method using predefined categories only"""
        logger.info(f"Processing classification for text: {text[:100]}...")
        
        # Perform classification against predefined categories
        result = self.classify_with_confidence_scoring(text)
        
        logger.info(f"Classification result: {result}")
        return result

    def get_available_categories(self) -> List[str]:
        """Return list of all available predefined categories"""
        return self.categories.copy()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Starting up zero-shot classification service...")
        app.state.classifier = ZeroShotClassifier()
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
    method: str = None

@app.post("/classify", response_model=CategoryResponse)
async def classify_prompt(request: PromptRequest):
    """Classify prompt text against predefined categories"""
    logger.info(f"Received classification request")
    if not hasattr(app.state, 'classifier'):
        logger.error("Model not loaded when processing request")
        return CategoryResponse(
            categories=["General"],
            scores=[0.5],
            confidence=0.5,
            method="error-fallback"
        )
    
    result = app.state.classifier.predict(request.text)
    # Filter categories and scores by score >= 0.6
    filtered = [(cat, score) for cat, score in zip(result['categories'], result['scores']) if score >= 0.6]
    if filtered:
        result['categories'] = [cat for cat, _ in filtered]
        result['scores'] = [score for _, score in filtered]
        result['confidence'] = result['scores'][0] if result['scores'] else 0.0
    else:
        # If no categories meet threshold, fallback to General category
        result['categories'] = ["General"]
        result['scores'] = [0.6]
        result['confidence'] = 0.6
    return CategoryResponse(**result)

@app.get("/categories")
async def get_categories():
    """Get list of all available predefined categories"""
    if not hasattr(app.state, 'classifier'):
        return {"error": "Model not loaded"}
    
    return {
        "categories": app.state.classifier.get_available_categories(),
        "total_count": len(app.state.classifier.get_available_categories())
    }

@app.get("/health")
async def health_check():
    status = "ready" if hasattr(app.state, 'classifier') else "unhealthy"
    device = getattr(app.state.classifier, 'device', 'none') if status == "ready" else "none"
    category_count = len(getattr(app.state.classifier, 'categories', [])) if status == "ready" else 0
    
    return {
        "status": status,
        "device": device,
        "model_type": "zero-shot",
        "predefined_categories": category_count
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Zero-shot Classification Uvicorn server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)