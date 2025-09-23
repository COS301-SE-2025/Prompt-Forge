#!/usr/bin/env python3
"""
Test suite for the prompt optimization endpoints
"""
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Add the service directory to path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Import main FastAPI app and models
from main import app
from models import (
    PromptRequest, GoalBasedRequest, 
    StructureBasedRequest, ContextBasedRequest
)

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
    with patch('routes.optimize_prompt') as mock_optimize:
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
    assert response.status_code == 422  # Validation Error

# Test Goal-Based Optimization
def test_optimize_goals_success():
    """Test successful goal-based optimization"""
    with patch('routes.optimize_prompt_with_goals') as mock_optimize:
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
        assert "goal_alignment_scores" in data
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
    assert response.status_code == 422

# Test Structure-Based Optimization
def test_optimize_structure_success():
    """Test successful structure-based optimization"""
    with patch('routes.optimize_prompt_with_structure') as mock_optimize:
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
        assert "structure_alignment" in data
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
    assert response.status_code == 422

# Test Context-Based Optimization
def test_optimize_context_success():
    """Test successful context-based optimization"""
    with patch('routes.optimize_prompt_with_context') as mock_optimize:
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
        assert "context_relevance" in data
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
    assert response.status_code == 422

# Test Edge Cases
def test_optimization_with_very_long_prompt():
    """Test optimization with extremely long prompt"""
    very_long_prompt = "Write an email " * 1000  # Very long prompt
    response = client.post(
        "/optimize",
        json={"prompt": very_long_prompt}
    )
    assert response.status_code == 422

def test_optimization_with_special_characters():
    """Test optimization with special characters"""
    prompt_with_special_chars = "Write an email! @#$%^&*()"
    response = client.post(
        "/optimize",
        json={"prompt": prompt_with_special_chars}
    )
    assert response.status_code == 200

# Test Consistency
def test_optimization_consistency():
    """Test if optimization results are consistent"""
    with patch('routes.optimize_prompt') as mock_optimize:
        mock_optimize.return_value = MOCK_BASIC_RESPONSE
        
        # Multiple optimization requests for the same prompt
        responses = []
        for _ in range(3):
            response = client.post(
                "/optimize",
                json={"prompt": VALID_PROMPT}
            )
            responses.append(response.json())
        
        # Check if all responses are identical
        assert all(r["optimized_prompt"] == responses[0]["optimized_prompt"] for r in responses)
        assert all(r["improvement_score"] == responses[0]["improvement_score"] for r in responses)

# Run tests
if __name__ == "__main__":
    pytest.main([__file__])