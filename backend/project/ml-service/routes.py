# routes.py
from fastapi import HTTPException
from config import logger
from models import (
    PromptRequest, AnalysisResponse, OptimizationResponse, OptimizationSuggestion,
    GoalBasedRequest, GoalOptimizationResponse, StructureBasedRequest, StructureOptimizationResponse,
    ContextBasedRequest, ContextOptimizationResponse, TokenValidationResponse
)
from analyzer import EnhancedPromptMetricsAnalyzer

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
        
        # Make this an async call
        analysis = await analyzer.analyze_prompt_comprehensive(
            request.text
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
        analysis = await analyzer.analyze_prompt_comprehensive(request.text)
        
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
    
    if '?' not in text and not any(word in text.lower() for word in ['write', 'generate', 'create', 'explain']):
        suggestions.append(OptimizationSuggestion(
            suggestion="Add clear action verbs",
            before="No specific instruction",
            after="Use verbs like 'generate', 'explain', or 'list' to direct the AI",
            impact="Makes prompt more actionable"
        ))
    
    if 'format' not in text.lower():
        suggestions.append(OptimizationSuggestion(
            suggestion="Specify output format",
            before="No format specified",
            after="Request specific format like bullet points or paragraphs",
            impact="Improves structure and readability"
        ))
    
    return suggestions or [OptimizationSuggestion(
        suggestion="General improvement",
        before="Basic prompt",
        after="Enhanced with details",
        impact="Overall better performance"
    )]

def optimize_prompt_with_goals(request: GoalBasedRequest):
    """Optimize prompt with goals using Qwen based on selected goals and current metrics"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt with goals: {request.text[:100]}...")
        
        # Analyze current metrics
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        current_metrics = analysis["metrics"]
        
        # Generate goal-based optimization
        goal_result = analyzer.generate_goal_optimization(
            request.text, 
            request.goals, 
            current_metrics
        )
        
        return GoalOptimizationResponse(
            original_prompt=request.text,
            optimized_prompt=goal_result.get("optimized_prompt", request.text),
            improvement_explanation=goal_result.get("improvement_explanation", "Goal optimization applied"),
            goal_alignment_score=goal_result.get("goal_alignment_score", 50),
            predicted_metrics=goal_result.get("predicted_metrics", current_metrics),
            key_changes=goal_result.get("key_changes", []),
            current_metrics=current_metrics,
            used_ai=goal_result.get("success", False)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Goal optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Goal optimization service temporarily unavailable")

def optimize_prompt_with_structure(request: StructureBasedRequest):
    """Optimize prompt structure using Qwen based on selected options and current metrics"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt structure: {request.text[:100]}...")
        
        # Analyze current metrics
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        current_metrics = analysis["metrics"]
        
        # Generate structure-based optimization
        structure_result = analyzer.generate_structure_optimization(
            request.text, 
            request.structure_options, 
            current_metrics
        )
        
        return StructureOptimizationResponse(
            original_prompt=request.text,
            structured_prompt=structure_result.get("structured_prompt", request.text),
            structure_explanation=structure_result.get("structure_explanation", "Structure optimization applied"),
            structure_score=structure_result.get("structure_score", 50),
            structural_improvements=structure_result.get("structural_improvements", []),
            organization_type=structure_result.get("organization_type", "enhanced"),
            current_metrics=current_metrics,
            used_ai=structure_result.get("success", False)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Structure optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Structure optimization service temporarily unavailable")

def optimize_prompt_with_context(request: ContextBasedRequest):
    """Optimize prompt context using Qwen based on selected options and current metrics"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt context: {request.text[:100]}...")
        
        # Analyze current metrics
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        current_metrics = analysis["metrics"]
        
        # Generate context-based optimization
        context_result = analyzer.generate_context_optimization(
            request.text, 
            request.context_options, 
            current_metrics
        )
        
        return ContextOptimizationResponse(
            original_prompt=request.text,
            context_enhanced_prompt=context_result.get("context_enhanced_prompt", request.text),
            context_explanation=context_result.get("context_explanation", "Context optimization applied"),
            context_score=context_result.get("context_score", 50),
            context_improvements=context_result.get("context_improvements", []),
            enhancement_type=context_result.get("enhancement_type", "enhanced"),
            current_metrics=current_metrics,
            used_ai=context_result.get("success", False)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Context optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Context optimization service temporarily unavailable")

def validate_token():
    """Validate service availability with enhanced features"""
    qwen_valid = analyzer.qwen_client.validate_token()
    available_models = analyzer.qwen_client.get_available_models() if qwen_valid else []
    
    if qwen_valid:
        message = "Enhanced system: Qwen models + standardized rubric"
    else:
        message = "Enhanced system: Standardized rubric analysis + fallback optimization available"
    
    return TokenValidationResponse(
        valid=True,
        message=message,
        available_models=available_models + [
            "standardized-rubric-analyzer", 
            "enhanced-metrics-engine"
        ]
    )