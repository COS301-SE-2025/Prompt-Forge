#!/usr/bin/env python3
"""
Test script for TinyLlama Prompt Optimizer
Run this to test your optimizer API
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust if needed
TEST_PROMPTS = [
    {
        "text": "Explain machine learning",
        "target_model": "GPT-4"
    },
    {
        "text": "Help me write code",
        "target_model": "Claude-3"
    },
    {
        "text": "What is the weather like?",
        "target_model": "TinyLlama"
    }
]

def test_health_check():
    """Test the health endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_model_status():
    """Test the model status endpoint"""
    print("\n🔍 Testing model status...")
    try:
        response = requests.get(f"{BASE_URL}/model-status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Model status: {data}")
            return data.get('model_loaded', False)
        else:
            print(f"❌ Model status failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Model status error: {e}")
        return False

def test_optimization(prompt_data):
    """Test prompt optimization"""
    print(f"\n🔍 Testing optimization for: '{prompt_data['text'][:50]}...'")
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/optimize", json=prompt_data)
        end_time = time.time()
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Optimization successful in {end_time - start_time:.2f}s")
            print(f"   Source: {data.get('source', 'unknown')}")
            print(f"   Processing time: {data.get('processing_time', 'unknown')}s")
            print(f"   Number of suggestions: {len(data.get('suggestions', []))}")
            
            # Print first suggestion details
            if data.get('suggestions'):
                suggestion = data['suggestions'][0]
                print(f"   First suggestion: {suggestion.get('suggestion', 'N/A')}")
                print(f"   Confidence: {suggestion.get('confidence', 'N/A')}")
                print(f"   Key improvements count: {len(suggestion.get('key_improvements', []))}")
            
            return True
        else:
            print(f"❌ Optimization failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Optimization error: {e}")
        return False

def test_prompt_testing(prompt):
    """Test the prompt testing endpoint"""
    print(f"\n🔍 Testing prompt execution...")
    try:
        response = requests.post(f"{BASE_URL}/test-prompt", json={"prompt": prompt})
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prompt test successful")
            print(f"   Generated response length: {len(data.get('generated_response', ''))}")
            print(f"   Model: {data.get('model', 'unknown')}")
            return True
        else:
            print(f"❌ Prompt test failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Prompt test error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting TinyLlama Prompt Optimizer Tests")
    print("=" * 60)
    
    # Test health
    if not test_health_check():
        print("\n❌ Health check failed. Is the server running?")
        return
    
    # Test model status
    if not test_model_status():
        print("\n❌ Model not loaded. Check server logs.")
        return
    
    # Test optimizations
    success_count = 0
    for i, prompt_data in enumerate(TEST_PROMPTS, 1):
        print(f"\n--- Test {i}/{len(TEST_PROMPTS)} ---")
        if test_optimization(prompt_data):
            success_count += 1
    
    # Test prompt execution
    test_prompt_testing("Hello, how are you today?")
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary: {success_count}/{len(TEST_PROMPTS)} optimization tests passed")
    
    if success_count == len(TEST_PROMPTS):
        print("🎉 All tests passed! Your optimizer is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the server logs for details.")

def interactive_test():
    """Interactive testing mode"""
    print("\n🎮 Interactive Testing Mode")
    print("Enter your prompts to test (type 'quit' to exit)")
    
    while True:
        user_input = input("\nEnter prompt: ").strip()
        if user_input.lower() in ['quit', 'exit', 'q']:
            break
        
        if not user_input:
            continue
            
        target_model = input("Target model (or press Enter for default): ").strip()
        if not target_model:
            target_model = "General AI Model"
        
        prompt_data = {
            "text": user_input,
            "target_model": target_model
        }
        
        test_optimization(prompt_data)

if __name__ == "__main__":
    print("Choose testing mode:")
    print("1. Automatic tests")
    print("2. Interactive testing")
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "2":
        interactive_test()
    else:
        main()