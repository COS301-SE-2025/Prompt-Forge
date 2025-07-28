#!/usr/bin/env python3
"""
Test the keyword-based classification directly
"""
import sys
from pathlib import Path

# Add the service directory to path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

def test_keyword_classification():
    # Import the classifier components
    from ai_service import Classifier
    
    # Create a mock classifier just for testing keyword method
    class MockClassifier:
        def _keyword_based_classification(self, text: str) -> dict:
            # Copy the method from the real classifier
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
                    scores["coding"] = 0.4
                else:
                    scores["coding"] = 0.3
            
            # Sort by score and return top categories
            sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            
            # Only return categories with reasonable confidence
            filtered_results = [(cat, score) for cat, score in sorted_results if score >= 0.3]
            
            if not filtered_results:
                filtered_results = [("coding", 0.5)]  # Ultimate fallback
            
            # Limit to top 2 categories
            if len(filtered_results) > 2:
                filtered_results = filtered_results[:2]
            
            result = {
                "categories": [cat for cat, _ in filtered_results],
                "scores": [score for _, score in filtered_results],
                "confidence": filtered_results[0][1]
            }
            
            return result
    
    mock_classifier = MockClassifier()
    
    # Test cases that were failing
    test_cases = [
        ("latest tech gadgets", "technology"),
        ("what is java", "coding"),
        ("financial services", "business"),
        ("big bang theory", "science"),
        ("itchy nose", "health"),
        ("cars", "technology"),
        ("artificial intelligence", "technology"),
        ("python programming", "coding"),
        ("medical treatment", "health"),
    ]
    
    print("Testing Keyword-Based Classification")
    print("=" * 40)
    
    correct = 0
    for text, expected in test_cases:
        result = mock_classifier._keyword_based_classification(text)
        predicted = result["categories"][0] if result["categories"] else "none"
        
        is_correct = predicted == expected
        status = "✓" if is_correct else "✗"
        
        if is_correct:
            correct += 1
        
        print(f"{status} '{text}' → {predicted} (expected: {expected})")
        print(f"   Full result: {result['categories']} (confidence: {result['confidence']:.3f})")
        print()
    
    accuracy = correct / len(test_cases) * 100
    print(f"Keyword-based accuracy: {correct}/{len(test_cases)} ({accuracy:.1f}%)")

if __name__ == "__main__":
    test_keyword_classification()
