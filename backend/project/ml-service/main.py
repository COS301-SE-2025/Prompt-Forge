from fastapi import FastAPI, Body, HTTPException
from typing import List
from datetime import datetime
from config import Config, logger
from models import (
    AnalysisResponse, OptimizationResponse, GoalOptimizationResponse,
    StructureOptimizationResponse, ContextOptimizationResponse, TokenValidationResponse,
    PromptRequest, GoalBasedRequest, StructureBasedRequest, ContextBasedRequest, WizardResults
)
from routes import (
    health_check, read_root, analyze_prompt_metrics, optimize_prompt,
    optimize_prompt_with_goals, optimize_prompt_with_structure,
    optimize_prompt_with_context, validate_token, get_rubric_info, test_consistency
)

# ----------------------------
# Enhanced FastAPI Application
# ----------------------------
app = FastAPI(
    title="Enhanced Prompt Optimizer API v2.0",
    description="Advanced prompt optimization with standardized rubric system and consistency validation",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ----------------------------
# Core Routes
# ----------------------------

@app.get("/")
def root():
    """Root endpoint with enhanced features"""
    return read_root()

@app.get("/health")
def health():
    """Health check endpoint"""
    return health_check()

# ----------------------------
# Analysis Routes
# ----------------------------

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: PromptRequest):
    """
    Analyze prompt using standardized rubric system with consistency validation
    
    Features:
    - Deterministic scoring based on measurable criteria
    - Consistency validation across multiple runs
    - Detailed rubric-based analysis
    """
    return await analyze_prompt_metrics(request)

# ----------------------------
# Optimization Routes
# ----------------------------

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: PromptRequest):
    """
    Basic prompt optimization with enhanced rubric-based analysis
    
    Features:
    - Rubric-based issue identification
    - Targeted optimization suggestions
    - Backward compatibility with v1.0
    """
    return await optimize_prompt(request)

@app.post("/optimize-with-goals", response_model=GoalOptimizationResponse)
async def optimize_goals(request: GoalBasedRequest):
    """
    AI-powered goal-based optimization with consistency validation
    
    Features:
    - Qwen AI integration for intelligent optimization
    - Goal alignment scoring
    - Consistency validation of optimization results
    - Fallback to rule-based optimization
    """
    return await optimize_prompt_with_goals(request)

@app.post("/optimize-with-structure", response_model=StructureOptimizationResponse)
async def optimize_structure(request: StructureBasedRequest):
    """
    Structure-based optimization with consistency validation
    
    Features:
    - Rubric-guided structural improvements
    - Measurable structure scoring
    - Consistency validation
    """
    return await optimize_prompt_with_structure(request)

@app.post("/optimize-with-context", response_model=ContextOptimizationResponse)
async def optimize_context(request: ContextBasedRequest):
    """
    Context-enhanced optimization with consistency validation
    
    Features:
    - Context analysis and enhancement
    - Domain-specific improvements
    - Consistency validation
    """
    return await optimize_prompt_with_context(request)

# ----------------------------
# Validation and Information Routes
# ----------------------------

@app.get("/validate-token", response_model=TokenValidationResponse)
def token_validation():
    """
    Validate service availability and features
    
    Returns:
    - Service status and available features
    - AI model availability
    - Rubric system information
    """
    return validate_token()

@app.get("/rubric-info")
async def rubric_information():
    """
    Get detailed information about the standardized rubric system
    
    Returns:
    - Rubric criteria and weights
    - Scoring methodology
    - Consistency features
    """
    return await get_rubric_info()

# ----------------------------
# Consistency Testing Routes
# ----------------------------

@app.post("/test-consistency")
async def consistency_test(
    prompts: List[str] = Body(..., description="List of prompts to test for consistency"),
    num_runs: int = Body(3, description="Number of test runs per prompt (1-10)", ge=1, le=10)
):
    """
    Test system consistency with provided prompts
    
    Features:
    - Batch consistency testing
    - Statistical analysis of score variations
    - System reliability assessment
    - Rubric calibration insights
    
    Args:
        prompts: List of 1-10 prompts to test
        num_runs: Number of evaluation runs per prompt (1-10)
    
    Returns:
        Comprehensive consistency analysis and recommendations
    """
    return await test_consistency(prompts, num_runs)

# ----------------------------
# Enhanced Comparison Endpoint
# ----------------------------

@app.post("/compare-prompts")
async def compare_prompts(
    original_prompt: str = Body(..., description="Original prompt text"),
    optimized_prompt: str = Body(..., description="Optimized prompt text"),
    validate_consistency: bool = Body(True, description="Enable consistency validation")
):
    """
    Compare two prompts using rubric system with optional consistency validation
    
    Features:
    - Side-by-side rubric analysis
    - Improvement measurement
    - Consistency validation
    - Reliability assessment
    
    Returns:
        Detailed comparison with consistency validation
    """
    from routes import analyzer
    
    try:
        if not original_prompt.strip() or not optimized_prompt.strip():
            raise HTTPException(status_code=400, detail="Both prompts must be non-empty")
        
        logger.info("Comparing prompts with consistency validation")
        comparison = analyzer.compare_prompts_with_validation(
            original_prompt, 
            optimized_prompt, 
            validate_consistency
        )
        
        return comparison
        
    except Exception as e:
        logger.error(f"Prompt comparison failed: {e}")
        raise HTTPException(status_code=500, detail="Comparison service temporarily unavailable")

# ----------------------------
# System Status and Metrics
# ----------------------------

@app.get("/system-status")
async def system_status():
    """
    Get comprehensive system status and capabilities
    
    Returns:
    - Service health
    - AI model availability  
    - Rubric system status
    - Feature availability
    """
    from routes import analyzer
    
    try:
        qwen_available = analyzer.qwen_client.validate_token()
        rubric_info = analyzer.get_rubric_information()
        
        return {
            "service_version": "2.0.0",
            "service_status": "operational",
            "features": {
                "standardized_rubric": True,
                "consistency_validation": True,
                "ai_optimization": qwen_available,
                "fallback_optimization": True,
                "batch_testing": True
            },
            "ai_services": {
                "qwen_available": qwen_available,
                "models_available": analyzer.qwen_client.get_available_models() if qwen_available else []
            },
            "rubric_system": {
                "version": rubric_info.get("version", "1.0"),
                "total_criteria": rubric_info.get("total_criteria", 5),
                "methodology": rubric_info.get("scoring_methodology", "Deterministic rules-based"),
                "consistency_features": rubric_info.get("consistency_features", [])
            },
            "performance": {
                "deterministic_scoring": True,
                "cache_enabled": True,
                "consistency_validated": True
            }
        }
        
    except Exception as e:
        logger.error(f"System status check failed: {e}")
        return {
            "service_version": "2.0.0",
            "service_status": "degraded",
            "error": "Could not retrieve full system status"
        }

# ----------------------------
# Application Startup Events
# ----------------------------

@app.on_event("startup")
async def startup_event():
    """Initialize system on startup"""
    logger.info("=== Enhanced Prompt Optimizer API v2.0 Starting ===")
    logger.info("Features: Standardized Rubric + Consistency Validation + AI Optimization")
    
    # Test system components
    try:
        from routes import analyzer
        
        # Test rubric system
        test_prompt = "Write a good email"
        analysis = analyzer.analyze_prompt_comprehensive(test_prompt)
        logger.info(f"✅ Rubric system operational - test score: {analysis['metrics']['overall']}")
        
        # Test AI availability
        if analyzer.qwen_client.validate_token():
            logger.info("✅ AI optimization services available")
        else:
            logger.info("ℹ️  AI services unavailable - fallback optimization active")
        
        logger.info("🚀 Enhanced Prompt Optimizer API v2.0 Ready")
        
    except Exception as e:
        logger.error(f"❌ Startup validation failed: {e}")
        logger.info("⚠️  System running in degraded mode")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Enhanced Prompt Optimizer API v2.0 shutting down")

# ...existing code...

@app.get("/wizard-results", response_model=WizardResults)
async def get_wizard_results():
    """
    Get comprehensive results for the entire optimization wizard cycle
    """
    try:
        test_prompt = "Write an email to schedule a meeting"
        
        results = {
            "wizard_version": "2.0.0",
            "timestamp": datetime.now().isoformat(),
            "steps": {
                "1_basic_optimization": await optimize(
                    PromptRequest(text=test_prompt)
                ),
                "2_goal_optimization": await optimize_goals(
                    GoalBasedRequest(
                        text=test_prompt,
                        goals={
                            "clarity": 0.8,
                            "professionalism": 0.9
                        }
                    )
                ),
                "3_structure_optimization": await optimize_structure(
                    StructureBasedRequest(
                        text=test_prompt,
                        structure={
                            "format": "email",
                            "components": ["greeting", "body", "closing"]
                        }
                    )
                ),
                "4_context_optimization": await optimize_context(
                    ContextBasedRequest(
                        text=test_prompt,
                        context={
                            "domain": "business",
                            "audience": "professional"
                        }
                    )
                )
            },
            "consistency_check": await test_consistency([test_prompt], num_runs=3),
            "overall_metrics": {
                "improvement_progression": [],
                "final_score": 0.0,
                "optimization_time": 0.0
            }
        }
        
        # Calculate metrics
        for step, step_results in results["steps"].items():
            score = step_results.get("improvement_score", 0.0)
            results["overall_metrics"]["improvement_progression"].append({
                "step": step,
                "score": score
            })
        
        results["overall_metrics"]["final_score"] = max(
            score["score"] for score in results["overall_metrics"]["improvement_progression"]
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Wizard results generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate wizard results: {str(e)}"
        )
# ...existing code...

# ----------------------------
# Application Run
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting Enhanced Prompt Optimizer API v2.0 on {Config.API_HOST}:{Config.API_PORT}")
    uvicorn.run(
        app, 
        host=Config.API_HOST, 
        port=Config.API_PORT,
        log_level="info",
        access_log=True
    )