import re
import numpy as np
from typing import List, Dict, Tuple, Optional
from sentence_transformers import SentenceTransformer
from config import Config, logger
from qwen_client import QwenClient
from rubric_sys import StandardizedRubric, RubricLevel
from consistency_validator import ConsistencyValidator

class EnhancedPromptMetricsAnalyzer:
    """
    Enhanced analyzer using standardized rubric system for consistent evaluation
    Addresses supervisor concerns about LLM reliability by using deterministic scoring
    """
    
    def __init__(self):
        # Initialize models for embeddings (if needed for advanced features)
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Initialize standardized rubric system
        self.rubric = StandardizedRubric()
        
        # Initialize consistency validator
        self.consistency_validator = ConsistencyValidator(self.rubric)
        
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
    
    def analyze_prompt_comprehensive(self, text: str, validate_consistency: bool = False, 
                                   num_consistency_runs: int = 3) -> Dict:
        """
        Comprehensive analysis using standardized rubric system
        
        Args:
            text: Prompt text to analyze
            validate_consistency: Whether to run consistency validation
            num_consistency_runs: Number of runs for consistency testing
        
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
        
        # Use standardized rubric for evaluation
        rubric_evaluation = self.rubric.evaluate_prompt(text)
        
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
            "consistency_validation": None
        }
        
        # Add consistency validation if requested
        if validate_consistency and num_consistency_runs > 1:
            logger.info(f"Running consistency validation with {num_consistency_runs} runs")
            consistency_result = self.consistency_validator.test_prompt_consistency(
                text, num_consistency_runs
            )
            result["consistency_validation"] = {
                "is_consistent": consistency_result.is_consistent,
                "consistency_rating": consistency_result.consistency_rating,
                "coefficient_of_variation": consistency_result.coefficient_of_variation,
                "mean_score": consistency_result.mean_score,
                "std_deviation": consistency_result.std_deviation,
                "test_runs": consistency_result.test_runs,
                "recommendation": self._get_consistency_recommendation(consistency_result)
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
            if criterion == "clarity":
                suggestions.append("Use more specific, unambiguous language")
                suggestions.append("Add clear action verbs (write, create, explain)")
            elif criterion == "specificity":
                suggestions.append("Include specific requirements (format, length, audience)")
                suggestions.append("Add numbers, examples, or concrete constraints")
            elif criterion == "structure":
                suggestions.append("Organize content with headers, bullets, or numbered lists")
                suggestions.append("Use logical flow with clear transitions")
            elif criterion == "context":
                suggestions.append("Provide background information and purpose")
                suggestions.append("Explain the use case and intended outcome")
            elif criterion == "actionability":
                suggestions.append("Include clear, specific action items")
                suggestions.append("Specify deliverables and expected outputs")
        
        # Remove duplicates while preserving order
        issues = list(dict.fromkeys(issues))
        suggestions = list(dict.fromkeys(suggestions))
        
        return issues[:8], suggestions[:6]  # Limit for readability
    
    def _is_excellent_prompt_rubric(self, metrics: Dict[str, float]) -> bool:
        """Check if prompt meets excellence criteria using rubric scores"""
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
    
    def _get_consistency_recommendation(self, consistency_result) -> str:
        """Generate recommendation based on consistency test results"""
        if consistency_result.consistency_rating == "excellent":
            return "Rubric scoring is highly consistent and reliable"
        elif consistency_result.consistency_rating == "good":
            return "Rubric scoring shows good consistency"
        elif consistency_result.consistency_rating == "acceptable":
            return "Rubric scoring has acceptable consistency but could be improved"
        else:
            return "Rubric scoring shows poor consistency - may indicate prompt ambiguity"
    
    def compare_prompts_with_validation(self, original_text: str, optimized_text: str,
                                      validate_consistency: bool = True) -> Dict:
        """
        Compare two prompts using rubric system with optional consistency validation
        
        Args:
            original_text: Original prompt
            optimized_text: Optimized prompt  
            validate_consistency: Whether to validate consistency across multiple runs
        
        Returns:
            Comprehensive comparison with rubric analysis and consistency validation
        """
        logger.info("Comparing prompts using standardized rubric with consistency validation")
        
        # Get rubric-based comparison
        comparison = self.rubric.compare_prompts(original_text, optimized_text)
        
        # Add consistency validation if requested
        if validate_consistency:
            consistency_validation = self.consistency_validator.validate_optimization_consistency(
                original_text, optimized_text, num_runs=3
            )
            comparison["consistency_validation"] = consistency_validation
        
        # Add summary metrics in expected format
        original_metrics = self._extract_metrics_from_rubric(comparison["original_evaluation"])
        optimized_metrics = self._extract_metrics_from_rubric(comparison["optimized_evaluation"])
        
        comparison["summary"] = {
            "original_metrics": original_metrics,
            "optimized_metrics": optimized_metrics,
            "improvement_verified": comparison["overall_improvement"]["meaningful_improvement"],
            "consistency_validated": validate_consistency and consistency_validation["validation_summary"]["optimization_reliable"],
            "recommendation": self._generate_comparison_recommendation(comparison, consistency_validation if validate_consistency else None)
        }
        
        return comparison
    
    def _generate_comparison_recommendation(self, comparison: Dict, consistency_validation: Optional[Dict]) -> str:
        """Generate recommendation based on comparison and consistency results"""
        improvement = comparison["overall_improvement"]["improvement"]
        meaningful = comparison["overall_improvement"]["meaningful_improvement"]
        
        if consistency_validation:
            reliable = consistency_validation["validation_summary"]["optimization_reliable"]
            if not reliable:
                return "Optimization shows inconsistent results - consider alternative approaches"
        
        if meaningful and improvement >= 10:
            return "Significant and reliable improvement achieved"
        elif meaningful:
            return "Moderate improvement achieved with good consistency"
        elif improvement > 0:
            return "Minor improvement - consider more substantial optimization"
        else:
            return "No meaningful improvement detected - optimization unsuccessful"
    
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
    
    def get_rubric_information(self) -> Dict:
        """Get information about the rubric system for transparency"""
        return self.rubric.get_rubric_summary()
    
    def test_system_consistency(self, test_prompts: List[str], num_runs: int = 5) -> Dict:
        """
        Test system consistency with a set of test prompts
        Useful for validating rubric reliability
        """
        logger.info(f"Testing system consistency with {len(test_prompts)} prompts")
        
        batch_results = self.consistency_validator.batch_consistency_test(test_prompts, num_runs)
        consistency_report = self.consistency_validator.generate_consistency_report(batch_results)
        
        return {
            "individual_results": batch_results,
            "system_report": consistency_report,
            "rubric_info": self.get_rubric_information()
        }