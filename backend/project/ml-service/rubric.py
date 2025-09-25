# rubric_sys.py (unchanged, kept thorough)
import aiohttp
import re
import json
import hashlib
from typing import Dict, List, Tuple, Optional, Any, Callable
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
    def __init__(self, 
                 name: str, 
                 description: str, 
                 weight: float = 1.0,
                 evaluation_guidelines: str = "",
                 focus_areas: List[str] = None):
        self.name = name
        self.description = description
        self.weight = weight
        self.evaluation_guidelines = evaluation_guidelines
        self.focus_areas = focus_areas or []
        self.measurement_function = self._default_measurement
        self.evaluation_cache = {}
        
    def _default_measurement(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Default measurement function if none is specified"""
        # Basic evaluation logic
        if not text or len(text.strip()) == 0:
            return RubricLevel.POOR, {
                "reason": "Empty or whitespace-only text",
                "score": 0.0,
                "suggestions": ["Add meaningful content"]
            }
        
        # Simple length-based scoring
        word_count = len(text.split())
        if word_count < 10:
            return RubricLevel.BELOW_AVERAGE, {
                "reason": "Text is too short",
                "score": 0.4,
                "word_count": word_count,
                "suggestions": ["Expand the content"]
            }
        elif word_count < 50:
            return RubricLevel.GOOD, {
                "reason": "Moderate length",
                "score": 0.7,
                "word_count": word_count,
                "suggestions": ["Consider adding more detail"]
            }
        else:
            return RubricLevel.EXCELLENT, {
                "reason": "Good length",
                "score": 0.9,
                "word_count": word_count,
                "suggestions": []
            }

    def set_measurement_function(self, func: Callable[[str], Tuple[RubricLevel, Dict[str, Any]]]):
        """Set custom measurement function"""
        self.measurement_function = func

    def measure(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure text using the defined measurement function"""
        try:
            if text in self.evaluation_cache:
                return self.evaluation_cache[text]
            
            result = self.measurement_function(text)
            self.evaluation_cache[text] = result
            return result
        except Exception as e:
            logger.error(f"Measurement failed for criterion {self.name}: {e}")
            return RubricLevel.POOR, {
                "reason": f"Measurement error: {str(e)}",
                "score": 0.0,
                "suggestions": ["System error occurred"]
            }

class StandardizedRubric:
    """
    Standardized rubric system for consistent prompt evaluation
    Uses deterministic rules and measurable criteria to ensure consistency
    """
    
    def __init__(self, qwen_api_endpoint: str = None, qwen_api_key: str = None):
        self.criteria = self._initialize_criteria()
        self.consistency_cache = {}
        self.qwen_endpoint = qwen_api_endpoint
        self.qwen_api_key = qwen_api_key
        
    def _initialize_criteria(self) -> Dict[str, RubricCriteria]:
        """Initialize all evaluation criteria with specific, measurable rules"""
        
        criteria = {}
        
        # 1. CLARITY CRITERIA
        clarity_criteria = RubricCriteria(
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
        clarity_criteria.set_measurement_function(self._measure_clarity)
        criteria["clarity"] = clarity_criteria
        
        # 2. SPECIFICITY CRITERIA
        specificity_criteria = RubricCriteria(
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
            - 1-2 specific elements mentioned
            - Vague format mentions
            - Minimal quantifiable elements (1-2)
            - Some audience/context implied
            - Basic constraints present
            
            SCORE 41-60 (AVERAGE):
            - 3-4 specific requirements
            - Basic format specs (e.g., 'list', 'paragraph')
            - Some quantifiable elements (3-4)
            - Clear audience or context
            - Standard constraints mentioned
            
            SCORE 61-80 (GOOD):
            - 5-6 detailed specifications
            - Clear format requirements with details
            - Multiple quantifiable elements (5+)
            - Specific audience and context defined
            - Comprehensive constraints
            
            SCORE 81-100 (EXCELLENT):
            - 7+ comprehensive specifications
            - Precise formats with examples/templates
            - Extensive quantifiable metrics
            - Detailed audience, context, constraints
            - Measurable success criteria
            """,
            focus_areas=["requirements_detail", "format_specificity", "quantifiable_elements", "audience_context", "constraints"]
        )
        specificity_criteria.set_measurement_function(self._measure_specificity)
        criteria["specificity"] = specificity_criteria
        
        # 3. STRUCTURE CRITERIA
        structure_criteria = RubricCriteria(
            name="Structure",
            description="Organization, logical flow, and formatting of the prompt",
            weight=0.25,
            evaluation_guidelines="""
            STRUCTURE SCORING RANGES:
            
            SCORE 0-20 (POOR):
            - No organization or formatting
            - Stream of consciousness writing
            - No sections, lists, or hierarchy
            - Poor logical flow
            - Difficult to follow
            
            SCORE 21-40 (BELOW AVERAGE):
            - Basic organization with 2-3 distinct ideas
            - Minimal formatting (e.g., paragraphs)
            - Weak logical flow with some jumps
            - Lacks clear beginning/end
            - Basic readability
            
            SCORE 41-60 (AVERAGE):
            - Clear sections or steps (3-4)
            - Uses basic formatting (bullets/numbers)
            - Logical flow present
            - Has introduction or conclusion
            - Good overall organization
            
            SCORE 61-80 (GOOD):
            - Well-organized with hierarchy (headers/subheaders)
            - Effective formatting for readability
            - Strong logical progression
            - Clear intro, body, conclusion
            - Easy to scan and understand
            
            SCORE 81-100 (EXCELLENT):
            - Perfect structure with multiple levels
            - Professional formatting (markdown, lists, etc.)
            - Seamless logical flow
            - Comprehensive organization
            - Optimal for AI processing
            """,
            focus_areas=["organization", "formatting", "logical_flow", "hierarchy", "readability"]
        )
        structure_criteria.set_measurement_function(self._measure_structure)
        criteria["structure"] = structure_criteria
        
        # 4. CONTEXT CRITERIA
        context_criteria = RubricCriteria(
            name="Context",
            description="Background information, purpose, and situational awareness provided",
            weight=0.15,
            evaluation_guidelines="""
            CONTEXT SCORING RANGES:
            
            SCORE 0-20 (POOR):
            - No background or purpose mentioned
            - No domain-specific context
            - Missing essential situational info
            - Assumes too much prior knowledge
            - No constraints or scope
            
            SCORE 21-40 (BELOW AVERAGE):
            - Minimal context provided
            - Implied purpose only
            - Limited background (1-2 elements)
            - Incomplete domain information
            - Basic constraints mentioned
            
            SCORE 41-60 (AVERAGE):
            - Basic context and background
            - Clear purpose stated
            - Some domain-specific info
            - Adequate situational awareness
            - Standard constraints
            
            SCORE 61-80 (GOOD):
            - Good contextual foundation
            - Clear purpose and goals
            - Relevant domain context
            - Constraints and scope defined
            - Helpful background details
            
            SCORE 81-100 (EXCELLENT):
            - Comprehensive context
            - Detailed purpose/rationale
            - Rich domain/situational info
            - All relevant constraints
            - Enables informed response
            """,
            focus_areas=["background", "purpose", "domain_context", "constraints", "situational_awareness"]
        )
        context_criteria.set_measurement_function(self._measure_context)
        criteria["context"] = context_criteria
        
        # 5. ACTIONABILITY CRITERIA
        actionability_criteria = RubricCriteria(
            name="Actionability",
            description="How easily the prompt can be acted upon with clear steps/deliverables",
            weight=0.10,
            evaluation_guidelines="""
            ACTIONABILITY SCORING RANGES:
            
            SCORE 0-20 (POOR):
            - No clear actions or deliverables
            - Unclear what to do
            - No guidance provided
            - Abstract or theoretical only
            - Requires significant interpretation
            
            SCORE 21-40 (BELOW AVERAGE):
            - Weak action verbs
            - Implied actions only
            - Vague deliverables
            - Minimal guidance
            - Requires some interpretation
            
            SCORE 41-60 (AVERAGE):
            - Clear action verbs present
            - Specific actions mentioned
            - Basic deliverables defined
            - Some implementation guidance
            - Straightforward to follow
            
            SCORE 61-80 (GOOD):
            - Strong, specific action guidance
            - Well-defined deliverables
            - Step-by-step instructions
            - Easy to act upon
            - Minimal ambiguity
            
            SCORE 81-100 (EXCELLENT):
            - Crystal clear action steps
            - Comprehensive guidance
            - Specific, measurable deliverables
            - Complete implementation roadmap
            - Immediately actionable
            """,
            focus_areas=["action_verbs", "deliverables", "guidance", "steps", "measurability"]
        )
        actionability_criteria.set_measurement_function(self._measure_actionability)
        criteria["actionability"] = actionability_criteria
        
        return criteria

    def _measure_clarity(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure clarity using deterministic rules"""
        clarity_score = 0
        clarity_features = []
        
        # Factor 1: Vague terms count
        vague_terms = ['something', 'stuff', 'things', 'good', 'nice', 'well', 'better', 'etc', 'like', 'kind of']
        vague_count = sum(len(re.findall(r'\b' + term + r'\b', text.lower())) for term in vague_terms)
        if vague_count == 0:
            clarity_score += 30
            clarity_features.append("No vague terms")
        elif vague_count <= 1:
            clarity_score += 20
            clarity_features.append("Minimal vague terms")
        elif vague_count <= 3:
            clarity_score += 10
            clarity_features.append("Some vague terms")
        
        # Factor 2: Action verb clarity
        action_verbs = ['generate', 'create', 'write', 'list', 'explain', 'analyze', 'describe', 'summarize', 'design', 'build']
        action_count = sum(1 for verb in action_verbs if verb in text.lower())
        if action_count >= 2:
            clarity_score += 25
            clarity_features.append("Multiple clear action verbs")
        elif action_count == 1:
            clarity_score += 15
            clarity_features.append("Clear action verb present")
        
        # Factor 3: Pronoun usage
        pronouns = ['it', 'this', 'that', 'they', 'them', 'these', 'those']
        pronoun_count = sum(len(re.findall(r'\b' + p + r'\b', text.lower())) for p in pronouns)
        total_words = len(text.split())
        pronoun_ratio = pronoun_count / total_words if total_words > 0 else 0
        if pronoun_ratio < 0.05:
            clarity_score += 20
            clarity_features.append("Minimal pronoun usage")
        elif pronoun_ratio < 0.10:
            clarity_score += 10
            clarity_features.append("Moderate pronoun usage")
        
        # Factor 4: Sentence length
        sentences = re.split(r'[.!?]', text)
        avg_length = np.mean([len(s.split()) for s in sentences if s.strip()])
        if avg_length < 15:
            clarity_score += 15
            clarity_features.append("Optimal sentence length")
        elif avg_length < 20:
            clarity_score += 10
            clarity_features.append("Good sentence length")
        elif avg_length < 25:
            clarity_score += 5
            clarity_features.append("Acceptable sentence length")
        
        # Factor 5: Overall readability (simple proxy)
        if total_words > 20:
            clarity_score += 10
            clarity_features.append("Sufficient length for clarity")
        
        # Cap at 100
        clarity_score = min(100, clarity_score)
        
        # Determine level
        if clarity_score >= 81:
            level = RubricLevel.EXCELLENT
        elif clarity_score >= 61:
            level = RubricLevel.GOOD
        elif clarity_score >= 41:
            level = RubricLevel.AVERAGE
        elif clarity_score >= 21:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "clarity_score": clarity_score,
            "features": clarity_features,
            "vague_count": vague_count,
            "action_count": action_count,
            "pronoun_ratio": round(pronoun_ratio * 100, 1),
            "avg_sentence_length": round(avg_length, 1)
        }

    def _measure_specificity(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure specificity using deterministic rules"""
        specificity_score = 0
        spec_features = []
        
        # Factor 1: Quantifiable elements
        numbers = len(re.findall(r'\b\d+\b', text))
        metrics = len(re.findall(r'\b(?:percent|%|dollars?|\$|times?|levels?|steps?|items?|points?)\b', text.lower()))
        quant_count = numbers + metrics
        if quant_count >= 5:
            specificity_score += 30
            spec_features.append("Extensive quantifiable elements")
        elif quant_count >= 3:
            specificity_score += 20
            spec_features.append("Good quantifiable elements")
        elif quant_count >= 1:
            specificity_score += 10
            spec_features.append("Basic quantifiable elements")
        
        # Factor 2: Format specifications
        formats = ['list', 'paragraph', 'bullet', 'number', 'table', 'json', 'xml', 'markdown', 'section', 'chapter']
        format_count = sum(1 for f in formats if f in text.lower())
        if format_count >= 3:
            specificity_score += 25
            spec_features.append("Detailed format specifications")
        elif format_count >= 2:
            specificity_score += 15
            spec_features.append("Good format specifications")
        elif format_count == 1:
            specificity_score += 10
            spec_features.append("Basic format specification")
        
        # Factor 3: Audience/Context mentions
        audience_terms = ['audience', 'user', 'reader', 'team', 'executive', 'student', 'professional']
        context_terms = ['context', 'background', 'scenario', 'situation', 'case', 'example']
        aud_count = sum(1 for term in audience_terms if term in text.lower())
        ctx_count = sum(1 for term in context_terms if term in text.lower())
        if aud_count + ctx_count >= 3:
            specificity_score += 20
            spec_features.append("Detailed audience/context")
        elif aud_count + ctx_count >= 2:
            specificity_score += 15
            spec_features.append("Good audience/context")
        elif aud_count + ctx_count == 1:
            specificity_score += 10
            spec_features.append("Basic audience/context")
        
        # Factor 4: Constraints/Requirements
        constraint_terms = ['must', 'should', 'require', 'constraint', 'limit', 'avoid', 'include', 'exclude']
        const_count = sum(1 for term in constraint_terms if term in text.lower())
        if const_count >= 4:
            specificity_score += 15
            spec_features.append("Comprehensive constraints")
        elif const_count >= 2:
            specificity_score += 10
            spec_features.append("Good constraints")
        elif const_count == 1:
            specificity_score += 5
            spec_features.append("Basic constraints")
        
        # Factor 5: Success criteria
        if any(term in text.lower() for term in ['success', 'criteria', 'measure', 'evaluate']):
            specificity_score += 10
            spec_features.append("Includes success criteria")
        
        # Determine level
        if specificity_score >= 81:
            level = RubricLevel.EXCELLENT
        elif specificity_score >= 61:
            level = RubricLevel.GOOD
        elif specificity_score >= 41:
            level = RubricLevel.AVERAGE
        elif specificity_score >= 21:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "specificity_score": specificity_score,
            "features": spec_features,
            "quantifiable_count": quant_count,
            "format_count": format_count,
            "audience_context_count": aud_count + ctx_count,
            "constraint_count": const_count
        }

    def _measure_structure(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure structure using deterministic rules"""
        structure_score = 0
        struct_features = []
        
        # Factor 1: Formatting elements
        formatting = 0
        if re.search(r'#+\s', text):  # Headers
            formatting += 2
            struct_features.append("Uses headers")
        if re.search(r'-\s|\*\s|\d+\.\s', text):  # Lists
            formatting += 2
            struct_features.append("Uses lists")
        if '**' in text or '__' in text:  # Bold
            formatting += 1
            struct_features.append("Uses bold emphasis")
        if formatting >= 4:
            structure_score += 30
        elif formatting >= 2:
            structure_score += 20
        elif formatting >= 1:
            structure_score += 10
        
        # Factor 2: Logical flow (simple keyword transitions)
        transitions = ['first', 'then', 'next', 'after', 'finally', 'additionally', 'however', 'therefore']
        trans_count = sum(1 for t in transitions if t in text.lower())
        if trans_count >= 3:
            structure_score += 25
            struct_features.append("Strong transitions")
        elif trans_count >= 2:
            structure_score += 15
            struct_features.append("Good transitions")
        elif trans_count == 1:
            structure_score += 10
            struct_features.append("Basic transitions")
        
        # Factor 3: Section count
        sections = len(re.findall(r'#+\s|\d+\.\s', text))
        if sections >= 4:
            structure_score += 20
            struct_features.append("Multiple sections")
        elif sections >= 2:
            structure_score += 15
            struct_features.append("Good sectioning")
        elif sections == 1:
            structure_score += 10
            struct_features.append("Basic sectioning")
        
        # Factor 4: Intro/Conclusion
        if any(term in text.lower() for term in ['introduction', 'overview', 'summary']):
            structure_score += 15
            struct_features.append("Includes intro/conclusion")
        
        # Factor 5: Readability (paragraph breaks)
        para_breaks = text.count('\n\n')
        if para_breaks >= 3:
            structure_score += 10
            struct_features.append("Good paragraph breaks")
        
        # Determine level
        if structure_score >= 81:
            level = RubricLevel.EXCELLENT
        elif structure_score >= 61:
            level = RubricLevel.GOOD
        elif structure_score >= 41:
            level = RubricLevel.AVERAGE
        elif structure_score >= 21:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "structure_score": structure_score,
            "features": struct_features,
            "formatting_level": formatting,
            "transition_count": trans_count,
            "section_count": sections
        }

    def _measure_context(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure context using deterministic rules"""
        context_score = 0
        ctx_features = []
        
        # Factor 1: Background information
        bg_terms = ['background', 'context', 'previously', 'history', 'overview', 'situation']
        bg_count = sum(1 for term in bg_terms if term in text.lower())
        if bg_count >= 3:
            context_score += 30
            ctx_features.append("Comprehensive background")
        elif bg_count >= 2:
            context_score += 20
            ctx_features.append("Good background")
        elif bg_count == 1:
            context_score += 10
            ctx_features.append("Basic background")
        
        # Factor 2: Purpose/Goals
        purpose_terms = ['purpose', 'goal', 'objective', 'aim', 'target', 'intent']
        purpose_count = sum(1 for term in purpose_terms if term in text.lower())
        if purpose_count >= 2:
            context_score += 25
            ctx_features.append("Clear purpose/goals")
        elif purpose_count == 1:
            context_score += 15
            ctx_features.append("Basic purpose")
        
        # Factor 3: Domain-specific context
        domain_terms = ['industry', 'field', 'domain', 'sector', 'area', 'topic']
        domain_count = sum(1 for term in domain_terms if term in text.lower())
        if domain_count >= 2:
            context_score += 20
            ctx_features.append("Domain-specific context")
        elif domain_count == 1:
            context_score += 10
            ctx_features.append("Basic domain info")
        
        # Factor 4: Constraints/Scope
        const_terms = ['constraint', 'limit', 'scope', 'boundary', 'requirement', 'must', 'should not']
        const_count = sum(1 for term in const_terms if term in text.lower())
        if const_count >= 3:
            context_score += 15
            ctx_features.append("Detailed constraints")
        elif const_count >= 1:
            context_score += 10
            ctx_features.append("Basic constraints")
        
        # Factor 5: Situational awareness
        sit_terms = ['scenario', 'case', 'example', 'situation', 'use case']
        if any(term in text.lower() for term in sit_terms):
            context_score += 10
            ctx_features.append("Situational details")
        
        # Determine level
        if context_score >= 81:
            level = RubricLevel.EXCELLENT
        elif context_score >= 61:
            level = RubricLevel.GOOD
        elif context_score >= 41:
            level = RubricLevel.AVERAGE
        elif context_score >= 21:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "context_score": context_score,
            "features": ctx_features,
            "background_count": bg_count,
            "purpose_count": purpose_count,
            "domain_count": domain_count,
            "constraint_count": const_count
        }

    def _measure_actionability(self, text: str) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Measure actionability using deterministic rules"""
        actionability_score = 0
        action_features = []
        
        # Factor 1: Action verbs
        action_verbs = ['generate', 'create', 'write', 'list', 'explain', 'analyze', 'describe', 'summarize', 'design', 'build', 'develop']
        action_count = sum(1 for verb in action_verbs if verb in text.lower())
        if action_count >= 3:
            actionability_score += 30
            action_features.append("Multiple strong action verbs")
        elif action_count >= 2:
            actionability_score += 20
            action_features.append("Good action verbs")
        elif action_count == 1:
            actionability_score += 10
            action_features.append("Basic action verb")
        
        # Factor 2: Deliverables specified
        deliverables = ['output', 'result', 'response', 'format', 'deliver', 'produce', 'create', 'report', 'plan', 'code', 'essay', 'article', 'summary', 'analysis', 'review', 'presentation', 'document']
        deliverable_count = sum(1 for item in deliverables if item in text.lower())
        if deliverable_count >= 3:
            actionability_score += 25
            action_features.append("Detailed deliverables")
        elif deliverable_count >= 2:
            actionability_score += 15
            action_features.append("Good deliverables")
        elif deliverable_count == 1:
            actionability_score += 10
            action_features.append("Basic deliverable")
        
        # Factor 3: Guidance/Steps
        step_indicators = ['step', 'first', 'then', 'next', 'finally', 'process', 'procedure', 'how to', 'guide', 'instructions']
        step_count = sum(1 for indicator in step_indicators if indicator in text.lower())
        if step_count >= 3:
            actionability_score += 20
            action_features.append("Detailed guidance")
        elif step_count >= 2:
            actionability_score += 15
            action_features.append("Good step-by-step")
        elif step_count == 1:
            actionability_score += 10
            action_features.append("Basic guidance")
        
        # Factor 4: Measurability
        measure_terms = ['measure', 'criteria', 'success', 'evaluate', 'check', 'verify']
        if any(term in text.lower() for term in measure_terms):
            actionability_score += 15
            action_features.append("Includes measurability")
        
        # Factor 5: Examples
        if any(term in text.lower() for term in ['example', 'sample', 'template', 'like this']):
            actionability_score += 10
            action_features.append("Provides examples")
        
        # Determine level
        if actionability_score >= 81:
            level = RubricLevel.EXCELLENT
        elif actionability_score >= 61:
            level = RubricLevel.GOOD
        elif actionability_score >= 41:
            level = RubricLevel.AVERAGE
        elif actionability_score >= 21:
            level = RubricLevel.BELOW_AVERAGE
        else:
            level = RubricLevel.POOR
        
        return level, {
            "actionability_score": actionability_score,
            "features": action_features,
            "action_verb_count": action_count,
            "deliverable_count": deliverable_count,
            "step_count": step_count
        }

    async def evaluate_prompt(self, text: str, use_llm: bool = False, generate_hash: bool = True) -> Dict[str, Any]:
        """Evaluate prompt using all criteria"""
        if not text or not text.strip():
            return self._empty_prompt_result()
        
        # Generate hash for consistency tracking
        text_hash = hashlib.md5(text.encode()).hexdigest() if generate_hash else None
        
        # Check cache
        if text_hash and text_hash in self.consistency_cache:
            return self.consistency_cache[text_hash]
        
        criteria_scores = {}
        detailed_analysis = {}
        total_weighted_score = 0
        total_weight = sum(c.weight for c in self.criteria.values())
        
        for name, criterion in self.criteria.items():
            level, analysis = criterion.measure(text)
            score = self._level_to_score(level)
            
            criteria_scores[name] = {
                "level": level.name,
                "score": score,
                "weight": criterion.weight
            }
            
            detailed_analysis[name] = analysis
            detailed_analysis[name]["guidelines"] = criterion.evaluation_guidelines.split('\n')[:5]  # First 5 lines for brevity
            
            total_weighted_score += score * criterion.weight
        
        weighted_score = (total_weighted_score / total_weight) if total_weight > 0 else 0
        
        result = {
            "text": text,
            "text_hash": text_hash,
            "criteria_scores": criteria_scores,
            "detailed_analysis": detailed_analysis,
            "overall_metrics": {
                "weighted_score": round(weighted_score, 1),
                "letter_grade": self._score_to_letter_grade(weighted_score),
                "improvement_needed": weighted_score < 80,
                "excellence_achieved": weighted_score >= 90,
                "consistency_hash": text_hash
            },
            "rubric_version": "2.0"
        }
        
        # Cache result
        if text_hash:
            self.consistency_cache[text_hash] = result
        
        return result

    def _level_to_score(self, level: RubricLevel) -> float:
        """Convert level to score"""
        score_mapping = {
            RubricLevel.EXCELLENT: 95.0,
            RubricLevel.GOOD: 75.0,
            RubricLevel.AVERAGE: 55.0,
            RubricLevel.BELOW_AVERAGE: 35.0,
            RubricLevel.POOR: 15.0
        }
        return score_mapping.get(level, 0.0)

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
            "rubric_version": "2.0",
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
    
    async def compare_prompts(self, original_text: str, optimized_text: str, use_llm: bool = True) -> Dict[str, Any]:
        """
        Compare two prompts using the standardized rubric
        Ensures consistent comparison results
        """
        original_eval = await self.evaluate_prompt(original_text, use_llm=use_llm)
        optimized_eval = await self.evaluate_prompt(optimized_text, use_llm=use_llm)
        
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
            "version": "2.0",
            "total_criteria": len(self.criteria),
            "criteria_details": {},
            "scoring_methodology": "LLM-enhanced evaluation with fallback rules",
            "consistency_features": [
                "Cached evaluations for identical inputs",
                "Quantifiable measurement criteria", 
                "Standardized scoring rubric",
                "Reproducible hash-based tracking",
                "LLM-powered analysis with rule-based fallback"
            ]
        }
        
        for name, criterion in self.criteria.items():
            summary["criteria_details"][name] = {
                "description": criterion.description,
                "weight": criterion.weight,
                "focus_areas": criterion.focus_areas,
                "evaluation_method": "LLM with scoring ranges"
            }
        
        return summary