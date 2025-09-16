import os
import logging
import numpy as np
import re
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Tuple, Any
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
from dotenv import load_dotenv
from openai import OpenAI

# ----------------------------
# Logging Configuration
# ----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prompt_optimizer")
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
formatter = logging.Formatter("[%(asctime)s] %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# ----------------------------
# FastAPI Initialization
# ----------------------------
app = FastAPI(title="Prompt Optimizer API")

# ----------------------------
# Qwen Integration Class
# ----------------------------
class QwenClient:
    def __init__(self):
        load_dotenv()
        self.api_token = os.getenv("HF_TOKEN", "")
        
        # Available Qwen models via Hugging Face router
        self.model_endpoints = [
            "Qwen/Qwen2.5-72B-Instruct",
            "Qwen/Qwen2.5-32B-Instruct", 
            "Qwen/Qwen2.5-14B-Instruct",
            "Qwen/Qwen2.5-7B-Instruct"
        ]
        
        self.token_validated = False
        self.client = None

        if not self.api_token:
            logger.warning("No Hugging Face token provided. Goal-based optimization will use fallback.")
        else:
            self.client = OpenAI(
                base_url="https://router.huggingface.co/v1",
                api_key=self.api_token,
            )

    def validate_token(self) -> bool:
        """Validate the Hugging Face API token"""
        if self.token_validated:
            return True
            
        if not self.api_token or not self.client:
            return False
            
        try:
            response = self.client.chat.completions.create(
                model=self.model_endpoints[0],
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10,
                timeout=10
            )
            
            if response and response.choices:
                logger.info("✅ Qwen API token is valid")
                self.token_validated = True
                return True
            else:
                logger.error("❌ Invalid Qwen API response")
                return False
                
        except Exception as e:
            logger.error(f"Qwen token validation failed: {e}")
            return False

    def get_available_models(self) -> List[str]:
        """Get available Qwen models"""
        if not self.validate_token():
            return []
        return self.model_endpoints

    def generate_goal_optimization(self, original_prompt: str, goals: Dict, metrics: Dict) -> Dict:
        """Use Qwen to generate goal-based optimization"""
        
        if not self.validate_token():
            logger.warning("Qwen not available, using fallback optimization")
            return self.get_fallback_goal_optimization(original_prompt, goals, metrics)
        
        # Try each available model
        for model in self.model_endpoints:
            try:
                logger.info(f"Trying Qwen model: {model}")
                
                optimization_prompt = self.build_qwen_optimization_prompt(original_prompt, goals, metrics)
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are an expert prompt engineer. Analyze prompts and provide goal-based improvements. Always respond with valid JSON."
                        },
                        {"role": "user", "content": optimization_prompt}
                    ],
                    max_tokens=1200,
                    temperature=0.3,
                    timeout=30
                )
                
                if response and response.choices and response.choices[0].message:
                    content = response.choices[0].message.content.strip()
                    logger.info(f"✅ Successfully got response from {model}")
                    
                    # Parse JSON response
                    try:
                        result = json.loads(content)
                        return {
                            "optimized_prompt": result.get("optimized_prompt", original_prompt),
                            "improvement_explanation": result.get("improvement_explanation", ""),
                            "goal_alignment_score": result.get("goal_alignment_score", 75),
                            "predicted_metrics": result.get("predicted_metrics", {}),
                            "key_changes": result.get("key_changes", []),
                            "success": True
                        }
                    except json.JSONDecodeError:
                        # If JSON parsing fails, try to extract manually
                        return self.parse_qwen_response_manually(content, original_prompt)
                
            except Exception as e:
                logger.error(f"Error with Qwen model {model}: {e}")
                continue

        # If all models fail, return fallback
        logger.warning("All Qwen models failed, returning fallback optimization")
        return self.get_fallback_goal_optimization(original_prompt, goals, metrics)

    def build_qwen_optimization_prompt(self, original_prompt: str, goals: Dict, metrics: Dict) -> str:
        """Build optimization prompt for Qwen"""
        
        prompt = f"""You are a prompt engineering expert. Optimize the given prompt based on user goals and current metrics.

ORIGINAL PROMPT:
"{original_prompt}"

CURRENT PERFORMANCE METRICS (0-100):
- Clarity: {metrics.get('clarity', 0)}%
- Specificity: {metrics.get('specificity', 0)}%
- Structure: {metrics.get('structure', 0)}%
- Context: {metrics.get('context', 0)}%
- Overall: {metrics.get('overall', 0)}%

USER GOALS:
- Primary Objective: {goals.get('primaryObjective', 'Not specified')}
- Target Audience: {goals.get('targetAudience', 'Not specified')}
- Output Format: {goals.get('outputFormat', 'Not specified')}
- Tone: {goals.get('tone', 'Not specified')}
- Length: {goals.get('length', 'Not specified')}
- Complexity: {goals.get('complexity', 'Not specified')}

TASK:
1. Analyze the prompt's weaknesses based on the metrics
2. Align the prompt with the user's specific goals
3. Create an improved version that addresses both issues
4. Predict how metrics will improve

Respond with ONLY valid JSON in this exact format:
{{
  "optimized_prompt": "The fully improved prompt text here",
  "improvement_explanation": "Clear explanation of what was improved and why",
  "goal_alignment_score": 85,
  "predicted_metrics": {{ 
    "clarity": 90,
    "specificity": 85,
    "structure": 88,
    "context": 82
  }},
  "key_changes": [
    "Added specific target audience requirements",
    "Clarified output format expectations",
    "Enhanced context with relevant background"
  ]
}}"""
        
        return prompt

    def parse_qwen_response_manually(self, content: str, original_prompt: str, metrics: Dict = None) -> Dict:
        """Manually parse Qwen response if JSON fails"""
        
        if metrics is None:
            metrics = {"clarity": 50, "specificity": 50, "structure": 50, "context": 50}
        
        # Try to extract optimized prompt
        optimized_prompt = original_prompt
        if "optimized_prompt" in content.lower():
            # Look for text after "optimized_prompt"
            parts = content.split('"optimized_prompt"')
            if len(parts) > 1:
                # Extract text between quotes
                after_colon = parts[1].split(':', 1)
                if len(after_colon) > 1:
                    quote_parts = after_colon[1].split('"')
                    if len(quote_parts) > 1:
                        optimized_prompt = quote_parts[1].strip()
        
        # Extract key changes
        key_changes = []
        if "key_changes" in content.lower():
            lines = content.split('\n')
            in_changes = False
            for line in lines:
                if "key_changes" in line.lower():
                    in_changes = True
                    continue
                if in_changes and (line.strip().startswith('-') or line.strip().startswith('"')):
                    change = line.strip().lstrip('- "').rstrip('",')
                    if change:
                        key_changes.append(change)
                elif in_changes and ']' in line:
                    break
        
        return {
            "optimized_prompt": optimized_prompt,
            "improvement_explanation": "Qwen-generated optimization with goal alignment",
            "goal_alignment_score": 80,
            "predicted_metrics": {
                "clarity": min(100, metrics.get('clarity', 0) + 15),
                "specificity": min(100, metrics.get('specificity', 0) + 20),
                "structure": min(100, metrics.get('structure', 0) + 18),
                "context": min(100, metrics.get('context', 0) + 22)
            },
            "key_changes": key_changes if key_changes else ["Applied Qwen-based optimization"],
            "success": True
        }

    def get_fallback_goal_optimization(self, original_prompt: str, goals: Dict, metrics: Dict) -> Dict:
        """Fallback optimization when Qwen is not available"""
        
        optimized_prompt = original_prompt
        key_changes = []
        
        # Add goal-specific improvements
        if goals.get('primaryObjective'):
            optimized_prompt = f"**Objective:** {goals['primaryObjective']}\n\n{optimized_prompt}"
            key_changes.append("Added clear objective statement")
        
        if goals.get('targetAudience'):
            optimized_prompt = f"**Target Audience:** {goals['targetAudience']}\n\n{optimized_prompt}"
            key_changes.append("Specified target audience")
        
        if goals.get('outputFormat'):
            optimized_prompt += f"\n\n**Format:** Please provide the response as {goals['outputFormat'].lower()}."
            key_changes.append("Clarified output format")
        
        if goals.get('tone'):
            optimized_prompt += f"\n\n**Tone:** Use a {goals['tone'].lower()} tone throughout."
            key_changes.append("Specified tone requirements")
        
        if goals.get('length'):
            optimized_prompt += f"\n\n**Length:** Aim for {goals['length'].lower()} length."
            key_changes.append("Added length guidelines")
        
        # Add improvements based on low metrics
        if metrics.get('clarity', 0) < 70:
            optimized_prompt += "\n\n**Instructions:** Please be clear and specific in your response."
            key_changes.append("Enhanced clarity requirements")
        
        if metrics.get('context', 0) < 60:
            optimized_prompt += "\n\n**Context:** Consider the background and purpose when crafting your response."
            key_changes.append("Added context requirements")
        
        return {
            "optimized_prompt": optimized_prompt,
            "improvement_explanation": "Applied rule-based improvements focusing on goal alignment and metric enhancement.",
            "goal_alignment_score": min(85, 60 + len(key_changes) * 5),
            "predicted_metrics": {
                "clarity": min(100, metrics.get('clarity', 0) + 15),
                "specificity": min(100, metrics.get('specificity', 0) + 20),
                "structure": min(100, metrics.get('structure', 0) + 25),
                "context": min(100, metrics.get('context', 0) + 18)
            },
            "key_changes": key_changes,
            "success": False  # Indicates fallback was used
        }

    def generate_structure_optimization(self, original_prompt: str, structure_options: Dict, metrics: Dict) -> Dict:
        """Use Qwen to generate structure-based optimization"""
        
        if not self.validate_token():
            logger.warning("Qwen not available, using fallback structure optimization")
            return self.get_fallback_structure_optimization(original_prompt, structure_options, metrics)
        
        # Try each available model
        for model in self.model_endpoints:
            try:
                logger.info(f"Trying Qwen model: {model}")
                
                structure_prompt = self.build_qwen_structure_prompt(original_prompt, structure_options, metrics)
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are an expert prompt engineer specializing in prompt structure and organization. Analyze prompts and provide structural improvements. Always respond with valid JSON in the exact format requested."
                        },
                        {"role": "user", "content": structure_prompt}
                    ],
                    max_tokens=1500,
                    temperature=0.1,
                    timeout=45
                )
                
                if response and response.choices and response.choices[0].message:
                    content = response.choices[0].message.content.strip()
                    logger.info(f"✅ Successfully got response from {model}")
                    
                    # Try to extract JSON from response
                    json_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if json_match:
                        json_content = json_match.group()
                        
                        try:
                            result = json.loads(json_content)
                            return {
                                "structured_prompt": result.get("structured_prompt", original_prompt),
                                "structure_explanation": result.get("structure_explanation", "Applied structural improvements"),
                                "structure_score": result.get("structure_score", 75),
                                "structural_improvements": result.get("structural_improvements", []),
                                "organization_type": result.get("organization_type", "improved"),
                                "success": True
                            }
                        except json.JSONDecodeError:
                            logger.error("JSON parsing failed, using manual parsing")
                            return self.parse_structure_response_manually(content, original_prompt, structure_options, metrics)
                    else:
                        logger.warning("No JSON found in response")
                        return self.parse_structure_response_manually(content, original_prompt, structure_options, metrics)
                
            except Exception as e:
                logger.error(f"Error with Qwen model {model}: {e}")
                continue

        # If all models fail, return fallback
        logger.warning("All Qwen models failed for structure optimization")
        return self.get_fallback_structure_optimization(original_prompt, structure_options, metrics)

    def build_qwen_structure_prompt(self, original_prompt: str, structure_options: Dict, metrics: Dict) -> str:
        """Build structure optimization prompt for Qwen"""
        
        enabled_options = [key for key, value in structure_options.items() if value and key != 'structuredPrompt']
        structure_descriptions = []
        
        for option in enabled_options:
            if option == "hasIntroduction":
                structure_descriptions.append("hasIntroduction: Add clear objective and purpose statement")
            elif option == "usesBulletPoints":
                structure_descriptions.append("usesBulletPoints: Organize content with bullet points")
            elif option == "usesNumberedList":
                structure_descriptions.append("usesNumberedList: Create numbered steps or sequence")
            elif option == "hasExamples":
                structure_descriptions.append("hasExamples: Include concrete examples and demonstrations")
            elif option == "hasConclusion":
                structure_descriptions.append("hasConclusion: Add success criteria and quality standards")
        
        prompt = f"""You are an expert prompt structure architect. Transform this prompt into a well-organized, clearly structured version.

ORIGINAL PROMPT:
"{original_prompt}"

CURRENT METRICS:
- Structure Score: {metrics.get('structure', 0)}%
- Clarity Score: {metrics.get('clarity', 0)}%
- Overall Score: {metrics.get('overall', 0)}%

REQUIRED STRUCTURAL IMPROVEMENTS:
{chr(10).join(structure_descriptions) if structure_descriptions else 'Apply general structural improvements'}

STRUCTURE OPTIMIZATION GOALS:
1. **ORGANIZATION**: Create clear sections with logical flow
2. **READABILITY**: Use formatting that enhances comprehension
3. **HIERARCHY**: Establish proper information precedence
4. **CLARITY**: Remove ambiguity through better structure
5. **COMPLETENESS**: Ensure all requirements are clearly presented

Respond with valid JSON in this exact format:
{{
  "structured_prompt": "Complete restructured prompt with markdown formatting and selected improvements",
  "structure_explanation": "Specific explanation of structural changes made and their benefits",
  "structure_score": 85,
  "structural_improvements": [
    "Detailed description of each improvement applied",
    "Specific formatting and organization changes made",
    "Benefits of the new structure for clarity and usability"
  ],
  "organization_type": "descriptive name for the organization pattern used"
}}"""
        
        return prompt

    def parse_structure_response_manually(self, content: str, original_prompt: str, structure_options: Dict, metrics: Dict = None) -> Dict:
        """Manually parse structure response if JSON fails"""
        
        if metrics is None:
            metrics = {"structure": 50, "clarity": 50, "overall": 50}
        
        # Try to extract structured prompt from content
        structured_prompt = original_prompt
        lines = content.split('\n')
        potential_prompt = []
        in_prompt_section = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['structured_prompt', 'improved prompt', 'optimized']):
                in_prompt_section = True
                continue
            elif in_prompt_section and line and not line.startswith('{') and not line.startswith('"'):
                if line.startswith('##') or line.startswith('**') or line.startswith('•') or line.startswith('1.'):
                    potential_prompt.append(line)
        
        if potential_prompt:
            structured_prompt = '\n'.join(potential_prompt)
        else:
            structured_prompt = self.create_structured_version(original_prompt, structure_options)
        
        # Extract improvements based on enabled options
        improvements = []
        enabled_options = [key for key, value in structure_options.items() if value and key != 'structuredPrompt']
        
        for option in enabled_options:
            if option == "hasIntroduction":
                improvements.append("Added clear objective and purpose statement")
            elif option == "usesBulletPoints":
                improvements.append("Organized content with bullet points for better readability")
            elif option == "usesNumberedList":
                improvements.append("Structured content as numbered sequence")
            elif option == "hasExamples":
                improvements.append("Included concrete examples and demonstrations")
            elif option == "hasConclusion":
                improvements.append("Added success criteria and quality standards")
        
        # Calculate structure score
        base_score = metrics.get('structure', 50)
        improvement_bonus = len(improvements) * 10
        structure_score = min(90, base_score + improvement_bonus)
        
        return {
            "structured_prompt": structured_prompt,
            "structure_explanation": f"Applied {len(improvements)} structural improvements to enhance organization and readability",
            "structure_score": structure_score,
            "structural_improvements": improvements,
            "organization_type": "enhanced structure",
            "success": True
        }

    def create_structured_version(self, original_prompt: str, structure_options: Dict) -> str:
        """Create a structured version of the prompt based on selected options"""
        
        sections = []
        
        # Add introduction if requested
        if structure_options.get('hasIntroduction'):
            sections.append("## Objective")
            sections.append("**Goal**: [Define your main objective here]")
            sections.append("**Purpose**: [Explain what this will be used for]")
            sections.append("**Scope**: [Specify boundaries and expectations]")
            sections.append("")
        
        # Add main content section
        sections.append("## Task Description")
        sections.append(original_prompt)
        sections.append("")
        
        # Add requirements with bullet points
        if structure_options.get('usesBulletPoints'):
            sections.append("## Requirements")
            sections.append("• Provide clear and detailed responses")
            sections.append("• Maintain professional quality standards")
            sections.append("• Address all aspects of the request")
            sections.append("• Use appropriate formatting and structure")
            sections.append("")
        
        # Add numbered steps
        if structure_options.get('usesNumberedList'):
            sections.append("## Instructions")
            sections.append("1. **Analyze**: Review the request thoroughly")
            sections.append("2. **Plan**: Organize your approach")
            sections.append("3. **Execute**: Provide the requested content")
            sections.append("4. **Review**: Ensure quality and completeness")
            sections.append("")
        
        # Add examples
        if structure_options.get('hasExamples'):
            sections.append("## Examples & Guidelines")
            sections.append("**Good Example**: Clear, specific, well-structured content")
            sections.append("**Quality Standards**: Accurate, relevant, and complete information")
            sections.append("")
        
        # Add conclusion
        if structure_options.get('hasConclusion'):
            sections.append("## Success Criteria")
            sections.append("**Quality Metrics**:")
            sections.append("- ✓ All requirements addressed")
            sections.append("- ✓ Clear and professional presentation")
            sections.append("- ✓ Accurate and relevant content")
            sections.append("- ✓ Appropriate length and detail")
        
        return '\n'.join(sections)

    def generate_context_optimization(self, original_prompt: str, context_options: Dict, metrics: Dict) -> Dict:
        """Use Qwen to generate context-based optimization"""
        
        if not self.validate_token():
            logger.warning("Qwen not available, using fallback context optimization")
            return self.get_fallback_context_optimization(original_prompt, context_options, metrics)
        
        # Try each available model
        for model in self.model_endpoints:
            try:
                logger.info(f"Trying Qwen model: {model}")
                
                context_prompt = self.build_qwen_context_prompt(original_prompt, context_options, metrics)
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {
                            "role": "system", 
                            "content": "You are an expert prompt engineer specializing in context enhancement and background information integration. Analyze prompts and provide context improvements. Always respond with valid JSON in the exact format requested."
                        },
                        {"role": "user", "content": context_prompt}
                    ],
                    max_tokens=1500,
                    temperature=0.2,
                    timeout=45
                )
                
                if response and response.choices and response.choices[0].message:
                    content = response.choices[0].message.content.strip()
                    logger.info(f"✅ Successfully got response from {model}")
                    
                    # Try to extract JSON from response
                    json_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if json_match:
                        json_content = json_match.group()
                        
                        try:
                            result = json.loads(json_content)
                            return {
                                "context_enhanced_prompt": result.get("context_enhanced_prompt", original_prompt),
                                "context_explanation": result.get("context_explanation", "Applied context improvements"),
                                "context_score": result.get("context_score", 75),
                                "context_improvements": result.get("context_improvements", []),
                                "enhancement_type": result.get("enhancement_type", "enhanced"),
                                "success": True
                            }
                        except json.JSONDecodeError:
                            logger.error("JSON parsing failed, using manual parsing")
                            return self.parse_context_response_manually(content, original_prompt, context_options, metrics)
                    else:
                        logger.warning("No JSON found in response")
                        return self.parse_context_response_manually(content, original_prompt, context_options, metrics)
                
            except Exception as e:
                logger.error(f"Error with Qwen model {model}: {e}")
                continue

        # If all models fail, return fallback
        logger.warning("All Qwen models failed for context optimization")
        return self.get_fallback_context_optimization(original_prompt, context_options, metrics)

    def build_qwen_context_prompt(self, original_prompt: str, context_options: Dict, metrics: Dict) -> str:
        """Build context optimization prompt for Qwen"""
        
        domain = context_options.get('domain', '')
        use_case = context_options.get('useCase', '')
        additional_context = context_options.get('additionalContext', '')
        requirements = context_options.get('requirements', [])
        
        prompt = f"""You are an expert prompt context enhancer. Transform this prompt by adding relevant background information, domain context, and situational details that will help AI models understand the request better.

ORIGINAL PROMPT:
"{original_prompt}"

CURRENT METRICS:
- Context Score: {metrics.get('context', 0)}%
- Clarity Score: {metrics.get('clarity', 0)}%
- Overall Score: {metrics.get('overall', 0)}%

CONTEXT INFORMATION PROVIDED:
- Domain/Industry: {domain if domain else 'Not specified'}
- Use Case: {use_case if use_case else 'Not specified'}
- Additional Context: {additional_context if additional_context else 'Not provided'}
- Requirements: {', '.join(requirements) if requirements else 'None specified'}

CONTEXT ENHANCEMENT GOALS:
1. **BACKGROUND**: Add relevant industry/domain context
2. **PURPOSE**: Clarify the intended use and goals
3. **AUDIENCE**: Define who will use or consume the output
4. **CONSTRAINTS**: Include relevant limitations or requirements
5. **EXAMPLES**: Add context-specific examples when helpful

Respond with valid JSON in this exact format:
{{
  "context_enhanced_prompt": "Complete prompt with integrated context and background information",
  "context_explanation": "Detailed explanation of context enhancements made and their benefits",
  "context_score": 85,
  "context_improvements": [
    "Added industry-specific background and terminology",
    "Integrated use case context for better understanding",
    "Included relevant constraints and requirements",
    "Enhanced with domain expertise considerations"
  ],
  "enhancement_type": "domain-aware contextual enhancement"
}}"""
        
        return prompt

    def parse_context_response_manually(self, content: str, original_prompt: str, context_options: Dict, metrics: Dict = None) -> Dict:
        """Manually parse context response if JSON fails"""
        
        if metrics is None:
            metrics = {"context": 50, "clarity": 50, "overall": 50}
        
        # Try to extract context-enhanced prompt from content
        enhanced_prompt = original_prompt
        lines = content.split('\n')
        potential_prompt = []
        in_prompt_section = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['context_enhanced_prompt', 'enhanced prompt', 'improved']):
                in_prompt_section = True
                continue
            elif in_prompt_section and line and not line.startswith('{') and not line.startswith('"'):
                if len(potential_prompt) > 0 or line.strip():
                    potential_prompt.append(line)
                if any(end in line for end in ['}', '"]', 'explanation']) and len(potential_prompt) > 5:
                    break
        
        if potential_prompt:
            enhanced_prompt = '\n'.join(potential_prompt)
        else:
            enhanced_prompt = self.create_context_enhanced_version(original_prompt, context_options)
        
        # Extract improvements based on provided context
        improvements = []
        
        if context_options.get('domain'):
            improvements.append(f"Added {context_options['domain']} industry context and domain expertise")
        if context_options.get('useCase'):
            improvements.append(f"Integrated specific use case: {context_options['useCase']}")
        if context_options.get('additionalContext'):
            improvements.append("Incorporated additional background information")
        if context_options.get('requirements'):
            improvements.append(f"Added {len(context_options['requirements'])} specific requirements")
        
        if not improvements:
            improvements = ["Applied basic context enhancement"]
        
        # Calculate context score
        base_score = metrics.get('context', 50)
        improvement_bonus = len(improvements) * 8
        context_score = min(95, base_score + improvement_bonus + 15)
        
        return {
            "context_enhanced_prompt": enhanced_prompt,
            "context_explanation": f"Applied {len(improvements)} context enhancements to provide better background and situational understanding",
            "context_score": context_score,
            "context_improvements": improvements,
            "enhancement_type": "contextual background enhancement",
            "success": True
        }

    def create_context_enhanced_version(self, original_prompt: str, context_options: Dict) -> str:
        """Create a context-enhanced version of the prompt"""
        
        sections = []
        
        # Add domain context if provided
        if context_options.get('domain'):
            domain = context_options['domain']
            sections.append(f"**Industry Context:** This request is for the {domain} industry.")
        
        # Add use case context
        if context_options.get('useCase'):
            use_case = context_options['useCase']
            sections.append(f"**Use Case:** {use_case}")
        
        # Add additional context
        if context_options.get('additionalContext'):
            sections.append(f"**Background:** {context_options['additionalContext']}")
        
        # Add the original prompt
        sections.append(f"**Request:** {original_prompt}")
        
        # Add requirements
        requirements = context_options.get('requirements', [])
        if requirements:
            sections.append("**Additional Requirements:**")
            for req in requirements:
                sections.append(f"- {req}")
        
        return '\n\n'.join(sections)

    def get_fallback_context_optimization(self, original_prompt: str, context_options: Dict, metrics: Dict) -> Dict:
        """Enhanced fallback context optimization when Qwen is not available"""
        
        try:
            enhanced_prompt = original_prompt.strip()
            improvements = []
            
            # Check what context information is available
            has_domain = bool(context_options.get('domain'))
            has_use_case = bool(context_options.get('useCase'))
            has_additional_context = bool(context_options.get('additionalContext'))
            has_requirements = bool(context_options.get('requirements'))
            
            # Build contextual enhancement
            context_parts = []
            
            if has_domain:
                domain = context_options['domain']
                context_parts.append(f"**Industry Context:** This is for the {domain} sector.")
                improvements.append(f"Added {domain} industry context and domain expertise")
            
            if has_use_case:
                use_case = context_options['useCase']
                context_parts.append(f"**Specific Use Case:** {use_case}")
                improvements.append("Clarified the specific use case and application")
            
            if has_additional_context:
                additional = context_options['additionalContext']
                context_parts.append(f"**Background Information:** {additional}")
                improvements.append("Integrated comprehensive background information")
            
            # Combine context with original prompt
            if context_parts:
                enhanced_prompt = '\n\n'.join(context_parts) + f"\n\n**Task:** {original_prompt}"
            
            # Add requirements
            requirements = context_options.get('requirements', [])
            if requirements:
                req_section = "**Additional Requirements:**\n" + '\n'.join(f"- {req}" for req in requirements)
                enhanced_prompt += f"\n\n{req_section}"
                improvements.append(f"Added {len(requirements)} specific requirements and constraints")
            
            # If no context provided, add basic improvements
            if not improvements:
                enhanced_prompt = f"**Task:** {original_prompt}\n\n**Instructions:** Please provide a comprehensive response that considers the context and requirements."
                improvements = ["Applied basic context structure and clarity improvements"]
            
            # Calculate improved context score
            base_score = metrics.get('context', 50)
            improvement_points = len(improvements) * 10
            context_score = min(95, base_score + improvement_points + 20)
            
            # Determine enhancement type
            if has_domain and has_use_case:
                enhancement_type = "domain-specific contextual enhancement"
            elif has_additional_context:
                enhancement_type = "comprehensive background integration"
            elif has_requirements:
                enhancement_type = "requirement-focused context enhancement"
            else:
                enhancement_type = "basic context structure improvement"
            
            return {
                "context_enhanced_prompt": enhanced_prompt.strip(),
                "context_explanation": f"Applied {len(improvements)} context enhancements to provide better background understanding and domain-specific information. Created {enhancement_type} to improve AI comprehension.",
                "context_score": context_score,
                "context_improvements": improvements,
                "enhancement_type": enhancement_type,
                "success": False  # Indicates fallback was used
            }
            
        except Exception as e:
            logger.error(f"❌ Error in fallback context optimization: {str(e)}")
            
            # Return minimal fallback result
            return {
                "context_enhanced_prompt": f"**Task:** {original_prompt}\n\n**Context:** Please consider relevant background information when responding.",
                "context_explanation": "Basic context enhancement applied due to processing error",
                "context_score": metrics.get('context', 50) + 10,
                "context_improvements": ["Applied basic context formatting"],
                "enhancement_type": "basic",
                "success": False
            }

    def get_fallback_structure_optimization(self, original_prompt: str, structure_options: Dict, metrics: Dict) -> Dict:
        """Fallback structure optimization when Qwen is not available"""
        
        logger.info("=== FALLBACK STRUCTURE OPTIMIZATION START ===")
        logger.debug(f"Original prompt: {original_prompt}")
        logger.debug(f"Structure options: {structure_options}")
        logger.debug(f"Metrics: {metrics}")
        
        try:
            enhanced_prompt = original_prompt.strip()
            improvements = []
            
            # Apply structure improvements based on options
            sections = []
            
            # Add introduction if requested
            if structure_options.get('hasIntroduction'):
                sections.append("## Objective")
                sections.append("**Goal**: [Define your main objective here]")
                sections.append("**Purpose**: [Explain what this will be used for]")
                sections.append("")
                improvements.append("Added clear objective and purpose statement")
            
            # Add main content section
            sections.append("## Task Description")
            sections.append(original_prompt)
            sections.append("")
            
            # Add requirements with bullet points
            if structure_options.get('usesBulletPoints'):
                sections.append("## Requirements")
                sections.append("• Provide clear and detailed responses")
                sections.append("• Maintain professional quality standards")
                sections.append("• Address all aspects of the request")
                sections.append("")
                improvements.append("Organized content with bullet points for better readability")
            
            # Add numbered steps
            if structure_options.get('usesNumberedList'):
                sections.append("## Instructions")
                sections.append("1. **Analyze**: Review the request thoroughly")
                sections.append("2. **Plan**: Organize your approach")
                sections.append("3. **Execute**: Provide the requested content")
                sections.append("4. **Review**: Ensure quality and completeness")
                sections.append("")
                improvements.append("Structured content as numbered sequence")
            
            # Add examples
            if structure_options.get('hasExamples'):
                sections.append("## Examples & Guidelines")
                sections.append("**Good Example**: Clear, specific, well-structured content")
                sections.append("**Quality Standards**: Accurate, relevant, and complete information")
                sections.append("")
                improvements.append("Included concrete examples and demonstrations")
            
            # Add conclusion
            if structure_options.get('hasConclusion'):
                sections.append("## Success Criteria")
                sections.append("**Quality Metrics**:")
                sections.append("- ✓ All requirements addressed")
                sections.append("- ✓ Clear and professional presentation")
                sections.append("- ✓ Accurate and relevant content")
                sections.append("- ✓ Appropriate length and detail")
                improvements.append("Added success criteria and quality standards")
            
            if sections:
                enhanced_prompt = '\n'.join(sections)
            
            # Calculate structure score
            base_score = metrics.get('structure', 50)
            improvement_bonus = len(improvements) * 15
            structure_score = min(95, base_score + improvement_bonus)
            
            result = {
                "structured_prompt": enhanced_prompt.strip(),
                "structure_explanation": f"Applied {len(improvements)} structural improvements to enhance organization and readability using rule-based optimization.",
                "structure_score": structure_score,
                "structural_improvements": improvements if improvements else ["Applied basic structure formatting"],
                "organization_type": "rule-based enhanced structure",
                "success": False  # Indicates fallback was used
            }
            
            logger.info(f"✅ Fallback structure optimization complete: {structure_score}% score, {len(improvements)} improvements")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error in fallback structure optimization: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            # Return minimal fallback result
            return {
                "structured_prompt": f"## Task\n{original_prompt}\n\n## Instructions\n- Provide clear and detailed responses\n- Follow professional standards",
                "structure_explanation": "Basic structure applied due to processing error",
                "structure_score": metrics.get('structure', 50) + 10,
                "structural_improvements": ["Applied basic structure formatting"],
                "organization_type": "basic",
                "success": False
            }

# ----------------------------
# Enhanced Prompt Metrics Analyzer Class
# ----------------------------
class PromptMetricsAnalyzer:
    def __init__(self):
        load_dotenv()
        self.api_token = os.getenv("HF_TOKEN", "")
        
        # Initialize models for different metrics
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        
        # Initialize Qwen client for goal-based optimization
        self.qwen_client = QwenClient()
        
        # Thresholds for "cannot improve" status
        self.excellence_thresholds = {
            "clarity": 85,
            "specificity": 80,
            "structure": 88,
            "context": 82,
            "overall": 84
        }
        
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
        weights = {
            "clarity": 0.3,
            "specificity": 0.25,
            "structure": 0.25,
            "context": 0.2
        }
        
        overall = (
            clarity * weights["clarity"] +
            specificity * weights["specificity"] +
            structure * weights["structure"] +
            context * weights["context"]
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

class TokenValidationResponse(BaseModel):
    valid: bool
    message: str
    available_models: List[str]

class AnalysisResponse(BaseModel):
    prompt: str
    metrics: Dict[str, float]
    issues: List[str]
    suggestions: List[str]
    is_excellent: bool
    improvement_potential: str
    rating: int
    rating_explanation: str

class PromptRequest(BaseModel):
    text: str

class OptimizationSuggestion(BaseModel):
    suggestion: str
    before: str
    after: str
    impact: str

class OptimizationResponse(BaseModel):
    prompt: str
    suggestions: List[OptimizationSuggestion]
    source: str

class GoalBasedRequest(BaseModel):
    text: str
    goals: Dict[str, Any]

class GoalOptimizationResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    improvement_explanation: str
    goal_alignment_score: int
    predicted_metrics: Dict[str, float]
    key_changes: List[str]
    current_metrics: Dict[str, float]
    used_ai: bool

class StructureBasedRequest(BaseModel):
    text: str
    structure_options: Dict[str, bool]

class StructureOptimizationResponse(BaseModel):
    original_prompt: str
    structured_prompt: str
    structure_explanation: str
    structure_score: int
    structural_improvements: List[str]
    organization_type: str
    current_metrics: Dict[str, float]
    used_ai: bool

class ContextBasedRequest(BaseModel):
    text: str
    context_options: Dict[str, Any]

class ContextOptimizationResponse(BaseModel):
    original_prompt: str
    context_enhanced_prompt: str
    context_explanation: str
    context_score: int
    context_improvements: List[str]
    enhancement_type: str
    current_metrics: Dict[str, float]
    used_ai: bool

# ----------------------------
# Initialize Analyzer
# ----------------------------
analyzer = PromptMetricsAnalyzer()

# ----------------------------
# FastAPI Routes
# ----------------------------
@app.get("/")
def read_root():
    return {"message": "Prompt Optimizer API with Qwen and Metrics Analysis is running."}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "prompt-optimizer-qwen-metrics"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_prompt_metrics(request: PromptRequest):
    """Analyze prompt metrics without generating suggestions"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Analyzing prompt: {request.text[:100]}...")
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        
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
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Analysis service temporarily unavailable")

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_prompt(request: PromptRequest):
    """Optimize prompt using Qwen (replicates old version logic)"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt: {request.text[:100]}...")
        
        # Use the simple Qwen optimization (like old version)
        suggestions_raw = analyzer.qwen_client.optimize_prompt_simple(request.text)
        
        # Convert to OptimizationSuggestion format
        suggestions = []
        for s in suggestions_raw:
            suggestions.append(OptimizationSuggestion(
                suggestion=s["suggestion"],
                before=s["before"],
                after=s["after"],
                impact=s["impact"]
            ))
        
        # Determine source based on whether we got AI suggestions or fallback
        source = "ai" if analyzer.qwen_client.token_validated and analyzer.qwen_client.get_available_models() else "fallback"
        
        return OptimizationResponse(
            prompt=request.text, 
            suggestions=suggestions,
            source=source
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Optimization service temporarily unavailable")

@app.post("/optimize-with-goals", response_model=GoalOptimizationResponse)
async def optimize_prompt_with_goals(request: GoalBasedRequest):
    """Optimize prompt using Qwen based on user goals and current metrics"""
    try:
        if not request.text or request.text.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt with goals using Qwen: {request.text[:100]}...")
        
        # First, analyze current metrics
        analysis = analyzer.analyze_prompt_comprehensive(request.text)
        current_metrics = analysis["metrics"]
        
        # Then, generate goal-based optimization using Qwen
        optimization_result = analyzer.generate_goal_optimization(
            request.text, 
            request.goals, 
            current_metrics
        )
        
        return GoalOptimizationResponse(
            original_prompt=request.text,
            optimized_prompt=optimization_result["optimized_prompt"],
            improvement_explanation=optimization_result["improvement_explanation"],
            goal_alignment_score=optimization_result["goal_alignment_score"],
            predicted_metrics=optimization_result["predicted_metrics"],
            key_changes=optimization_result["key_changes"],
            current_metrics=current_metrics,
            used_ai=optimization_result["success"]  # True if Qwen was used, False if fallback
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Goal-based optimization failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Goal-based optimization service temporarily unavailable")

@app.post("/optimize-with-structure", response_model=StructureOptimizationResponse)
async def optimize_prompt_with_structure(request: StructureBasedRequest):
    """Optimize prompt structure using Qwen based on selected options and current metrics"""
    try:
        logger.info("=== STRUCTURE OPTIMIZATION ENDPOINT CALLED ===")
        logger.info(f"Request text length: {len(request.text) if request.text else 0}")
        logger.info(f"Structure options: {request.structure_options}")
        
        # Validate request
        if not request:
            logger.error("No request object provided")
            raise HTTPException(status_code=400, detail="Invalid request")
            
        if not hasattr(request, 'text') or not request.text:
            logger.error("No text field in request or text is empty")
            raise HTTPException(status_code=400, detail="Prompt text is required")
            
        if not hasattr(request, 'structure_options'):
            logger.error("No structure_options field in request")
            raise HTTPException(status_code=400, detail="Structure options are required")
        
        if not request.text.strip():
            logger.error("Empty prompt text provided")
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt structure: {request.text[:100]}...")
        
        # First, analyze current metrics
        logger.info("Analyzing current metrics...")
        try:
            analysis = analyzer.analyze_prompt_comprehensive(request.text)
            current_metrics = analysis["metrics"]
            logger.info(f"Current metrics: {current_metrics}")
        except Exception as e:
            logger.error(f"Error analyzing metrics: {str(e)}")
            # Use default metrics if analysis fails
            current_metrics = {
                "clarity": 50,
                "specificity": 50,
                "structure": 50,
                "context": 50,
                "overall": 50
            }
            logger.warning("Using default metrics due to analysis error")
        
        # Then, generate structure-based optimization
        logger.info("Starting structure optimization...")
        try:
            structure_result = analyzer.generate_structure_optimization(
                request.text, 
                request.structure_options, 
                current_metrics
            )
            
            logger.info("=== STRUCTURE OPTIMIZATION RESULT ===")
            logger.info(f"Success: {structure_result.get('success', False)}")
            logger.info(f"Structure score: {structure_result.get('structure_score', 0)}")
            logger.info(f"Improvements count: {len(structure_result.get('structural_improvements', []))}")
            
        except Exception as e:
            logger.error(f"Error in structure optimization: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            # Create a basic fallback result
            structure_result = {
                "structured_prompt": f"## Task\n{request.text}\n\n## Instructions\n- Provide clear and detailed responses\n- Follow professional standards",
                "structure_explanation": "Basic structure applied due to processing error",
                "structure_score": 60,
                "structural_improvements": ["Applied basic formatting"],
                "organization_type": "basic",
                "success": False
            }
            logger.warning("Using emergency fallback structure result")
        
        # Validate structure_result
        required_fields = ['structured_prompt', 'structure_explanation', 'structure_score', 'structural_improvements', 'organization_type']
        for field in required_fields:
            if field not in structure_result:
                logger.error(f"Missing required field in structure_result: {field}")
                structure_result[field] = "Unknown" if field in ['structure_explanation', 'organization_type'] else ([] if field == 'structural_improvements' else 50)
        
        # Create response
        try:
            response = StructureOptimizationResponse(
                original_prompt=request.text,
                structured_prompt=structure_result["structured_prompt"],
                structure_explanation=structure_result["structure_explanation"],
                structure_score=int(structure_result["structure_score"]) if isinstance(structure_result["structure_score"], (int, float)) else 50,
                structural_improvements=structure_result["structural_improvements"] if isinstance(structure_result["structural_improvements"], list) else [],
                organization_type=structure_result["organization_type"],
                current_metrics=current_metrics,
                used_ai=structure_result.get("success", False)
            )
            
            logger.info("✅ Structure optimization response created successfully")
            return response
            
        except Exception as e:
            logger.error(f"Error creating response object: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error creating response: {str(e)}")
        
    except HTTPException:
        logger.error("HTTPException in structure optimization")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in structure optimization endpoint: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/optimize-with-context", response_model=ContextOptimizationResponse)
async def optimize_prompt_with_context(request: ContextBasedRequest):
    """Optimize prompt context using Qwen based on selected options and current metrics"""
    try:
        logger.info("=== CONTEXT OPTIMIZATION ENDPOINT CALLED ===")
        logger.info(f"Request text length: {len(request.text) if request.text else 0}")
        logger.info(f"Context options: {request.context_options}")
        
        # Validate request
        if not request:
            logger.error("No request object provided")
            raise HTTPException(status_code=400, detail="Invalid request")
            
        if not hasattr(request, 'text') or not request.text:
            logger.error("No text field in request or text is empty")
            raise HTTPException(status_code=400, detail="Prompt text is required")
            
        if not hasattr(request, 'context_options'):
            logger.error("No context_options field in request")
            raise HTTPException(status_code=400, detail="Context options are required")
        
        if not request.text.strip():
            logger.error("Empty prompt text provided")
            raise HTTPException(status_code=400, detail="Prompt text cannot be empty")
        
        logger.info(f"Optimizing prompt context: {request.text[:100]}...")
        
        # First, analyze current metrics
        logger.info("Analyzing current metrics...")
        try:
            analysis = analyzer.analyze_prompt_comprehensive(request.text)
            current_metrics = analysis["metrics"]
            logger.info(f"Current metrics: {current_metrics}")
        except Exception as e:
            logger.error(f"Error analyzing metrics: {str(e)}")
            # Use default metrics if analysis fails
            current_metrics = {
                "clarity": 50,
                "specificity": 50,
                "structure": 50,
                "context": 50,
                "overall": 50
            }
            logger.warning("Using default metrics due to analysis error")
        
        # Then, generate context-based optimization
        logger.info("Starting context optimization...")
        try:
            context_result = analyzer.generate_context_optimization(
                request.text, 
                request.context_options, 
                current_metrics
            )
            
            logger.info("=== CONTEXT OPTIMIZATION RESULT ===")
            logger.info(f"Success: {context_result.get('success', False)}")
            logger.info(f"Context score: {context_result.get('context_score', 0)}")
            logger.info(f"Improvements count: {len(context_result.get('context_improvements', []))}")
            
        except Exception as e:
            logger.error(f"Error in context optimization: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            # Create a basic fallback result
            context_result = {
                "context_enhanced_prompt": f"**Task:** {request.text}\n\n**Context:** Please consider relevant background information when responding.",
                "context_explanation": "Basic context enhancement applied due to processing error",
                "context_score": 60,
                "context_improvements": ["Applied basic context formatting"],
                "enhancement_type": "basic",
                "success": False
            }
            logger.warning("Using emergency fallback context result")
        
        # Validate context_result
        required_fields = ['context_enhanced_prompt', 'context_explanation', 'context_score', 'context_improvements', 'enhancement_type']
        for field in required_fields:
            if field not in context_result:
                logger.error(f"Missing required field in context_result: {field}")
                context_result[field] = "Unknown" if field in ['context_explanation', 'enhancement_type'] else ([] if field == 'context_improvements' else 50)
        
        # Create response
        try:
            response = ContextOptimizationResponse(
                original_prompt=request.text,
                context_enhanced_prompt=context_result["context_enhanced_prompt"],
                context_explanation=context_result["context_explanation"],
                context_score=int(context_result["context_score"]) if isinstance(context_result["context_score"], (int, float)) else 50,
                context_improvements=context_result["context_improvements"] if isinstance(context_result["context_improvements"], list) else [],
                enhancement_type=context_result["enhancement_type"],
                current_metrics=current_metrics,
                used_ai=context_result.get("success", False)
            )
            
            logger.info("✅ Context optimization response created successfully")
            return response
            
        except Exception as e:
            logger.error(f"Error creating response object: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Error creating response: {str(e)}")
        
    except HTTPException:
        logger.error("HTTPException in context optimization")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in context optimization endpoint: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/validate-token", response_model=TokenValidationResponse)
def validate_token():
    """Validate service availability"""
    qwen_valid = analyzer.qwen_client.validate_token()
    available_models = analyzer.qwen_client.get_available_models() if qwen_valid else []
    
    if qwen_valid:
        message = "Qwen models available for goal-based optimization"
    else:
        message = "Metrics analysis available, goal optimization will use fallback"
    
    return TokenValidationResponse(
        valid=True,  # Service is always available (metrics + fallback)
        message=message,
        available_models=available_models + ["metrics-analyzer", "prompt-evaluator"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)