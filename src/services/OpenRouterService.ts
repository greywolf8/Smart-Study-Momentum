interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterService {
  private apiKey: string = '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';
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private defaultModel = 'nvidia/llama-nemotron-embed-vl-1b-v2:free';

  constructor() {
    // API key is hardcoded, no need to load
  }

  hasApiKey(): boolean {
    return true; // Always has hardcoded key
  }

  async generateCompletion(
    messages: OpenRouterMessage[],
    model: string = this.defaultModel,
    temperature: number = 0.7
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not set. Please configure it in Settings.');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://smartstudy.app',
          'X-Title': 'Smart Study Momentum',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter API call failed:', error);
      throw error;
    }
  }

  async generateStudyPlan(
    subjects: string[],
    availableTime: number,
    userContext?: string
  ): Promise<any> {
    const systemPrompt = `You are an AI study planner assistant. Create a personalized study plan based on the user's subjects and available time.
    
    Return a JSON response with this exact structure:
    {
      "sessions": [
        {
          "subject": "string",
          "duration": number (in minutes),
          "difficulty": "easy" | "medium" | "hard",
          "focusLevel": number (1-10),
          "startTime": "ISO date string",
          "endTime": "ISO date string"
        }
      ],
      "difficultyBalance": {
        "easy": number,
        "medium": number,
        "hard": number
      },
      "recommendations": ["string"]
    }`;

    const userPrompt = `Create a study plan for the following:
    Subjects: ${subjects.join(', ')}
    Available time: ${availableTime} minutes
    ${userContext ? `Additional context: ${userContext}` : ''}
    
    Start from the current time and schedule sessions with 15-minute breaks between them.`;

    const response = await this.generateCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      // Extract JSON from the response (handle markdown code blocks if present)
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('Failed to parse study plan from AI response');
    }
  }

  async generateMicroTasks(
    subject: string,
    sessionDuration: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<any[]> {
    const systemPrompt = `You are an AI study assistant. Break down a study session into micro-tasks.
    
    Return a JSON array with this exact structure:
    [
      {
        "title": "string",
        "estimatedTime": number (in minutes),
        "difficulty": "easy" | "medium" | "hard"
      }
    ]
    
    Total estimated time should not exceed the session duration.`;

    const userPrompt = `Create ${sessionDuration} minutes of micro-tasks for studying ${subject} at ${difficulty} difficulty level.`;

    const response = await this.generateCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse micro-tasks from AI response:', error);
      throw new Error('Failed to parse micro-tasks from AI response');
    }
  }

  async getRecommendations(
    studyHistory: any[],
    productivityScore: number
  ): Promise<string[]> {
    const systemPrompt = `You are an AI study coach. Provide personalized study recommendations based on the user's study history and productivity.
    
    Return a JSON array of recommendation strings:
    ["recommendation 1", "recommendation 2", ...]`;

    const userPrompt = `Based on the following data, provide 3-5 specific recommendations to improve study effectiveness:
    - Productivity score: ${productivityScore}/1.0
    - Recent study sessions: ${JSON.stringify(studyHistory.slice(-5))}`;

    const response = await this.generateCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    try {
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse recommendations from AI response:', error);
      // Return fallback recommendations if parsing fails
      return ['Take regular breaks to maintain focus', 'Review difficult topics more frequently'];
    }
  }

  async generateFocusTips(subject: string): Promise<string[]> {
    const systemPrompt = `You are an AI study coach. Provide specific tips for staying focused during study sessions.
    
    Return a JSON array of tip strings:
    ["tip 1", "tip 2", ...]`;

    const userPrompt = `Provide 3-5 specific tips for maintaining focus while studying ${subject}.`;

    const response = await this.generateCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], 'anthropic/claude-3.5-haiku', 0.8);

    try {
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Failed to parse focus tips from AI response:', error);
      return ['Eliminate distractions', 'Set clear goals', 'Use the Pomodoro technique'];
    }
  }
}

export const openRouterService = new OpenRouterService();
