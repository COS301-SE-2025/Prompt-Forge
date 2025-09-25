# main.py
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from typing import List
from datetime import datetime
import numpy as np  # Added missing import
import uvicorn

from config import Config, logger
from models import (
    AnalysisResponse, OptimizationResponse, GoalOptimizationResponse,
    StructureOptimizationResponse, ContextOptimizationResponse, TokenValidationResponse,
    PromptRequest, GoalBasedRequest, StructureBasedRequest, ContextBasedRequest, WizardResults
)
from routes import (
    health_check, read_root, analyze_prompt_metrics, optimize_prompt,
    optimize_prompt_with_goals, optimize_prompt_with_structure,
    optimize_prompt_with_context, validate_token
)

# ----------------------------
# Enhanced Lifespan Management
# ----------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern lifespan handler replacing deprecated on_event decorators"""
    # Startup code
    logger.info("=== Enhanced Prompt Optimizer API v2.0 Starting ===")
    logger.info("Features: Standardized Rubric + AI Optimization")
    
    # Test system components
    try:
        from routes import analyzer
        
        # Test rubric system
        test_prompt = "Write a good email"
        analysis = await analyzer.analyze_prompt_comprehensive(test_prompt)
        logger.info(f"✅ Rubric system operational - test score: {analysis['metrics']['overall']}")
        
        # Test AI availability
        if analyzer.qwen_client.validate_token():
            logger.info("✅ Qwen API token is valid")
            logger.info("✅ AI optimization services available")
        else:
            logger.info("ℹ️  AI services unavailable - fallback optimization active")
        
        logger.info("🚀 Enhanced Prompt Optimizer API v2.0 Ready")
        
    except Exception as e:
        logger.error(f"❌ Startup validation failed: {e}")
        logger.info("⚠️  System running in degraded mode")
    
    yield  # App runs here
    
    # Shutdown code
    logger.info("Enhanced Prompt Optimizer API v2.0 shutting down")

# ----------------------------
# Enhanced FastAPI Application
# ----------------------------
app = FastAPI(
    title="Enhanced Prompt Optimizer API v2.0",
    description="Advanced prompt optimization with standardized rubric system",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan  # Modern lifespan handler
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
    Analyze prompt using standardized rubric system
    
    Features:
    - Deterministic scoring based on measurable criteria
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
def optimize_goals(request: GoalBasedRequest):
    """
    AI-powered goal-based optimization
    
    Features:
    - Qwen AI integration for intelligent optimization
    - Goal alignment scoring
    - Fallback to rule-based optimization
    """
    return optimize_prompt_with_goals(request)

@app.post("/optimize-with-structure", response_model=StructureOptimizationResponse)
def optimize_structure(request: StructureBasedRequest):
    """
    Structure-based optimization
    
    Features:
    - Rubric-guided structural improvements
    - Measurable structure scoring
    """
    return optimize_prompt_with_structure(request)

@app.post("/optimize-with-context", response_model=ContextOptimizationResponse)
def optimize_context(request: ContextBasedRequest):
    """
    Context-enhanced optimization
    
    Features:
    - Context analysis and enhancement
    - Domain-specific improvements
    """
    return optimize_prompt_with_context(request)

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

# ----------------------------
# Enhanced Wizard Endpoint
# ----------------------------
@app.get("/wizard-results", response_model=WizardResults)
async def get_wizard_results():
    """
    Get comprehensive results for the 6-step optimization wizard cycle
    """
    try:
        current_prompt = "Write an email to schedule a meeting"
        steps = []
        
        # Step 1: Initial analysis
        initial_analysis = await analyze_prompt_metrics(PromptRequest(text=current_prompt))
        steps.append({"step": "1_initial_analysis", "result": initial_analysis})
        
        # Step 2: Goal optimization
        goal_opt = optimize_prompt_with_goals(GoalBasedRequest(
            text=current_prompt,
            goals={"primaryObjective": "Schedule meeting", "tone": "professional"}
        ))
        current_prompt = goal_opt.optimized_prompt
        steps.append({"step": "2_goal_optimization", "result": goal_opt})
        
        # Step 3: Analysis after goal opt
        goal_analysis = await analyze_prompt_metrics(PromptRequest(text=current_prompt))
        steps.append({"step": "3_analysis_after_goal", "result": goal_analysis})
        
        # Step 4: Structure optimization
        struct_opt = optimize_prompt_with_structure(StructureBasedRequest(
            text=current_prompt,
            structure_options={"hasIntroduction": True, "stepByStep": True}
        ))
        current_prompt = struct_opt.structured_prompt
        steps.append({"step": "4_structure_optimization", "result": struct_opt})
        
        # Step 5: Analysis after structure opt
        struct_analysis = await analyze_prompt_metrics(PromptRequest(text=current_prompt))
        steps.append({"step": "5_analysis_after_structure", "result": struct_analysis})
        
        # Step 6: Context optimization
        context_opt = optimize_prompt_with_context(ContextBasedRequest(
            text=current_prompt,
            context_options={"domain": "business", "useCase": "scheduling"}
        ))
        current_prompt = context_opt.context_enhanced_prompt
        steps.append({"step": "6_context_optimization", "result": context_opt})
        
        # Calculate overall metrics
        improvement_progression = []
        for step in steps:
            if hasattr(step["result"], "metrics"):
                improvement_progression.append({
                    "step": step["step"],
                    "overall_score": step["result"].metrics.get("overall", 0)
                })
            elif hasattr(step["result"], "predicted_metrics"):
                improvement_progression.append({
                    "step": step["step"],
                    "overall_score": step["result"].predicted_metrics.get("overall", 0)
                })
        
        final_score = improvement_progression[-1]["overall_score"] if improvement_progression else 0
        
        return WizardResults(
            wizard_version="2.0.0",
            timestamp=datetime.now().isoformat(),
            steps=steps,
            consistency_check=None,  # Removed consistency
            overall_metrics={
                "improvement_progression": improvement_progression,
                "final_score": final_score,
                "optimization_time": 0.0  # Placeholder
            }
        )
        
    except Exception as e:
        logger.error(f"Wizard results generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate wizard results: {str(e)}"
        )

# ----------------------------
# Error Handling
# ----------------------------

@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    """Handle internal server errors gracefully"""
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )

# ----------------------------
# Application Run
# ----------------------------
if __name__ == "__main__":
    import socket
    import sys
    
    # Check if port is available
    def is_port_in_use(port: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex((Config.API_HOST, port)) == 0
    
    # Try alternative ports if default is occupied
    ports_to_try = [Config.API_PORT, 8002, 8003, 8004, 8005]
    selected_port = Config.API_PORT
    
    for port in ports_to_try:
        if not is_port_in_use(port):
            selected_port = port
            break
    else:
        logger.error("All ports are occupied. Please free up a port.")
        sys.exit(1)
    
    if selected_port != Config.API_PORT:
        logger.warning(f"Port {Config.API_PORT} occupied, using port {selected_port} instead")
    
    logger.info(f"Starting Enhanced Prompt Optimizer API v2.0 on {Config.API_HOST}:{selected_port}")
    
    uvicorn.run(
        app, 
        host=Config.API_HOST, 
        port=selected_port,
        log_level="info",
        access_log=True,
        reload=True  # Enable auto-reload for development
    )