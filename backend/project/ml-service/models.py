from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional, Any

# Base Request/Response Models
class PromptRequest(BaseModel):
    text: str

# Token Validation
class TokenValidationResponse(BaseModel):
    valid: bool
    message: str
    available_models: List[str]

# Analysis Models
class AnalysisResponse(BaseModel):
    prompt: str
    metrics: Dict[str, float]
    issues: List[str]
    suggestions: List[str]
    is_excellent: bool
    improvement_potential: str
    rating: int
    rating_explanation: str

# Basic Optimization Models
class OptimizationSuggestion(BaseModel):
    suggestion: str
    before: str
    after: str
    impact: str

class OptimizationResponse(BaseModel):
    prompt: str
    suggestions: List[OptimizationSuggestion]
    source: str

# Goal-Based Optimization Models
class GoalBasedRequest(BaseModel):
    text: str
    goals: Dict[str, Any]

class GoalOptimizationResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    improvement_explanation: str
    goal_alignment_score: int
    predicted_metrics: Dict[str, float]
    key_changes: List[str]
    current_metrics: Dict[str, float]
    used_ai: bool

# Structure-Based Optimization Models
class StructureBasedRequest(BaseModel):
    text: str
    structure_options: Dict[str, bool]

class StructureOptimizationResponse(BaseModel):
    original_prompt: str
    structured_prompt: str
    structure_explanation: str
    structure_score: int
    structural_improvements: List[str]
    organization_type: str
    current_metrics: Dict[str, float]
    used_ai: bool

# Context-Based Optimization Models
class ContextBasedRequest(BaseModel):
    text: str
    context_options: Dict[str, Any]

class ContextOptimizationResponse(BaseModel):
    original_prompt: str
    context_enhanced_prompt: str
    context_explanation: str
    context_score: int
    context_improvements: List[str]
    enhancement_type: str
    current_metrics: Dict[str, float]
    used_ai: bool


class WizardStepResult(BaseModel):
    step_name: str
    score: float
    optimized_prompt: str
    improvements: List[str]

class WizardResults(BaseModel):
    wizard_version: str
    timestamp: datetime
    steps: Dict[str, dict]
    consistency_check: dict
    overall_metrics: dict

