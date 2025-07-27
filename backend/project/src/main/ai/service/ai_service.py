from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import logging
import re
from collections import defaultdict
from transformers import pipeline
from keybert import KeyBERT
import spacy

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Load models
nlp = spacy.load("en_core_web_sm")
kw_model = KeyBERT("all-mpnet-base-v2")
zero_shot_model = pipeline("zero-shot-classification", 
                          model="facebook/bart-large-mnli")

class OptimalTagger:
    def __init__(self):
        # Core domains with seed terms
        self.domains = {
            "Technology": ["Programming", "Debugging", "JavaScript", "Python", "API"],
            "Business": ["Marketing", "Finance", "Startup", "Management"],
            "Health": ["Nutrition", "Fitness", "Mental Health", "Meditation"],
            "Creative": ["Writing", "Design", "Photography", "Music"],
            "Science": ["Biology", "Physics", "Chemistry", "Research"]
        }
        
        # Stopwords and blacklist
        self.stopwords = {
            "explain", "about", "what", "how", "the", "is", "are", 
            "this", "that", "detailed", "common", "basic", "simple",
            "ways", "way", "things", "thing", "guide"
        }
        
        # Minimum confidence threshold
        self.min_confidence = 0.65

    def predict_tags(self, text: str) -> Dict[str, List]:
        try:
            # Step 1: Clean and preprocess
            cleaned_text = self._clean_text(text)
            
            # Step 2: Extract quality keywords
            keywords = self._get_quality_keywords(cleaned_text)
            
            # Step 3: Identify relevant domains
            domain_tags = self._get_domain_tags(cleaned_text)
            
            # Step 4: Combine and filter results
            combined = keywords + domain_tags
            filtered = self._filter_and_rank(combined)
            
            return {
                "labels": [tag[0] for tag in filtered],
                "scores": [tag[1] for tag in filtered]
            }
            
        except Exception as e:
            logger.error(f"Tagging failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def _clean_text(self, text: str) -> str:
        """Basic text cleaning"""
        text = re.sub(r'[^\w\s]', '', text)
        return text.lower().strip()

    def _get_quality_keywords(self, text: str) -> List[tuple]:
        """Get meaningful keywords using multiple techniques"""
        # Technique 1: KeyBERT with noun phrases
        keywords = kw_model.extract_keywords(
            text,
            keyphrase_ngram_range=(1, 2),
            stop_words="english",
            top_n=10
        )
        
        # Technique 2: Extract noun chunks
        doc = nlp(text)
        noun_chunks = [chunk.text for chunk in doc.noun_chunks if len(chunk.text) > 3]
        
        # Combine and deduplicate
        all_keywords = list(set([kw[0] for kw in keywords] + noun_chunks))
        
        # Filter out stopwords and generic terms
        return [
            (kw, 0.9) for kw in all_keywords
            if (kw.lower() not in self.stopwords and 
                not kw.isnumeric() and 
                len(kw) > 3)
        ]

    def _get_domain_tags(self, text: str) -> List[tuple]:
        """Get relevant domain-specific tags"""
        # Identify top domains
        domain_result = zero_shot_model(
            text,
            candidate_labels=list(self.domains.keys()),
            multi_label=True
        )
        
        # Get relevant terms from top domains
        relevant_terms = []
        for domain, score in zip(domain_result["labels"], domain_result["scores"]):
            if score >= self.min_confidence:
                relevant_terms.extend([
                    (term, score * 0.8)  # Slightly discount domain terms
                    for term in self.domains[domain]
                ])
        
        return relevant_terms

    def _filter_and_rank(self, tags: List[tuple]) -> List[tuple]:
        """Filter and rank final tags"""
        # Deduplicate keeping highest score
        unique_tags = {}
        for tag, score in tags:
            norm_tag = tag.lower()
            if norm_tag not in unique_tags or score > unique_tags[norm_tag][1]:
                unique_tags[norm_tag] = (tag, score)
        
        # Filter by confidence and sort
        filtered = [
            t for t in unique_tags.values() 
            if t[1] >= self.min_confidence
        ]
        filtered.sort(key=lambda x: -x[1])
        
        return filtered[:5]  # Return top 5 tags

tagger = OptimalTagger()

class TagRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict_tags(request: TagRequest):
    return tagger.predict_tags(request.text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)