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
    
    def get_rubric_information(self) -> Dict:
        """Get information about the rubric system for transparency"""
        return self.rubric.get_rubric_summary()