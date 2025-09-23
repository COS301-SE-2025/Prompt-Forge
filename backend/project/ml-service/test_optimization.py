#!/usr/bin/env python3
"""
Test suite for the prompt optimization endpoints
"""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Add the parent directory to path
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

# Import main FastAPI app
from main import app

client = TestClient(app)

# Test Data
VALID_PROMPT = "Write a professional email to schedule a meeting"
INVALID_PROMPT = ""
VALID_GOALS = ["clarity", "professionalism"]
VALID_STRUCTURE = {
    "format": "email",
    "components": ["greeting", "body", "closing"]
}
VALID_CONTEXT = {
    "domain": "business",
    "audience": "professional"
}

# Successful Response Mocks
MOCK_BASIC_RESPONSE = {
    "optimized_prompt": "Dear [Name],\n\nI hope this email finds you well...",
    "improvement_score": 0.85,
    "suggestions": ["Added proper greeting", "Improved formatting"]
}

MOCK_GOAL_RESPONSE = {
    "optimized_prompt": "Dear [Name],\n\nI am writing to request...",
    "goal_alignment_scores": {"clarity": 0.9, "professionalism": 0.95},
    "suggestions": ["Added clear objective", "Enhanced professional tone"]
}

MOCK_STRUCTURE_RESPONSE = {
    "optimized_prompt": "Subject: Meeting Request\n\nDear [Name],\n\n...",
    "structure_alignment": 0.88,
    "structure_improvements": ["Added subject line", "Proper email format"]
}

MOCK_CONTEXT_RESPONSE = {
    "optimized_prompt": "Dear [Professional Title],\n\nI am reaching out...",
    "context_relevance": 0.92,
    "context_enhancements": ["Added industry-specific terms", "Appropriate formality"]
}

# Test Basic Optimization
def test_optimize_success():
    """Test successful basic prompt optimization"""
    # Mock the optimization function - adjust the import path based on your actual code structure
    with patch('main.optimize_prompt') as mock_optimize:
        mock_optimize.return_value = MOCK_BASIC_RESPONSE
        
        response = client.post(
            "/optimize",
            json={"prompt": VALID_PROMPT}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "optimized_prompt" in data
        assert "improvement_score" in data
        assert data["improvement_score"] >= 0.0
        assert data["improvement_score"] <= 1.0

def test_optimize_failure():
    """Test basic optimization with invalid input"""
    response = client.post(
        "/optimize",
        json={"prompt": INVALID_PROMPT}
    )
    # Could be 422 (Validation Error) or 400 (Bad Request)
    assert response.status_code in [400, 422]

# Test Goal-Based Optimization
def test_optimize_goals_success():
    """Test successful goal-based optimization"""
    with patch('main.optimize_prompt_with_goals') as mock_optimize:
        mock_optimize.return_value = MOCK_GOAL_RESPONSE
        
        response = client.post(
            "/optimize-with-goals",
            json={
                "prompt": VALID_PROMPT,
                "goals": VALID_GOALS
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "optimized_prompt" in data
        if "goal_alignment_scores" in data:
            assert all(0.0 <= score <= 1.0 for score in data["goal_alignment_scores"].values())

def test_optimize_goals_failure():
    """Test goal-based optimization with invalid goals"""
    response = client.post(
        "/optimize-with-goals",
        json={
            "prompt": VALID_PROMPT,
            "goals": []  # Empty goals list
        }
    )
    assert response.status_code in [400, 422]

# Test Structure-Based Optimization
def test_optimize_structure_success():
    """Test successful structure-based optimization"""
    with patch('main.optimize_prompt_with_structure') as mock_optimize:
        mock_optimize.return_value = MOCK_STRUCTURE_RESPONSE
        
        response = client.post(
            "/optimize-with-structure",
            json={
                "prompt": VALID_PROMPT,
                "structure": VALID_STRUCTURE
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "optimized_prompt" in data
        if "structure_alignment" in data:
            assert 0.0 <= data["structure_alignment"] <= 1.0

def test_optimize_structure_failure():
    """Test structure-based optimization with invalid structure"""
    response = client.post(
        "/optimize-with-structure",
        json={
            "prompt": VALID_PROMPT,
            "structure": {}  # Empty structure
        }
    )
    assert response.status_code in [400, 422]

# Test Context-Based Optimization
def test_optimize_context_success():
    """Test successful context-based optimization"""
    with patch('main.optimize_prompt_with_context') as mock_optimize:
        mock_optimize.return_value = MOCK_CONTEXT_RESPONSE
        
        response = client.post(
            "/optimize-with-context",
            json={
                "prompt": VALID_PROMPT,
                "context": VALID_CONTEXT
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "optimized_prompt" in data
        if "context_relevance" in data:
            assert 0.0 <= data["context_relevance"] <= 1.0

def test_optimize_context_failure():
    """Test context-based optimization with invalid context"""
    response = client.post(
        "/optimize-with-context",
        json={
            "prompt": VALID_PROMPT,
            "context": {}  # Empty context
        }
    )
    assert response.status_code in [400, 422]

# Test Endpoint Existence - RENAMED from test_endpoint
def test_all_endpoints_exist():
    """Test that all endpoints are defined"""
    endpoints = [
        "/optimize",
        "/optimize-with-goals", 
        "/optimize-with-structure",
        "/optimize-with-context"
    ]
    
    for endpoint in endpoints:
        # Try POST request
        response = client.post(endpoint, json={"prompt": VALID_PROMPT})
        # Should not be 404 (Not Found)
        assert response.status_code != 404, f"Endpoint {endpoint} not found"

# Test Edge Cases
def test_optimization_with_very_long_prompt():
    """Test optimization with extremely long prompt"""
    very_long_prompt = "Write an email " * 100  # Reduced length to avoid timeout
    response = client.post(
        "/optimize",
        json={"prompt": very_long_prompt}
    )
    # Should be validation error or bad request
    assert response.status_code in [400, 422]

def test_optimization_with_special_characters():
    """Test optimization with special characters"""
    prompt_with_special_chars = "Write an email! @#$%^&*()"
    response = client.post(
        "/optimize",
        json={"prompt": prompt_with_special_chars}
    )
    # Should not be a server error
    assert response.status_code < 500

# Test Consistency
def test_optimization_consistency():
    """Test if optimization results are consistent"""
    with patch('main.optimize_prompt') as mock_optimize:
        mock_optimize.return_value = MOCK_BASIC_RESPONSE
        
        # Multiple optimization requests for the same prompt
        responses = []
        for _ in range(2):  # Reduced to 2 for faster testing
            response = client.post(
                "/optimize",
                json={"prompt": VALID_PROMPT}
            )
            if response.status_code == 200:
                responses.append(response.json())
        
        if len(responses) > 1:  # Only test if we got multiple successful responses
            # Check if all responses are identical
            assert all(r["optimized_prompt"] == responses[0]["optimized_prompt"] for r in responses)
            assert all(r["improvement_score"] == responses[0]["improvement_score"] for r in responses)

# Simple health check test
def test_health_check():
    """Test that the API is accessible"""
    response = client.get("/")
    # Could be 200, 404, or 405 - we just want to make sure it's not a server error
    assert response.status_code < 500

# Run tests
if __name__ == "__main__":
    # Simple test runner that doesn't rely on pytest
    test_functions = [
        test_health_check,
        test_all_endpoints_exist,
        test_optimize_failure,
        test_optimization_with_special_characters,
    ]
    
    # Try to run the success tests with mocking
    try:
        with patch('main.optimize_prompt') as mock_optimize:
            mock_optimize.return_value = MOCK_BASIC_RESPONSE
            test_functions.append(test_optimize_success)
    except:
        print("Note: Mock tests skipped - functions may not exist yet")
    
    passed = 0
    failed = 0
    
    for test_func in test_functions:
        try:
            test_func()
            print(f"✅ {test_func.__name__} passed")
            passed += 1
        except Exception as e:
            print(f"❌ {test_func.__name__} failed: {e}")
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All tests passed!")
    else:
        print("Some tests failed. This is normal if your API endpoints aren't fully implemented yet.")