import os
import json
import numpy as np
from dotenv import load_dotenv
from openai import OpenAI
from typing import Dict, List, Tuple, Any

# Load environment variables from .env file
load_dotenv()

class PromptOptimizationSystem:
    def __init__(self):
        # Initialize Hugging Face client
        api_key = os.getenv("HF_TOKEN")
        if not api_key:
            raise ValueError("Hugging Face API key not found. Please set HF_TOKEN in your .env file.")
        
        self.client = OpenAI(
            base_url="https://router.huggingface.co/v1",
            api_key=api_key,
        )
        
        # Core analysis metrics
        self.ANALYSIS_METRICS = {
            'clarity': {
                'weight': 0.25,
                'factors': ['sentence_structure', 'ambiguity_score', 'instruction_clarity']
            },
            'specificity': {
                'weight': 0.25, 
                'factors': ['constraint_definition', 'context_richness', 'output_format_clarity']
            },
            'structure': {
                'weight': 0.20,
                'factors': ['logical_flow', 'component_organization', 'instruction_hierarchy']
            },
            'completeness': {
                'weight': 0.15,
                'factors': ['missing_context', 'undefined_terms', 'incomplete_instructions']
            },
            'optimization_potential': {
                'weight': 0.15,
                'factors': ['redundancy', 'token_efficiency', 'model_compatibility']
            }
        }
        
        # Load or create benchmark data
        self.benchmark_data = self.load_benchmark_data()
        
    def load_benchmark_data(self) -> Dict:
        """Load benchmark data for comparison"""
        try:
            with open('benchmark_prompts.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Default benchmark data
            return {
                "high_quality_prompts": [
                    "Create a detailed summary of the key findings from the attached research paper, focusing on methodology, results, and implications. Format the output with clear headings for each section.",
                    "Generate Python code to sort a list of dictionaries by a specific key. Include error handling for invalid keys and comments explaining each step.",
                    "Analyze the sentiment of the following product review and provide a rating from 1-5. Explain the reasoning behind your rating based on specific phrases in the text."
                ],
                "low_quality_prompts": [
                    "Write something about this",
                    "I need help with code",
                    "Tell me about the thing"
                ]
            }
    
    def analyze_prompt(self, prompt_text: str) -> Dict:
        """Analyze a prompt using the defined metrics"""
        # Get analysis from the model
        analysis_response = self._get_analysis_from_model(prompt_text)
        
        # Process the analysis
        scores = self._process_analysis(analysis_response, prompt_text)
        
        # Calculate weighted overall score
        overall_score = self._calculate_weighted_score(scores)
        improvement_needed = 100 - overall_score
        
        return {
            'overall_score': overall_score,
            'improvement_needed': improvement_needed,
            'component_scores': scores,
            'specific_issues': self._identify_issues(scores),
            'optimization_suggestions': self._generate_suggestions(scores)
        }
    
    def _get_analysis_from_model(self, prompt_text: str) -> str:
        """Get analysis from the Hugging Face model"""
        analysis_prompt = f"""
        Analyze the following prompt based on these criteria:
        1. Clarity (sentence structure, ambiguity, instruction clarity)
        2. Specificity (constraint definition, context richness, output format clarity)
        3. Structure (logical flow, organization, instruction hierarchy)
        4. Completeness (missing context, undefined terms, incomplete instructions)
        5. Optimization Potential (redundancy, token efficiency, model compatibility)
        
        For each category, provide a score from 0-100 and brief justification.
        
        Prompt to analyze: "{prompt_text}"
        
        Respond in JSON format with this structure:
        {{
            "clarity": {{"score": number, "justification": "string"}},
            "specificity": {{"score": number, "justification": "string"}},
            "structure": {{"score": number, "justification": "string"}},
            "completeness": {{"score": number, "justification": "string"}},
            "optimization_potential": {{"score": number, "justification": "string"}}
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="Qwen/Qwen3-Coder-30B-A3B-Instruct:fireworks-ai",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing and optimizing prompts for AI systems. Provide detailed, structured analysis in JSON format."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling API: {e}")
            # Fallback to a simple heuristic analysis
            return self._fallback_analysis(prompt_text)
    
    def _process_analysis(self, analysis_response: str, prompt_text: str) -> Dict:
        """Process the analysis response into scores"""
        try:
            # Try to parse JSON response
            analysis_data = json.loads(analysis_response)
            scores = {}
            
            for category in self.ANALYSIS_METRICS.keys():
                if category in analysis_data:
                    scores[category] = analysis_data[category]['score']
                else:
                    # Default score if category missing
                    scores[category] = 50
            
            return scores
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return self._fallback_analysis_scores(prompt_text)
    
    def _fallback_analysis(self, prompt_text: str) -> str:
        """Fallback analysis when API call fails"""
        # Simple heuristic-based analysis
        prompt_length = len(prompt_text.split())
        
        # Simple scoring based on length and structure
        clarity = min(100, prompt_length * 3)
        specificity = min(100, prompt_length * 2)
        structure = 50  # Mid-range default
        completeness = min(100, prompt_length * 2)
        optimization_potential = max(0, 100 - prompt_length)
        
        return json.dumps({
            "clarity": {"score": clarity, "justification": "Based on word count and basic structure"},
            "specificity": {"score": specificity, "justification": "Based on word count and detail level"},
            "structure": {"score": structure, "justification": "Default mid-range score"},
            "completeness": {"score": completeness, "justification": "Based on word count and detail level"},
            "optimization_potential": {"score": optimization_potential, "justification": "Inverse relationship with length"}
        })
    
    def _fallback_analysis_scores(self, prompt_text: str) -> Dict:
        """Fallback scores when analysis parsing fails"""
        prompt_length = len(prompt_text.split())
        
        return {
            'clarity': min(100, prompt_length * 3),
            'specificity': min(100, prompt_length * 2),
            'structure': 50,
            'completeness': min(100, prompt_length * 2),
            'optimization_potential': max(0, 100 - prompt_length)
        }
    
    def _calculate_weighted_score(self, scores: Dict) -> float:
        """Calculate weighted overall score"""
        total_score = 0
        total_weight = 0
        
        for category, weight in [(k, v['weight']) for k, v in self.ANALYSIS_METRICS.items()]:
            if category in scores:
                total_score += scores[category] * weight
                total_weight += weight
        
        return total_score / total_weight if total_weight > 0 else 0
    
    def _identify_issues(self, scores: Dict) -> List[str]:
        """Identify specific issues based on low scores"""
        issues = []
        
        if scores.get('clarity', 0) < 70:
            issues.append("Prompt lacks clarity - sentences may be ambiguous or poorly structured")
        if scores.get('specificity', 0) < 70:
            issues.append("Prompt needs more specific details and constraints")
        if scores.get('structure', 0) < 70:
            issues.append("Prompt structure could be improved for better logical flow")
        if scores.get('completeness', 0) < 70:
            issues.append("Prompt may be missing important context or instructions")
        if scores.get('optimization_potential', 0) > 70:
            issues.append("Prompt has high optimization potential - could be more efficient")
        
        return issues
    
    def _generate_suggestions(self, scores: Dict) -> List[str]:
        """Generate optimization suggestions based on scores"""
        suggestions = []
        
        if scores.get('clarity', 0) < 70:
            suggestions.append("Rewrite sentences for better clarity and reduce ambiguity")
        if scores.get('specificity', 0) < 70:
            suggestions.append("Add specific constraints, examples, or output format requirements")
        if scores.get('structure', 0) < 70:
            suggestions.append("Reorganize the prompt with clearer instruction hierarchy")
        if scores.get('completeness', 0) < 70:
            suggestions.append("Add missing context or define any ambiguous terms")
        if scores.get('optimization_potential', 0) > 70:
            suggestions.append("Remove redundant phrases and optimize for token efficiency")
        
        return suggestions
    
    def optimize_prompt(self, original_prompt: str, target_improvement: float = 75) -> Dict:
        """Optimize a prompt to reach the target improvement level"""
        # Analyze the original prompt
        original_analysis = self.analyze_prompt(original_prompt)
        
        # Generate optimization suggestions
        optimization_prompt = f"""
        Original prompt: "{original_prompt}"
        
        Analysis of the original prompt:
        - Overall score: {original_analysis['overall_score']}/100
        - Improvement needed: {original_analysis['improvement_needed']}%
        - Issues identified: {', '.join(original_analysis['specific_issues'])}
        - Suggestions: {', '.join(original_analysis['optimization_suggestions'])}
        
        Optimize this prompt to address the issues and achieve a score of at least {target_improvement}/100.
        Maintain the original intent while improving clarity, specificity, structure, and completeness.
        
        Provide only the optimized prompt without any additional commentary.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="Qwen/Qwen3-Coder-30B-A3B-Instruct:fireworks-ai",
                messages=[
                    {"role": "system", "content": "You are an expert at optimizing prompts for AI systems. Provide only the optimized prompt without any additional text."},
                    {"role": "user", "content": optimization_prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            optimized_prompt = response.choices[0].message.content.strip()
            
            # Analyze the optimized prompt
            optimized_analysis = self.analyze_prompt(optimized_prompt)
            
            return {
                'original_prompt': original_prompt,
                'optimized_prompt': optimized_prompt,
                'original_score': original_analysis['overall_score'],
                'optimized_score': optimized_analysis['overall_score'],
                'improvement': optimized_analysis['overall_score'] - original_analysis['overall_score'],
                'original_analysis': original_analysis,
                'optimized_analysis': optimized_analysis
            }
            
        except Exception as e:
            print(f"Error during optimization: {e}")
            return {
                'original_prompt': original_prompt,
                'optimized_prompt': original_prompt,  # Fallback to original
                'original_score': original_analysis['overall_score'],
                'optimized_score': original_analysis['overall_score'],
                'improvement': 0,
                'error': str(e)
            }
    
    def validate_optimization(self, original_prompt: str, optimized_prompt: str, expected_improvement: float = 75) -> Dict:
        """Validate that the optimization achieved the expected improvement"""
        original_analysis = self.analyze_prompt(original_prompt)
        optimized_analysis = self.analyze_prompt(optimized_prompt)
        
        actual_improvement = optimized_analysis['overall_score'] - original_analysis['overall_score']
        target_achieved = actual_improvement >= expected_improvement * 0.9  # 90% of target
        
        return {
            'target_achieved': target_achieved,
            'expected_improvement': expected_improvement,
            'actual_improvement': actual_improvement,
            'original_score': original_analysis['overall_score'],
            'optimized_score': optimized_analysis['overall_score'],
            'validation_passed': target_achieved
        }

# Example usage
if __name__ == "__main__":
    # Initialize the system
    optimizer = PromptOptimizationSystem()
    
    # Example prompt that needs optimization
    test_prompt = "Write a function to calculate something"
    
    print("Original prompt:", test_prompt)
    
    # Analyze the original prompt
    analysis = optimizer.analyze_prompt(test_prompt)
    print(f"Original score: {analysis['overall_score']}/100")
    print(f"Improvement needed: {analysis['improvement_needed']}%")
    print("Issues:", analysis['specific_issues'])
    
    # Optimize the prompt
    result = optimizer.optimize_prompt(test_prompt)
    
    print("\nOptimized prompt:", result['optimized_prompt'])
    print(f"Optimized score: {result['optimized_score']}/100")
    print(f"Improvement: {result['improvement']} points")
    
    # Validate the optimization
    validation = optimizer.validate_optimization(test_prompt, result['optimized_prompt'])
    print(f"Validation passed: {validation['validation_passed']}")