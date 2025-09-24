import re
import json
import hashlib
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import asyncio
import aiohttp
from config import logger

class RubricLevel(Enum):
    POOR = 1
    BELOW_AVERAGE = 2
    AVERAGE = 3
    GOOD = 4
    EXCELLENT = 5

@dataclass
class RubricCriteria:
    """Individual criteria for prompt evaluation"""
    name: str
    description: str
    weight: float
    evaluation_guidelines: str
    focus_areas: List[str]

class LLMPoweredRubric:
    """
    LLM-powered rubric system using Qwen for dynamic prompt evaluation
    Provides contextual, intelligent scoring and personalized suggestions
    """
    
    def __init__(self, qwen_api_endpoint: str = None, qwen_api_key: str = None):
        self.criteria = self._initialize_criteria()
        self.qwen_endpoint = qwen_api_endpoint or "http://localhost:8000/v1/chat/completions"  # Default local endpoint
        self.qwen_api_key = qwen_api_key
        self.evaluation_cache = {}  # Optional caching for identical prompts
        
    def _initialize_criteria(self) -> Dict[str, RubricCriteria]:
        """Initialize evaluation criteria with defined score ranges for predictable output"""
        
        criteria = {}
        
        # 1. CLARITY CRITERIA
        criteria["clarity"] = RubricCriteria(
            name="Clarity",
            description="How clear, unambiguous, and easy to understand the prompt is",
            weight=0.25,
            evaluation_guidelines="""
            CLARITY SCORING RANGES:
            
            SCORE 0-20 (POOR): 
            - Contains 4+ vague or ambiguous terms (something, stuff, things, good, nice, etc.)
            - No clear action verbs or instructions
            - Heavy use of pronouns without clear antecedents (>15% of text)
            - Complex sentences averaging >30 words
            - Multiple interpretations possible
            
            SCORE 21-40 (BELOW AVERAGE):
            - Contains 2-3 vague terms
            - Weak or implied action words
            - Some ambiguous pronouns (10-15% of text)
            - Average sentence length 25-30 words
            - Some confusion possible but generally understandable
            
            SCORE 41-60 (AVERAGE):
            - Contains 1-2 vague terms
            - Has clear action word but may lack precision
            - Moderate pronoun use (5-10% of text)
            - Average sentence length 20-25 words
            - Generally clear with minor ambiguities
            
            SCORE 61-80 (GOOD):
            - Contains 0-1 vague terms
            - Clear, specific action verbs present
            - Minimal ambiguous pronouns (<5% of text)
            - Average sentence length 15-20 words
            - Clear instructions with specific language
            
            SCORE 81-100 (EXCELLENT):
            - No vague or ambiguous terms
            - Crystal clear, specific action verbs and instructions
            - Precise language throughout
            - Optimal sentence length (<15 words average)
            - Unambiguous and immediately comprehensible
            """,
            focus_areas=["vague_terms", "action_clarity", "pronoun_usage", "sentence_length", "overall_clarity"]
        )
        
        # 2. SPECIFICITY CRITERIA
        criteria["specificity"] = RubricCriteria(
            name="Specificity",
            description="Level of detail, concrete requirements, and precise expectations",
            weight=0.25,
            evaluation_guidelines="""
            SPECIFICITY SCORING RANGES:
            
            SCORE 0-20 (POOR):
            - No specific requirements or constraints mentioned
            - No format specifications
            - No quantifiable elements (numbers, metrics, lengths)
            - Generic, one-size-fits-all language
            - No audience or context specified
            
            SCORE 21-40 (BELOW AVERAGE):
            - 1-2 specific elements present
            - Vague format mentions without details
            - Minimal quantifiable elements
            - Some attempt at specificity but lacks depth
            - Audience implied but not explicitly stated
            
            SCORE 41-60 (AVERAGE):
            - 3-4 specific requirements or constraints
            - Basic format specifications mentioned
            - Some quantifiable elements present
            - Moderate level of detail provided
            - General audience or context mentioned
            
            SCORE 61-80 (GOOD):
            - 5-6 detailed specifications
            - Clear format requirements with details
            - Multiple quantifiable elements (word counts, time limits, etc.)
            - Specific constraints and requirements outlined
            - Target audience clearly defined
            
            SCORE 81-100 (EXCELLENT):
            - 7+ comprehensive, detailed specifications
            - Precise format requirements with examples
            - Multiple quantifiable metrics specified
            - Comprehensive constraints and success criteria
            - Detailed audience, tone, and style specifications
            - Examples or templates provided
            """,
            focus_areas=["requirement_count", "format_specs", "quantifiable_elements", "constraints", "audience_definition"]
        )
        
        # 3. STRUCTURE CRITERIA
        criteria["structure"] = RubricCriteria(
            name="Structure",
            description="Organization, logical flow, and presentation format",
            weight=0.25,
            evaluation_guidelines="""
            STRUCTURE SCORING RANGES:
            
            SCORE 0-20 (POOR):
            - No apparent organization or structure
            - Stream of consciousness writing
            - No headers, sections, or formatting
            - No logical flow between ideas
            - Single paragraph or wall of text
            
            SCORE 21-40 (BELOW AVERAGE):
            - Basic organization present
            - 2-3 distinct ideas but poorly connected
            - Minimal formatting or structure
            - Some attempt at logical flow
            - Basic paragraph separation
            
            SCORE 41-60 (AVERAGE):
            - Clear sections or logical divisions
            - 3-4 organized ideas with reasonable flow
            - Some use of formatting (bullets or numbers)
            - Logical progression mostly evident
            - Proper paragraph structure
            
            SCORE 61-80 (GOOD):
            - Well-organized with clear hierarchy
            - Strong logical flow between sections
            - Good use of formatting (headers, lists, etc.)
            - Clear introduction and conclusion
            - Professional presentation
            
            SCORE 81-100 (EXCELLENT):
            - Perfect structural organization
            - Clear headers, sections, and subsections
            - Excellent use of formatting and visual hierarchy
            - Seamless logical progression
            - Professional, polished presentation
            - Clear beginning, middle, and end structure
            """,
            focus_areas=["organization_level", "formatting_usage", "logical_flow", "visual_hierarchy", "professional_presentation"]
        )
        
        # 4. CONTEXT CRITERIA
        criteria["context"] = RubricCriteria(
            name="Context",
            description="Background information, situational awareness, and domain understanding",
            weight=0.15,
            evaluation_guidelines="""
            CONTEXT SCORING RANGES:
            
            SCORE 0-20 (POOR):
            - No background information provided
            - No purpose or goal explanation
            - No domain or situational context
            - Missing essential context for understanding
            - Assumes reader has all necessary knowledge
            
            SCORE 21-40 (BELOW AVERAGE):
            - Minimal context provided
            - Purpose implied but not explicitly stated
            - Limited background information
            - Some domain awareness but incomplete
            - Missing key contextual elements
            
            SCORE 41-60 (AVERAGE):
            - Basic context and background provided
            - Purpose generally clear
            - Some domain-specific information included
            - Adequate situational awareness
            - Most necessary context present
            
            SCORE 61-80 (GOOD):
            - Good contextual foundation provided
            - Clear purpose and goal explanation
            - Relevant domain-specific context
            - Strong situational awareness
            - Appropriate constraints and limitations mentioned
            
            SCORE 81-100 (EXCELLENT):
            - Comprehensive contextual framework
            - Detailed purpose, goals, and rationale
            - Rich domain and situational context
            - Complete background information
            - Thorough constraint and limitation awareness
            - Anticipates reader's knowledge level
            """,
            focus_areas=["background_completeness", "purpose_clarity", "domain_awareness", "situational_context", "constraint_awareness"]
        )
        
        # 5. ACTIONABILITY CRITERIA
        criteria["actionability"] = RubricCriteria(
            name="Actionability",
            description="How easily the prompt can be acted upon and executed",
            weight=0.10,
            evaluation_guidelines="""
            ACTIONABILITY SCORING RANGES:
            
            SCORE 0-20 (POOR):
            - No clear action verbs or instructions
            - Unclear what specific action to take
            - No deliverables or outcomes specified
            - Abstract or theoretical language only
            - No guidance on how to proceed
            
            SCORE 21-40 (BELOW AVERAGE):
            - Weak action verbs present
            - Action implied but not explicit
            - Vague deliverables mentioned
            - Some guidance but lacks clarity
            - Requires significant interpretation
            
            SCORE 41-60 (AVERAGE):
            - Clear action verbs present
            - Specific action requested
            - Basic deliverables identified
            - Some implementation guidance
            - Generally actionable with minor gaps
            
            SCORE 61-80 (GOOD):
            - Strong, specific action verbs
            - Clear, executable instructions
            - Well-defined deliverables
            - Step-by-step guidance provided
            - Easy to act upon immediately
            
            SCORE 81-100 (EXCELLENT):
            - Crystal clear action verbs and instructions
            - Comprehensive step-by-step guidance
            - Specific, measurable deliverables
            - Examples and templates provided
            - Complete implementation roadmap
            - No ambiguity about next steps
            """,
            focus_areas=["action_verb_clarity", "instruction_specificity", "deliverable_definition", "implementation_guidance", "execution_clarity"]
        )
        
        return criteria
    
    async def _call_qwen_api(self, messages: List[Dict[str, str]], temperature: float = 0.3) -> str:
        """Make API call to Qwen model"""
        headers = {
            "Content-Type": "application/json"
        }
        
        if self.qwen_api_key:
            headers["Authorization"] = f"Bearer {self.qwen_api_key}"
        
        payload = {
            "model": "Qwen2.5-72B-Instruct",  # Adjust model name as needed
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 1000,
            "response_format": {"type": "json_object"}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.qwen_endpoint, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result["choices"][0]["message"]["content"]
                    else:
                        error_text = await response.text()
                        logger.error(f"Qwen API error: {response.status} - {error_text}")
                        raise Exception(f"API call failed: {response.status}")
        except Exception as e:
            logger.error(f"Error calling Qwen API: {str(e)}")
            raise
    
    async def _evaluate_criterion_with_llm(self, text: str, criterion: RubricCriteria) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Use Qwen to evaluate a specific criterion with defined score ranges"""
        
        system_prompt = f"""You are an expert prompt evaluation specialist. Evaluate the given prompt for the criterion: {criterion.name}.

        CRITERION: {criterion.name}
        DESCRIPTION: {criterion.description}
        
        DETAILED SCORING GUIDELINES WITH DEFINED RANGES:
        {criterion.evaluation_guidelines}
        
        FOCUS AREAS TO ANALYZE: {', '.join(criterion.focus_areas)}

        CRITICAL INSTRUCTIONS:
        1. You MUST provide a numerical score from 0-100 based on the defined ranges above
        2. Justify your score by referencing specific elements from the scoring ranges
        3. Provide concrete evidence from the prompt text
        4. Be consistent with the defined scoring criteria

        Provide your evaluation as a JSON object with the following structure:
        {{
            "numerical_score": <0-100>,
            "score_range": "<0-20|21-40|41-60|61-80|81-100>",
            "level": "<POOR|BELOW_AVERAGE|AVERAGE|GOOD|EXCELLENT>",
            "reasoning": "<detailed explanation referencing the specific scoring range criteria>",
            "strengths": ["<specific strengths with evidence from prompt>"],
            "weaknesses": ["<specific weaknesses with evidence from prompt>"],
            "specific_suggestions": ["<actionable suggestions based on the scoring range>"],
            "evidence": ["<direct quotes or examples from the prompt>"],
            "scoring_factors": {{
                "{criterion.focus_areas[0]}": "<assessment>",
                "{criterion.focus_areas[1] if len(criterion.focus_areas) > 1 else 'additional_factor'}": "<assessment>"
            }}
        }}

        IMPORTANT: Your numerical_score must align with the defined ranges and your reasoning must explicitly reference which range criteria the prompt meets or fails to meet."""

        user_prompt = f"""Evaluate this prompt for {criterion.name} using the defined scoring ranges:

        PROMPT TO EVALUATE:
        "{text}"

        Analyze each focus area: {', '.join(criterion.focus_areas)}
        
        Provide your score (0-100) and justify it by explaining which range criteria are met/not met."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await self._call_qwen_api(messages)
            evaluation = json.loads(response)
            
            # Extract numerical score and validate range
            numerical_score = evaluation.get("numerical_score", 50)
            numerical_score = max(0, min(100, numerical_score))  # Ensure 0-100 range
            
            # Map numerical score to RubricLevel
            if numerical_score >= 81:
                level = RubricLevel.EXCELLENT
            elif numerical_score >= 61:
                level = RubricLevel.GOOD
            elif numerical_score >= 41:
                level = RubricLevel.AVERAGE
            elif numerical_score >= 21:
                level = RubricLevel.BELOW_AVERAGE
            else:
                level = RubricLevel.POOR
            
            # Ensure consistency between numerical score and reported level
            reported_level = evaluation.get("level", level.name)
            if reported_level != level.name:
                logger.warning(f"Score-level mismatch for {criterion.name}: {numerical_score} -> {level.name} vs reported {reported_level}")
            
            details = {
                "numerical_score": numerical_score,
                "score_range": evaluation.get("score_range", f"{numerical_score//20*20}-{min(100, (numerical_score//20 + 1)*20)}"),
                "reasoning": evaluation.get("reasoning", ""),
                "strengths": evaluation.get("strengths", []),
                "weaknesses": evaluation.get("weaknesses", []),
                "specific_suggestions": evaluation.get("specific_suggestions", []),
                "evidence": evaluation.get("evidence", []),
                "scoring_factors": evaluation.get("scoring_factors", {}),
                "llm_confidence": "high",
                "range_compliance": True
            }
            
            return level, details
            
        except Exception as e:
            logger.error(f"Error in LLM evaluation for {criterion.name}: {str(e)}")
            # Fallback to middle range
            fallback_score = 50
            return RubricLevel.AVERAGE, {
                "numerical_score": fallback_score,
                "score_range": "41-60",
                "reasoning": f"LLM evaluation failed, using fallback score: {str(e)}",
                "strengths": [],
                "weaknesses": ["Unable to complete detailed analysis due to LLM error"],
                "specific_suggestions": ["Please retry evaluation with proper LLM connection"],
                "evidence": [],
                "scoring_factors": {},
                "llm_confidence": "low",
                "range_compliance": False,
                "error": str(e)
            }
    
    async def evaluate_prompt(self, text: str, use_cache: bool = True) -> Dict[str, Any]:
        """
        Evaluate a prompt using LLM-powered analysis
        Returns dynamic, contextual evaluation results
        """
        if not text or not text.strip():
            return self._empty_prompt_result()
        
        # Optional caching for identical prompts
        text_hash = hashlib.md5(text.encode()).hexdigest()
        if use_cache and text_hash in self.evaluation_cache:
            logger.info(f"Using cached LLM evaluation for prompt")
            return self.evaluation_cache[text_hash]
        
        results = {
            "text": text,
            "text_hash": text_hash,
            "evaluation_timestamp": str(datetime.now()),
            "evaluation_method": "llm_powered",
            "criteria_scores": {},
            "detailed_analysis": {},
            "overall_metrics": {},
            "consolidated_suggestions": [],
            "rubric_version": "2.0_llm"
        }
        
        total_weighted_score = 0
        max_possible_score = 0
        all_suggestions = []
        all_strengths = []
        all_weaknesses = []
        
        # Evaluate each criterion using LLM
        evaluation_tasks = []
        for criterion_name, criterion in self.criteria.items():
            task = self._evaluate_criterion_with_llm(text, criterion)
            evaluation_tasks.append((criterion_name, criterion, task))
        
        # Execute all evaluations concurrently
        for criterion_name, criterion, task in evaluation_tasks:
            try:
                level, details = await task
                # Use numerical score directly from LLM evaluation
                numerical_score = details.get("numerical_score", level.value * 20)
                weighted_score = numerical_score * criterion.weight
                
                results["criteria_scores"][criterion_name] = {
                    "level": level.name,
                    "numerical_score": numerical_score,
                    "score_range": details.get("score_range", "Unknown"),
                    "weight": criterion.weight,
                    "weighted_score": weighted_score,
                    "reasoning": details.get("reasoning", ""),
                    "llm_confidence": details.get("llm_confidence", "medium"),
                    "range_compliance": details.get("range_compliance", True)
                }
                
                results["detailed_analysis"][criterion_name] = details
                
                # Collect suggestions and insights
                all_suggestions.extend(details.get("specific_suggestions", []))
                all_strengths.extend(details.get("strengths", []))
                all_weaknesses.extend(details.get("weaknesses", []))
                
                total_weighted_score += weighted_score
                max_possible_score += 100 * criterion.weight
                
            except Exception as e:
                logger.error(f"Error evaluating {criterion_name}: {str(e)}")
                # Assign average score for failed evaluations
                fallback_score = 50  # Middle of 41-60 range (AVERAGE)
                weighted_score = fallback_score * criterion.weight
                
                results["criteria_scores"][criterion_name] = {
                    "level": "AVERAGE",
                    "numerical_score": fallback_score,
                    "score_range": "41-60",
                    "weight": criterion.weight,
                    "weighted_score": weighted_score,
                    "reasoning": f"Evaluation failed: {str(e)}",
                    "llm_confidence": "low",
                    "range_compliance": False
                }
                
                total_weighted_score += weighted_score
                max_possible_score += 100 * criterion.weight
        
        # Calculate overall metrics
        overall_score = (total_weighted_score / max_possible_score) * 100
        results["overall_metrics"] = {
            "weighted_score": round(overall_score, 1),
            "letter_grade": self._score_to_letter_grade(overall_score),
            "improvement_needed": overall_score < 70,
            "excellence_achieved": overall_score >= 85,
            "evaluation_confidence": "high" if all(details.get("llm_confidence") == "high" 
                                                 for details in results["detailed_analysis"].values()) else "medium"
        }
        
        # Generate consolidated suggestions using LLM
        results["consolidated_suggestions"] = await self._generate_consolidated_suggestions(
            text, results, all_suggestions, all_strengths, all_weaknesses
        )
        
        # Cache results
        if use_cache:
            self.evaluation_cache[text_hash] = results
        
        return results
    
    async def _generate_consolidated_suggestions(self, 
                                               original_text: str,
                                               evaluation_results: Dict[str, Any],
                                               all_suggestions: List[str],
                                               all_strengths: List[str],
                                               all_weaknesses: List[str]) -> List[Dict[str, Any]]:
        """Generate prioritized, consolidated improvement suggestions"""
        
        system_prompt = """You are a prompt optimization specialist. Based on the detailed evaluation results, 
        provide consolidated, prioritized suggestions for improving the prompt.

        Focus on:
        1. Most impactful improvements first
        2. Specific, actionable recommendations
        3. Avoiding redundant suggestions
        4. Providing concrete examples where helpful
        5. Considering the overall context and purpose

        Return a JSON array of suggestion objects with this structure:
        [
            {
                "priority": "<HIGH|MEDIUM|LOW>",
                "category": "<clarity|specificity|structure|context|actionability>",
                "suggestion": "<specific recommendation>",
                "rationale": "<why this improvement is important>",
                "example": "<concrete example or template if applicable>"
            }
        ]"""

        overall_score = evaluation_results["overall_metrics"]["weighted_score"]
        
        user_prompt = f"""
        ORIGINAL PROMPT:
        "{original_text}"

        EVALUATION SUMMARY:
        - Overall Score: {overall_score}/100
        - Letter Grade: {evaluation_results["overall_metrics"]["letter_grade"]}

        IDENTIFIED STRENGTHS:
        {chr(10).join(f"• {strength}" for strength in all_strengths[:10])}

        IDENTIFIED WEAKNESSES:
        {chr(10).join(f"• {weakness}" for weakness in all_weaknesses[:10])}

        SPECIFIC SUGGESTIONS FROM ANALYSIS:
        {chr(10).join(f"• {suggestion}" for suggestion in all_suggestions[:15])}

        CRITERION SCORES:
        {chr(10).join(f"• {name}: {data['score']}/100 ({data['level']})" 
                     for name, data in evaluation_results["criteria_scores"].items())}

        Please provide 3-7 consolidated, prioritized suggestions for improving this prompt.
        Focus on the most impactful changes that will significantly improve the prompt's effectiveness.
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._call_qwen_api(messages)
            suggestions = json.loads(response)
            return suggestions if isinstance(suggestions, list) else []
        except Exception as e:
            logger.error(f"Error generating consolidated suggestions: {str(e)}")
            return [
                {
                    "priority": "HIGH",
                    "category": "general",
                    "suggestion": "Review and refine the prompt based on the detailed analysis above",
                    "rationale": "LLM-generated suggestions failed to process",
                    "example": "Please retry the evaluation process"
                }
            ]
    
    async def optimize_prompt(self, original_text: str, focus_areas: List[str] = None) -> Dict[str, Any]:
        """Generate an optimized version of the prompt using LLM"""
        
        # First evaluate the original prompt
        evaluation = await self.evaluate_prompt(original_text)
        
        system_prompt = f"""You are an expert prompt optimization specialist. Your task is to rewrite and optimize the given prompt 
        to improve its effectiveness while maintaining its core intent and purpose.

        OPTIMIZATION GUIDELINES:
        1. Maintain the original intent and purpose
        2. Improve clarity, specificity, structure, context, and actionability
        3. Use concrete, specific language
        4. Provide clear instructions and expectations
        5. Include relevant context and constraints
        6. Ensure logical flow and organization
        7. Make the prompt more actionable

        FOCUS AREAS: {', '.join(focus_areas) if focus_areas else 'All criteria'}

        Return a JSON object with:
        {{
            "optimized_prompt": "<the improved version of the prompt>",
            "key_improvements": ["<list of specific improvements made>"],
            "optimization_rationale": "<explanation of the optimization approach>",
            "maintained_elements": ["<elements kept from original>"]
        }}"""

        user_prompt = f"""
        ORIGINAL PROMPT TO OPTIMIZE:
        "{original_text}"

        EVALUATION RESULTS:
        - Overall Score: {evaluation['overall_metrics']['weighted_score']}/100
        - Improvement Areas: {', '.join([name for name, data in evaluation['criteria_scores'].items() if data['score'] < 80])}

        KEY SUGGESTIONS FROM ANALYSIS:
        {chr(10).join(f"• {sugg['suggestion']}" for sugg in evaluation.get('consolidated_suggestions', [])[:5])}

        Please provide an optimized version of this prompt that addresses the identified weaknesses while preserving its strengths and core purpose.
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._call_qwen_api(messages)
            optimization_result = json.loads(response)
            
            # Evaluate the optimized prompt
            optimized_text = optimization_result.get("optimized_prompt", original_text)
            optimized_evaluation = await self.evaluate_prompt(optimized_text)
            
            return {
                "original_text": original_text,
                "optimized_text": optimized_text,
                "original_evaluation": evaluation,
                "optimized_evaluation": optimized_evaluation,
                "optimization_details": optimization_result,
                "improvement_summary": self._calculate_improvement_summary(evaluation, optimized_evaluation),
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Error in prompt optimization: {str(e)}")
            return {
                "original_text": original_text,
                "optimized_text": original_text,
                "original_evaluation": evaluation,
                "optimization_details": {"error": str(e)},
                "success": False
            }
    
    def _calculate_improvement_summary(self, original_eval: Dict, optimized_eval: Dict) -> Dict[str, Any]:
        """Calculate improvement metrics between original and optimized prompts using numerical scores"""
        
        original_score = original_eval["overall_metrics"]["weighted_score"]
        optimized_score = optimized_eval["overall_metrics"]["weighted_score"]
        
        improvements = {}
        for criterion in self.criteria.keys():
            if (criterion in original_eval["criteria_scores"] and 
                criterion in optimized_eval["criteria_scores"]):
                
                orig_score = original_eval["criteria_scores"][criterion]["numerical_score"]
                opt_score = optimized_eval["criteria_scores"][criterion]["numerical_score"]
                improvement = opt_score - orig_score
                
                # Determine improvement category based on score ranges
                orig_range = self._get_score_range_category(orig_score)
                opt_range = self._get_score_range_category(opt_score)
                
                improvements[criterion] = {
                    "original_score": orig_score,
                    "optimized_score": opt_score,
                    "improvement": improvement,
                    "improvement_percentage": round(((improvement) / orig_score) * 100, 1) if orig_score > 0 else 0,
                    "original_range": orig_range,
                    "optimized_range": opt_range,
                    "range_improvement": opt_range != orig_range,
                    "significant_improvement": improvement >= 15  # More than one scoring tier
                }
        
        return {
            "overall_improvement": optimized_score - original_score,
            "improvement_percentage": round(((optimized_score - original_score) / original_score) * 100, 1) if original_score > 0 else 0,
            "grade_improvement": f"{original_eval['overall_metrics']['letter_grade']} → {optimized_eval['overall_metrics']['letter_grade']}",
            "criterion_improvements": improvements,
            "significant_improvement": (optimized_score - original_score) >= 10,
            "range_improvements": sum(1 for imp in improvements.values() if imp["range_improvement"]),
            "total_criteria": len(improvements)
        }
    
    def _get_score_range_category(self, score: float) -> str:
        """Get the score range category for a numerical score"""
        if score >= 81:
            return "81-100 (EXCELLENT)"
        elif score >= 61:
            return "61-80 (GOOD)"
        elif score >= 41:
            return "41-60 (AVERAGE)"
        elif score >= 21:
            return "21-40 (BELOW AVERAGE)"
        else:
            return "0-20 (POOR)"
    
    def _empty_prompt_result(self) -> Dict[str, Any]:
        """Return standardized result for empty prompts"""
        return {
            "text": "",
            "text_hash": None,
            "criteria_scores": {},
            "detailed_analysis": {},
            "overall_metrics": {
                "weighted_score": 0.0,
                "letter_grade": "F",
                "improvement_needed": True,
                "excellence_achieved": False,
                "evaluation_confidence": "n/a"
            },
            "consolidated_suggestions": [],
            "rubric_version": "2.0_llm",
            "error": "Empty prompt provided"
        }
    
    def _score_to_letter_grade(self, score: float) -> str:
        """Convert numerical score to letter grade"""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
    
    async def compare_prompts(self, original_text: str, optimized_text: str) -> Dict[str, Any]:
        """
        Compare two prompts using LLM-powered evaluation
        """
        original_eval = await self.evaluate_prompt(original_text)
        optimized_eval = await self.evaluate_prompt(optimized_text)
        
        # Generate comparative analysis using LLM
        comparison_analysis = await self._generate_comparative_analysis(
            original_text, optimized_text, original_eval, optimized_eval
        )
        
        return {
            "original_evaluation": original_eval,
            "optimized_evaluation": optimized_eval,
            "improvement_summary": self._calculate_improvement_summary(original_eval, optimized_eval),
            "comparative_analysis": comparison_analysis,
            "recommendation": "optimized" if optimized_eval["overall_metrics"]["weighted_score"] > 
                                          original_eval["overall_metrics"]["weighted_score"] else "original"
        }
    
    async def _generate_comparative_analysis(self, 
                                           original_text: str, 
                                           optimized_text: str,
                                           original_eval: Dict,
                                           optimized_eval: Dict) -> Dict[str, Any]:
        """Generate detailed comparative analysis between two prompts"""
        
        system_prompt = """You are a prompt comparison specialist. Analyze two prompts and their evaluation results 
        to provide insightful comparative analysis.

        Provide analysis as JSON:
        {
            "summary": "<brief comparison summary>",
            "key_differences": ["<list of major differences>"],
            "trade_offs": ["<any trade-offs or considerations>"],
            "recommendation_rationale": "<detailed reasoning for which prompt is better>"
        }"""

        user_prompt = f"""
        ORIGINAL PROMPT:
        "{original_text}"
        Original Score: {original_eval['overall_metrics']['weighted_score']}/100

        OPTIMIZED PROMPT:
        "{optimized_text}"
        Optimized Score: {optimized_eval['overall_metrics']['weighted_score']}/100

        Please provide a detailed comparative analysis of these two prompts.
        """

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            response = await self._call_qwen_api(messages)
            return json.loads(response)
        except Exception as e:
            logger.error(f"Error in comparative analysis: {str(e)}")
            return {
                "summary": "Comparative analysis failed",
                "key_differences": [],
                "trade_offs": [],
                "recommendation_rationale": "Unable to generate detailed comparison"
            }
    
    def get_rubric_summary(self) -> Dict[str, Any]:
        """Get a summary of the LLM-powered rubric"""
        return {
            "version": "2.0_llm",
            "evaluation_method": "llm_powered",
            "model_used": "Qwen2.5-72B-Instruct",
            "total_criteria": len(self.criteria),
            "criteria_details": {
                name: {
                    "description": criterion.description,
                    "weight": criterion.weight,
                    "evaluation_guidelines": criterion.evaluation_guidelines,
                    "focus_areas": criterion.focus_areas
                }
                for name, criterion in self.criteria.items()
            },
            "features": [
                "Dynamic LLM-powered evaluation",
                "Contextual scoring and feedback",
                "Personalized improvement suggestions",
                "Comparative prompt analysis",
                "Automated prompt optimization"
            ]
        }

# Example usage and testing
async def main():
    """Example usage of the LLM-powered rubric system"""
    
    # Initialize the rubric system
    rubric = LLMPoweredRubric(
        qwen_api_endpoint="http://localhost:8000/v1/chat/completions",
        qwen_api_key="your-api-key-here"  # If required
    )
    
    # Test prompt
    test_prompt = "Write something good about AI"
    
    # Evaluate the prompt
    evaluation = await rubric.evaluate_prompt(test_prompt)
    print("Evaluation Results:")
    print(json.dumps(evaluation, indent=2))
    
    # Optimize the prompt
    optimization = await rubric.optimize_prompt(test_prompt)
    print("\nOptimization Results:")
    print(json.dumps(optimization, indent=2))

if __name__ == "__main__":
    asyncio.run(main())