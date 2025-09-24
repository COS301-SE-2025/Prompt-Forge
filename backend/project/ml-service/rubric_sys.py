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
    def __init__(self, name: str, description: str, weight: float = 1.0):
        self.name = name
        self.description = description
        self.weight = weight
        self.measurement_function = self._default_measurement
        self.evaluation_cache = {}

    def _default_measurement(self, text: str) -> Tuple[Level, Dict[str, Any]]:
        """Default measurement function if none is specified"""
        # Basic evaluation logic
        if not text or len(text.strip()) == 0:
            return Level.POOR, {
                "reason": "Empty or whitespace-only text",
                "score": 0.0,
                "suggestions": ["Add meaningful content"]
            }
        
        # Simple length-based scoring
        word_count = len(text.split())
        if word_count < 10:
            return Level.FAIR, {
                "reason": "Text is too short",
                "score": 0.4,
                "word_count": word_count,
                "suggestions": ["Expand the content"]
            }
        elif word_count < 50:
            return Level.GOOD, {
                "reason": "Moderate length",
                "score": 0.7,
                "word_count": word_count,
                "suggestions": ["Consider adding more detail"]
            }
        else:
            return Level.EXCELLENT, {
                "reason": "Good length",
                "score": 0.9,
                "word_count": word_count,
                "suggestions": []
            }

    def set_measurement_function(self, func: Callable[[str], Tuple[Level, Dict[str, Any]]]):
        """Set custom measurement function"""
        self.measurement_function = func

    def measure(self, text: str) -> Tuple[Level, Dict[str, Any]]:
        """Measure text using the defined measurement function"""
        try:
            if text in self.evaluation_cache:
                return self.evaluation_cache[text]
            
            result = self.measurement_function(text)
            self.evaluation_cache[text] = result
            return result
        except Exception as e:
            logger.error(f"Measurement failed for criterion {self.name}: {e}")
            return Level.POOR, {
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
        if not self.qwen_endpoint:
            raise Exception("Qwen API endpoint not configured")
            
        headers = {
            "Content-Type": "application/json"
        }
        
        if self.qwen_api_key:
            headers["Authorization"] = f"Bearer {self.qwen_api_key}"
        
        payload = {
            "model": "Qwen2.5-72B-Instruct",
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
            numerical_score = max(0, min(100, numerical_score))
            
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
            # Fallback to rule-based evaluation
            return await self._evaluate_criterion_fallback(text, criterion)

    async def _evaluate_criterion_fallback(self, text: str, criterion: RubricCriteria) -> Tuple[RubricLevel, Dict[str, Any]]:
        """Fallback evaluation when LLM is unavailable"""
        # Use existing rule-based evaluation methods as fallback
        if criterion.name == "clarity":
            return self._measure_clarity(text)
        elif criterion.name == "specificity":
            return self._measure_specificity(text)
        elif criterion.name == "structure":
            return self._measure_structure(text)
        elif criterion.name == "context":
            return self._measure_context(text)
        elif criterion.name == "actionability":
            return self._measure_actionability(text)
        else:
            # Default fallback
            return RubricLevel.AVERAGE, {
                "numerical_score": 50,
                "score_range": "41-60",
                "reasoning": "Fallback evaluation used",
                "strengths": [],
                "weaknesses": ["LLM evaluation unavailable"],
                "specific_suggestions": ["Retry with LLM service available"],
                "evidence": [],
                "scoring_factors": {},
                "llm_confidence": "low",
                "range_compliance": False
            }

    async def evaluate_prompt(self, text: str, use_llm: bool = True, generate_hash: bool = True) -> Dict[str, Any]:
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
            "evaluation_method": "llm" if use_llm else "rule_based",
            "criteria_scores": {},
            "detailed_analysis": {},
            "overall_metrics": {},
            "rubric_version": "2.0"
        }
        
        total_weighted_score = 0
        max_possible_score = 0
        
        # Evaluate each criterion
        for criterion_name, criterion in self.criteria.items():
            if use_llm and self.qwen_endpoint:
                level, details = await self._evaluate_criterion_with_llm(text, criterion)
            else:
                level, details = await self._evaluate_criterion_fallback(text, criterion)
                
            score = details.get("numerical_score", level.value * 20)  # Use numerical score if available
            weighted_score = score * criterion.weight
            
            results["criteria_scores"][criterion_name] = {
                "level": level.name,
                "score": score,
                "weight": criterion.weight,
                "weighted_score": weighted_score,
                "numerical_score": score,
                "evaluation_method": "llm" if use_llm and self.qwen_endpoint else "rule_based"
            }
            
            results["detailed_analysis"][criterion_name] = details
            
            total_weighted_score += weighted_score
            max_possible_score += 100 * criterion.weight
        
        # Calculate overall metrics
        overall_score = (total_weighted_score / max_possible_score) * 100 if max_possible_score > 0 else 0
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