import asyncio
import statistics
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import time
import json
from config import logger
from rubric_system import StandardizedRubric

@dataclass
class ConsistencyTestResult:
    """Results from consistency testing"""
    prompt_hash: str
    test_runs: int
    scores: List[float]
    mean_score: float
    std_deviation: float
    coefficient_of_variation: float
    consistency_rating: str
    is_consistent: bool
    individual_results: List[Dict[str, Any]]

class ConsistencyValidator:
    """
    Validates that the rubric produces consistent results
    Tests prompts multiple times to ensure reliability
    """
    
    def __init__(self, rubric: StandardizedRubric):
        self.rubric = rubric
        self.consistency_thresholds = {
            "excellent": 0.05,  # CV < 5%
            "good": 0.10,       # CV < 10% 
            "acceptable": 0.15,  # CV < 15%
            "poor": 0.20        # CV < 20%
        }
        
    def test_prompt_consistency(self, text: str, num_runs: int = 5, delay_ms: int = 100) -> ConsistencyTestResult:
        """
        Test a prompt multiple times to validate consistency
        
        Args:
            text: The prompt text to test
            num_runs: Number of evaluation runs (default: 5)
            delay_ms: Delay between runs in milliseconds
        
        Returns:
            ConsistencyTestResult with statistics
        """
        logger.info(f"Testing prompt consistency with {num_runs} runs")
        
        results = []
        scores = []
        
        for run in range(num_runs):
            if run > 0 and delay_ms > 0:
                time.sleep(delay_ms / 1000)  # Convert to seconds
            
            # Force fresh evaluation by not using cache
            evaluation = self.rubric.evaluate_prompt(text, generate_hash=False)
            
            score = evaluation["overall_metrics"]["weighted_score"]
            scores.append(score)
            results.append({
                "run": run + 1,
                "score": score,
                "letter_grade": evaluation["overall_metrics"]["letter_grade"],
                "criteria_scores": {k: v["score"] for k, v in evaluation["criteria_scores"].items()},
                "timestamp": time.time()
            })
            
            logger.debug(f"Run {run + 1}: Score = {score}")
        
        # Calculate statistics
        mean_score = statistics.mean(scores)
        std_dev = statistics.stdev(scores) if len(scores) > 1 else 0
        cv = (std_dev / mean_score) * 100 if mean_score > 0 else 0
        
        # Determine consistency rating
        consistency_rating = self._get_consistency_rating(cv)
        is_consistent = cv < self.consistency_thresholds["acceptable"] * 100
        
        # Generate prompt hash for tracking
        import hashlib
        prompt_hash = hashlib.md5(text.encode()).hexdigest()
        
        return ConsistencyTestResult(
            prompt_hash=prompt_hash,
            test_runs=num_runs,
            scores=scores,
            mean_score=round(mean_score, 2),
            std_deviation=round(std_dev, 2),
            coefficient_of_variation=round(cv, 2),
            consistency_rating=consistency_rating,
            is_consistent=is_consistent,
            individual_results=results
        )
    
    def _get_consistency_rating(self, cv: float) -> str:
        """Determine consistency rating based on coefficient of variation"""
        cv_decimal = cv / 100  # Convert percentage to decimal
        
        if cv_decimal <= self.consistency_thresholds["excellent"]:
            return "excellent"
        elif cv_decimal <= self.consistency_thresholds["good"]:
            return "good"
        elif cv_decimal <= self.consistency_thresholds["acceptable"]:
            return "acceptable"
        else:
            return "poor"
    
    def batch_consistency_test(self, prompts: List[str], num_runs: int = 3) -> Dict[str, ConsistencyTestResult]:
        """
        Test multiple prompts for consistency
        
        Args:
            prompts: List of prompt texts to test
            num_runs: Number of runs per prompt
        
        Returns:
            Dictionary mapping prompt hash to consistency results
        """
        results = {}
        
        for i, prompt in enumerate(prompts):
            logger.info(f"Testing prompt {i+1}/{len(prompts)}")
            result = self.test_prompt_consistency(prompt, num_runs)
            results[result.prompt_hash] = result
        
        return results
    
    def validate_optimization_consistency(self, original_prompt: str, optimized_prompt: str, 
                                        num_runs: int = 3) -> Dict[str, Any]:
        """
        Validate that optimization results are consistent across multiple runs
        
        Args:
            original_prompt: The original prompt text
            optimized_prompt: The optimized prompt text
            num_runs: Number of test runs
        
        Returns:
            Comprehensive consistency validation report
        """
        logger.info("Validating optimization consistency")
        
        # Test both prompts for consistency
        original_consistency = self.test_prompt_consistency(original_prompt, num_runs)
        optimized_consistency = self.test_prompt_consistency(optimized_prompt, num_runs)
        
        # Compare improvement consistency across runs
        improvement_scores = []
        for i in range(num_runs):
            original_score = original_consistency.individual_results[i]["score"]
            optimized_score = optimized_consistency.individual_results[i]["score"]
            improvement = optimized_score - original_score
            improvement_scores.append(improvement)
        
        improvement_mean = statistics.mean(improvement_scores)
        improvement_std = statistics.stdev(improvement_scores) if len(improvement_scores) > 1 else 0
        improvement_cv = (improvement_std / abs(improvement_mean)) * 100 if improvement_mean != 0 else 0
        
        # Determine if optimization is reliably beneficial
        consistent_improvement = all(score > 0 for score in improvement_scores)
        significant_improvement = improvement_mean >= 5.0  # At least 5 points improvement
        
        return {
            "original_consistency": {
                "mean_score": original_consistency.mean_score,
                "std_deviation": original_consistency.std_deviation,
                "cv_percentage": original_consistency.coefficient_of_variation,
                "rating": original_consistency.consistency_rating,
                "is_consistent": original_consistency.is_consistent
            },
            "optimized_consistency": {
                "mean_score": optimized_consistency.mean_score,
                "std_deviation": optimized_consistency.std_deviation,
                "cv_percentage": optimized_consistency.coefficient_of_variation,
                "rating": optimized_consistency.consistency_rating,
                "is_consistent": optimized_consistency.is_consistent
            },
            "improvement_analysis": {
                "mean_improvement": round(improvement_mean, 2),
                "improvement_std": round(improvement_std, 2),
                "improvement_cv": round(improvement_cv, 2),
                "consistent_improvement": consistent_improvement,
                "significant_improvement": significant_improvement,
                "improvement_scores": improvement_scores
            },
            "validation_summary": {
                "both_prompts_consistent": original_consistency.is_consistent and optimized_consistency.is_consistent,
                "optimization_reliable": consistent_improvement and significant_improvement,
                "recommendation": self._get_validation_recommendation(
                    original_consistency.is_consistent, 
                    optimized_consistency.is_consistent,
                    consistent_improvement,
                    significant_improvement
                ),
                "test_runs": num_runs,
                "validation_timestamp": time.time()
            }
        }
    
    def _get_validation_recommendation(self, original_consistent: bool, optimized_consistent: bool,
                                     consistent_improvement: bool, significant_improvement: bool) -> str:
        """Generate recommendation based on validation results"""
        
        if not original_consistent and not optimized_consistent:
            return "CRITICAL: Neither prompt shows consistent scoring. Review rubric criteria or prompt complexity."
        
        if not original_consistent:
            return "WARNING: Original prompt scoring is inconsistent. May indicate ambiguous or complex content."
        
        if not optimized_consistent:
            return "WARNING: Optimized prompt scoring is inconsistent. Optimization may have introduced ambiguity."
        
        if not consistent_improvement:
            return "CONCERN: Optimization doesn't consistently improve scores. Consider alternative optimization strategies."
        
        if not significant_improvement:
            return "MINOR: Optimization is consistent but improvement is small. Consider more aggressive optimization."
        
        return "SUCCESS: Optimization shows consistent and significant improvement across all test runs."
    
    def generate_consistency_report(self, test_results: Dict[str, ConsistencyTestResult]) -> Dict[str, Any]:
        """
        Generate a comprehensive consistency report
        
        Args:
            test_results: Results from batch consistency testing
        
        Returns:
            Detailed consistency analysis report
        """
        total_tests = len(test_results)
        if total_tests == 0:
            return {"error": "No test results provided"}
        
        # Aggregate statistics
        all_cv_values = [result.coefficient_of_variation for result in test_results.values()]
        all_scores = []
        for result in test_results.values():
            all_scores.extend(result.scores)
        
        consistent_prompts = sum(1 for result in test_results.values() if result.is_consistent)
        consistency_rate = (consistent_prompts / total_tests) * 100
        
        # Rating distribution
        rating_counts = {}
        for result in test_results.values():
            rating = result.consistency_rating
            rating_counts[rating] = rating_counts.get(rating, 0) + 1
        
        return {
            "summary": {
                "total_prompts_tested": total_tests,
                "consistent_prompts": consistent_prompts,
                "consistency_rate_percentage": round(consistency_rate, 1),
                "overall_system_reliability": self._assess_system_reliability(consistency_rate)
            },
            "statistical_analysis": {
                "mean_cv_across_prompts": round(statistics.mean(all_cv_values), 2),
                "median_cv": round(statistics.median(all_cv_values), 2),
                "cv_standard_deviation": round(statistics.stdev(all_cv_values), 2) if len(all_cv_values) > 1 else 0,
                "score_range": {
                    "min": min(all_scores),
                    "max": max(all_scores),
                    "mean": round(statistics.mean(all_scores), 2)
                }
            },
            "consistency_distribution": rating_counts,
            "recommendations": self._generate_system_recommendations(consistency_rate, all_cv_values),
            "rubric_performance": {
                "reliability_score": self._calculate_reliability_score(all_cv_values),
                "needs_calibration": consistency_rate < 80,
                "suggested_improvements": self._suggest_rubric_improvements(all_cv_values)
            }
        }
    
    def _assess_system_reliability(self, consistency_rate: float) -> str:
        """Assess overall system reliability based on consistency rate"""
        if consistency_rate >= 95:
            return "excellent"
        elif consistency_rate >= 85:
            return "good"
        elif consistency_rate >= 70:
            return "acceptable"
        else:
            return "poor"
    
    def _calculate_reliability_score(self, cv_values: List[float]) -> float:
        """Calculate overall reliability score (0-100)"""
        if not cv_values:
            return 0
        
        mean_cv = statistics.mean(cv_values)
        # Convert CV to reliability score (lower CV = higher reliability)
        reliability = max(0, 100 - (mean_cv * 2))  # Scale CV impact
        return round(reliability, 1)
    
    def _generate_system_recommendations(self, consistency_rate: float, cv_values: List[float]) -> List[str]:
        """Generate recommendations for improving system consistency"""
        recommendations = []
        
        if consistency_rate < 70:
            recommendations.append("CRITICAL: Low consistency rate indicates rubric needs major revision")
        
        if statistics.mean(cv_values) > 15:
            recommendations.append("High coefficient of variation suggests criteria need more objective measures")
        
        if consistency_rate < 85:
            recommendations.extend([
                "Consider adding more quantitative scoring criteria",
                "Review rubric weights and scoring thresholds",
                "Test rubric with larger sample of diverse prompts"
            ])
        
        if len(recommendations) == 0:
            recommendations.append("System shows good consistency - continue monitoring")
        
        return recommendations
    
    def _suggest_rubric_improvements(self, cv_values: List[float]) -> List[str]:
        """Suggest specific rubric improvements based on CV analysis"""
        suggestions = []
        mean_cv = statistics.mean(cv_values) if cv_values else 0
        
        if mean_cv > 20:
            suggestions.append("Add more objective, countable metrics to reduce subjectivity")
        
        if mean_cv > 15:
            suggestions.append("Consider binary (yes/no) criteria instead of scaled ratings")
        
        if mean_cv > 10:
            suggestions.extend([
                "Refine scoring thresholds with more specific boundaries",
                "Add examples for each scoring level",
                "Consider weighted sub-criteria for complex dimensions"
            ])
        
        return suggestions