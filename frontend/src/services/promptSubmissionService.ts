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
      // console.log('Submitting prompt:', data)
      
      const response = await httpClient.post('/prompts', data)
      
      if (response.ok) {
        const result = await response.json()
        // console.log('Prompt submitted successfully:', result)
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
      // console.log('Updating prompt:', id, data)
      
      const response = await httpClient.put(`/prompts/${id}`, data)
      
      if (response.ok) {
        const result = await response.json()
        // console.log('Prompt updated successfully:', result)
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
      // console.log('Publishing prompt:', id)
      
      const response = await httpClient.post(`/prompts/${id}/publish`)
      
      if (response.ok) {
        const result = await response.json()
        // console.log('Prompt published successfully:', result)
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
      // console.log('Unpublishing prompt:', id)
      
      const response = await httpClient.post(`/prompts/${id}/unpublish`)
      
      if (response.ok) {
        const result = await response.json()
        // console.log('Prompt unpublished successfully:', result)
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