import re
import json
from typing import Dict, List, Any, Optional
from config import logger

def clean_text(text: str) -> str:
    """Clean and normalize text input"""
    if not text:
        return ""
    
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    return text

def extract_json_from_text(text: str) -> Optional[Dict]:
    """Extract JSON object from text that might contain other content"""
    try:
        # First try direct JSON parsing
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass
    
    # Try to find JSON within the text
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    
    logger.warning("Could not extract valid JSON from text")
    return None

def validate_metrics(metrics: Dict[str, float]) -> Dict[str, float]:
    """Validate and normalize metric values"""
    validated = {}
    
    for key, value in metrics.items():
        if isinstance(value, (int, float)):
            # Clamp values between 0 and 100
            validated[key] = max(0, min(100, float(value)))
        else:
            logger.warning(f"Invalid metric value for {key}: {value}")
            validated[key] = 50.0  # Default to middle value
    
    return validated

def calculate_improvement_score(before_metrics: Dict[str, float], after_metrics: Dict[str, float]) -> float:
    """Calculate overall improvement score between two metric sets"""
    if not before_metrics or not after_metrics:
        return 0.0
    
    improvements = []
    for key in before_metrics:
        if key in after_metrics:
            improvement = after_metrics[key] - before_metrics[key]
            improvements.append(improvement)
    
    if not improvements:
        return 0.0
    
    return sum(improvements) / len(improvements)

def format_percentage(value: float) -> str:
    """Format a float value as a percentage string"""
    return f"{value:.1f}%"

def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text to specified length with ellipsis"""
    if len(text) <= max_length:
        return text
    return text[:max_length-3] + "..."

def extract_key_phrases(text: str) -> List[str]:
    """Extract key phrases from text for analysis"""
    # Remove common stop words and extract meaningful phrases
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
        'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    }
    
    # Split into words and filter
    words = re.findall(r'\b\w+\b', text.lower())
    key_words = [word for word in words if word not in stop_words and len(word) > 2]
    
    # Extract 2-word phrases
    phrases = []
    for i in range(len(key_words) - 1):
        phrase = f"{key_words[i]} {key_words[i+1]}"
        if len(phrase) > 6:  # Avoid very short phrases
            phrases.append(phrase)
    
    return phrases[:10]  # Return top 10 phrases

def count_sentences(text: str) -> int:
    """Count the number of sentences in text"""
    sentences = re.split(r'[.!?]+', text)
    return len([s for s in sentences if s.strip()])

def count_words(text: str) -> int:
    """Count the number of words in text"""
    return len(text.split())

def detect_language_patterns(text: str) -> Dict[str, bool]:
    """Detect various language patterns in text"""
    patterns = {
        'has_questions': '?' in text,
        'has_exclamations': '!' in text,
        'has_bullets': any(marker in text for marker in ['•', '*', '-']),
        'has_numbers': bool(re.search(r'\d+', text)),
        'has_quotes': '"' in text or "'" in text,
        'has_parentheses': '(' in text and ')' in text,
        'has_colons': ':' in text,
        'has_semicolons': ';' in text,
        'has_uppercase_words': any(word.isupper() for word in text.split() if len(word) > 1),
        'has_urls': bool(re.search(r'https?://', text)),
        'has_emails': bool(re.search(r'\S+@\S+\.\S+', text))
    }
    
    return patterns

def suggest_structural_improvements(text: str, current_score: float) -> List[str]:
    """Suggest structural improvements based on text analysis"""
    suggestions = []
    patterns = detect_language_patterns(text)
    word_count = count_words(text)
    sentence_count = count_sentences(text)
    
    # Suggest based on current structure
    if not patterns['has_bullets'] and word_count > 50:
        suggestions.append("Consider using bullet points to organize key information")
    
    if sentence_count > 5 and not patterns['has_colons']:
        suggestions.append("Use colons to introduce lists or explanations")
    
    if word_count > 100 and '\n' not in text:
        suggestions.append("Break content into paragraphs for better readability")
    
    if not patterns['has_questions'] and 'explain' not in text.lower():
        suggestions.append("Add questions to clarify what you're looking for")
    
    if current_score < 60:
        suggestions.append("Add clear section headers to organize information")
        suggestions.append("Use numbered steps if describing a process")
    
    return suggestions[:4]  # Return top 4 suggestions

def analyze_text_complexity(text: str) -> Dict[str, Any]:
    """Analyze the complexity of the given text"""
    words = text.split()
    sentences = count_sentences(text)
    
    if sentences == 0:
        return {"complexity": "low", "readability": "high", "avg_sentence_length": 0}
    
    avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
    avg_sentence_length = len(words) / sentences
    
    # Determine complexity
    complexity = "low"
    if avg_word_length > 6 or avg_sentence_length > 20:
        complexity = "high"
    elif avg_word_length > 4 or avg_sentence_length > 15:
        complexity = "medium"
    
    # Determine readability (inverse of complexity)
    readability_map = {"low": "high", "medium": "medium", "high": "low"}
    readability = readability_map[complexity]
    
    return {
        "complexity": complexity,
        "readability": readability,
        "avg_word_length": round(avg_word_length, 1),
        "avg_sentence_length": round(avg_sentence_length, 1),
        "word_count": len(words),
        "sentence_count": sentences
    }

def generate_quality_score(metrics: Dict[str, float]) -> str:
    """Generate a quality assessment based on metrics"""
    overall = metrics.get('overall', 0)
    
    if overall >= 85:
        return "Excellent - Ready to use with minimal changes"
    elif overall >= 70:
        return "Good - Minor improvements recommended"
    elif overall >= 55:
        return "Average - Several improvements needed"
    elif overall >= 40:
        return "Below Average - Significant improvements required"
    else:
        return "Poor - Major revisions needed"

def create_improvement_summary(before_metrics: Dict, after_metrics: Dict, changes: List[str]) -> Dict:
    """Create a summary of improvements made"""
    improvement_score = calculate_improvement_score(before_metrics, after_metrics)
    
    return {
        "overall_improvement": round(improvement_score, 1),
        "before_quality": generate_quality_score(before_metrics),
        "after_quality": generate_quality_score(after_metrics),
        "changes_made": len(changes),
        "key_improvements": changes[:3],  # Top 3 changes
        "recommendation": get_improvement_recommendation(improvement_score)
    }

def get_improvement_recommendation(improvement_score: float) -> str:
    """Get recommendation based on improvement score"""
    if improvement_score >= 20:
        return "Significant improvements achieved - prompt is much more effective"
    elif improvement_score >= 10:
        return "Moderate improvements made - consider additional refinements"
    elif improvement_score >= 5:
        return "Some improvements made - may benefit from further optimization"
    else:
        return "Minimal improvements - consider alternative optimization approaches"