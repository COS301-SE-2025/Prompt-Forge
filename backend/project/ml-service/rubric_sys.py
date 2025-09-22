import re
import json
import hashlib
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
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
    scoring_rules: Dict[RubricLevel, str]
    measurement_function: callable
    
class StandardizedRubric:
    """
    Standardized rubric system for consistent prompt evaluation
    Uses deterministic rules and measurable criteria to ensure consistency
    """
    
    def __init__(self):
        self.criteria = self._initialize_criteria()
        self.consistency_cache = {}
        
    def _initialize_criteria(self) -> Dict[str, RubricCriteria]:
        """Initialize all evaluation criteria with specific, measurable rules"""
        
        criteria = {}
        
        # 1. CLARITY CRITERIA
        criteria["clarity"] = RubricCriteria(
            name="Clarity",
            description="How clear and unambiguous the prompt is",
            weight=0.25,
            scoring_rules={
                RubricLevel.POOR: "Vague, ambiguous, contains 3+ unclear terms",
                RubricLevel.BELOW_AVERAGE: "Some ambiguity, 2 unclear terms",
                RubricLevel.AVERAGE: "Generally clear, 1 minor ambiguity",
                RubricLevel.GOOD: "Clear instructions, specific language",
                RubricLevel.EXCELLENT: "Crystal clear, no ambiguity, precise language"
            },
            measurement_function=self._measure_clarity
        )
        
        # 2. SPECIFICITY CRITERIA
        criteria["specificity"] = RubricCriteria(
            name="Specificity",
            description="Level of detail and concrete requirements",
            weight=0.25,
            scoring_rules={
                RubricLevel.POOR: "No specific requirements, completely generic",
                RubricLevel.BELOW_AVERAGE: "1-2 specific elements mentioned",
                RubricLevel.AVERAGE: "3-4 specific requirements or constraints",
                RubricLevel.GOOD: "5-6 detailed specifications",
                RubricLevel.EXCELLENT: "7+ comprehensive, detailed specifications"
            },
            measurement_function=self._measure_specificity
        )
        
        # 3. STRUCTURE CRITERIA
        criteria["structure"] = RubricCriteria(
            name="Structure",
            description="Organization and logical flow",
            weight=0.25,
            scoring_rules={
                RubricLevel.POOR: "No structure, stream of consciousness",
                RubricLevel.BELOW_AVERAGE: "Basic structure, some organization",
                RubricLevel.AVERAGE: "Clear sections or logical flow",
                RubricLevel.GOOD: "Well-organized with clear hierarchy",
                RubricLevel.EXCELLENT: "Perfect structure with headers, lists, clear progression"
            },
            measurement_function=self._measure_structure
        )
        
        # 4. CONTEXT CRITERIA
        criteria["context"] = RubricCriteria(
            name="Context",
            description="Background information and situational details",
            weight=0.15,
            scoring_rules={
                RubricLevel.POOR: "No context provided",
                RubricLevel.BELOW_AVERAGE: "Minimal context, missing key background",
                RubricLevel.AVERAGE: "Some context provided",
                RubricLevel.GOOD: "Good context with relevant background",
                RubricLevel.EXCELLENT: "Comprehensive context with all necessary background"
            },
            measurement_function=self._measure_context
        )
        
        # 5. ACTIONABILITY CRITERIA
        criteria["actionability"] = RubricCriteria(
            name="Actionability",
            description="How easy it is to act on the prompt",
            weight=0.10,
            scoring_rules={
                RubricLevel.POOR: "Unclear what action to take",
                RubricLevel.BELOW_AVERAGE: "Action implied but not explicit",
                RubricLevel.AVERAGE: "Clear action with some guidance",
                RubricLevel.GOOD: "Clear action with specific steps",
                RubricLevel.EXCELLENT: "Crystal clear actionable instructions with examples"
            },
            measurement_function=self._measure_actionability
        )
        
        return criteria
    
    def _measure_clarity(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure clarity using deterministic rules"""
        issues = []
        score_factors = []
        
        # Factor 1: Vague words (measurable)
        vague_words = ['something', 'anything', 'stuff', 'things', 'good', 'nice', 'some', 'many', 'several', 'various']
        vague_count = sum(1 for word in vague_words if word.lower() in text.lower())
        score_factors.append(("vague_words", vague_count))
        
        if vague_count >= 3:
            issues.append(f"Contains {vague_count} vague words")
        
        # Factor 2: Question vs instruction clarity
        has_question = '?' in text
        action_words = ['write', 'create', 'generate', 'explain', 'describe', 'analyze', 'compare', 'list', 'summarize']
        has_clear_action = any(word in text.lower() for word in action_words)
        score_factors.append(("has_clear_action", has_clear_action))
        
        if not has_question and not has_clear_action:
            issues.append("No clear action word or question")
        
        # Factor 3: Sentence complexity (measurable)
        sentences = re.split(r'[.!?]+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        score_factors.append(("avg_sentence_length", avg_sentence_length))
        
        if avg_sentence_length > 25:
            issues.append("Sentences too long (avg > 25 words)")
        
        # Factor 4: Pronoun ambiguity
        pronouns = ['it', 'they', 'them', 'this', 'that', 'these', 'those']
        pronoun_count = sum(1 for word in pronouns if word in text.lower().split())
        score_factors.append(("pronoun_count", pronoun_count))
        
        if pronoun_count > len(text.split()) * 0.1:  # More than 10% pronouns
            issues.append("Too many ambiguous pronouns")
        
        # Determine level based on measurable factors
        if vague_count >= 3 or not has_clear_action or avg_sentence_length > 30:
            level = RubricLevel.POOR
        elif vague_count == 2 or avg_sentence_length > 25:
            level = RubricLevel.BELOW_AVERAGE
        elif vague_count == 1 or avg_sentence_length > 20:
            level = RubricLevel.AVERAGE
        elif vague_count == 0 and has_clear_action and avg_sentence_length <= 20:
            level = RubricLevel.GOOD
        else:
            level = RubricLevel.EXCELLENT
        
        return level, {
            "score_factors": score_factors,
            "issues": issues,
            "vague_word_count": vague_count,
            "has_clear_action": has_clear_action,
            "avg_sentence_length": round(avg_sentence_length, 1)
        }
    
    def _measure_specificity(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure specificity using quantifiable elements"""
        specific_elements = 0
        details = []
        
        # Factor 1: Numbers and quantities (highly specific)
        numbers = re.findall(r'\b\d+\b', text)
        if numbers:
            specific_elements += 2
            details.append(f"Contains {len(numbers)} numeric specifications")
        
        # Factor 2: Format specifications
        format_words = ['email', 'report', 'list', 'paragraph', 'summary', 'article', 'bullet points', 'table', 'chart']
        format_mentions = sum(1 for word in format_words if word in text.lower())
        specific_elements += format_mentions
        if format_mentions > 0:
            details.append(f"Specifies {format_mentions} format requirements")
        
        # Factor 3: Length specifications
        length_words = ['words', 'pages', 'minutes', 'sentences', 'paragraphs', 'characters']
        length_mentions = sum(1 for word in length_words if word in text.lower())
        specific_elements += length_mentions
        if length_mentions > 0:
            details.append(f"Includes {length_mentions} length specifications")
        
        # Factor 4: Audience specifications
        audience_indicators = ['for', 'audience', 'readers', 'users', 'customers', 'students', 'professionals', 'beginners', 'experts']
        audience_mentions = sum(1 for indicator in audience_indicators if indicator in text.lower())
        if audience_mentions > 0:
            specific_elements += 1
            details.append("Specifies target audience")
        
        # Factor 5: Tone/Style specifications
        tone_words = ['formal', 'informal', 'professional', 'casual', 'academic', 'friendly', 'persuasive', 'informative']
        tone_mentions = sum(1 for word in tone_words if word in text.lower())
        if tone_mentions > 0:
            specific_elements += 1
            details.append(f"Specifies {tone_mentions} tone/style requirements")
        
        # Factor 6: Examples requested
        example_words = ['example', 'examples', 'instance', 'such as', 'like', 'including']
        example_mentions = sum(1 for word in example_words if word in text.lower())
        if example_mentions > 0:
            specific_elements += 1
            details.append("Requests examples")
        
        # Factor 7: Constraints and requirements
        constraint_words = ['must', 'should', 'need to', 'required', 'necessary', 'important', 'ensure', 'make sure']
        constraint_mentions = sum(1 for word in constraint_words if word in text.lower())
        if constraint_mentions > 0:
            specific_elements += min(constraint_mentions, 2)  # Cap at 2 points
            details.append(f"Contains {constraint_mentions} explicit requirements")
        
        # Determine level based on specific elements count
        if specific_elements >= 7:
            level = RubricLevel.EXCELLENT
        elif specific_elements >= 5:
            level = RubricLevel.GOOD
        elif specific_elements >= 3:
            level = RubricLevel.AVERAGE
        elif specific_elements >= 1:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "specific_elements_count": specific_elements,
            "details": details,
            "numbers_found": len(numbers),
            "format_specifications": format_mentions,
            "length_specifications": length_mentions,
            "audience_specified": audience_mentions > 0,
            "tone_specified": tone_mentions > 0,
            "examples_requested": example_mentions > 0,
            "constraints_mentioned": constraint_mentions
        }
    
    def _measure_structure(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure structural organization using concrete indicators"""
        structure_points = 0
        structure_features = []
        
        # Factor 1: Headers and sections
        has_headers = bool(re.search(r'^#+\s|^\*\*[^*]+\*\*|\b(Step \d+|Part \d+|Section \d+):', text, re.MULTILINE))
        if has_headers:
            structure_points += 2
            structure_features.append("Contains headers/sections")
        
        # Factor 2: Lists and bullets
        has_bullets = bool(re.search(r'^\s*[-*•]\s', text, re.MULTILINE))
        has_numbered = bool(re.search(r'^\s*\d+\.\s', text, re.MULTILINE))
        if has_bullets:
            structure_points += 1
            structure_features.append("Uses bullet points")
        if has_numbered:
            structure_points += 1
            structure_features.append("Uses numbered lists")
        
        # Factor 3: Logical connectors
        connectors = ['first', 'second', 'then', 'next', 'finally', 'however', 'therefore', 'moreover', 'additionally']
        connector_count = sum(1 for connector in connectors if connector in text.lower())
        if connector_count >= 2:
            structure_points += 1
            structure_features.append(f"Uses {connector_count} logical connectors")
        
        # Factor 4: Paragraph structure
        paragraphs = text.split('\n\n')
        paragraph_count = len([p for p in paragraphs if p.strip()])
        if paragraph_count > 1:
            structure_points += 1
            structure_features.append(f"Organized in {paragraph_count} paragraphs")
        
        # Factor 5: Clear beginning and end
        has_clear_start = text.strip().startswith(('##', '**', 'Step 1', 'First', 'To', 'Please', 'I need'))
        has_clear_end = text.strip().endswith(('.', '!', '?')) and len(text.strip()) > 10
        if has_clear_start:
            structure_points += 0.5
            structure_features.append("Has clear opening")
        if has_clear_end:
            structure_points += 0.5
            structure_features.append("Has proper ending")
        
        # Determine level
        if structure_points >= 5:
            level = RubricLevel.EXCELLENT
        elif structure_points >= 3.5:
            level = RubricLevel.GOOD
        elif structure_points >= 2:
            level = RubricLevel.AVERAGE
        elif structure_points >= 1:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "structure_points": structure_points,
            "features": structure_features,
            "has_headers": has_headers,
            "has_bullets": has_bullets,
            "has_numbered_lists": has_numbered,
            "logical_connectors": connector_count,
            "paragraph_count": paragraph_count,
            "clear_structure": has_clear_start and has_clear_end
        }
    
    def _measure_context(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure context provision using identifiable elements"""
        context_elements = 0
        context_details = []
        
        # Factor 1: Background information indicators
        background_words = ['background', 'context', 'situation', 'scenario', 'about', 'regarding', 'concerning']
        has_background = any(word in text.lower() for word in background_words)
        if has_background:
            context_elements += 1
            context_details.append("Provides background information")
        
        # Factor 2: Purpose/goal explanation
        purpose_indicators = ['purpose', 'goal', 'aim', 'objective', 'to achieve', 'in order to', 'so that']
        has_purpose = any(indicator in text.lower() for indicator in purpose_indicators)
        if has_purpose:
            context_elements += 1
            context_details.append("Explains purpose/goal")
        
        # Factor 3: Use case description
        use_case_phrases = ['will be used for', 'intended for', 'this will help', 'used to', 'for the purpose of']
        has_use_case = any(phrase in text.lower() for phrase in use_case_phrases)
        if has_use_case:
            context_elements += 1
            context_details.append("Describes use case")
        
        # Factor 4: Domain/industry context
        domain_words = ['business', 'technical', 'academic', 'medical', 'legal', 'marketing', 'education', 'research', 'scientific']
        domain_mentions = sum(1 for word in domain_words if word in text.lower())
        if domain_mentions > 0:
            context_elements += 1
            context_details.append(f"Specifies domain ({domain_mentions} indicators)")
        
        # Factor 5: Constraints and limitations
        constraint_phrases = ['must not', 'avoid', 'within', 'limited to', 'maximum', 'minimum', 'constraint', 'restriction']
        constraint_count = sum(1 for phrase in constraint_phrases if phrase in text.lower())
        if constraint_count > 0:
            context_elements += 1
            context_details.append(f"Mentions {constraint_count} constraints")
        
        # Determine level
        if context_elements >= 5:
            level = RubricLevel.EXCELLENT
        elif context_elements >= 3:
            level = RubricLevel.GOOD
        elif context_elements >= 2:
            level = RubricLevel.AVERAGE
        elif context_elements >= 1:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "context_elements": context_elements,
            "details": context_details,
            "has_background": has_background,
            "has_purpose": has_purpose,
            "has_use_case": has_use_case,
            "domain_specified": domain_mentions > 0,
            "constraints_mentioned": constraint_count > 0
        }
    
    def _measure_actionability(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure how actionable the prompt is"""
        actionability_score = 0
        action_features = []
        
        # Factor 1: Clear action verbs
        action_verbs = ['write', 'create', 'generate', 'explain', 'describe', 'analyze', 'compare', 'list', 'summarize', 'develop', 'design', 'build']
        action_count = sum(1 for verb in action_verbs if verb in text.lower())
        if action_count > 0:
            actionability_score += min(action_count, 2)  # Cap at 2 points
            action_features.append(f"Contains {action_count} clear action verbs")
        
        # Factor 2: Specific deliverable mentioned
        deliverables = ['report', 'summary', 'list', 'plan', 'strategy', 'analysis', 'review', 'presentation', 'document']
        deliverable_count = sum(1 for item in deliverables if item in text.lower())
        if deliverable_count > 0:
            actionability_score += 1
            action_features.append(f"Specifies {deliverable_count} deliverable types")
        
        # Factor 3: Step-by-step indicators
        step_indicators = ['step', 'first', 'then', 'next', 'finally', 'process', 'procedure']
        step_count = sum(1 for indicator in step_indicators if indicator in text.lower())
        if step_count >= 2:
            actionability_score += 1
            action_features.append("Includes step-by-step guidance")
        
        # Factor 4: Examples or templates mentioned
        example_requests = ['example', 'template', 'sample', 'format', 'like this', 'such as']
        example_count = sum(1 for req in example_requests if req in text.lower())
        if example_count > 0:
            actionability_score += 1
            action_features.append("Requests examples/templates")
        
        # Determine level
        if actionability_score >= 4:
            level = RubricLevel.EXCELLENT
        elif actionability_score >= 3:
            level = RubricLevel.GOOD
        elif actionability_score >= 2:
            level = RubricLevel.AVERAGE
        elif actionability_score >= 1:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "actionability_score": actionability_score,
            "features": action_features,
            "action_verb_count": action_count,
            "deliverables_specified": deliverable_count,
            "step_indicators": step_count,
            "examples_requested": example_count > 0
        }
    
    def evaluate_prompt(self, text: str, generate_hash: bool = True) -> Dict[str, Any]:
        """
        Evaluate a prompt using the standardized rubric
        Returns consistent results for the same input
        """
        if not text or not text.strip():
            return self._empty_prompt_result()
        
        # Generate hash for consistency checking
        text_hash = hashlib.md5(text.encode()).hexdigest() if generate_hash else None
        
        # Check cache for consistency
        if text_hash and text_hash in self.consistency_cache:
            logger.info(f"Using cached evaluation for consistent results")
            return self.consistency_cache[text_hash]
        
        results = {
            "text": text,
            "text_hash": text_hash,
            "evaluation_timestamp": None,  # Would be set in production
            "criteria_scores": {},
            "detailed_analysis": {},
            "overall_metrics": {},
            "rubric_version": "1.0"
        }
        
        total_weighted_score = 0
        max_possible_score = 0
        
        # Evaluate each criterion
        for criterion_name, criterion in self.criteria.items():
            level, details = criterion.measurement_function(text)
            score = level.value * 20  # Convert 1-5 to 0-100 scale
            weighted_score = score * criterion.weight
            
            results["criteria_scores"][criterion_name] = {
                "level": level.name,
                "score": score,
                "weight": criterion.weight,
                "weighted_score": weighted_score,
                "rationale": criterion.scoring_rules[level]
            }
            
            results["detailed_analysis"][criterion_name] = details
            
            total_weighted_score += weighted_score
            max_possible_score += 100 * criterion.weight
        
        # Calculate overall metrics
        overall_score = (total_weighted_score / max_possible_score) * 100
        results["overall_metrics"] = {
            "weighted_score": round(overall_score, 1),
            "letter_grade": self._score_to_letter_grade(overall_score),
            "improvement_needed": overall_score < 70,
            "excellence_achieved": overall_score >= 85,
            "consistency_hash": text_hash
        }
        
        # Add to cache for consistency
        if text_hash:
            self.consistency_cache[text_hash] = results
        
        return results
    
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
                "consistency_hash": None
            },
            "rubric_version": "1.0",
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
    
    def compare_prompts(self, original_text: str, optimized_text: str) -> Dict[str, Any]:
        """
        Compare two prompts using the standardized rubric
        Ensures consistent comparison results
        """
        original_eval = self.evaluate_prompt(original_text)
        optimized_eval = self.evaluate_prompt(optimized_text)
        
        comparison = {
            "original_evaluation": original_eval,
            "optimized_evaluation": optimized_eval,
            "improvements": {},
            "regression_warnings": [],
            "overall_improvement": {},
            "consistency_verified": True
        }
        
        # Calculate improvements per criterion
        for criterion_name in self.criteria.keys():
            if criterion_name in original_eval["criteria_scores"] and criterion_name in optimized_eval["criteria_scores"]:
                original_score = original_eval["criteria_scores"][criterion_name]["score"]
                optimized_score = optimized_eval["criteria_scores"][criterion_name]["score"]
                improvement = optimized_score - original_score
                
                comparison["improvements"][criterion_name] = {
                    "original_score": original_score,
                    "optimized_score": optimized_score,
                    "improvement": improvement,
                    "improvement_percentage": round((improvement / original_score) * 100, 1) if original_score > 0 else 0,
                    "significant_improvement": improvement >= 10
                }
                
                # Check for regressions
                if improvement < -5:  # Significant regression
                    comparison["regression_warnings"].append(f"{criterion_name} decreased by {abs(improvement)} points")
        
        # Overall improvement summary
        original_overall = original_eval["overall_metrics"]["weighted_score"]
        optimized_overall = optimized_eval["overall_metrics"]["weighted_score"]
        overall_improvement = optimized_overall - original_overall
        
        comparison["overall_improvement"] = {
            "original_score": original_overall,
            "optimized_score": optimized_overall,
            "improvement": round(overall_improvement, 1),
            "improvement_percentage": round((overall_improvement / original_overall) * 100, 1) if original_overall > 0 else 0,
            "grade_change": f"{original_eval['overall_metrics']['letter_grade']} → {optimized_eval['overall_metrics']['letter_grade']}",
            "meaningful_improvement": overall_improvement >= 5
        }
        
        return comparison
    
    def get_rubric_summary(self) -> Dict[str, Any]:
        """Get a summary of the rubric for transparency"""
        summary = {
            "version": "1.0",
            "total_criteria": len(self.criteria),
            "criteria_details": {},
            "scoring_methodology": "Deterministic rules-based evaluation",
            "consistency_features": [
                "Cached evaluations for identical inputs",
                "Quantifiable measurement criteria",
                "Standardized scoring rubric",
                "Reproducible hash-based tracking"
            ]
        }
        
        for name, criterion in self.criteria.items():
            summary["criteria_details"][name] = {
                "description": criterion.description,
                "weight": criterion.weight,
                "scoring_levels": {level.name: rule for level, rule in criterion.scoring_rules.items()}
            }
        
        return summary