import logging
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer, util
import time
import json

# ----------------------------
# Logging Configuration
# ----------------------------
logger = logging.getLogger("prompt_optimizer")
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
formatter = logging.Formatter("[%(asctime)s] %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# ----------------------------
# FastAPI Initialization
# ----------------------------
app = FastAPI(title="Prompt Optimizer API")

# ----------------------------
# Hugging Face Model Class
# ----------------------------
class HuggingFaceModels:
    def __init__(self):
        self.api_token = ""  # Replace with your token!
        
        # Updated model endpoints - these are more likely to work
        self.model_endpoints = [
            "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
            "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
            "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
            "https://api-inference.huggingface.co/models/distilbert-base-uncased",
            "https://api-inference.huggingface.co/models/gpt2"
        ]
        
        self.current_endpoint = 0
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        self.token_validated = False

        if not self.api_token:
            raise ValueError("Missing Hugging Face token.")

    def validate_token(self) -> bool:
        """Validate the Hugging Face API token"""
        if self.token_validated:
            return True
            
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        try:
            # Test with a simple model that should always exist
            response = requests.get(
                "https://api-inference.huggingface.co/models/bert-base-uncased",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info("✅ API token is valid")
                self.token_validated = True
                return True
            elif response.status_code == 401:
                logger.error("❌ Invalid API token")
                return False
            else:
                logger.warning(f"Token validation returned {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Token validation failed: {e}")
            return False

    def get_available_models(self) -> List[str]:
        """Get a list of available models for text generation"""
        if not self.validate_token():
            return []
            
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        # Test each model endpoint
        available_models = []
        for endpoint in self.model_endpoints:
            try:
                response = requests.get(endpoint, headers=headers, timeout=5)
                if response.status_code == 200:
                    available_models.append(endpoint)
                    logger.info(f"✅ Model available: {endpoint}")
                else:
                    logger.warning(f"❌ Model unavailable: {endpoint} (Status: {response.status_code})")
            except Exception as e:
                logger.error(f"Error checking model {endpoint}: {e}")
                
        return available_models

    def optimize_prompt_with_openai_style(self, text: str) -> Optional[str]:
        """Try using OpenAI-compatible endpoints if available"""
        try:
            # Some providers offer OpenAI-compatible endpoints
            openai_style_urls = [
                "https://api-inference.huggingface.co/v1/chat/completions",  # If available
            ]
            
            for url in openai_style_urls:
                headers = {
                    "Authorization": f"Bearer {self.api_token}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "gpt-3.5-turbo",  # This might work with HF's OpenAI compatibility
                    "messages": [
                        {
                            "role": "user",
                            "content": f"Improve this prompt: '{text}'. Provide 3 specific suggestions with format: 'Suggestion: X\\nAfter: Y\\nImpact: Z'"
                        }
                    ],
                    "max_tokens": 300,
                    "temperature": 0.7
                }
                
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
        except Exception as e:
            logger.error(f"OpenAI-style API failed: {e}")
            
        return None

    def optimize_prompt(self, text: str) -> List[Dict[str, str]]:
        """Try multiple approaches to optimize the prompt"""
        
        # First, validate the token
        if not self.validate_token():
            logger.error("Invalid API token, using fallback suggestions")
            return self.get_fallback_suggestions(text)
        
        # Try OpenAI-style API first
        openai_result = self.optimize_prompt_with_openai_style(text)
        if openai_result:
            suggestions = self.extract_suggestions(openai_result, text)
            if suggestions:
                return suggestions
        
        # Get available models
        available_models = self.get_available_models()
        if not available_models:
            logger.warning("No models available, using fallback suggestions")
            return self.get_fallback_suggestions(text)
        
        # Try each available model
        for model_url in available_models:
            try:
                logger.info(f"Trying model: {model_url}")
                
                prompt = (
                    f"Improve this prompt: \"{text}\"\n"
                    f"Suggest 3 improvements. Format each improvement as:\n"
                    f"Suggestion: ...\nAfter: ...\nImpact: low/medium/high"
                )

                headers = {
                    "Authorization": f"Bearer {self.api_token}",
                    "Content-Type": "application/json"
                }

                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 300,
                        "temperature": 0.7,
                        "do_sample": True,
                        "return_full_text": False
                    }
                }

                response = requests.post(model_url, headers=headers, json=payload, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"✅ Successfully got response from {model_url}")
                    
                    generated = result[0]["generated_text"] if isinstance(result, list) else result.get("generated_text", "")
                    suggestions = self.extract_suggestions(generated, text)
                    
                    if suggestions:
                        return self.remove_suggestion_duplicates(suggestions)
                
                elif response.status_code == 503:
                    logger.warning(f"Model loading (503), waiting 10 seconds...")
                    time.sleep(10)
                    continue
                    
                else:
                    logger.warning(f"Model {model_url} returned {response.status_code}: {response.text}")
                    continue

            except requests.exceptions.Timeout:
                logger.error(f"Timeout for model {model_url}")
                continue
                
            except Exception as e:
                logger.error(f"Error with model {model_url}: {e}")
                continue

        # If all models fail, return fallback suggestions
        logger.warning("All models failed, returning fallback suggestions")
        return self.get_fallback_suggestions(text)

    def get_fallback_suggestions(self, text: str) -> List[Dict[str, str]]:
        """Enhanced rule-based suggestions when AI models fail"""
        suggestions = []
        text_lower = text.lower()
        word_count = len(text.split())
        
        # Rule 1: Length-based suggestions
        if word_count < 5:
            suggestions.append({
                "suggestion": "Expand with more specific details and context",
                "before": text,
                "after": f"Please provide a comprehensive explanation of {text}, including specific examples, key concepts, and practical applications",
                "impact": "high"
            })
        elif word_count > 50:
            suggestions.append({
                "suggestion": "Make your prompt more concise and focused",
                "before": text,
                "after": f"Concisely explain {text.split()[:10][:5]} with key points",
                "impact": "medium"
            })
        
        # Rule 2: Structure-based suggestions
        if not any(char in text for char in ["?", ":", "."]):
            suggestions.append({
                "suggestion": "Add clear structure with questions or instructions",
                "before": text,
                "after": f"{text}. Please explain: 1) What this means, 2) How it works, 3) Why it's important",
                "impact": "high"
            })
        
        # Rule 3: Specificity suggestions
        vague_words = ["help", "explain", "tell me", "about", "something", "thing"]
        if any(word in text_lower for word in vague_words):
            suggestions.append({
                "suggestion": "Replace vague terms with specific requirements",
                "before": text,
                "after": f"{text}. Please provide step-by-step instructions with concrete examples and expected outcomes",
                "impact": "high"
            })
        
        # Rule 4: Context suggestions
        if not any(word in text_lower for word in ["because", "for", "to", "in order to", "since"]):
            suggestions.append({
                "suggestion": "Add context about your purpose and requirements",
                "before": text,
                "after": f"{text}. I need this information to [specify your use case] and require [specific format/depth]",
                "impact": "medium"
            })
        
        # Rule 5: Action verb suggestions
        action_verbs = ["create", "write", "generate", "analyze", "compare", "evaluate", "design"]
        if not any(verb in text_lower for verb in action_verbs):
            suggestions.append({
                "suggestion": "Use clear action verbs to specify what you want",
                "before": text,
                "after": f"Please analyze and create a detailed explanation of {text} with specific examples",
                "impact": "high"
            })
        
        # Rule 6: Format suggestions
        if "format" not in text_lower and "structure" not in text_lower:
            suggestions.append({
                "suggestion": "Specify the desired output format",
                "before": text,
                "after": f"{text}. Please format as: 1) Overview, 2) Key points with examples, 3) Practical applications",
                "impact": "medium"
            })
        
        # Ensure we have at least one suggestion
        if not suggestions:
            suggestions.append({
                "suggestion": "Your prompt is well-structured. Consider adding specific constraints or examples",
                "before": text,
                "after": f"{text}. Please include relevant examples and any specific constraints or requirements",
                "impact": "low"
            })
        
        return suggestions[:3]

    def extract_suggestions(self, generated: str, original: str) -> List[Dict[str, str]]:
        if not generated or generated.strip() == "":
            return self.get_fallback_suggestions(original)
            
        lines = generated.strip().split("\n")
        current = {"suggestion": "", "before": original, "after": "", "impact": ""}
        suggestions = []

        for line in lines:
            line = line.strip()
            if line.lower().startswith("suggestion:"):
                current["suggestion"] = line.split(":", 1)[-1].strip()
            elif line.lower().startswith("after:"):
                current["after"] = line.split(":", 1)[-1].strip()
            elif line.lower().startswith("impact:"):
                current["impact"] = line.split(":", 1)[-1].strip().lower()
                if all(current.values()):
                    suggestions.append(current.copy())
                    current = {"suggestion": "", "before": original, "after": "", "impact": ""}

        if not suggestions:
            return self.get_fallback_suggestions(original)

        return suggestions[:3]

    def remove_suggestion_duplicates(self, suggestions: List[Dict[str, str]], threshold: float = 0.8) -> List[Dict[str, str]]:
        if len(suggestions) <= 1:
            return suggestions

        try:
            texts = [s["after"] for s in suggestions]
            embeddings = self.embedder.encode(texts, convert_to_tensor=True)
            kept, seen = [], set()

            for i, s in enumerate(suggestions):
                if i in seen:
                    continue
                similar = util.pytorch_cos_sim(embeddings[i], embeddings)[0]
                for j, score in enumerate(similar):
                    if score > threshold:
                        seen.add(j)
                kept.append(s)
            return kept[:3]
        except Exception as e:
            logger.error(f"Error removing duplicates: {e}")
            return suggestions[:3]

# ----------------------------
# Pydantic Models
# ----------------------------
class PromptRequest(BaseModel):
    text: str

class OptimizationSuggestion(BaseModel):
    suggestion: str
    before: str
    after: str
    impact: str

class OptimizationResponse(BaseModel):
    prompt: str
    suggestions: List[OptimizationSuggestion]
    source: str = "fallback"  # Indicates if suggestions came from AI or fallback

class TokenValidationResponse(BaseModel):
    valid: bool
    message: str
    available_models: List[str]

# ----------------------------
# Initialize Model
# ----------------------------
hf = HuggingFaceModels()

# ----------------------------
# FastAPI Routes
# ----------------------------
@app.get("/")
def read_root():
    return {"message": "Prompt Optimizer API is running."}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "prompt-optimizer"}

@app.get("/validate-token", response_model=TokenValidationResponse)
def validate_token():
    """Validate the Hugging Face API token and check available models"""
    is_valid = hf.validate_token()
    available_models = hf.get_available_models() if is_valid else []
    
    message = "Token is valid" if is_valid else "Token is invalid or expired"
    
    return TokenValidationResponse(
        valid=is_valid,
        message=message,
        available_models=available_models
    )

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_prompt(request: PromptRequest):
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
            
        suggestions = hf.optimize_prompt(request.text)
        
        # Determine source based on whether we got AI suggestions or fallback
        source = "ai" if hf.token_validated and hf.get_available_models() else "fallback"
        
        return OptimizationResponse(
            prompt=request.text, 
            suggestions=suggestions,
            source=source
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Optimization service temporarily unavailable")