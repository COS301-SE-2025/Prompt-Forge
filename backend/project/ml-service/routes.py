from fastapi import HTTPException
from config import logger
from models import (
    PromptRequest, AnalysisResponse, OptimizationResponse, OptimizationSuggestion,
    GoalBasedRequest, GoalOptimizationResponse, StructureBasedRequest, StructureOptimizationResponse,
    ContextBasedRequest, ContextOptimizationResponse, TokenValidationResponse
)
from metrics_analyzer import PromptMetricsAnalyzer

# Initialize analyzer
analyzer = PromptMetricsAnalyzer()

def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "prompt-optimizer-qwen-metrics"}

def read_root():
    """Root endpoint"""
    return {"message": "Prompt Optimizer API with Qwen and Metrics Analysis is running."}

async def analyze_prompt_metrics(request: PromptRequest):
    """Analyze prompt metrics without generating suggestions"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Analyzing prompt: {request.text[:100]}...")
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        
        return AnalysisResponse(
            prompt=request.text,
            metrics=analysis["metrics"],
            issues=analysis["issues"],
            suggestions=analysis["suggestions"],
            is_excellent=analysis["is_excellent"],
            improvement_potential=analysis["improvement_potential"],
            rating=analysis["rating"],
            rating_explanation=analysis["rating_explanation"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis service temporarily unavailable")

async def optimize_prompt(request: PromptRequest):
    """Optimize prompt using basic optimization (legacy endpoint)"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Basic optimization for prompt: {request.text[:100]}...")
        
        # For basic optimization, create simple rule-based suggestions
        suggestions = create_basic_optimization_suggestions(request.text)
        
        # Determine source based on whether we got AI suggestions or fallback
        source = "ai" if analyzer.qwen_client.token_validated and analyzer.qwen_client.get_available_models() else "fallback"
        
        return OptimizationResponse(
            prompt=request.text, 
            suggestions=suggestions,
            source=source
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Optimization service temporarily unavailable")

def create_basic_optimization_suggestions(text: str):
    """Create basic optimization suggestions"""
    suggestions = []
    
    # Check for common issues and suggest improvements
    if len(text.split()) < 10:
        suggestions.append(OptimizationSuggestion(
            suggestion="Add more detail and context",
            before="Short prompt without context",
            after="Detailed prompt with background information and specific requirements",
            impact="Improves clarity and AI understanding"
        ))
    
    if '?' not in text and not any(word in text.lower() for word in ['write', 'create', 'generate', 'explain']):
        suggestions.append(OptimizationSuggestion(
            suggestion="Add clear action words",
            before="Vague request without clear instruction",
            after="Please write/create/explain [specific request]",
            impact="Makes the desired action clear"
        ))
    
    if not any(word in text.lower() for word in ['format', 'length', 'style', 'tone']):
        suggestions.append(OptimizationSuggestion(
            suggestion="Specify output requirements",
            before="No format specification",
            after="Please provide a [format] response with [length] and [tone]",
            impact="Ensures output meets your needs"
        ))
    
    return suggestions

async def optimize_prompt_with_goals(request: GoalBasedRequest):
    """Optimize prompt using Qwen based on user goals and current metrics"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt with goals using Qwen: {request.text[:100]}...")
        
        # First, analyze current metrics
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        current_metrics = analysis["metrics"]
        
        # Then, generate goal-based optimization using Qwen
        optimization_result = analyzer.generate_goal_optimization(
            request.text, 
            request.goals, 
            current_metrics
        )
        
        return GoalOptimizationResponse(
            original_prompt=request.text,
            optimized_prompt=optimization_result["optimized_prompt"],
            improvement_explanation=optimization_result["improvement_explanation"],
            goal_alignment_score=optimization_result["goal_alignment_score"],
            predicted_metrics=optimization_result["predicted_metrics"],
            key_changes=optimization_result["key_changes"],
            current_metrics=current_metrics,
            used_ai=optimization_result["success"]  # True if Qwen was used, False if fallback
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Goal-based optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Goal-based optimization service temporarily unavailable")

async def optimize_prompt_with_structure(request: StructureBasedRequest):
    """Optimize prompt structure using Qwen based on selected options and current metrics"""
    try:
        logger.info("=== STRUCTURE OPTIMIZATION ENDPOINT CALLED ===")
        logger.info(f"Request text length: {len(request.text) if request.text else 0}")
        logger.info(f"Structure options: {request.structure_options}")
        
        # Validate request
        if not request:
            logger.error("No request object provided")
            raise HTTPException(status_code=400, detail="Invalid request")
            
        if not hasattr(request, 'text') or not request.text:
            logger.error("No text field in request or text is empty")
            raise HTTPException(status_code=400, detail="Prompt text is required")
            
        if not hasattr(request, 'structure_options'):
            logger.error("No structure_options field in request")
            raise HTTPException(status_code=400, detail="Structure options are required")
        
        if not request.text.strip():
            logger.error("Empty prompt text provided")
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt structure: {request.text[:100]}...")
        
        # First, analyze current metrics
        logger.info("Analyzing current metrics...")
        try:
            analysis = analyzer.analyze_prompt_comprehensive(request.text)
            current_metrics = analysis["metrics"]
            logger.info(f"Current metrics: {current_metrics}")
        except Exception as e:
            logger.error(f"Error analyzing metrics: {str(e)}")
            # Use default metrics if analysis fails
            current_metrics = {
                "clarity": 50,
                "specificity": 50,
                "structure": 50,
                "context": 50,
                "overall": 50
            }
            logger.warning("Using default metrics due to analysis error")
        
        # Then, generate structure-based optimization
        logger.info("Starting structure optimization...")
        try:
            structure_result = analyzer.generate_structure_optimization(
                request.text, 
                request.structure_options, 
                current_metrics
            )
            
            logger.info("=== STRUCTURE OPTIMIZATION RESULT ===")
            logger.info(f"Success: {structure_result.get('success', False)}")
            logger.info(f"Structure score: {structure_result.get('structure_score', 0)}")
            logger.info(f"Improvements count: {len(structure_result.get('structural_improvements', []))}")
            
        except Exception as e:
            logger.error(f"Error in structure optimization: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            # Create a basic fallback result
            structure_result = {
                "structured_prompt": f"## Task\n{request.text}\n\n## Instructions\n- Provide clear and detailed responses\n- Follow professional standards",
                "structure_explanation": "Basic structure applied due to processing error",
                "structure_score": 60,
                "structural_improvements": ["Applied basic formatting"],
                "organization_type": "basic",
                "success": False
            }
            logger.warning("Using emergency fallback structure result")
        
        # Validate structure_result
        required_fields = ['structured_prompt', 'structure_explanation', 'structure_score', 'structural_improvements', 'organization_type']
        for field in required_fields:
            if field not in structure_result:
                logger.error(f"Missing required field in structure_result: {field}")
                structure_result[field] = "Unknown" if field in ['structure_explanation', 'organization_type'] else ([] if field == 'structural_improvements' else 50)
        
        # Create response
        try:
            response = StructureOptimizationResponse(
                original_prompt=request.text,
                structured_prompt=structure_result["structured_prompt"],
                structure_explanation=structure_result["structure_explanation"],
                structure_score=int(structure_result["structure_score"]) if isinstance(structure_result["structure_score"], (int, float)) else 50,
                structural_improvements=structure_result["structural_improvements"] if isinstance(structure_result["structural_improvements"], list) else [],
                organization_type=structure_result["organization_type"],
                current_metrics=current_metrics,
                used_ai=structure_result.get("success", False)
            )
            
            logger.info("✅ Structure optimization response created successfully")
            return response
            
        except Exception as e:
            logger.error(f"Error creating response object: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error creating response: {str(e)}")
        
    except HTTPException:
        logger.error("HTTPException in structure optimization")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in structure optimization endpoint: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def optimize_prompt_with_context(request: ContextBasedRequest):
    """Optimize prompt context using Qwen based on selected options and current metrics"""
    try:
        logger.info("=== CONTEXT OPTIMIZATION ENDPOINT CALLED ===")
        logger.info(f"Request text length: {len(request.text) if request.text else 0}")
        logger.info(f"Context options: {request.context_options}")
        
        # Validate request
        if not request:
            logger.error("No request object provided")
            raise HTTPException(status_code=400, detail="Invalid request")
            
        if not hasattr(request, 'text') or not request.text:
            logger.error("No text field in request or text is empty")
            raise HTTPException(status_code=400, detail="Prompt text is required")
            
        if not hasattr(request, 'context_options'):
            logger.error("No context_options field in request")
            raise HTTPException(status_code=400, detail="Context options are required")
        
        if not request.text.strip():
            logger.error("Empty prompt text provided")
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt context: {request.text[:100]}...")
        
        # First, analyze current metrics
        logger.info("Analyzing current metrics...")
        try:
            analysis = analyzer.analyze_prompt_comprehensive(request.text)
            current_metrics = analysis["metrics"]
            logger.info(f"Current metrics: {current_metrics}")
        except Exception as e:
            logger.error(f"Error analyzing metrics: {str(e)}")
            # Use default metrics if analysis fails
            current_metrics = {
                "clarity": 50,
                "specificity": 50,
                "structure": 50,
                "context": 50,
                "overall": 50
            }
            logger.warning("Using default metrics due to analysis error")
        
        # Then, generate context-based optimization
        logger.info("Starting context optimization...")
        try:
            context_result = analyzer.generate_context_optimization(
                request.text, 
                request.context_options, 
                current_metrics
            )
            
            logger.info("=== CONTEXT OPTIMIZATION RESULT ===")
            logger.info(f"Success: {context_result.get('success', False)}")
            logger.info(f"Context score: {context_result.get('context_score', 0)}")
            logger.info(f"Improvements count: {len(context_result.get('context_improvements', []))}")
            
        except Exception as e:
            logger.error(f"Error in context optimization: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            # Create a basic fallback result
            context_result = {
                "context_enhanced_prompt": f"**Task:** {request.text}\n\n**Context:** Please consider relevant background information when responding.",
                "context_explanation": "Basic context enhancement applied due to processing error",
                "context_score": 60,
                "context_improvements": ["Applied basic context formatting"],
                "enhancement_type": "basic",
                "success": False
            }
            logger.warning("Using emergency fallback context result")
        
        # Validate context_result
        required_fields = ['context_enhanced_prompt', 'context_explanation', 'context_score', 'context_improvements', 'enhancement_type']
        for field in required_fields:
            if field not in context_result:
                logger.error(f"Missing required field in context_result: {field}")
                context_result[field] = "Unknown" if field in ['context_explanation', 'enhancement_type'] else ([] if field == 'context_improvements' else 50)
        
        # Create response
        try:
            response = ContextOptimizationResponse(
                original_prompt=request.text,
                context_enhanced_prompt=context_result["context_enhanced_prompt"],
                context_explanation=context_result["context_explanation"],
                context_score=int(context_result["context_score"]) if isinstance(context_result["context_score"], (int, float)) else 50,
                context_improvements=context_result["context_improvements"] if isinstance(context_result["context_improvements"], list) else [],
                enhancement_type=context_result["enhancement_type"],
                current_metrics=current_metrics,
                used_ai=context_result.get("success", False)
            )
            
            logger.info("✅ Context optimization response created successfully")
            return response
            
        except Exception as e:
            logger.error(f"Error creating response object: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error creating response: {str(e)}")
        
    except HTTPException:
        logger.error("HTTPException in context optimization")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in context optimization endpoint: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def validate_token():
    """Validate service availability"""
    qwen_valid = analyzer.qwen_client.validate_token()
    available_models = analyzer.qwen_client.get_available_models() if qwen_valid else []
    
    if qwen_valid:
        message = "Qwen models available for goal-based optimization"
    else:
        message = "Metrics analysis available, goal optimization will use fallback"
    
    return TokenValidationResponse(
        valid=True,  # Service is always available (metrics + fallback)
        message=message,
        available_models=available_models + ["metrics-analyzer", "prompt-evaluator"]
    )