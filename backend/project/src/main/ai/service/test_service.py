#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(__file__))

from ai_service import Classifier
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_classifier():
    try:
        logger.info("Initializing classifier...")
        classifier = Classifier()
        
        test_texts = [
            "how to code in python",
            "biology experiment with cells",
            "machine learning artificial intelligence",
            "medical treatment for diabetes",
            "startup business plan"
        ]
        
        for text in test_texts:
            logger.info(f"\nTesting: {text}")
            result = classifier.predict(text)
            logger.info(f"Result: {result}")
            
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_classifier()
