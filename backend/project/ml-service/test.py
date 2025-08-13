import os
import json
import time
import requests
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class QwenModelDebugger:
    def __init__(self):
        self.api_token = os.getenv("HF_TOKEN", "")
        self.client = None
        self.debug_info = {
            "token_status": "not_checked",
            "client_status": "not_created",
            "model_tests": [],
            "api_endpoints": [],
            "errors": []
        }
        
        # Updated model list based on current availability
        self.models_to_test = [
            # Qwen3 models (latest)
            "Qwen/Qwen3-235B-A22B-Instruct",
            "Qwen/Qwen3-30B-A3B-Instruct", 
            "Qwen/Qwen3-8B-Instruct",
            "Qwen/Qwen3-4B-Instruct",
            
            # Qwen2.5 models (stable)
            "Qwen/Qwen2.5-72B-Instruct",
            "Qwen/Qwen2.5-32B-Instruct", 
            "Qwen/Qwen2.5-14B-Instruct",
            "Qwen/Qwen2.5-7B-Instruct",
            "Qwen/Qwen2.5-3B-Instruct",
            "Qwen/Qwen2.5-1.5B-Instruct",
            "Qwen/Qwen2.5-0.5B-Instruct",
            
            # Qwen-Coder models
            "Qwen/Qwen2.5-Coder-32B-Instruct",
            "Qwen/Qwen2.5-Coder-14B-Instruct",
            "Qwen/Qwen2.5-Coder-7B-Instruct",
            
            # Alternative endpoints
            "microsoft/DialoGPT-medium",
            "facebook/blenderbot-400M-distill"
        ]
        
        self.endpoints_to_test = [
            "https://router.huggingface.co/v1",
            "https://api-inference.huggingface.co/v1", 
            "https://inference.huggingface.co/v1"
        ]
        
        print(f"🔍 Starting Qwen Model Debugger...")
        print(f"🔑 Token provided: {'Yes' if self.api_token else 'No'}")
        print(f"📝 Token length: {len(self.api_token) if self.api_token else 0} characters")
        print("-" * 60)

    def test_token_validity(self):
        """Test if the HF token is valid"""
        print("🔐 Testing token validity...")
        
        if not self.api_token:
            self.debug_info["token_status"] = "missing"
            self.debug_info["errors"].append("No HF_TOKEN found in environment")
            print("❌ No token found!")
            return False
            
        # Test with simple API call
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.get(
                "https://huggingface.co/api/whoami",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                user_info = response.json()
                self.debug_info["token_status"] = "valid"
                print(f"✅ Token is valid! User: {user_info.get('name', 'Unknown')}")
                return True
            else:
                self.debug_info["token_status"] = "invalid"
                self.debug_info["errors"].append(f"Token validation failed: {response.status_code}")
                print(f"❌ Token invalid! Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.debug_info["token_status"] = "error"
            self.debug_info["errors"].append(f"Token validation error: {str(e)}")
            print(f"❌ Token validation error: {e}")
            return False

    def test_endpoints(self):
        """Test different API endpoints"""
        print("\n🌐 Testing API endpoints...")
        
        working_endpoints = []
        
        for endpoint in self.endpoints_to_test:
            print(f"Testing: {endpoint}")
            
            try:
                client = OpenAI(
                    base_url=endpoint,
                    api_key=self.api_token,
                    timeout=10
                )
                
                # Try a simple request
                response = client.chat.completions.create(
                    model="Qwen/Qwen2.5-7B-Instruct",
                    messages=[{"role": "user", "content": "Hi"}],
                    max_tokens=5,
                    timeout=10
                )
                
                if response and response.choices:
                    working_endpoints.append(endpoint)
                    self.debug_info["api_endpoints"].append({
                        "endpoint": endpoint,
                        "status": "working",
                        "response": "Got valid response"
                    })
                    print(f"  ✅ Working!")
                else:
                    self.debug_info["api_endpoints"].append({
                        "endpoint": endpoint,
                        "status": "failed",
                        "response": "No valid response"
                    })
                    print(f"  ❌ No valid response")
                    
            except Exception as e:
                self.debug_info["api_endpoints"].append({
                    "endpoint": endpoint,
                    "status": "error",
                    "response": str(e)
                })
                print(f"  ❌ Error: {e}")
                
        if working_endpoints:
            print(f"\n✅ Working endpoints: {len(working_endpoints)}")
            self.client = OpenAI(
                base_url=working_endpoints[0],
                api_key=self.api_token
            )
            self.debug_info["client_status"] = "created"
            return True
        else:
            print("❌ No working endpoints found!")
            self.debug_info["client_status"] = "failed"
            return False

    def test_models(self):
        """Test individual models"""
        print(f"\n🤖 Testing {len(self.models_to_test)} models...")
        
        if not self.client:
            print("❌ No client available for testing models")
            return []
            
        working_models = []
        
        for i, model in enumerate(self.models_to_test):
            print(f"Testing model {i+1}/{len(self.models_to_test)}: {model}")
            
            model_result = {
                "model": model,
                "status": "unknown",
                "response_time": None,
                "response": "",
                "error": ""
            }
            
            try:
                start_time = time.time()
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "user", "content": "Say 'Hello' and nothing else."}
                    ],
                    max_tokens=10,
                    timeout=30
                )
                
                end_time = time.time()
                response_time = end_time - start_time
                
                if response and response.choices and response.choices[0].message:
                    content = response.choices[0].message.content.strip()
                    model_result.update({
                        "status": "working",
                        "response_time": response_time,
                        "response": content
                    })
                    working_models.append(model)
                    print(f"  ✅ Working! Response: '{content}' ({response_time:.2f}s)")
                else:
                    model_result.update({
                        "status": "no_response",
                        "response_time": response_time
                    })
                    print(f"  ❌ No response ({response_time:.2f}s)")
                    
            except Exception as e:
                model_result.update({
                    "status": "error",
                    "error": str(e)
                })
                print(f"  ❌ Error: {e}")
                
            self.debug_info["model_tests"].append(model_result)
            
            # Brief pause between requests
            time.sleep(1)
            
        print(f"\n✅ Working models found: {len(working_models)}")
        return working_models

    def test_optimization_capability(self, working_models):
        """Test actual prompt optimization with working models"""
        print(f"\n🎯 Testing optimization capability...")
        
        if not working_models:
            print("❌ No working models to test optimization")
            return False
            
        test_prompt = "Explain machine learning"
        optimization_prompt = f"""Please analyze this prompt and provide 3 specific suggestions to improve it:

Original prompt: "{test_prompt}"

For each suggestion, please format your response exactly as follows:
Suggestion: [brief description of the improvement]
After: [the improved version of the prompt]  
Impact: [low/medium/high]

Make sure each suggestion addresses a different aspect of prompt improvement."""

        for model in working_models[:3]:  # Test first 3 working models
            print(f"Testing optimization with: {model}")
            
            try:
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "user", "content": optimization_prompt}
                    ],
                    max_tokens=800,
                    temperature=0.7,
                    timeout=60
                )
                
                if response and response.choices and response.choices[0].message:
                    content = response.choices[0].message.content
                    print(f"✅ Optimization response received ({len(content)} chars)")
                    print("📝 Sample response:")
                    print(content[:200] + "..." if len(content) > 200 else content)
                    print("-" * 40)
                    return True
                    
            except Exception as e:
                print(f"❌ Optimization test failed: {e}")
                
        return False

    def generate_fixed_code(self, working_models):
        """Generate updated code with working models"""
        if not working_models:
            return None
            
        return f"""# Updated model list for your prompt.py
self.model_endpoints = [
{chr(10).join([f'    "{model}",' for model in working_models[:5]])}
]

# Working endpoint
self.client = OpenAI(
    base_url="{self.debug_info['api_endpoints'][0]['endpoint'] if self.debug_info['api_endpoints'] else 'https://router.huggingface.co/v1'}",
    api_key=self.api_token,
)"""

    def run_full_debug(self):
        """Run complete debugging process"""
        print("🚀 Starting comprehensive model debugging...")
        print("=" * 60)
        
        # Step 1: Test token
        if not self.test_token_validity():
            print("\n❌ Cannot proceed without valid token")
            return self.generate_report()
            
        # Step 2: Test endpoints  
        if not self.test_endpoints():
            print("\n❌ Cannot proceed without working endpoint")
            return self.generate_report()
            
        # Step 3: Test models
        working_models = self.test_models()
        
        # Step 4: Test optimization
        if working_models:
            self.test_optimization_capability(working_models)
            
        return self.generate_report()

    def generate_report(self):
        """Generate comprehensive debug report"""
        report = {
            "summary": {
                "token_valid": self.debug_info["token_status"] == "valid",
                "working_endpoints": len([e for e in self.debug_info["api_endpoints"] if e["status"] == "working"]),
                "working_models": len([m for m in self.debug_info["model_tests"] if m["status"] == "working"]),
                "total_errors": len(self.debug_info["errors"])
            },
            "details": self.debug_info,
            "recommendations": []
        }
        
        # Generate recommendations
        if report["summary"]["token_valid"]:
            report["recommendations"].append("✅ Token is valid")
        else:
            report["recommendations"].append("❌ Fix your HF_TOKEN in .env file")
            
        if report["summary"]["working_endpoints"] > 0:
            report["recommendations"].append(f"✅ Found {report['summary']['working_endpoints']} working endpoint(s)")
        else:
            report["recommendations"].append("❌ No working API endpoints found")
            
        if report["summary"]["working_models"] > 0:
            working_models = [m["model"] for m in self.debug_info["model_tests"] if m["status"] == "working"]
            report["recommendations"].append(f"✅ Found {len(working_models)} working model(s)")
            report["fixed_code"] = self.generate_fixed_code(working_models)
        else:
            report["recommendations"].append("❌ No working models found - check Hugging Face service status")
            
        return report

def main():
    debugger = QwenModelDebugger()
    report = debugger.run_full_debug()
    
    print("\n" + "=" * 60)
    print("📊 FINAL REPORT")
    print("=" * 60)
    
    print(f"Token Status: {'✅ Valid' if report['summary']['token_valid'] else '❌ Invalid'}")
    print(f"Working Endpoints: {report['summary']['working_endpoints']}")
    print(f"Working Models: {report['summary']['working_models']}")
    print(f"Total Errors: {report['summary']['total_errors']}")
    
    print("\n📋 RECOMMENDATIONS:")
    for rec in report["recommendations"]:
        print(f"  {rec}")
        
    if "fixed_code" in report:
        print(f"\n🔧 FIXED CODE FOR YOUR prompt.py:")
        print("-" * 40)
        print(report["fixed_code"])
        
    # Save full report
    with open("debug_report.json", "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n💾 Full debug report saved to: debug_report.json")
    
    return report

if __name__ == "__main__":
    main()