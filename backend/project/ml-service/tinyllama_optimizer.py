import logging
import json
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from transformers import pipeline
import re
import time

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
app = FastAPI(title="TinyLlama Prompt Optimizer API")

# ----------------------------
# TinyLlama Model Class
# ----------------------------
class TinyLlamaOptimizer:
    def __init__(self):
        self.model = None
        self.prompt_template = self.load_prompt_template()
        self.initialize_model()

    def load_prompt_template(self) -> str:
        """Load the detailed prompt template from prompt.txt"""
        try:
            with open("prompt.txt", "r", encoding="utf-8") as f:
                template = f.read().strip()
            logger.info("✅ Prompt template loaded successfully")
            return template
        except FileNotFoundError:
            logger.error("❌ prompt.txt file not found, using fallback template")
            return self.get_fallback_template()
        except Exception as e:
            logger.error(f"❌ Error loading prompt template: {e}")
            return self.get_fallback_template()

    def get_fallback_template(self) -> str:
        """Fallback prompt template if prompt.txt is not found"""
        return """You are an expert prompt engineer with deep knowledge of AI model optimization and prompt crafting best practices. Your task is to analyze user prompts and provide detailed improvement suggestions.

TASK: Analyze the following user prompt and provide exactly 3 suggestions to improve it according to prompt engineering industry standards.

USER PROMPT: {user_prompt}

TARGET MODEL: {target_model}

For each suggestion, you must provide:
1. A clear suggestion title
2. The improved prompt version
3. 5 specific key improvements
4. A confidence factor (0.0-1.0)

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

SUGGESTION 1:
Title: [Brief title of the suggestion]
Improved Prompt: [The enhanced version of the original prompt]
Key Improvements:
- [Improvement 1]
- [Improvement 2] 
- [Improvement 3]
- [Improvement 4]
- [Improvement 5]
Confidence: [0.0-1.0]

SUGGESTION 2:
Title: [Brief title of the suggestion]
Improved Prompt: [The enhanced version of the original prompt]
Key Improvements:
- [Improvement 1]
- [Improvement 2]
- [Improvement 3] 
- [Improvement 4]
- [Improvement 5]
Confidence: [0.0-1.0]

SUGGESTION 3:
Title: [Brief title of the suggestion]
Improved Prompt: [The enhanced version of the original prompt]
Key Improvements:
- [Improvement 1]
- [Improvement 2]
- [Improvement 3]
- [Improvement 4]
- [Improvement 5]
Confidence: [0.0-1.0]

Focus on: clarity, specificity, context, structure, and expected output format."""

    def initialize_model(self):
        """Initialize the TinyLlama model"""
        try:
            logger.info("🔄 Loading TinyLlama model...")
            self.model = pipeline(
                "text-generation",
                model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                torch_dtype="auto",
                device_map="auto"
            )
            logger.info("✅ TinyLlama model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load TinyLlama model: {e}")
            raise RuntimeError(f"Model initialization failed: {e}")

    def optimize_prompt(self, user_prompt: str, target_model: str = "General AI Model") -> List[Dict]:
        """Generate optimization suggestions using TinyLlama"""
        if not self.model:
            raise RuntimeError("Model not initialized")

        try:
            # Format the prompt template
            formatted_prompt = self.prompt_template.format(
                user_prompt=user_prompt,
                target_model=target_model
            )

            # Generate response using TinyLlama
            logger.info("🔄 Generating optimization suggestions...")
            
            response = self.model(
                formatted_prompt,
                max_new_tokens=1000,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=self.model.tokenizer.eos_token_id
            )

            generated_text = response[0]['generated_text']
            
            # Extract only the new generated content (remove the input prompt)
            generated_content = generated_text[len(formatted_prompt):].strip()
            
            logger.info("✅ Response generated successfully")
            logger.debug(f"Generated content: {generated_content[:200]}...")

            # Parse the structured response
            suggestions = self.parse_suggestions(generated_content, user_prompt)
            
            if not suggestions:
                logger.warning("⚠️  Failed to parse suggestions, using fallback")
                return self.get_fallback_suggestions(user_prompt)

            return suggestions

        except Exception as e:
            logger.error(f"❌ Error during optimization: {e}")
            return self.get_fallback_suggestions(user_prompt)

    def parse_suggestions(self, generated_content: str, original_prompt: str) -> List[Dict]:
        """Parse the structured response from TinyLlama"""
        suggestions = []
        
        try:
            # Split into suggestion blocks
            suggestion_blocks = re.split(r'SUGGESTION \d+:', generated_content)
            
            for i, block in enumerate(suggestion_blocks[1:], 1):  # Skip first empty split
                suggestion = self.parse_single_suggestion(block, original_prompt, i)
                if suggestion:
                    suggestions.append(suggestion)
                    
                if len(suggestions) >= 3:  # Limit to 3 suggestions
                    break

            return suggestions

        except Exception as e:
            logger.error(f"Error parsing suggestions: {e}")
            return []

    def parse_single_suggestion(self, block: str, original_prompt: str, suggestion_num: int) -> Optional[Dict]:
        """Parse a single suggestion block"""
        try:
            lines = [line.strip() for line in block.strip().split('\n') if line.strip()]
            
            suggestion = {
                "suggestion": "",
                "before": original_prompt,
                "after": "",
                "impact": "medium",
                "key_improvements": [],
                "confidence": 0.7
            }

            current_section = None
            improvements = []

            for line in lines:
                if line.startswith('Title:'):
                    suggestion["suggestion"] = line.replace('Title:', '').strip()
                elif line.startswith('Improved Prompt:'):
                    suggestion["after"] = line.replace('Improved Prompt:', '').strip()
                elif line.startswith('Key Improvements:'):
                    current_section = "improvements"
                elif line.startswith('Confidence:'):
                    try:
                        conf_str = line.replace('Confidence:', '').strip()
                        suggestion["confidence"] = float(conf_str)
                    except:
                        suggestion["confidence"] = 0.7
                elif current_section == "improvements" and line.startswith('-'):
                    improvement = line.replace('-', '').strip()
                    if improvement:
                        improvements.append(improvement)

            suggestion["key_improvements"] = improvements[:5]  # Limit to 5 improvements
            
            # Set impact based on confidence
            if suggestion["confidence"] >= 0.8:
                suggestion["impact"] = "high"
            elif suggestion["confidence"] >= 0.6:
                suggestion["impact"] = "medium"
            else:
                suggestion["impact"] = "low"

            # Validate suggestion has required fields
            if suggestion["suggestion"] and suggestion["after"]:
                return suggestion
            else:
                logger.warning(f"Incomplete suggestion {suggestion_num}: {suggestion}")
                return None

        except Exception as e:
            logger.error(f"Error parsing suggestion {suggestion_num}: {e}")
            return None

    def get_fallback_suggestions(self, user_prompt: str) -> List[Dict]:
        """Enhanced fallback suggestions when AI parsing fails"""
        suggestions = []
        
        # Analyze the prompt
        word_count = len(user_prompt.split())
        has_context = any(word in user_prompt.lower() for word in ["because", "for", "to", "since", "in order"])
        has_structure = any(char in user_prompt for char in ["1.", "2.", "3.", ":", "?"])
        has_specificity = len([word for word in user_prompt.split() if len(word) > 6]) / max(len(user_prompt.split()), 1) > 0.3

        # Suggestion 1: Add specificity and context
        suggestions.append({
            "suggestion": "Add specific context and detailed requirements",
            "before": user_prompt,
            "after": f"{user_prompt}. Please provide a comprehensive response that includes specific examples, step-by-step explanations, and practical applications. Consider the target audience and intended use case.",
            "impact": "high",
            "key_improvements": [
                "Added request for specific examples",
                "Included step-by-step explanation requirement",
                "Specified need for practical applications",
                "Mentioned target audience consideration",
                "Requested comprehensive coverage"
            ],
            "confidence": 0.85
        })

        # Suggestion 2: Improve structure and format
        suggestions.append({
            "suggestion": "Enhance structure with clear formatting requirements",
            "before": user_prompt,
            "after": f"{user_prompt}. Please structure your response as follows: 1) Overview and key concepts, 2) Detailed explanation with examples, 3) Practical implementation steps, 4) Common challenges and solutions, 5) Summary and next steps.",
            "impact": "high",
            "key_improvements": [
                "Added clear response structure",
                "Specified numbered formatting",
                "Included overview section",
                "Added implementation guidance",
                "Incorporated challenge identification"
            ],
            "confidence": 0.82
        })

        # Suggestion 3: Add constraints and output specifications
        suggestions.append({
            "suggestion": "Define clear constraints and expected output format",
            "before": user_prompt,
            "after": f"{user_prompt}. Please provide your response in approximately 300-500 words, using professional language suitable for [specify audience]. Include relevant citations or sources where applicable, and conclude with actionable recommendations.",
            "impact": "medium",
            "key_improvements": [
                "Specified word count range",
                "Defined language style requirements",
                "Added citation requirements",
                "Included actionable recommendations",
                "Specified target audience consideration"
            ],
            "confidence": 0.75
        })

        return suggestions[:3]

# ----------------------------
# Pydantic Models
# ----------------------------
class PromptRequest(BaseModel):
    text: str
    target_model: Optional[str] = "General AI Model"

class OptimizationSuggestion(BaseModel):
    suggestion: str
    before: str
    after: str
    impact: str
    key_improvements: List[str]
    confidence: float

class OptimizationResponse(BaseModel):
    prompt: str
    target_model: str
    suggestions: List[OptimizationSuggestion]
    source: str = "tinyllama"
    processing_time: float

class ModelStatus(BaseModel):
    model_loaded: bool
    model_name: str
    status: str

# ----------------------------
# Initialize Model
# ----------------------------
try:
    optimizer = TinyLlamaOptimizer()
    model_status = {"loaded": True, "error": None}
except Exception as e:
    logger.error(f"Failed to initialize optimizer: {e}")
    model_status = {"loaded": False, "error": str(e)}
    optimizer = None

# ----------------------------
# FastAPI Routes
# ----------------------------
@app.get("/")
def read_root():
    return {"message": "TinyLlama Prompt Optimizer API is running.", "model_loaded": model_status["loaded"]}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if model_status["loaded"] else "unhealthy",
        "service": "tinyllama-prompt-optimizer",
        "model_status": model_status
    }

@app.get("/model-status", response_model=ModelStatus)
def get_model_status():
    """Get current model status"""
    return ModelStatus(
        model_loaded=model_status["loaded"],
        model_name="TinyLlama-1.1B-Chat-v1.0",
        status="ready" if model_status["loaded"] else f"error: {model_status['error']}"
    )

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_prompt(request: PromptRequest):
    """Optimize a prompt using TinyLlama"""
    if not optimizer or not model_status["loaded"]:
        raise HTTPException(
            status_code=503, 
            detail=f"Model not available: {model_status.get('error', 'Unknown error')}"
        )
    
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        start_time = time.time()
        
        suggestions = optimizer.optimize_prompt(request.text, request.target_model)
        
        processing_time = time.time() - start_time
        
        return OptimizationResponse(
            prompt=request.text,
            target_model=request.target_model,
            suggestions=suggestions,
            source="tinyllama",
            processing_time=round(processing_time, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Optimization service temporarily unavailable"
        )

@app.post("/test-prompt")
async def test_optimized_prompt(request: dict):
    """Test an optimized prompt with TinyLlama"""
    if not optimizer or not model_status["loaded"]:
        raise HTTPException(status_code=503, detail="Model not available")
    
    try:
        prompt = request.get("prompt", "")
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        
        response = optimizer.model(
            prompt,
            max_new_tokens=200,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )
        
        return {
            "input_prompt": prompt,
            "generated_response": response[0]['generated_text'][len(prompt):].strip(),
            "model": "TinyLlama-1.1B-Chat-v1.0"
        }
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise HTTPException(status_code=500, detail="Test service temporarily unavailable")