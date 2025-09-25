import API_BASE_URL from '@/config/api';

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

      return await response.json();
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

      return await response.json();
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

      return await response.json();
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

      return await response.json();
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

      return await response.json();
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

      return await response.json();
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

      return await response.json();
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

      return await response.json();
    } catch (error) {
      console.error('Error in simple optimization:', error);
      throw error;
    }
  }
}

export default new PromptOptimizerService();