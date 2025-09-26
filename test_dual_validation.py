import requests
import json

# Test the new dual validation system
test_prompt = 'Write about technology'

print('TESTING DUAL VALIDATION SYSTEM')
print('=' * 50)
print('Test prompt:', repr(test_prompt))

try:
    response = requests.post('http://localhost:8000/wizard-analyze', 
        json={'text': test_prompt},
        headers={'Content-Type': 'application/json'},
        timeout=120  # Longer timeout for AI validation
    )
    
    print('Status Code:', response.status_code)
    
    if response.status_code == 200:
        result = response.json()
        analysis = result['analysis']
        metrics = analysis['metrics']
        
        print()
        print('FINAL METRICS:')
        for metric, score in metrics.items():
            print('  ' + metric + ':', f'{score:.1f}')
        
        # Check if validation info is included
        if 'validation_info' in analysis:
            validation = analysis['validation_info']
            print()
            print('VALIDATION INFO:')
            print('  Dual Validation Used:', validation.get('dual_validation_used', False))
            
            if 'validation_summary' in validation:
                summary = validation['validation_summary']
                print('  Validation Quality:', summary.get('validation_quality', 'unknown'))
                print('  Average Confidence:', summary.get('average_confidence', 'unknown'))
                print('  Agreement Distribution:', summary.get('agreement_distribution', {}))
            
            print()
            print('LINGUISTIC vs QWEN:')
            for criterion, scores in validation.get('linguistic_vs_qwen', {}).items():
                print('  ' + criterion + ':')
                print('    Linguistic:', f'{scores["linguistic"]:.1f}')
                print('    Qwen:', f'{scores["qwen"]:.1f}')
                print('    Final:', f'{scores["final"]:.1f}')
                print('    Agreement:', scores['agreement'])
        else:
            print()
            print('No validation info found - checking rubric_analysis...')
            if 'rubric_analysis' in analysis:
                rubric = analysis['rubric_analysis']
                print('Rubric version:', rubric.get('rubric_version', 'unknown'))
                print('Has validation info in rubric:', 'validation_info' in rubric)
            
    else:
        print('Error:', response.text)
        
except Exception as e:
    print('Request failed:', str(e))