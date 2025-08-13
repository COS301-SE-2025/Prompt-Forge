import logging
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer, util
import time
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

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
# Qwen Model Class
# ----------------------------
class QwenModels:
    def __init__(self):
        load_dotenv()
        self.api_token = os.getenv("HF_TOKEN", "")  # Read from environment variable
        
        # Available Qwen models via Hugging Face router
        self.model_endpoints = [
            "Qwen/Qwen3-Coder-30B-A3B-Instruct:fireworks-ai",
            "Qwen/Qwen2.5-72B-Instruct",
            "Qwen/Qwen2.5-32B-Instruct",
            "Qwen/Qwen2.5-14B-Instruct",
            "Qwen/Qwen2.5-7B-Instruct"
        ]
        
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        self.token_validated = False
        self.client = None

        if not self.api_token:
            logger.warning("No Hugging Face token provided. Some features may be limited.")
            logger.info("Set HF_TOKEN environment variable to enable full functionality.")
        else:
            self.client = OpenAI(
                base_url="https://router.huggingface.co/v1",
                api_key=self.api_token,
            )

    def validate_token(self) -> bool:
        """Validate the Hugging Face API token by making a test request"""
        if self.token_validated:
            return True
            
        if not self.api_token or not self.client:
            logger.error("No API token or client available")
            return False
            
        try:
            # Test with a simple completion request
            response = self.client.chat.completions.create(
                model=self.model_endpoints[0],
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10,
                timeout=10
            )
            
            if response and response.choices:
                logger.info("✅ API token is valid")
                self.token_validated = True
                return True
            else:
                logger.error("❌ Invalid API response")
                return False
                
        except Exception as e:
            logger.error(f"Token validation failed: {e}")
            return False

    def get_available_models(self) -> List[str]:
        """Get a list of available models"""
        if not self.validate_token():
            return []
            
        available_models = []
        
        # Test each model
        for model in self.model_endpoints[:3]:  # Test first 3 to avoid rate limits
            try:
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Test"}],
                    max_tokens=5,
                    timeout=5
                )
                
                if response and response.choices:
                    available_models.append(model)
                    logger.info(f"✅ Model available: {model}")
                else:
                    logger.warning(f"❌ Model unavailable: {model}")
                    
            except Exception as e:
                logger.warning(f"Error testing model {model}: {e}")
                
        # If no models tested successfully, return all models as potentially available
        if not available_models:
            logger.info("No models tested successfully, returning all models")
            return self.model_endpoints
            
        return available_models

    def optimize_prompt(self, text: str) -> List[Dict[str, str]]:
        """Use Qwen model to optimize the prompt"""
        
        # First, validate the token
        if not self.validate_token():
            logger.error("Invalid API token, using fallback suggestions")
            return self.get_fallback_suggestions(text)
        
        # Try each available model
        for model in self.model_endpoints:
            try:
                logger.info(f"Trying model: {model}")
                
                prompt = f"""Please analyze this prompt and provide 3 specific suggestions to improve it:

Original prompt: "{text}"

For each suggestion, please format your response exactly as follows:
Suggestion: [brief description of the improvement]
After: [the improved version of the prompt]
Impact: [low/medium/high]

Make sure each suggestion addresses a different aspect of prompt improvement such as clarity, specificity, structure, or completeness."""

                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=800,
                    temperature=0.7,
                    timeout=30
                )
                
                if response and response.choices and response.choices[0].message:
                    generated = response.choices[0].message.content
                    logger.info(f"✅ Successfully got response from {model}")
                    
                    suggestions = self.extract_suggestions(generated, text)
                    
                    if suggestions:
                        return self.remove_suggestion_duplicates(suggestions)
                
            except Exception as e:
                logger.error(f"Error with model {model}: {e}")
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
                "after": f"Concisely explain {' '.join(text.split()[:10])} with key points",
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
        """Extract suggestions from the generated text"""
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
                # When we find an impact, save the current suggestion if complete
                if all(current.values()):
                    suggestions.append(current.copy())
                    current = {"suggestion": "", "before": original, "after": "", "impact": ""}

        # Also check for patterns without exact formatting
        if not suggestions:
            # Try to extract suggestions using different patterns
            parts = generated.split("\n\n")
            for part in parts:
                if len(part.strip()) > 20:  # Reasonable length for a suggestion
                    suggestions.append({
                        "suggestion": "AI-generated improvement suggestion",
                        "before": original,
                        "after": part.strip(),
                        "impact": "medium"
                    })

        if not suggestions:
            return self.get_fallback_suggestions(original)

        return suggestions[:3]

    def remove_suggestion_duplicates(self, suggestions: List[Dict[str, str]], threshold: float = 0.8) -> List[Dict[str, str]]:
        """Remove duplicate suggestions using semantic similarity"""
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
qwen = QwenModels()

# ----------------------------
# FastAPI Routes
# ----------------------------
@app.get("/")
def read_root():
    return {"message": "Prompt Optimizer API with Qwen is running."}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "prompt-optimizer-qwen"}

@app.get("/validate-token", response_model=TokenValidationResponse)
def validate_token():
    """Validate the Hugging Face API token and check available models"""
    is_valid = qwen.validate_token()
    available_models = qwen.get_available_models() if is_valid else []
    
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
            
        suggestions = qwen.optimize_prompt(request.text)
        
        # Determine source based on whether we got AI suggestions or fallback
        source = "ai" if qwen.token_validated and qwen.get_available_models() else "fallback"
        
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