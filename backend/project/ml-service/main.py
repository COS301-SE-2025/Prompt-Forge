# main.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
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
    optimize_prompt_with_context, validate_token, analyzer
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

@app.post("/optimize-wizard", response_model=dict)
async def optimize_wizard(request: PromptRequest):
    """
    Complete Optimizer Wizard: Analyze → Improve → Re-analyze → Compare
    
    Workflow:
    1. Analyze: Use sentence transformers and linguistic analyzers
    2. Improve: Use Qwen model for optimization
    3. Re-analyze: Analyze the improved prompt 
    4. Compare: Compare before/after analytics
    5. Feedback: Provide user feedback on improvements
    """
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Starting optimizer wizard for: {request.text[:100]}...")
        
        # Step 1: ANALYZE - Initial comprehensive analysis
        logger.info("Step 1: Analyzing original prompt...")
        initial_analysis = await analyzer.analyze_prompt_comprehensive(request.text)
        
        # Step 2: IMPROVE - Use Qwen model for optimization
        logger.info("Step 2: Optimizing prompt with AI...")
        optimization_result = analyzer.qwen_client.optimize_prompt_simple(request.text)
        
        if not optimization_result["success"]:
            # Fallback to goal-based optimization if simple fails
            logger.info("Simple optimization failed, trying goal-based...")
            fallback_result = analyzer.generate_goal_optimization(
                request.text, 
                {"clarity": True, "specificity": True, "actionability": True}, 
                initial_analysis["metrics"]
            )
            optimized_text = fallback_result.get("optimized_prompt", request.text)
            optimization_explanation = fallback_result.get("improvement_explanation", "Applied rule-based optimization")
            used_ai = fallback_result.get("success", False)
        else:
            optimized_text = optimization_result["optimized_prompt"]
            optimization_explanation = optimization_result["explanation"]
            used_ai = True
        
        # Step 3: RE-ANALYZE - Analyze the improved prompt
        logger.info("Step 3: Re-analyzing optimized prompt...")
        improved_analysis = await analyzer.analyze_prompt_comprehensive(optimized_text)
        
        # Step 4: COMPARE - Compare initial and improved analytics
        logger.info("Step 4: Comparing analytics...")
        comparison = {
            "metrics_comparison": {},
            "improvements": [],
            "regressions": [],
            "overall_improvement": 0
        }
        
        # Compare metrics
        for metric, initial_score in initial_analysis["metrics"].items():
            improved_score = improved_analysis["metrics"].get(metric, initial_score)
            difference = improved_score - initial_score
            
            comparison["metrics_comparison"][metric] = {
                "before": initial_score,
                "after": improved_score,
                "change": difference,
                "improvement": difference > 0
            }
            
            if difference > 0:
                comparison["improvements"].append({
                    "metric": metric,
                    "improvement": difference,
                    "description": f"{metric.title()} improved by {difference:.1f} points"
                })
            elif difference < 0:
                comparison["regressions"].append({
                    "metric": metric,
                    "regression": abs(difference),
                    "description": f"{metric.title()} decreased by {abs(difference):.1f} points"
                })
        
        # Calculate overall improvement
        initial_overall = initial_analysis["metrics"].get("overall", 0)
        improved_overall = improved_analysis["metrics"].get("overall", 0)
        comparison["overall_improvement"] = improved_overall - initial_overall
        
        # Step 5: FEEDBACK - Generate user feedback
        logger.info("Step 5: Generating user feedback...")
        
        if comparison["overall_improvement"] < 2 and len(comparison["improvements"]) < 2:
            feedback_type = "minimal_improvement"
            feedback_message = "Your prompt is already well-structured. Only minor refinements were possible."
        elif comparison["overall_improvement"] >= 10:
            feedback_type = "significant_improvement"
            feedback_message = f"Excellent! Your prompt has been significantly improved by {comparison['overall_improvement']:.1f} points overall."
        else:
            feedback_type = "moderate_improvement"
            feedback_message = f"Good! Your prompt has been improved by {comparison['overall_improvement']:.1f} points overall."
        
        # Prepare improvement highlights
        improvement_highlights = []
        for improvement in comparison["improvements"][:3]:  # Top 3 improvements
            improvement_highlights.append(improvement["description"])
        
        # Check for consistency between AI optimization and linguistic analysis
        consistency_check = {
            "consistent": len(comparison["regressions"]) == 0,
            "ai_vs_linguistic_alignment": "good" if comparison["overall_improvement"] > 0 else "mixed",
            "recommendation": "The AI optimization aligns well with linguistic analysis recommendations." if len(comparison["regressions"]) == 0 else "Some metrics showed regression - consider manual review."
        }
        
        return {
            "wizard_steps": {
                "step1_initial_analysis": {
                    "metrics": initial_analysis["metrics"],
                    "issues": initial_analysis.get("issues", []),
                    "rating": initial_analysis.get("rating", 0),
                    "rating_explanation": initial_analysis.get("rating_explanation", "")
                },
                "step2_optimization": {
                    "original_prompt": request.text,
                    "optimized_prompt": optimized_text,
                    "explanation": optimization_explanation,
                    "used_ai": used_ai
                },
                "step3_reanalysis": {
                    "metrics": improved_analysis["metrics"],
                    "issues": improved_analysis.get("issues", []),
                    "rating": improved_analysis.get("rating", 0),
                    "rating_explanation": improved_analysis.get("rating_explanation", "")
                },
                "step4_comparison": comparison,
                "step5_feedback": {
                    "type": feedback_type,
                    "message": feedback_message,
                    "improvement_highlights": improvement_highlights,
                    "consistency_check": consistency_check
                }
            },
            "summary": {
                "overall_improvement": comparison["overall_improvement"],
                "key_improvements": improvement_highlights,
                "final_recommendation": consistency_check["recommendation"],
                "optimization_success": used_ai and comparison["overall_improvement"] > 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimizer wizard failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Optimizer wizard service temporarily unavailable")

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