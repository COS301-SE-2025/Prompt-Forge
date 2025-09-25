import asyncio
import json
from typing import Dict, List, Any
from llm_rubric_system import LLMPoweredRubric

class ScoreRangeValidator:
    """
    Validates that the LLM scoring system adheres to the defined score ranges
    """
    
    def __init__(self):
        self.test_prompts = self._create_test_prompts()
        self.expected_ranges = self._define_expected_ranges()
    
    def _create_test_prompts(self) -> Dict[str, Dict[str, str]]:
        """Create test prompts for each score range category"""
        
        return {
            "poor_clarity": {
                "text": "Do something good with the stuff and make sure it's nice and things work out well for people and everything.",
                "expected_range": "0-20",
                "rationale": "Multiple vague terms, no clear action, heavy pronoun use"
            },
            
            "below_average_clarity": {
                "text": "Write a report about the project status and make sure it covers the important things that management needs to know.",
                "expected_range": "21-40", 
                "rationale": "Some vague terms, implied action, moderate clarity issues"
            },
            
            "average_clarity": {
                "text": "Create a status report for the Q3 marketing project. Include budget details and timeline information for management review.",
                "expected_range": "41-60",
                "rationale": "Clear action verb, specific project mentioned, some details but could be more precise"
            },
            
            "good_clarity": {
                "text": "Write a comprehensive Q3 marketing project status report for senior management. Include current budget utilization, milestone completion rates, and projected delivery timeline with specific dates.",
                "expected_range": "61-80",
                "rationale": "Clear action verbs, specific audience, detailed requirements, minimal ambiguity"
            },
            
            "excellent_clarity": {
                "text": "Generate a detailed Q3 marketing campaign status report for the executive leadership team. Document: (1) budget utilization vs. allocated $50K, (2) completion percentage for each of the 5 defined milestones, (3) updated delivery timeline with specific dates, and (4) risk assessment with mitigation strategies.",
                "expected_range": "81-100",
                "rationale": "Crystal clear instructions, specific deliverables, numbered structure, precise language"
            },
            
            # SPECIFICITY TEST PROMPTS
            "poor_specificity": {
                "text": "Write something about artificial intelligence for people to read.",
                "expected_range": "0-20",
                "rationale": "No specific requirements, no format, no audience definition, completely generic"
            },
            
            "below_average_specificity": {
                "text": "Create an article about AI trends that explains the key developments in a professional tone.",
                "expected_range": "21-40",
                "rationale": "Basic format (article), some topic focus, tone specified, but lacks detail"
            },
            
            "average_specificity": {
                "text": "Write a 1000-word article about AI trends in healthcare for medical professionals, covering machine learning applications and regulatory considerations.",
                "expected_range": "41-60",
                "rationale": "Word count, specific audience, topic focus, some constraints mentioned"
            },
            
            "good_specificity": {
                "text": "Create a 1500-word professional article for healthcare executives about AI implementation trends. Include: 5 specific machine learning use cases, regulatory compliance requirements, ROI analysis framework, and implementation timeline considerations. Use formal tone with data citations.",
                "expected_range": "61-80",
                "rationale": "Multiple specifications, detailed requirements, format guidelines, audience defined"
            },
            
            "excellent_specificity": {
                "text": "Generate a comprehensive 2000-word executive briefing document for C-suite healthcare leaders on AI adoption strategies. Must include: (1) 7 quantified ROI case studies with specific dollar amounts, (2) regulatory compliance checklist for FDA/HIPAA, (3) 6-month implementation roadmap with milestones, (4) risk assessment matrix, (5) vendor evaluation criteria with scoring rubric. Format: executive summary + 4 main sections + appendix. Tone: authoritative but accessible. Include minimum 15 credible sources with citations.",
                "expected_range": "81-100",
                "rationale": "Extremely detailed specifications, multiple quantified requirements, comprehensive structure"
            },
            
            # STRUCTURE TEST PROMPTS
            "poor_structure": {
                "text": "I need you to write about customer service and how to improve it and make customers happy and also talk about training staff and measuring satisfaction and implementing feedback systems and using technology solutions.",
                "expected_range": "0-20",
                "rationale": "No structure, run-on sentence, stream of consciousness, no formatting"
            },
            
            "below_average_structure": {
                "text": "Write about customer service improvements. Cover staff training and customer satisfaction measurement. Also include technology solutions and feedback systems.",
                "expected_range": "21-40",
                "rationale": "Basic organization, separate ideas, minimal structure, some logical flow"
            },
            
            "average_structure": {
                "text": "Create a customer service improvement guide covering:\n1. Staff training programs\n2. Customer satisfaction measurement\n3. Feedback system implementation\n4. Technology solutions\n\nProvide practical recommendations for each area.",
                "expected_range": "41-60",
                "rationale": "Clear sections, numbered list, logical flow, basic formatting"
            },
            
            "good_structure": {
                "text": "# Customer Service Excellence Strategy\n\n## Overview\nDevelop a comprehensive customer service improvement plan.\n\n## Key Areas\n### 1. Staff Training & Development\n- Training curriculum design\n- Performance metrics\n\n### 2. Customer Satisfaction Measurement\n- Survey methodology\n- KPI tracking\n\n### 3. Implementation Roadmap\nProvide detailed timeline and resource requirements.",
                "expected_range": "61-80",
                "rationale": "Professional structure, headers/subheaders, clear hierarchy, good organization"
            },
            
            "excellent_structure": {
                "text": "# Customer Service Transformation Initiative\n\n## Executive Summary\n[Brief overview of objectives and expected outcomes]\n\n## Phase 1: Assessment & Planning (Months 1-2)\n### 1.1 Current State Analysis\n- Customer satisfaction baseline measurement\n- Staff competency assessment\n- Technology audit\n\n### 1.2 Goal Setting\n- Define specific, measurable objectives\n- Establish success metrics\n\n## Phase 2: Implementation (Months 3-8)\n### 2.1 Staff Training Program\n- Curriculum development with 40-hour certification\n- Role-specific training modules\n- Performance evaluation framework\n\n### 2.2 Technology Integration\n- CRM system optimization\n- Customer feedback automation\n- Real-time dashboard implementation\n\n## Phase 3: Optimization (Months 9-12)\n### 3.1 Performance Monitoring\n### 3.2 Continuous Improvement\n\n## Deliverables & Timeline\n## Success Metrics & ROI Analysis",
                "expected_range": "81-100",
                "rationale": "Perfect structure with multiple levels, clear progression, professional presentation"
            },
            
            # CONTEXT TEST PROMPTS
            "poor_context": {
                "text": "Write a marketing plan.",
                "expected_range": "0-20",
                "rationale": "No background, purpose, domain context, or situational awareness"
            },
            
            "below_average_context": {
                "text": "Create a marketing plan for our new product launch to help increase sales.",
                "expected_range": "21-40",
                "rationale": "Basic purpose mentioned, some context but lacks depth and background"
            },
            
            "average_context": {
                "text": "Develop a marketing plan for our SaaS product launch targeting small businesses. The goal is to achieve 1000 new customers in Q1 with a limited budget of $50K.",
                "expected_range": "41-60",
                "rationale": "Clear purpose, target audience, goals, and constraints mentioned"
            },
            
            "good_context": {
                "text": "Create a comprehensive marketing strategy for launching our project management SaaS tool in the competitive small business market. Background: We're a startup with 18 months runway, competing against established players like Asana and Monday.com. Goal: Acquire 1000 paying customers ($49/month plans) within Q1 2024, with marketing budget limited to $50K. Target audience: small business owners (10-50 employees) in service industries.",
                "expected_range": "61-80",
                "rationale": "Rich context, competitive landscape, specific background, clear constraints"
            },
            
            "excellent_context": {
                "text": "Develop a go-to-market strategy for our AI-powered project management platform targeting SMBs in the post-COVID remote work era. \n\nBackground: We're a 25-person startup with Series A funding, 18 months runway, launching in a $4.2B market dominated by Asana (40% market share) and Monday.com (25% share). Our unique value proposition: AI-driven task prioritization and resource optimization.\n\nBusiness Context: Q4 2023 launch targeting Q1 2024 revenue goals of $100K MRR. Customer acquisition cost must remain under $150 with 6-month payback period. \n\nTarget Market: Service-based SMBs (10-50 employees) in consulting, marketing agencies, and professional services, currently using basic tools like Trello or spreadsheets.\n\nConstraints: $50K marketing budget, 2-person marketing team, cannot compete on price with freemium models. Must comply with SOC 2 requirements for enterprise prospects.",
                "expected_range": "81-100",
                "rationale": "Comprehensive context with market data, competitive analysis, detailed constraints, and business rationale"
            },
            
            # ACTIONABILITY TEST PROMPTS
            "poor_actionability": {
                "text": "Think about social media and how it might be useful for business purposes in some way.",
                "expected_range": "0-20",
                "rationale": "No clear action verbs, vague instruction, no specific deliverables"
            },
            
            "below_average_actionability": {
                "text": "Look into social media marketing options and provide some recommendations for business use.",
                "expected_range": "21-40",
                "rationale": "Weak action verbs, vague deliverables, requires significant interpretation"
            },
            
            "average_actionability": {
                "text": "Research social media marketing platforms and create a recommendation report comparing Facebook, LinkedIn, and Instagram for B2B marketing.",
                "expected_range": "41-60",
                "rationale": "Clear action verbs, specific platforms mentioned, defined deliverable"
            },
            
            "good_actionability": {
                "text": "Conduct a comparative analysis of Facebook Ads, LinkedIn Marketing, and Instagram Business for B2B lead generation. Create a detailed report with: platform comparison matrix, cost analysis per lead, audience targeting capabilities, and implementation timeline. Provide specific recommendations with budget allocations.",
                "expected_range": "61-80",
                "rationale": "Strong action verbs, detailed deliverables, step-by-step components, clear expectations"
            },
            
            "excellent_actionability": {
                "text": "Execute a comprehensive B2B social media platform evaluation following this process:\n\nStep 1: Analyze Facebook Ads Manager, LinkedIn Campaign Manager, and Instagram Business (2 days)\n- Document targeting options, minimum budgets, and ad formats\n- Calculate cost-per-lead benchmarks for our industry (SaaS, $49/month product)\n\nStep 2: Create comparison framework (1 day)\n- Build scoring matrix with weighted criteria: reach, targeting precision, cost efficiency, integration capabilities\n- Include ROI projections based on $5K monthly budget\n\nStep 3: Develop implementation roadmap (1 day)\n- 30/60/90-day launch timeline\n- Resource requirements and team responsibilities\n- Success metrics and optimization milestones\n\nDeliverables: Executive summary (1 page), detailed analysis report (8-10 pages), implementation checklist, budget allocation spreadsheet.",
                "expected_range": "81-100",
                "rationale": "Crystal clear step-by-step process, specific timelines, measurable deliverables, complete implementation guidance"
            }
        }
    
    def _define_expected_ranges(self) -> Dict[str, str]:
        """Define expected score ranges for test prompts"""
        return {prompt_id: details["expected_range"] 
                for prompt_id, details in self.test_prompts.items()}
    
    async def validate_scoring_consistency(self, rubric: LLMPoweredRubric) -> Dict[str, Any]:
        """Validate that LLM scoring aligns with expected ranges"""
        
        results = {
            "total_tests": len(self.test_prompts),
            "passed_tests": 0,
            "failed_tests": 0,
            "test_results": {},
            "accuracy_by_criterion": {},
            "overall_accuracy": 0.0
        }
        
        criterion_accuracies = {criterion: {"correct": 0, "total": 0} 
                              for criterion in rubric.criteria.keys()}
        
        print("Running Score Range Validation Tests...")
        print("=" * 60)
        
        for prompt_id, prompt_data in self.test_prompts.items():
            print(f"\nTesting: {prompt_id}")
            print(f"Expected Range: {prompt_data['expected_range']}")
            
            try:
                # Evaluate the test prompt
                evaluation = await rubric.evaluate_prompt(prompt_data["text"])
                
                # Check each criterion's score range
                test_result = {
                    "prompt_id": prompt_id,
                    "expected_range": prompt_data["expected_range"],
                    "rationale": prompt_data["rationale"],
                    "criterion_results": {},
                    "passed": True,
                    "issues": []
                }
                
                # Focus on the primary criterion being tested
                primary_criterion = prompt_id.split("_")[1]  # e.g., "clarity" from "poor_clarity"
                
                if primary_criterion in evaluation["criteria_scores"]:
                    criterion_data = evaluation["criteria_scores"][primary_criterion]
                    actual_range = criterion_data.get("score_range", "Unknown")
                    actual_score = criterion_data.get("numerical_score", 0)
                    expected_range = prompt_data["expected_range"]
                    
                    # Check if score falls in expected range
                    range_match = self._check_range_match(actual_score, expected_range)
                    
                    test_result["criterion_results"][primary_criterion] = {
                        "expected_range": expected_range,
                        "actual_range": actual_range,
                        "actual_score": actual_score,
                        "range_match": range_match,
                        "reasoning": criterion_data.get("reasoning", "")
                    }
                    
                    # Update accuracy tracking
                    criterion_accuracies[primary_criterion]["total"] += 1
                    if range_match:
                        criterion_accuracies[primary_criterion]["correct"] += 1
                        results["passed_tests"] += 1
                        print(f"✅ PASSED - Score: {actual_score} (Range: {actual_range})")
                    else:
                        test_result["passed"] = False
                        test_result["issues"].append(f"Score {actual_score} not in expected range {expected_range}")
                        results["failed_tests"] += 1
                        print(f"❌ FAILED - Score: {actual_score}, Expected: {expected_range}")
                        print(f"   Reasoning: {criterion_data.get('reasoning', 'No reasoning provided')}")
                
                results["test_results"][prompt_id] = test_result
                
            except Exception as e:
                print(f"❌ ERROR: {str(e)}")
                results["failed_tests"] += 1
                results["test_results"][prompt_id] = {
                    "prompt_id": prompt_id,
                    "error": str(e),
                    "passed": False
                }
        
        # Calculate accuracy metrics
        for criterion, accuracy_data in criterion_accuracies.items():
            if accuracy_data["total"] > 0:
                accuracy = (accuracy_data["correct"] / accuracy_data["total"]) * 100
                results["accuracy_by_criterion"][criterion] = round(accuracy, 1)
        
        results["overall_accuracy"] = round((results["passed_tests"] / results["total_tests"]) * 100, 1)
        
        # Print summary
        print("\n" + "=" * 60)
        print("VALIDATION SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {results['total_tests']}")
        print(f"Passed: {results['passed_tests']}")
        print(f"Failed: {results['failed_tests']}")
        print(f"Overall Accuracy: {results['overall_accuracy']}%")
        print("\nAccuracy by Criterion:")
        for criterion, accuracy in results["accuracy_by_criterion"].items():
            print(f"  {criterion.title()}: {accuracy}%")
        
        return results
    
    def _check_range_match(self, score: float, expected_range: str) -> bool:
        """Check if a score falls within the expected range"""
        range_mappings = {
            "0-20": (0, 20),
            "21-40": (21, 40),
            "41-60": (41, 60),
            "61-80": (61, 80),
            "81-100": (81, 100)
        }
        
        if expected_range in range_mappings:
            min_score, max_score = range_mappings[expected_range]
            return min_score <= score <= max_score
        
        return False
    
    def generate_scoring_guide(self) -> str:
        """Generate a comprehensive scoring guide for documentation"""
        
        guide = """
# LLM-Powered Rubric Scoring Guide

## Score Range Definitions

### Clarity Criterion (Weight: 25%)
- **0-20 (POOR)**: 4+ vague terms, no clear actions, heavy pronoun use (>15%), long sentences (>30 words avg)
- **21-40 (BELOW AVERAGE)**: 2-3 vague terms, weak actions, some ambiguous pronouns (10-15%), sentences 25-30 words
- **41-60 (AVERAGE)**: 1-2 vague terms, clear action but imprecise, moderate pronouns (5-10%), sentences 20-25 words
- **61-80 (GOOD)**: 0-1 vague terms, clear specific actions, minimal pronouns (<5%), sentences 15-20 words
- **81-100 (EXCELLENT)**: No vague terms, crystal clear actions, precise language, optimal sentence length (<15 words)

### Specificity Criterion (Weight: 25%)
- **0-20 (POOR)**: No specific requirements, no format specs, no quantifiable elements, generic language
- **21-40 (BELOW AVERAGE)**: 1-2 specific elements, vague format mentions, minimal quantifiable elements
- **41-60 (AVERAGE)**: 3-4 specific requirements, basic format specs, some quantifiable elements
- **61-80 (GOOD)**: 5-6 detailed specifications, clear format requirements, multiple quantifiable elements
- **81-100 (EXCELLENT)**: 7+ comprehensive specifications, precise formats with examples, extensive quantifiable metrics

### Structure Criterion (Weight: 25%)
- **0-20 (POOR)**: No organization, stream of consciousness, no formatting, no logical flow
- **21-40 (BELOW AVERAGE)**: Basic organization, 2-3 distinct ideas, minimal formatting
- **41-60 (AVERAGE)**: Clear sections, 3-4 organized ideas, some formatting (bullets/numbers)
- **61-80 (GOOD)**: Well-organized hierarchy, good formatting, clear intro/conclusion
- **81-100 (EXCELLENT)**: Perfect structure, headers/subheaders, excellent formatting, seamless flow

### Context Criterion (Weight: 15%)
- **0-20 (POOR)**: No background, no purpose, no domain context, missing essential context
- **21-40 (BELOW AVERAGE)**: Minimal context, implied purpose, limited background, incomplete domain info
- **41-60 (AVERAGE)**: Basic context/background, clear purpose, some domain info, adequate situational awareness
- **61-80 (GOOD)**: Good contextual foundation, clear purpose/goals, relevant domain context, constraints mentioned
- **81-100 (EXCELLENT)**: Comprehensive context, detailed purpose/rationale, rich domain/situational awareness

### Actionability Criterion (Weight: 10%)
- **0-20 (POOR)**: No clear actions, unclear what to do, no deliverables, abstract language only
- **21-40 (BELOW AVERAGE)**: Weak action verbs, implied actions, vague deliverables, requires interpretation
- **41-60 (AVERAGE)**: Clear action verbs, specific actions, basic deliverables, some implementation guidance
- **61-80 (GOOD)**: Strong specific actions, well-defined deliverables, step-by-step guidance, easy to act upon
- **81-100 (EXCELLENT)**: Crystal clear actions, comprehensive guidance, specific measurable deliverables, complete roadmap

## Validation Testing
Use the ScoreRangeValidator to test consistency and accuracy of LLM scoring against these defined ranges.
        """
        
        return guide.strip()

# Example usage and testing
async def run_validation_tests():
    """Run comprehensive validation tests"""
    
    # Initialize systems
    rubric = LLMPoweredRubric(
        qwen_api_endpoint="http://localhost:8000/v1/chat/completions"
    )
    validator = ScoreRangeValidator()
    
    # Run validation tests
    validation_results = await validator.validate_scoring_consistency(rubric)
    
    # Generate and display scoring guide
    scoring_guide = validator.generate_scoring_guide()
    
    print("\n" + "=" * 80)
    print("SCORING GUIDE")
    print("=" * 80)
    print(scoring_guide)
    
    return validation_results

if __name__ == "__main__":
    # Run the validation tests
    results = asyncio.run(run_validation_tests())