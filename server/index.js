const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/outputs', express.static('outputs'));

// Criar diretórios necessários
const directories = ['uploads', 'outputs', 'temp'];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuração do multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

// Armazenamento em memória para jobs
const videoJobs = new Map();

// Função para criar um arquivo MP4 válido mínimo (placeholder)
function createValidMP4File(outputPath) {
  // Cabeçalho MP4 básico válido para um arquivo vazio
  const mp4Header = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
    0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
    0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31,
    0x00, 0x00, 0x00, 0x08, 0x66, 0x72, 0x65, 0x65 // free box
  ]);
  
  fs.writeFileSync(outputPath, mp4Header);
  console.log(`Arquivo MP4 válido criado: ${outputPath}`);
}

// Classe para processamento de vídeos
class VideoProcessor {
  constructor() {
    this.maxDuration = 90; // segundos
  }

  async processVideo(jobId, config) {
    try {
      console.log(`Iniciando processamento do job ${jobId}`);
      
      const job = videoJobs.get(jobId);
      job.status = 'processing';
      job.progress = 0;

      // Simular processamento com progresso
      const segments = config.segments || [];
      const totalSteps = segments.length * 3; // 3 etapas por segmento
      let currentStep = 0;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        // Simular download de mídia
        await this.simulateStep(`Baixando mídia ${i + 1}`, 1000);
        currentStep++;
        job.progress = Math.round((currentStep / totalSteps) * 80);

        // Simular processamento de texto
        if (segment.text) {
          await this.simulateStep(`Processando texto ${i + 1}`, 800);
        }
        currentStep++;
        job.progress = Math.round((currentStep / totalSteps) * 80);

        // Simular aplicação de efeitos
        await this.simulateStep(`Aplicando efeitos ${i + 1}`, 1200);
        currentStep++;
        job.progress = Math.round((currentStep / totalSteps) * 80);
      }

      // Simular renderização final
      job.progress = 85;
      await this.simulateStep('Renderizando vídeo final', 3000);
      
      job.progress = 95;
      await this.simulateStep('Finalizando processamento', 1000);

      // Criar arquivo de saída válido
      const outputFilename = `video_${jobId}.mp4`;
      const outputPath = path.join('outputs', outputFilename);
      
      // Criar um arquivo MP4 válido (placeholder)
      createValidMP4File(outputPath);

      job.status = 'completed';
      job.progress = 100;
      job.outputFile = outputFilename;
      job.fileSize = fs.statSync(outputPath).size;
      job.completedAt = new Date().toISOString();
      job.downloadUrl = `/api/download/${jobId}`;

      console.log(`Job ${jobId} concluído com sucesso`);

    } catch (error) {
      console.error(`Erro no job ${jobId}:`, error);
      const job = videoJobs.get(jobId);
      job.status = 'error';
      job.error = error.message;
    }
  }

  async simulateStep(stepName, duration) {
    console.log(`  ${stepName}...`);
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}

const processor = new VideoProcessor();

// Endpoints da API

// Criar vídeo
app.post('/api/create-video', async (req, res) => {
  try {
    const config = req.body;
    
    if (!config || !config.segments || config.segments.length === 0) {
      return res.status(400).json({ 
        error: 'Configuração inválida: segmentos são obrigatórios' 
      });
    }

    const jobId = uuidv4();
    const job = {
      id: jobId,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      config: config
    };

    videoJobs.set(jobId, job);

    // Iniciar processamento assíncrono
    processor.processVideo(jobId, config).catch(error => {
      console.error(`Erro no processamento do job ${jobId}:`, error);
    });

    res.json({
      job_id: jobId,
      status: 'queued',
      message: 'Vídeo em processamento'
    });

  } catch (error) {
    console.error('Erro ao criar vídeo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Status do job
app.get('/api/job-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = videoJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job não encontrado' });
  }

  const response = {
    job_id: jobId,
    status: job.status,
    progress: job.progress,
    created_at: job.createdAt
  };

  if (job.status === 'completed') {
    response.download_url = job.downloadUrl;
    response.file_size = job.fileSize;
    response.completed_at = job.completedAt;
  } else if (job.status === 'error') {
    response.error = job.error;
  }

  res.json(response);
});

// Download do vídeo
app.get('/api/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = videoJobs.get(jobId);

  console.log(`Tentativa de download para job: ${jobId}`);

  if (!job) {
    console.log(`Job ${jobId} não encontrado`);
    return res.status(404).json({ error: 'Job não encontrado' });
  }

  if (job.status !== 'completed') {
    console.log(`Job ${jobId} não está completo. Status: ${job.status}`);
    return res.status(400).json({ error: 'Vídeo ainda não está pronto' });
  }

  const filePath = path.join(__dirname, 'outputs', job.outputFile);
  console.log(`Tentando baixar arquivo: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Arquivo não encontrado: ${filePath}`);
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  // Configurar headers para download
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="video_${jobId}.mp4"`);
  res.setHeader('Content-Length', fs.statSync(filePath).size);

  console.log(`Iniciando download do arquivo: ${filePath}`);
  
  // Criar stream e enviar arquivo
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on('error', (error) => {
    console.error('Erro ao enviar arquivo:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao enviar arquivo' });
    }
  });

  fileStream.on('end', () => {
    console.log(`Download concluído para job: ${jobId}`);
  });
});

// Listar jobs
app.get('/api/jobs', (req, res) => {
  const jobs = Array.from(videoJobs.values()).map(job => ({
    job_id: job.id,
    status: job.status,
    progress: job.progress,
    created_at: job.createdAt,
    completed_at: job.completedAt
  }));

  res.json(jobs);
});

// Health check
app.get('/api/health', (req, res) => {
  const activeJobs = Array.from(videoJobs.values()).filter(job => job.status === 'processing').length;
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    active_jobs: activeJobs,
    total_jobs: videoJobs.size
  });
});

// Templates
app.get('/api/templates', (req, res) => {
  const templates = {
    post_promocional: {
      name: 'Post Promocional',
      description: 'Template para posts promocionais',
      segments: [
        {
          id: 'promo_1',
          type: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080',
          duration: 7,
          text: 'PROMOÇÃO ESPECIAL\n50% OFF',
          textPosition: 'center',
          fontSize: 60,
          fontColor: '#ffffff',
          transition: 'fadein'
        }
      ],
      globalSettings: {
        resize: '1080x1080',
        fps: 30,
        backgroundAudio: ''
      }
    },
    slideshow_3: {
      name: 'Slideshow 3 Imagens',
      description: 'Slideshow com 3 imagens',
      segments: [
        {
          id: 'slide_1',
          type: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080',
          duration: 3,
          text: 'Slide 1',
          textPosition: 'center',
          fontSize: 50,
          fontColor: '#ffffff',
          transition: 'fadein'
        },
        {
          id: 'slide_2',
          type: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080',
          duration: 3,
          text: 'Slide 2',
          textPosition: 'center',
          fontSize: 50,
          fontColor: '#ffffff',
          transition: 'fadein'
        },
        {
          id: 'slide_3',
          type: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=1080',
          duration: 3,
          text: 'Slide 3',
          textPosition: 'center',
          fontSize: 50,
          fontColor: '#ffffff',
          transition: 'fadein'
        }
      ],
      globalSettings: {
        resize: '1080x1080',
        fps: 30,
        backgroundAudio: ''
      }
    }
  };

  res.json(templates);
});

// Upload de arquivos
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deletar job
app.delete('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = videoJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job não encontrado' });
  }

  // Deletar arquivo de saída se existir
  if (job.outputFile) {
    const filePath = path.join('outputs', job.outputFile);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  videoJobs.delete(jobId);
  res.json({ message: 'Job deletado com sucesso' });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🎬 ClipCraft API Server');
  console.log(`📍 Servidor rodando em: http://localhost:${PORT}`);
  console.log('📋 Endpoints disponíveis:');
  console.log('   POST /api/create-video - Criar vídeo');
  console.log('   GET  /api/job-status/:id - Status do job');
  console.log('   GET  /api/download/:id - Download do vídeo');
  console.log('   GET  /api/jobs - Listar jobs');
  console.log('   GET  /api/templates - Templates disponíveis');
  console.log('   POST /api/upload - Upload de arquivo');
  console.log('   GET  /api/health - Health check');
});
