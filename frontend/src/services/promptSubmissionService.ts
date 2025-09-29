import httpClient from './httpClient'

export interface PromptSubmissionData {
  title: string
  description: string
  category: string
  content: string // Backend expects 'content' not 'promptText'
  price: number
  visibility: string // Backend expects 'visibility' not 'isPrivate'
  tagNames?: string[]
}

export interface PromptUpdateData extends PromptSubmissionData {
  id: string
}

class PromptSubmissionService {
  
  async submitPrompt(data: PromptSubmissionData): Promise<any> {
    try {
      
      const response = await httpClient.post('/prompts', data)
      
      if (response.ok) {
        const result = await response.json()
        return result
      } else {
        const errorText = await response.text()
        throw new Error(`Failed to submit prompt: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error submitting prompt:', error)
      throw error
    }
  }

  async updatePrompt(id: string, data: PromptSubmissionData): Promise<any> {
    try {
      const response = await httpClient.put(`/prompts/${id}`, data)
      
      if (response.ok) {
        const result = await response.json()
        return result
      } else {
        const errorText = await response.text()
        throw new Error(`Failed to update prompt: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error updating prompt:', error)
      throw error
    }
  }

  async publishPrompt(id: string): Promise<any> {
    try {
      
      const response = await httpClient.post(`/prompts/${id}/publish`)
      
      if (response.ok) {
        const result = await response.json()
        return result
      } else {
        const errorText = await response.text()
        throw new Error(`Failed to publish prompt: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error publishing prompt:', error)
      throw error
    }
  }

  async unpublishPrompt(id: string): Promise<any> {
    try {
      
      const response = await httpClient.post(`/prompts/${id}/unpublish`)
      
      if (response.ok) {
        const result = await response.json()
        return result
      } else {
        const errorText = await response.text()
        throw new Error(`Failed to unpublish prompt: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error unpublishing prompt:', error)
      throw error
    }
  }
}

export default new PromptSubmissionService()