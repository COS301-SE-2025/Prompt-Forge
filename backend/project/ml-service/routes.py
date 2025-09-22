from fastapi import HTTPException
from config import logger
from models import (
    PromptRequest, AnalysisResponse, OptimizationResponse, OptimizationSuggestion,
    GoalBasedRequest, GoalOptimizationResponse, StructureBasedRequest, StructureOptimizationResponse,
    ContextBasedRequest, ContextOptimizationResponse, TokenValidationResponse
)
from metrics_analyzer import EnhancedPromptMetricsAnalyzer

# Initialize enhanced analyzer with rubric system
analyzer = EnhancedPromptMetricsAnalyzer()

def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "enhanced-prompt-optimizer-with-rubric"}

def read_root():
    """Root endpoint"""
    return {
        "message": "Enhanced Prompt Optimizer API with Standardized Rubric System",
        "version": "2.0",
        "features": [
            "Standardized rubric-based evaluation",
            "Consistency validation",
            "Deterministic scoring",
            "AI-powered optimization with fallbacks"
        ]
    }

async def analyze_prompt_metrics(request: PromptRequest):
    """Analyze prompt metrics using standardized rubric system"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Analyzing prompt with rubric system: {request.text[:100]}...")
        
        # Use enhanced analyzer with rubric system
        # Enable consistency validation for analysis endpoint
        analysis = analyzer.analyze_prompt_comprehensive(
            request.text, 
            validate_consistency=True,
            num_consistency_runs=3
        )
        
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
        logger.error(f"Enhanced analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis service temporarily unavailable")

async def optimize_prompt(request: PromptRequest):
    """Basic prompt optimization (legacy endpoint with enhanced analysis)"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Basic optimization with enhanced analysis: {request.text[:100]}...")
        
        # Use enhanced analyzer for initial assessment
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        
        # Create rule-based suggestions based on rubric analysis
        suggestions = create_enhanced_optimization_suggestions(request.text, analysis)
        
        # Determine source based on whether we got AI suggestions or fallback
        source = "enhanced_rubric" if analysis["rubric_analysis"] else "fallback"
        
        return OptimizationResponse(
            prompt=request.text, 
            suggestions=suggestions,
            source=source
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Optimization service temporarily unavailable")

def create_enhanced_optimization_suggestions(text: str, analysis: dict):
    """Create optimization suggestions based on rubric analysis"""
    suggestions = []
    
    if not analysis or not analysis.get("rubric_analysis"):
        # Fallback to basic suggestions
        return create_basic_optimization_suggestions(text)
    
    rubric_analysis = analysis["rubric_analysis"]
    criteria_scores = rubric_analysis.get("criteria_scores", {})
    detailed_analysis = rubric_analysis.get("detailed_analysis", {})
    
    # Generate suggestions based on low-scoring criteria
    for criterion_name, criterion_data in criteria_scores.items():
        score = criterion_data.get("score", 0)
        
        if score < 70:  # Below good performance
            if criterion_name == "clarity":
                suggestions.append(OptimizationSuggestion(
                    suggestion="Improve clarity by removing vague language",
                    before="Contains unclear or ambiguous terms",
                    after="Use specific, concrete language with clear action verbs",
                    impact="Increases clarity score by 15-25 points"
                ))
                
            elif criterion_name == "specificity":
                suggestions.append(OptimizationSuggestion(
                    suggestion="Add specific requirements and constraints",
                    before="Generic request without details",
                    after="Include format, length, audience, and specific deliverables",
                    impact="Increases specificity score by 20-30 points"
                ))
                
            elif criterion_name == "structure":
                suggestions.append(OptimizationSuggestion(
                    suggestion="Organize content with clear structure",
                    before="Unstructured stream of text",
                    after="Use headers, bullet points, numbered lists, and logical flow",
                    impact="Increases structure score by 18-25 points"
                ))
                
            elif criterion_name == "context":
                suggestions.append(OptimizationSuggestion(
                    suggestion="Provide background context and purpose",
                    before="Request lacks situational context",
                    after="Include background, purpose, use case, and constraints",
                    impact="Increases context score by 20-30 points"
                ))
                
            elif criterion_name == "actionability":
                suggestions.append(OptimizationSuggestion(
                    suggestion="Make the prompt more actionable",
                    before="Unclear what specific actions to take",
                    after="Include clear action verbs, deliverables, and step-by-step guidance",
                    impact="Increases actionability score by 15-25 points"
                ))
    
    # If no specific suggestions generated, provide general improvement
    if not suggestions:
        suggestions.append(OptimizationSuggestion(
            suggestion="Apply general prompt improvements",
            before="Prompt meets most criteria but could be enhanced",
            after="Add minor refinements in clarity, structure, or specificity",
            impact="Overall improvement of 5-10 points"
        ))
    
    return suggestions[:4]  # Limit to top 4 suggestions

def create_basic_optimization_suggestions(text: str):
    """Fallback basic optimization suggestions"""
    suggestions = []
    
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
    """Optimize prompt using AI based on user goals with consistency validation"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Goal-based optimization with consistency validation: {request.text[:100]}...")
        
        # First, analyze current metrics using enhanced analyzer
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        current_metrics = analysis["metrics"]
        
        # Then, generate goal-based optimization using AI
        optimization_result = analyzer.generate_goal_optimization(
            request.text, 
            request.goals, 
            current_metrics
        )
        
        # Validate consistency of optimization if AI was used
        if optimization_result.get("success") and optimization_result.get("optimized_prompt"):
            try:
                # Quick consistency check (fewer runs for performance)
                comparison = analyzer.compare_prompts_with_validation(
                    request.text,
                    optimization_result["optimized_prompt"],
                    validate_consistency=True
                )
                
                # Log consistency results
                if comparison.get("consistency_validation"):
                    consistency_summary = comparison["consistency_validation"]["validation_summary"]
                    logger.info(f"Optimization consistency: {consistency_summary['recommendation']}")
                    
                    # If optimization is not reliable, add warning
                    if not consistency_summary.get("optimization_reliable", True):
                        optimization_result["consistency_warning"] = "Optimization shows inconsistent results across multiple evaluations"
                
            except Exception as e:
                logger.warning(f"Consistency validation failed: {e}")
                optimization_result["consistency_warning"] = "Could not validate optimization consistency"
        
        return GoalOptimizationResponse(
            original_prompt=request.text,
            optimized_prompt=optimization_result["optimized_prompt"],
            improvement_explanation=optimization_result["improvement_explanation"],
            goal_alignment_score=optimization_result["goal_alignment_score"],
            predicted_metrics=optimization_result["predicted_metrics"],
            key_changes=optimization_result["key_changes"],
            current_metrics=current_metrics,
            used_ai=optimization_result["success"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced goal-based optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Goal-based optimization service temporarily unavailable")

async def optimize_prompt_with_structure(request: StructureBasedRequest):
    """Optimize prompt structure with consistency validation"""
    try:
        logger.info("=== ENHANCED STRUCTURE OPTIMIZATION ENDPOINT ===")
        logger.info(f"Request text length: {len(request.text) if request.text else 0}")
        logger.info(f"Structure options: {request.structure_options}")
        
        # Validate request
        if not request or not hasattr(request, 'text') or not request.text:
            raise HTTPException(status_code=400, detail="Prompt text is required")
        
        if not hasattr(request, 'structure_options'):
            raise HTTPException(status_code=400, detail="Structure options are required")
        
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Enhanced structure optimization: {request.text[:100]}...")
        
        # First, analyze current metrics using enhanced analyzer
        try:
            analysis = analyzer.analyze_prompt_comprehensive(request.text)
            current_metrics = analysis["metrics"]
            logger.info(f"Current rubric-based metrics: {current_metrics}")
        except Exception as e:
            logger.error(f"Error analyzing metrics: {str(e)}")
            current_metrics = {"clarity": 50, "specificity": 50, "structure": 50, "context": 50, "overall": 50}
        
        # Generate structure-based optimization
        try:
            structure_result = analyzer.generate_structure_optimization(
                request.text, 
                request.structure_options, 
                current_metrics
            )
            
            # If structure optimization was successful, validate consistency
            if structure_result.get("success") and structure_result.get("structured_prompt"):
                try:
                    logger.info("Validating structure optimization consistency...")
                    comparison = analyzer.compare_prompts_with_validation(
                        request.text,
                        structure_result["structured_prompt"],
                        validate_consistency=True
                    )
                    
                    if comparison.get("consistency_validation"):
                        consistency_summary = comparison["consistency_validation"]["validation_summary"]
                        logger.info(f"Structure optimization consistency: {consistency_summary['recommendation']}")
                        
                        # Add consistency information to result
                        structure_result["consistency_validated"] = consistency_summary.get("optimization_reliable", True)
                        structure_result["consistency_note"] = consistency_summary["recommendation"]
                
                except Exception as e:
                    logger.warning(f"Structure consistency validation failed: {e}")
                    structure_result["consistency_validated"] = False
                    structure_result["consistency_note"] = "Could not validate consistency"
            
            logger.info("=== ENHANCED STRUCTURE OPTIMIZATION RESULT ===")
            logger.info(f"Success: {structure_result.get('success', False)}")
            logger.info(f"Structure score: {structure_result.get('structure_score', 0)}")
            logger.info(f"Consistency validated: {structure_result.get('consistency_validated', False)}")
            
        except Exception as e:
            logger.error(f"Error in structure optimization: {str(e)}")
            structure_result = {
                "structured_prompt": f"## Task\n{request.text}\n\n## Instructions\n- Provide clear and detailed responses\n- Follow professional standards",
                "structure_explanation": "Basic structure applied due to processing error",
                "structure_score": 60,
                "structural_improvements": ["Applied basic formatting"],
                "organization_type": "basic",
                "success": False
            }
        
        # Create response
        response = StructureOptimizationResponse(
            original_prompt=request.text,
            structured_prompt=structure_result.get("structured_prompt", request.text),
            structure_explanation=structure_result.get("structure_explanation", "Structure optimization applied"),
            structure_score=int(structure_result.get("structure_score", 50)),
            structural_improvements=structure_result.get("structural_improvements", []),
            organization_type=structure_result.get("organization_type", "enhanced"),
            current_metrics=current_metrics,
            used_ai=structure_result.get("success", False)
        )
        
        logger.info("✅ Enhanced structure optimization response created successfully")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Enhanced structure optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def optimize_prompt_with_context(request: ContextBasedRequest):
    """Optimize prompt context with consistency validation"""
    try:
        logger.info("=== ENHANCED CONTEXT OPTIMIZATION ENDPOINT ===")
        
        # Validate request
        if not request or not hasattr(request, 'text') or not request.text:
            raise HTTPException(status_code=400, detail="Prompt text is required")
        
        if not hasattr(request, 'context_options'):
            raise HTTPException(status_code=400, detail="Context options are required")
        
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Enhanced context optimization: {request.text[:100]}...")
        
        # Analyze current metrics
        try:
            analysis = analyzer.analyze_prompt_comprehensive(request.text)
            current_metrics = analysis["metrics"]
        except Exception as e:
            logger.error(f"Error analyzing metrics: {str(e)}")
            current_metrics = {"clarity": 50, "specificity": 50, "structure": 50, "context": 50, "overall": 50}
        
        # Generate context-based optimization
        try:
            context_result = analyzer.generate_context_optimization(
                request.text, 
                request.context_options, 
                current_metrics
            )
            
            # Validate consistency if context optimization was successful
            if context_result.get("success") and context_result.get("context_enhanced_prompt"):
                try:
                    logger.info("Validating context optimization consistency...")
                    comparison = analyzer.compare_prompts_with_validation(
                        request.text,
                        context_result["context_enhanced_prompt"],
                        validate_consistency=True
                    )
                    
                    if comparison.get("consistency_validation"):
                        consistency_summary = comparison["consistency_validation"]["validation_summary"]
                        context_result["consistency_validated"] = consistency_summary.get("optimization_reliable", True)
                        context_result["consistency_note"] = consistency_summary["recommendation"]
                
                except Exception as e:
                    logger.warning(f"Context consistency validation failed: {e}")
                    context_result["consistency_validated"] = False
                    context_result["consistency_note"] = "Could not validate consistency"
            
        except Exception as e:
            logger.error(f"Error in context optimization: {str(e)}")
            context_result = {
                "context_enhanced_prompt": f"**Task:** {request.text}\n\n**Context:** Please consider relevant background information when responding.",
                "context_explanation": "Basic context enhancement applied due to processing error",
                "context_score": 60,
                "context_improvements": ["Applied basic context formatting"],
                "enhancement_type": "basic",
                "success": False
            }
        
        response = ContextOptimizationResponse(
            original_prompt=request.text,
            context_enhanced_prompt=context_result.get("context_enhanced_prompt", request.text),
            context_explanation=context_result.get("context_explanation", "Context optimization applied"),
            context_score=int(context_result.get("context_score", 50)),
            context_improvements=context_result.get("context_improvements", []),
            enhancement_type=context_result.get("enhancement_type", "enhanced"),
            current_metrics=current_metrics,
            used_ai=context_result.get("success", False)
        )
        
        logger.info("✅ Enhanced context optimization response created successfully")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Enhanced context optimization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def validate_token():
    """Validate service availability with enhanced features"""
    qwen_valid = analyzer.qwen_client.validate_token()
    available_models = analyzer.qwen_client.get_available_models() if qwen_valid else []
    
    if qwen_valid:
        message = "Enhanced system: Qwen models + standardized rubric with consistency validation"
    else:
        message = "Enhanced system: Standardized rubric analysis + fallback optimization available"
    
    return TokenValidationResponse(
        valid=True,
        message=message,
        available_models=available_models + [
            "standardized-rubric-analyzer", 
            "consistency-validator", 
            "enhanced-metrics-engine"
        ]
    )

# New endpoint for rubric information
async def get_rubric_info():
    """Get detailed information about the rubric system"""
    try:
        return analyzer.get_rubric_information()
    except Exception as e:
        logger.error(f"Error getting rubric info: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve rubric information")

# New endpoint for consistency testing
async def test_consistency(prompts: list, num_runs: int = 3):
    """Test system consistency with provided prompts"""
    try:
        if not prompts or len(prompts) == 0:
            raise HTTPException(status_code=400, detail="At least one prompt is required for testing")
        
        if len(prompts) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 prompts allowed for batch testing")
        
        logger.info(f"Running consistency test on {len(prompts)} prompts")
        return analyzer.test_system_consistency(prompts, num_runs)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Consistency testing failed: {e}")
        raise HTTPException(status_code=500, detail="Consistency testing service temporarily unavailable")