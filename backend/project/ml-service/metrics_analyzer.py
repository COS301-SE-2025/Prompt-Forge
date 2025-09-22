import re
import numpy as np
from typing import List, Dict, Tuple
from sentence_transformers import SentenceTransformer
from config import Config, logger
from qwen_client import QwenClient

class PromptMetricsAnalyzer:
    """Advanced analyzer for evaluating prompt quality across multiple dimensions"""
    
    def __init__(self):
        # Initialize models for different metrics
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Initialize Qwen client for goal-based optimization
        self.qwen_client = QwenClient()
        
        # Thresholds for "cannot improve" status
        self.excellence_thresholds = Config.EXCELLENCE_THRESHOLDS
        self.metric_weights = Config.METRIC_WEIGHTS
        
        logger.info("Prompt Metrics Analyzer with Qwen integration initialized successfully")

    def analyze_clarity(self, text: str) -> Tuple[float, List[str]]:
        """Analyze prompt clarity using multiple factors"""
        issues = []
        clarity_score = 100.0
        
        if not text.strip():
            return 0.0, ["Empty prompt"]
        
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Factor 1: Length appropriateness (10-200 words is optimal)
        if len(words) < 5:
            clarity_score -= 30
            issues.append("Prompt is too short - needs more detail")
        elif len(words) > 300:
            clarity_score -= 15
            issues.append("Prompt may be too long and complex")
        
        # Factor 2: Sentence structure
        if sentences:
            avg_sentence_length = len(words) / len(sentences)
            if avg_sentence_length > 25:
                clarity_score -= 10
                issues.append("Sentences are too long - break them down")
            elif avg_sentence_length < 3:
                clarity_score -= 20
                issues.append("Sentences are too fragmented")
        
        # Factor 3: Question marks and clear instructions
        has_questions = '?' in text
        instruction_words = ['write', 'create', 'generate', 'explain', 'describe', 'analyze', 'compare']
        has_clear_instruction = any(word in text.lower() for word in instruction_words)
        
        if not has_questions and not has_clear_instruction:
            clarity_score -= 25
            issues.append("Add clear action words (write, create, explain, etc.)")
        
        # Factor 4: Ambiguous words
        vague_words = ['something', 'anything', 'stuff', 'things', 'good', 'nice', 'some']
        vague_count = sum(1 for word in vague_words if word in text.lower())
        if vague_count > 0:
            clarity_score -= (vague_count * 8)
            issues.append("Replace vague words with specific terms")
        
        # Factor 5: Grammar and punctuation
        if not re.search(r'[.!?]$', text.strip()):
            clarity_score -= 8
            issues.append("Add proper punctuation")
        
        return max(0, clarity_score), issues

    def analyze_specificity(self, text: str) -> Tuple[float, List[str]]:
        """Analyze how specific and detailed the prompt is"""
        issues = []
        specificity_score = 50.0  # Start with middle score
        
        if not text.strip():
            return 0.0, ["Empty prompt"]
        
        text_lower = text.lower()
        
        # Factor 1: Specific requirements mentioned
        requirement_indicators = [
            'format', 'length', 'style', 'tone', 'audience', 'purpose',
            'include', 'must', 'should', 'need', 'require', 'specify'
        ]
        requirements_mentioned = sum(1 for indicator in requirement_indicators if indicator in text_lower)
        specificity_score += (requirements_mentioned * 8)
        
        # Factor 2: Numbers and quantities
        numbers = re.findall(r'\b\d+\b', text)
        if numbers:
            specificity_score += 15
        else:
            issues.append("Add specific numbers (word count, quantity, etc.)")
        
        # Factor 3: Examples mentioned
        example_words = ['example', 'like', 'such as', 'including', 'for instance']
        has_examples = any(word in text_lower for word in example_words)
        if has_examples:
            specificity_score += 12
        else:
            issues.append("Consider adding examples of what you want")
        
        # Factor 4: Target audience specified
        audience_words = ['for', 'audience', 'readers', 'users', 'customers', 'students', 'professionals']
        has_audience = any(word in text_lower for word in audience_words)
        if has_audience:
            specificity_score += 10
        else:
            issues.append("Specify your target audience")
        
        # Factor 5: Output format specified
        format_words = ['email', 'report', 'list', 'paragraph', 'summary', 'article', 'bullet points']
        has_format = any(word in text_lower for word in format_words)
        if has_format:
            specificity_score += 8
        else:
            issues.append("Specify the desired output format")
        
        # Factor 6: Context provided
        context_words = ['because', 'since', 'for', 'background', 'context', 'situation']
        has_context = any(word in text_lower for word in context_words)
        if has_context:
            specificity_score += 7
        
        return min(100, max(0, specificity_score)), issues

    def analyze_structure(self, text: str) -> Tuple[float, List[str]]:
        """Analyze the structural organization of the prompt"""
        issues = []
        structure_score = 60.0  # Start with above-middle score
        
        if not text.strip():
            return 0.0, ["Empty prompt"]
        
        # Factor 1: Logical flow
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) >= 2:
            structure_score += 10
        
        # Factor 2: Use of lists or bullet points
        has_bullets = '•' in text or '*' in text or re.search(r'^\s*[-\*\+]', text, re.MULTILINE)
        has_numbers = re.search(r'^\s*\d+\.', text, re.MULTILINE)
        
        if has_bullets or has_numbers:
            structure_score += 15
        else:
            issues.append("Consider using bullet points or numbered lists for clarity")
        
        # Factor 3: Clear sections
        section_indicators = ['first', 'second', 'then', 'next', 'finally', 'also', 'additionally']
        has_sections = any(indicator in text.lower() for indicator in section_indicators)
        if has_sections:
            structure_score += 8
        
        # Factor 4: Proper capitalization and formatting
        if text[0].isupper():
            structure_score += 5
        else:
            issues.append("Start with a capital letter")
        
        # Factor 5: Paragraph structure
        paragraphs = text.split('\n\n')
        if len(paragraphs) > 1:
            structure_score += 10
            
        # Factor 6: Transition words
        transitions = ['however', 'therefore', 'moreover', 'furthermore', 'in addition']
        has_transitions = any(transition in text.lower() for transition in transitions)
        if has_transitions:
            structure_score += 5
        
        return min(100, max(0, structure_score)), issues

    def analyze_context(self, text: str) -> Tuple[float, List[str]]:
        """Analyze how much context and background information is provided"""
        issues = []
        context_score = 40.0  # Start lower as context is often missing
        
        if not text.strip():
            return 0.0, ["Empty prompt"]
        
        text_lower = text.lower()
        
        # Factor 1: Background information
        background_words = ['background', 'context', 'about', 'regarding', 'concerning', 'situation']
        has_background = any(word in text_lower for word in background_words)
        if has_background:
            context_score += 20
        else:
            issues.append("Add background information or context")
        
        # Factor 2: Purpose explanation
        purpose_words = ['purpose', 'goal', 'aim', 'objective', 'to', 'for', 'in order to']
        has_purpose = any(word in text_lower for word in purpose_words)
        if has_purpose:
            context_score += 15
        else:
            issues.append("Explain the purpose or goal")
        
        # Factor 3: Domain/industry mentioned
        domain_words = ['business', 'technical', 'academic', 'medical', 'legal', 'marketing', 'education']
        has_domain = any(word in text_lower for word in domain_words)
        if has_domain:
            context_score += 12
        
        # Factor 4: Constraints mentioned
        constraint_words = ['limit', 'within', 'maximum', 'minimum', 'constraint', 'restriction']
        has_constraints = any(word in text_lower for word in constraint_words)
        if has_constraints:
            context_score += 10
        
        # Factor 5: Use case described
        use_case_words = ['will be used', 'intended for', 'purpose is', 'used to', 'help with']
        has_use_case = any(phrase in text_lower for phrase in use_case_words)
        if has_use_case:
            context_score += 13
        else:
            issues.append("Describe how the output will be used")
        
        return min(100, max(0, context_score)), issues

    def calculate_overall_score(self, clarity: float, specificity: float, structure: float, context: float) -> float:
        """Calculate weighted overall score"""
        overall = (
            clarity * self.metric_weights["clarity"] +
            specificity * self.metric_weights["specificity"] +
            structure * self.metric_weights["structure"] +
            context * self.metric_weights["context"]
        )
        
        return round(overall, 1)

    def is_excellent_prompt(self, metrics: Dict[str, float]) -> bool:
        """Check if prompt is already excellent and cannot be improved significantly"""
        return (
            metrics["clarity"] >= self.excellence_thresholds["clarity"] and
            metrics["specificity"] >= self.excellence_thresholds["specificity"] and
            metrics["structure"] >= self.excellence_thresholds["structure"] and
            metrics["context"] >= self.excellence_thresholds["context"] and
            metrics["overall"] >= self.excellence_thresholds["overall"]
        )

    def analyze_prompt_comprehensive(self, text: str) -> Dict:
        """Comprehensive analysis of a prompt"""
        if not text or not text.strip():
            return {
                "metrics": {
                    "clarity": 0,
                    "specificity": 0,
                    "structure": 0,
                    "context": 0,
                    "overall": 0
                },
                "issues": ["Empty prompt provided"],
                "suggestions": ["Please provide a prompt to analyze"],
                "is_excellent": False,
                "improvement_potential": "High",
                "rating": 1,
                "rating_explanation": "No prompt provided for analysis"
            }
        
        # Analyze each metric
        clarity_score, clarity_issues = self.analyze_clarity(text)
        specificity_score, specificity_issues = self.analyze_specificity(text)
        structure_score, structure_issues = self.analyze_structure(text)
        context_score, context_issues = self.analyze_context(text)
        
        # Calculate overall score
        overall_score = self.calculate_overall_score(clarity_score, specificity_score, structure_score, context_score)
        
        metrics = {
            "clarity": round(clarity_score, 1),
            "specificity": round(specificity_score, 1),
            "structure": round(structure_score, 1),
            "context": round(context_score, 1),
            "overall": overall_score
        }
        
        # Combine all issues
        all_issues = clarity_issues + specificity_issues + structure_issues + context_issues
        
        # Check if prompt is excellent
        is_excellent = self.is_excellent_prompt(metrics)
        
        # Determine improvement potential
        if is_excellent:
            improvement_potential = "Minimal"
            suggestions = [
                "Your prompt is already excellent!",
                "Minor refinements might be possible, but major improvements aren't needed",
                "Consider testing with different AI models to optimize performance"
            ]
        elif overall_score >= 70:
            improvement_potential = "Low to Moderate"
            suggestions = all_issues[:3] if all_issues else ["Your prompt is quite good with minor areas for improvement"]
        elif overall_score >= 50:
            improvement_potential = "Moderate"
            suggestions = all_issues[:4] if all_issues else ["Several areas could be enhanced for better results"]
        else:
            improvement_potential = "High"
            suggestions = all_issues[:5] if all_issues else ["Significant improvements needed for optimal performance"]
        
        # Calculate rating out of 10
        rating = max(1, min(10, round(overall_score / 10)))
        
        # Generate rating explanation
        if rating >= 9:
            rating_explanation = "Excellent prompt with clear instructions, proper context, and specific requirements"
        elif rating >= 7:
            rating_explanation = "Good prompt with minor areas for improvement in clarity or specificity"
        elif rating >= 5:
            rating_explanation = "Average prompt, needs improvement in several areas"
        else:
            rating_explanation = "Poor prompt, significant improvements needed"
        
        return {
            "metrics": metrics,
            "issues": all_issues,
            "suggestions": suggestions,
            "is_excellent": is_excellent,
            "improvement_potential": improvement_potential,
            "rating": rating,
            "rating_explanation": rating_explanation
        }

    def generate_goal_optimization(self, original_prompt: str, goals: Dict, metrics: Dict) -> Dict:
        """Generate goal-based optimization using QwenClient"""
        return self.qwen_client.generate_goal_optimization(original_prompt, goals, metrics)

    def generate_structure_optimization(self, original_prompt: str, structure_options: Dict, metrics: Dict) -> Dict:
        """Generate structure-based optimization using QwenClient"""
        return self.qwen_client.generate_structure_optimization(original_prompt, structure_options, metrics)

    def generate_context_optimization(self, original_prompt: str, context_options: Dict, metrics: Dict) -> Dict:
        """Generate context-based optimization using QwenClient"""
        return self.qwen_client.generate_context_optimization(original_prompt, context_options, metrics)