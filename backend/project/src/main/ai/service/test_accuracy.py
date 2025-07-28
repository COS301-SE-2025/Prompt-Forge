import requests
import json

# Test cases to verify accuracy
test_cases = [
    ("artificial intelligence", ["technology"]),
    ("beginner code c++", ["coding"]),
    ("how to save money", ["business"]),
    ("life science", ["science"]),
    ("latest tech gadgets", ["technology"]),
    ("python programming", ["coding"]),
    ("medical treatment", ["health"]),
    ("machine learning model", ["technology"]),
    ("business startup", ["business"]),
    ("biology experiment", ["science"])
]

def test_classification():
    url = "http://localhost:8000/classify"
    
    print("Testing AI Service Classification Accuracy")
    print("=" * 50)
    
    correct = 0
    total = len(test_cases)
    
    for text, expected in test_cases:
        try:
            response = requests.post(url, json={"text": text})
            if response.status_code == 200:
                result = response.json()
                predicted = result.get("categories", [])
                
                # Check if the first predicted category matches expected
                is_correct = len(predicted) > 0 and predicted[0] in expected
                status = "✓" if is_correct else "✗"
                
                if is_correct:
                    correct += 1
                
                print(f"{status} '{text}' → {predicted} (expected: {expected})")
                print(f"   Confidence: {result.get('confidence', 0):.3f}")
                if 'note' in result:
                    print(f"   Note: {result['note']}")
                print()
            else:
                print(f"✗ Error for '{text}': {response.status_code}")
                
        except Exception as e:
            print(f"✗ Exception for '{text}': {e}")
    
    accuracy = correct / total * 100
    print(f"Accuracy: {correct}/{total} ({accuracy:.1f}%)")

if __name__ == "__main__":
    test_classification()
