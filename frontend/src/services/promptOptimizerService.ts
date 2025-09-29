import API_BASE_URL from '@/config/api';
import { StreamingService } from './streamingService';

interface OptimizationRequest {
  text: string; // <-- change from 'prompt' to 'text'
  target_audience?: string;
  optimization_goals?: string[];
  context?: string;
}

interface MLServiceOptimizationResponse {
  prompt: string;
  suggestions: Array<{
    suggestion: string;
    before: string;
    after: string;
    impact: string;
  }>;
  source?: string;
  [key: string]: any; // allow extra fields
}

interface CategorizationRequest {
  prompt: string;
}

interface CategorizationResponse {
  category: string;
  confidence: number;
  all_categories: { [key: string]: number };
}

interface AnalysisRequest {
  prompt: string;
}

interface AnalysisResponse {
  readability_score: number;
  effectiveness_score: number;
  overall_score: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

class PromptOptimizerService {
  private baseURL = `${API_BASE_URL}/ml`;
  private streamingService = new StreamingService();

  async optimizePrompt(request: OptimizationRequest): Promise<MLServiceOptimizationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.prompt) {
        data.prompt = this.streamingService.formatResponse(data.prompt, false);
      }
      if (data.suggestions) {
        data.suggestions = data.suggestions.map((suggestion: any) => ({
          ...suggestion,
          suggestion: this.streamingService.formatResponse(suggestion.suggestion, false),
          before: this.streamingService.formatResponse(suggestion.before, false),
          after: this.streamingService.formatResponse(suggestion.after, false),
          impact: this.streamingService.formatResponse(suggestion.impact, false)
        }));
      }

      return data;
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      throw error;
    }
  }

  async categorizePrompt(request: CategorizationRequest): Promise<CategorizationResponse> {
    try {
      const response = await fetch(`${this.baseURL}/categorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error categorizing prompt:', error);
      throw error;
    }
  }

  async analyzePrompt(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.suggestions) {
        data.suggestions = data.suggestions.map((suggestion: string) => 
          this.streamingService.formatResponse(suggestion, false)
        );
      }
      if (data.strengths) {
        data.strengths = data.strengths.map((strength: string) => 
          this.streamingService.formatResponse(strength, false)
        );
      }
      if (data.weaknesses) {
        data.weaknesses = data.weaknesses.map((weakness: string) => 
          this.streamingService.formatResponse(weakness, false)
        );
      }

      return data;
    } catch (error) {
      console.error('Error analyzing prompt:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // New wizard-specific methods
  async wizardAnalyze(request: { text: string }) {
    try {
      const response = await fetch(`${this.baseURL}/wizard-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.analysis?.issues) {
        data.analysis.issues = data.analysis.issues.map((issue: string) => 
          this.streamingService.formatResponse(issue, false)
        );
      }
      if (data.analysis?.suggestions) {
        data.analysis.suggestions = data.analysis.suggestions.map((suggestion: string) => 
          this.streamingService.formatResponse(suggestion, false)
        );
      }
      if (data.analysis?.improvement_potential) {
        data.analysis.improvement_potential = this.streamingService.formatResponse(data.analysis.improvement_potential, false);
      }
      if (data.analysis?.rating_explanation) {
        data.analysis.rating_explanation = this.streamingService.formatResponse(data.analysis.rating_explanation, false);
      }
      if (data.improvement_areas) {
        data.improvement_areas = data.improvement_areas.map((area: string) => 
          this.streamingService.formatResponse(area, false)
        );
      }
      if (data.recommended_goals) {
        data.recommended_goals = Object.fromEntries(
          Object.entries(data.recommended_goals).map(([key, value]) => [
            key, 
            this.streamingService.formatResponse(value as string, false)
          ])
        );
      }

      return data;
    } catch (error) {
      console.error('Error in wizard analyze:', error);
      throw error;
    }
  }

  async wizardGoals(request: { text: string; goals: Record<string, string> }) {
    try {
      const response = await fetch(`${this.baseURL}/wizard-goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.optimized_prompt) {
        data.optimized_prompt = this.streamingService.formatResponse(data.optimized_prompt, false);
      }
      if (data.optimization_details?.improvement_explanation) {
        data.optimization_details.improvement_explanation = this.streamingService.formatResponse(data.optimization_details.improvement_explanation, false);
      }
      if (data.optimization_details?.key_changes) {
        data.optimization_details.key_changes = data.optimization_details.key_changes.map((change: string) => 
          this.streamingService.formatResponse(change, false)
        );
      }

      return data;
    } catch (error) {
      console.error('Error in wizard goals:', error);
      throw error;
    }
  }

  async wizardStructure(request: { text: string; structure_options: Record<string, boolean> }) {
    try {
      const response = await fetch(`${this.baseURL}/wizard-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.optimized_prompt) {
        data.optimized_prompt = this.streamingService.formatResponse(data.optimized_prompt, false);
      }
      if (data.structure_details?.structure_explanation) {
        data.structure_details.structure_explanation = this.streamingService.formatResponse(data.structure_details.structure_explanation, false);
      }
      if (data.structure_details?.structural_improvements) {
        data.structure_details.structural_improvements = data.structure_details.structural_improvements.map((improvement: string) => 
          this.streamingService.formatResponse(improvement, false)
        );
      }

      return data;
    } catch (error) {
      console.error('Error in wizard structure:', error);
      throw error;
    }
  }

  async wizardContext(request: { text: string; context_options: Record<string, string> }) {
    try {
      const response = await fetch(`${this.baseURL}/wizard-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.optimized_prompt) {
        data.optimized_prompt = this.streamingService.formatResponse(data.optimized_prompt, false);
      }
      if (data.context_details?.context_explanation) {
        data.context_details.context_explanation = this.streamingService.formatResponse(data.context_details.context_explanation, false);
      }
      if (data.context_details?.context_improvements) {
        data.context_details.context_improvements = data.context_details.context_improvements.map((improvement: string) => 
          this.streamingService.formatResponse(improvement, false)
        );
      }

      return data;
    } catch (error) {
      console.error('Error in wizard context:', error);
      throw error;
    }
  }

  async wizardComprehensive(request: { 
    text: string; 
    goals?: Record<string, string>;
    structure_options?: Record<string, boolean>;
    context_options?: Record<string, string>;
  }) {
    try {
      const response = await fetch(`${this.baseURL}/wizard-comprehensive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.optimized_prompt) {
        data.optimized_prompt = this.streamingService.formatResponse(data.optimized_prompt, false);
      }
      if (data.optimization_details?.improvement_explanation) {
        data.optimization_details.improvement_explanation = this.streamingService.formatResponse(data.optimization_details.improvement_explanation, false);
      }
      if (data.optimization_details?.key_changes) {
        data.optimization_details.key_changes = data.optimization_details.key_changes.map((change: string) => 
          this.streamingService.formatResponse(change, false)
        );
      }
      if (data.structure_details?.structure_explanation) {
        data.structure_details.structure_explanation = this.streamingService.formatResponse(data.structure_details.structure_explanation, false);
      }
      if (data.structure_details?.structural_improvements) {
        data.structure_details.structural_improvements = data.structure_details.structural_improvements.map((improvement: string) => 
          this.streamingService.formatResponse(improvement, false)
        );
      }
      if (data.context_details?.context_explanation) {
        data.context_details.context_explanation = this.streamingService.formatResponse(data.context_details.context_explanation, false);
      }
      if (data.context_details?.context_improvements) {
        data.context_details.context_improvements = data.context_details.context_improvements.map((improvement: string) => 
          this.streamingService.formatResponse(improvement, false)
        );
      }

      return data;
    } catch (error) {
      console.error('Error in wizard comprehensive:', error);
      throw error;
    }
  }

  // Simple optimization for OptimizerPage
  async optimizeSimple(request: { text: string }) {
    try {
      const response = await fetch(`${this.baseURL}/optimize-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format text responses to remove ## headers and other markdown formatting
      if (data.optimized_prompt) {
        data.optimized_prompt = this.streamingService.formatResponse(data.optimized_prompt, false);
      }
      if (data.explanation) {
        data.explanation = this.streamingService.formatResponse(data.explanation, false);
      }
      if (data.improvements) {
        data.improvements = data.improvements.map((improvement: string) => 
          this.streamingService.formatResponse(improvement, false)
        );
      }

      return data;
    } catch (error) {
      console.error('Error in simple optimization:', error);
      throw error;
    }
  }
}

export default new PromptOptimizerService();