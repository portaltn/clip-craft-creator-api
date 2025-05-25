
const API_BASE_URL = 'http://localhost:3001/api';

export interface Element {
  id: string;
  type: 'image' | 'video' | 'text';
  variable: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  shadow?: boolean;
  outline?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
  
  // Media specific
  mediaUrl?: string;
}

export interface Segment {
  id: string;
  name: string;
  duration: number;
  transition: string;
  backgroundColor: string;
  elements: Element[];
}

export interface Template {
  id?: string;
  name: string;
  description: string;
  width: number;
  height: number;
  fps: number;
  segments: Segment[];
  variables: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface VideoSegment {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string;
  duration?: number;
  text?: string;
  textPosition?: string;
  fontSize?: number;
  fontColor?: string;
  transition?: string;
}

export interface VideoConfig {
  segments: VideoSegment[];
  backgroundAudio?: string;
  resize?: string;
  fps?: number;
  template_id?: string;
  variables?: Record<string, any>;
}

export interface VideoJob {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  created_at: string;
  completed_at?: string;
  download_url?: string;
  file_size?: number;
  error?: string;
}

export class ClipCraftAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async createVideo(config: VideoConfig): Promise<{ job_id: string; status: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/create-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar vídeo');
    }

    return response.json();
  }

  async getJobStatus(jobId: string): Promise<VideoJob> {
    const response = await fetch(`${this.baseUrl}/job-status/${jobId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar status do job');
    }

    return response.json();
  }

  async downloadVideo(jobId: string): Promise<void> {
    console.log(`Iniciando download para job: ${jobId}`);
    
    const response = await fetch(`${this.baseUrl}/download/${jobId}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta do download:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Erro ao baixar vídeo');
      } catch {
        throw new Error('Erro ao baixar vídeo');
      }
    }

    const blob = await response.blob();
    console.log(`Blob recebido. Tamanho: ${blob.size} bytes`);

    if (blob.size === 0) {
      throw new Error('Arquivo vazio recebido');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `video_${jobId}.mp4`;
    
    document.body.appendChild(a);
    console.log('Iniciando download do arquivo...');
    a.click();
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('Download concluído e recursos limpos');
    }, 100);
  }

  // Template methods
  async saveTemplate(template: Template): Promise<{ success: boolean; template_id: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao salvar template');
    }

    return response.json();
  }

  async getTemplates(): Promise<Template[]> {
    const response = await fetch(`${this.baseUrl}/templates`);

    if (!response.ok) {
      throw new Error('Erro ao buscar templates');
    }

    return response.json();
  }

  async getTemplate(templateId: string): Promise<Template> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}`);

    if (!response.ok) {
      throw new Error('Erro ao buscar template');
    }

    return response.json();
  }

  async updateTemplate(templateId: string, template: Partial<Template>): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar template');
    }

    return response.json();
  }

  async deleteTemplate(templateId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar template');
    }

    return response.json();
  }

  async getJobs(): Promise<VideoJob[]> {
    const response = await fetch(`${this.baseUrl}/jobs`);

    if (!response.ok) {
      throw new Error('Erro ao buscar jobs');
    }

    return response.json();
  }

  async uploadFile(file: File): Promise<{ success: boolean; filename: string; url: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload');
    }

    return response.json();
  }

  async deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar job');
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; active_jobs: number; total_jobs: number }> {
    const response = await fetch(`${this.baseUrl}/health`);

    if (!response.ok) {
      throw new Error('Erro ao verificar saúde da API');
    }

    return response.json();
  }
}

export const api = new ClipCraftAPI();
