
const API_BASE_URL = 'http://localhost:3001/api';

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
    const response = await fetch(`${this.baseUrl}/download/${jobId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao baixar vídeo');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `video_${jobId}.mp4`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async getJobs(): Promise<VideoJob[]> {
    const response = await fetch(`${this.baseUrl}/jobs`);

    if (!response.ok) {
      throw new Error('Erro ao buscar jobs');
    }

    return response.json();
  }

  async getTemplates(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/templates`);

    if (!response.ok) {
      throw new Error('Erro ao buscar templates');
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
