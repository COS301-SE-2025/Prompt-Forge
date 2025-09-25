# metrics_analyzer.py
import re
import numpy as np
from typing import List, Dict, Tuple, Optional
from sentence_transformers import SentenceTransformer
from config import Config, logger
from qwen_client import QwenClient
from rubric import StandardizedRubric, RubricLevel

class EnhancedPromptMetricsAnalyzer:
    """
    Enhanced analyzer using standardized rubric system for consistent evaluation
    """
    
    def __init__(self):
        # Initialize models for embeddings (if needed for advanced features)
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Initialize standardized rubric system
        self.rubric = StandardizedRubric()
        
        # Initialize Qwen client for AI-powered optimization
        self.qwen_client = QwenClient()
        
        # Thresholds for "cannot improve" status (more conservative)
        self.excellence_thresholds = {
            "clarity": 90,      # Increased from 85
            "specificity": 85,  # Increased from 80
            "structure": 92,    # Increased from 88
            "context": 88,      # Increased from 82
            "actionability": 85,
            "overall": 88       # Increased from 84
        }
        
        logger.info("Enhanced Prompt Metrics Analyzer with Standardized Rubric initialized")
    
    async def analyze_prompt_comprehensive(self, text: str) -> Dict:
        """
        Comprehensive analysis using standardized rubric system
        
        Args:
            text: Prompt text to analyze
        
        Returns:
            Comprehensive analysis with rubric-based scoring
        """
        if not text or not text.strip():
            return {
                "metrics": {
                    "clarity": 0, "specificity": 0, "structure": 0, 
                    "context": 0, "actionability": 0, "overall": 0
                },
                "issues": ["Empty prompt provided"],
                "suggestions": ["Please provide a prompt to analyze"],
                "is_excellent": False,
                "improvement_potential": "High",
                "rating": 1,
                "rating_explanation": "No prompt provided for analysis",
                "rubric_analysis": None,
                "consistency_validation": None
            }
        
        # Use await for async rubric evaluation
        rubric_evaluation = await self.rubric.evaluate_prompt(text)
        
        # Extract standardized metrics
        metrics = self._extract_metrics_from_rubric(rubric_evaluation)
        
        # Generate issues and suggestions based on rubric analysis
        issues, suggestions = self._generate_issues_and_suggestions(rubric_evaluation)
        
        # Check if prompt meets excellence criteria
        is_excellent = self._is_excellent_prompt_rubric(metrics)
        
        # Determine improvement potential
        improvement_potential = self._assess_improvement_potential(metrics["overall"])
        
        # Calculate rating and explanation
        rating, rating_explanation = self._generate_rating_and_explanation(metrics, rubric_evaluation)
        
        result = {
            "metrics": metrics,
            "issues": issues,
            "suggestions": suggestions,
            "is_excellent": is_excellent,
            "improvement_potential": improvement_potential,
            "rating": rating,
            "rating_explanation": rating_explanation,
            "rubric_analysis": rubric_evaluation,
            "validation_info": rubric_evaluation.get("validation_info", {}),
            "consistency_validation": None
        }
        
        return result
    
    def _extract_metrics_from_rubric(self, rubric_evaluation: Dict) -> Dict[str, float]:
        """Extract metrics in expected format from rubric evaluation"""
        metrics = {}
        
        # Map rubric criteria to expected metric names
        criteria_mapping = {
            "clarity": "clarity",
            "specificity": "specificity", 
            "structure": "structure",
            "context": "context",
            "actionability": "actionability"
        }
        
        for rubric_name, metric_name in criteria_mapping.items():
            if rubric_name in rubric_evaluation["criteria_scores"]:
                metrics[metric_name] = rubric_evaluation["criteria_scores"][rubric_name]["score"]
            else:
                metrics[metric_name] = 0.0
        
        # Overall score from rubric
        metrics["overall"] = rubric_evaluation["overall_metrics"]["weighted_score"]
        
        return metrics
    
    def _generate_issues_and_suggestions(self, rubric_evaluation: Dict) -> Tuple[List[str], List[str]]:
        """Generate issues and suggestions based on rubric analysis"""
        issues = []
        suggestions = []
    
        for criterion_name, criterion_data in rubric_evaluation["criteria_scores"].items():
            level_name = criterion_data["level"]
            score = criterion_data["score"]
            
            # Add issues for poor performance
            if score < 60:  # Below average performance
                issue = f"{criterion_name.title()} needs improvement (score: {score}/100)"
                issues.append(issue)
                
                # Add specific suggestions based on detailed analysis
                if criterion_name in rubric_evaluation["detailed_analysis"]:
                    analysis = rubric_evaluation["detailed_analysis"][criterion_name]
                    if "issues" in analysis:
                        issues.extend(analysis["issues"])
        
        # Generate improvement suggestions based on low-scoring criteria
        low_scoring_criteria = [
            name for name, data in rubric_evaluation["criteria_scores"].items()
            if data["score"] < 70
        ]
        
        for criterion in low_scoring_criteria:
            suggestions.append(f"Improve {criterion} by adding more specific details.")

        return issues, suggestions
    
    def _is_excellent_prompt_rubric(self, metrics: Dict[str, float]) -> bool:
        """Check if prompt meets excellence thresholds based on rubric scores"""
        return (
            metrics.get("clarity", 0) >= self.excellence_thresholds["clarity"] and
            metrics.get("specificity", 0) >= self.excellence_thresholds["specificity"] and
            metrics.get("structure", 0) >= self.excellence_thresholds["structure"] and
            metrics.get("context", 0) >= self.excellence_thresholds["context"] and
            metrics.get("actionability", 0) >= self.excellence_thresholds["actionability"] and
            metrics.get("overall", 0) >= self.excellence_thresholds["overall"]
        )
    
    def _assess_improvement_potential(self, overall_score: float) -> str:
        """Assess improvement potential based on overall score"""
        if overall_score >= 85:
            return "Minimal"
        elif overall_score >= 70:
            return "Low to Moderate"
        elif overall_score >= 50:
            return "Moderate"
        else:
            return "High"
    
    def _generate_rating_and_explanation(self, metrics: Dict, rubric_evaluation: Dict) -> Tuple[int, str]:
        """Generate rating and explanation based on rubric evaluation"""
        overall_score = metrics["overall"]
        letter_grade = rubric_evaluation["overall_metrics"]["letter_grade"]
        
        # Convert to 1-10 scale
        rating = max(1, min(10, round(overall_score / 10)))
        
        # Generate explanation based on letter grade and rubric analysis
        if letter_grade == "A":
            explanation = "Excellent prompt meeting all quality criteria with clear structure and specificity"
        elif letter_grade == "B":
            explanation = "Good prompt with minor areas for improvement in clarity or detail"
        elif letter_grade == "C":
            explanation = "Average prompt requiring moderate improvements in multiple areas"
        elif letter_grade == "D":
            explanation = "Below-average prompt needing significant improvements in structure and specificity"
        else:
            explanation = "Poor prompt requiring major revisions across all criteria"
        
        return rating, explanation
    
    # Delegation methods to maintain compatibility with existing code
    def generate_goal_optimization(self, original_prompt: str, goals: Dict, metrics: Dict) -> Dict:
        """Generate goal-based optimization using QwenClient"""
        return self.qwen_client.generate_goal_optimization(original_prompt, goals, metrics)
    
    def generate_structure_optimization(self, original_prompt: str, structure_options: Dict, metrics: Dict) -> Dict:
        """Generate structure-based optimization using QwenClient"""
        return self.qwen_client.generate_structure_optimization(original_prompt, structure_options, metrics)
    
    def generate_context_optimization(self, original_prompt: str, context_options: Dict, metrics: Dict) -> Dict:
        """Generate context-based optimization using QwenClient"""
        return self.qwen_client.generate_context_optimization(original_prompt, context_options, metrics)
    
    async def optimize_structure_comprehensive(self, prompt: str, structure_options: Dict) -> Dict:
        """Comprehensive structure optimization using both AI and linguistic analysis"""
        try:
            # Get current metrics for baseline
            current_analysis = await self.analyze_prompt_comprehensive(prompt)
            current_metrics = current_analysis["metrics"]
            
            # First try AI-powered optimization
            ai_result = self.qwen_client.generate_structure_optimization(
                prompt, structure_options, current_metrics
            )
            
            if ai_result.get("success", False) and ai_result.get("structured_prompt"):
                # Validate AI result with linguistic analysis
                ai_optimized = ai_result["structured_prompt"]
                ai_analysis = await self.analyze_prompt_comprehensive(ai_optimized)
                
                # If AI improved structure metrics, use AI result
                if ai_analysis["metrics"].get("structure", 0) > current_metrics.get("structure", 0):
                    return {
                        "structured_prompt": ai_optimized,
                        "structure_explanation": ai_result.get("structure_explanation", "AI-powered structure optimization"),
                        "structure_score": ai_analysis["metrics"].get("structure", 0),
                        "structural_improvements": ai_result.get("structural_improvements", []),
                        "organization_type": ai_result.get("organization_type", "AI-optimized"),
                        "used_ai": True,
                        "method": "ai_with_linguistic_validation"
                    }
            
            # Fallback to rule-based structure optimization
            structured_prompt = self._apply_structure_rules(prompt, structure_options)
            linguistic_analysis = await self.analyze_prompt_comprehensive(structured_prompt)
            
            return {
                "structured_prompt": structured_prompt,
                "structure_explanation": "Applied rule-based structure improvements",
                "structure_score": linguistic_analysis["metrics"].get("structure", 0),
                "structural_improvements": self._identify_structure_improvements(structure_options),
                "organization_type": "rule-based",
                "used_ai": False,
                "method": "linguistic_rules"
            }
            
        except Exception as e:
            logger.error(f"Structure optimization failed: {e}")
            return {
                "structured_prompt": prompt,
                "structure_explanation": f"Structure optimization failed: {str(e)}",
                "structure_score": current_metrics.get("structure", 0),
                "structural_improvements": [],
                "organization_type": "unchanged",
                "used_ai": False,
                "method": "fallback"
            }
    
    async def optimize_context_comprehensive(self, prompt: str, context_options: Dict) -> Dict:
        """Comprehensive context optimization using both AI and linguistic analysis"""
        try:
            # Get current metrics for baseline
            current_analysis = await self.analyze_prompt_comprehensive(prompt)
            current_metrics = current_analysis["metrics"]
            
            # First try AI-powered optimization
            ai_result = self.qwen_client.generate_context_optimization(
                prompt, context_options, current_metrics
            )
            
            if ai_result.get("success", False) and ai_result.get("context_enhanced_prompt"):
                # Validate AI result with linguistic analysis
                ai_optimized = ai_result["context_enhanced_prompt"]
                ai_analysis = await self.analyze_prompt_comprehensive(ai_optimized)
                
                # If AI improved context metrics, use AI result
                if ai_analysis["metrics"].get("context", 0) > current_metrics.get("context", 0):
                    return {
                        "context_enhanced_prompt": ai_optimized,
                        "context_explanation": ai_result.get("context_explanation", "AI-powered context enhancement"),
                        "context_score": ai_analysis["metrics"].get("context", 0),
                        "context_improvements": ai_result.get("context_improvements", []),
                        "enhancement_type": ai_result.get("enhancement_type", "AI-enhanced"),
                        "used_ai": True,
                        "method": "ai_with_linguistic_validation"
                    }
            
            # Fallback to rule-based context optimization
            enhanced_prompt = self._apply_context_rules(prompt, context_options)
            linguistic_analysis = await self.analyze_prompt_comprehensive(enhanced_prompt)
            
            return {
                "context_enhanced_prompt": enhanced_prompt,
                "context_explanation": "Applied rule-based context enhancements",
                "context_score": linguistic_analysis["metrics"].get("context", 0),
                "context_improvements": self._identify_context_improvements(context_options),
                "enhancement_type": "rule-based",
                "used_ai": False,
                "method": "linguistic_rules"
            }
            
        except Exception as e:
            logger.error(f"Context optimization failed: {e}")
            return {
                "context_enhanced_prompt": prompt,
                "context_explanation": f"Context optimization failed: {str(e)}",
                "context_score": current_metrics.get("context", 0),
                "context_improvements": [],
                "enhancement_type": "unchanged",
                "used_ai": False,
                "method": "fallback"
            }
    
    def _apply_structure_rules(self, prompt: str, structure_options: Dict) -> str:
        """Apply rule-based structure improvements"""
        structured_prompt = prompt
        
        if structure_options.get("hasIntroduction", False):
            if not re.match(r'^\s*(objective|goal|purpose):', prompt.lower()):
                structured_prompt = f"**Objective:** {structured_prompt}"
        
        if structure_options.get("usesBulletPoints", False) or structure_options.get("usesNumberedList", False):
            # Add requirements section if not present
            if "requirement" not in prompt.lower():
                requirements = ["Clear output format", "Appropriate tone", "Target audience consideration"]
                if structure_options.get("usesNumberedList", False):
                    req_text = "\n".join([f"{i+1}. {req}" for i, req in enumerate(requirements)])
                else:
                    req_text = "\n".join([f"• {req}" for req in requirements])
                structured_prompt += f"\n\n**Requirements:**\n{req_text}"
        
        if structure_options.get("hasExamples", False):
            if "example" not in prompt.lower():
                structured_prompt += "\n\n**Example:** Provide relevant examples to illustrate expectations."
        
        if structure_options.get("hasConclusion", False):
            if not prompt.endswith((".", "!", "?")):
                structured_prompt += "\n\n**Success Criteria:** Deliver high-quality results that meet all specified requirements."
        
        return structured_prompt
    
    def _apply_context_rules(self, prompt: str, context_options: Dict) -> str:
        """Apply rule-based context enhancements"""
        enhanced_prompt = prompt
        
        if context_options.get("domain"):
            domain_context = f"**Domain Context:** {context_options['domain']}\n\n"
            enhanced_prompt = domain_context + enhanced_prompt
        
        if context_options.get("useCase"):
            use_case_context = f"**Use Case:** {context_options['useCase']}\n\n"
            enhanced_prompt = use_case_context + enhanced_prompt
        
        if context_options.get("additionalContext"):
            enhanced_prompt += f"\n\n**Additional Context:** {context_options['additionalContext']}"
        
        if context_options.get("requirements") and isinstance(context_options["requirements"], list):
            if context_options["requirements"]:
                req_text = "\n".join([f"• {req}" for req in context_options["requirements"]])
                enhanced_prompt += f"\n\n**Specific Requirements:**\n{req_text}"
        
        return enhanced_prompt
    
    def _identify_structure_improvements(self, structure_options: Dict) -> List[str]:
        """Identify what structure improvements were applied"""
        improvements = []
        
        if structure_options.get("hasIntroduction", False):
            improvements.append("Added clear objective statement")
        if structure_options.get("usesBulletPoints", False):
            improvements.append("Organized content with bullet points")
        if structure_options.get("usesNumberedList", False):
            improvements.append("Structured content with numbered list")
        if structure_options.get("hasExamples", False):
            improvements.append("Included example section")
        if structure_options.get("hasConclusion", False):
            improvements.append("Added success criteria")
        
        return improvements
    
    def _identify_context_improvements(self, context_options: Dict) -> List[str]:
        """Identify what context improvements were applied"""
        improvements = []
        
        if context_options.get("domain"):
            improvements.append("Added domain-specific context")
        if context_options.get("useCase"):
            improvements.append("Clarified use case scenario")
        if context_options.get("additionalContext"):
            improvements.append("Enhanced with additional background")
        if context_options.get("requirements"):
            improvements.append("Specified detailed requirements")
        
        return improvements
    
    def get_rubric_information(self) -> Dict:
        """Get information about the rubric system for transparency"""
        return self.rubric.get_rubric_summary()