# helper_functions.py
# Add these functions to your FastAPI service

import numpy as np
import joblib
from typing import List
import re
import requests
import json

# Load category mapping at startup
try:
    category_mapping = joblib.load('models/category_mapping.pkl')
    reverse_category_mapping = {v: k for k, v in category_mapping.items()}
except:
    # Fallback category mapping
    category_mapping = {
        0: 'business_communication',
        1: 'code_generation', 
        2: 'creative_writing',
        3: 'data_analysis',
        4: 'educational',
        5: 'marketing'
    }
    reverse_category_mapping = {v: k for k, v in category_mapping.items()}

def extract_features(text: str) -> np.ndarray:
    """Extract ML features from prompt text"""
    # Text statistics
    word_count = len(text.split())
    char_count = len(text)
    sentence_count = len(text.split('.'))
    
    # Linguistic features
    readability = calculate_readability(text)
    sentiment = analyze_sentiment(text)
    specificity = calculate_specificity(text)
    
    # Structural features
    question_count = text.count('?')
    instruction_keywords = count_instruction_keywords(text)
    
    return np.array([
        word_count, char_count, sentence_count,
        readability, sentiment, specificity,
        question_count, instruction_keywords
    ])

def extract_comprehensive_features(text: str) -> np.ndarray:
    """Extract comprehensive features for effectiveness model"""
    # Same as extract_features for now, but can be extended
    return extract_features(text)

def calculate_readability(text: str) -> float:
    """Calculate readability score using simple heuristics"""
    if not text.strip():
        return 50.0
    
    try:
        # Try to use textstat if available
        import textstat
        return textstat.flesch_reading_ease(text)
    except ImportError:
        # Fallback simple calculation
        words = text.split()
        sentences = text.split('.')
        
        if len(sentences) == 0 or len(words) == 0:
            return 50.0
        
        avg_sentence_length = len(words) / len(sentences)
        
        # Simple syllable count approximation
        syllable_count = sum(max(1, len(re.findall(r'[aeiouAEIOU]', word))) for word in words)
        avg_syllables_per_word = syllable_count / len(words) if words else 1
        
        # Simplified Flesch formula
        score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        return max(0, min(100, score))  # Clamp between 0-100

def analyze_sentiment(text: str) -> float:
    """Analyze sentiment of text"""
    try:
        from nltk.sentiment import SentimentIntensityAnalyzer
        import nltk
        
        try:
            sia = SentimentIntensityAnalyzer()
            sentiment = sia.polarity_scores(text)
            return sentiment['compound']
        except:
            # Download required data if not available
            nltk.download('vader_lexicon', quiet=True)
            sia = SentimentIntensityAnalyzer()
            sentiment = sia.polarity_scores(text)
            return sentiment['compound']
    except ImportError:
        # Fallback simple sentiment analysis
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'best', 'love', 'like']
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor', 'dislike']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        total_words = len(text.split())
        if total_words == 0:
            return 0.0
        
        return (pos_count - neg_count) / total_words

def calculate_specificity(text: str) -> float:
    """Calculate specificity score based on detail words"""
    specificity_words = [
        'specific', 'detailed', 'exactly', 'precisely', 'step-by-step',
        'comprehensive', 'thorough', 'complete', 'explicit', 'particular',
        'exact', 'definite', 'clear', 'concise', 'accurate', 'specific',
        'detailed', 'comprehensive', 'thorough', 'complete', 'explicit',
        'particular', 'exact', 'definite', 'clear', 'concise', 'accurate',
        'elaborate', 'extensive', 'in-depth', 'meticulous', 'rigorous'
    ]
    
    text_lower = text.lower()
    specificity_count = sum(1 for word in specificity_words if word in text_lower)
    
    # Normalize by text length
    word_count = len(text.split())
    if word_count == 0:
        return 0.0
    
    return (specificity_count / word_count) * 100

def count_instruction_keywords(text: str) -> int:
    """Count instruction keywords in text"""
    instruction_keywords = [
        'write', 'create', 'generate', 'make', 'build', 'develop',
        'analyze', 'explain', 'describe', 'list', 'compare', 'summarize',
        'evaluate', 'implement', 'design', 'code', 'calculate', 'find',
        'identify', 'determine', 'solve', 'optimize', 'review', 'test',
        'produce', 'construct', 'formulate', 'compose', 'draft', 'outline',
        'plan', 'organize', 'structure', 'format', 'arrange', 'compile'
    ]
    
    text_lower = text.lower()
    return sum(1 for keyword in instruction_keywords if keyword in text_lower)

def get_category_name(category_index: int) -> str:
    """Get category name from prediction index"""
    return category_mapping.get(category_index, 'unknown')

def get_subcategories(prediction_proba: np.ndarray, threshold: float = 0.3) -> List[str]:
    """Get subcategories that meet the threshold"""
    subcategories = []
    for i, prob in enumerate(prediction_proba):
        if prob >= threshold and i < len(category_mapping):
            subcategories.append(category_mapping[i])
    
    # Sort by probability (descending)
    subcategories.sort(key=lambda cat: prediction_proba[reverse_category_mapping[cat]], reverse=True)
    return subcategories

def calculate_confidence(features: np.ndarray) -> float:
    """Calculate confidence score for effectiveness prediction"""
    # Simple confidence calculation based on feature completeness
    feature_completeness = np.mean(features > 0)  # Fraction of non-zero features
    
    import requests
import json

def test_huggingface_token():
    """Test if your Hugging Face token is working"""
    
    # Your token
    token = ""
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("🔍 Testing Hugging Face API Token...\n")
    
    # Test 1: Check token validity with a simple model
    test_models = [
        "bert-base-uncased",
        "distilbert-base-uncased", 
        "gpt2",
        "microsoft/DialoGPT-small"
    ]
    
    for model in test_models:
        url = f"https://api-inference.huggingface.co/models/{model}"
        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"Model: {model}")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            print("-" * 50)
            
            if response.status_code == 200:
                print(f"✅ {model} is accessible!")
                break
                
        except Exception as e:
            print(f"❌ Error testing {model}: {e}")
            print("-" * 50)
    
    # Test 2: Try a simple inference request
    print("\n🚀 Testing inference request...\n")
    
    inference_url = "https://api-inference.huggingface.co/models/gpt2"
    payload = {
        "inputs": "The quick brown fox",
        "parameters": {
            "max_new_tokens": 50,
            "temperature": 0.7
        }
    }
    
    try:
        response = requests.post(inference_url, headers=headers, json=payload, timeout=30)
        print(f"Inference Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Inference request successful!")
        elif response.status_code == 503:
            print("⏳ Model is loading, try again in a few seconds")
        elif response.status_code == 401:
            print("❌ Authentication failed - check your token")
        elif response.status_code == 404:
            print("❌ Model not found")
        else:
            print(f"❌ Unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Inference request failed: {e}")

if __name__ == "__main__":
    test_huggingface_token()