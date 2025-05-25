const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const { createCanvas, loadImage, registerFont } = require('canvas');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/outputs', express.static('outputs'));

// Criar diretórios necessários
const directories = ['uploads', 'outputs', 'temp', 'fonts'];
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
  limits: { fileSize: 100 * 1024 * 1024 },
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

// Armazenamento em memória
const videoJobs = new Map();
const templates = new Map();

// Classe para processamento real de vídeos
class VideoProcessor {
  constructor() {
    this.maxDuration = 90;
  }

  async processVideo(jobId, config) {
    try {
      console.log(`Iniciando processamento real do job ${jobId}`);
      
      const job = videoJobs.get(jobId);
      job.status = 'processing';
      job.progress = 10;

      const outputFilename = `video_${jobId}.mp4`;
      const outputPath = path.join('outputs', outputFilename);
      const tempDir = path.join('temp', jobId);
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Processar cada segmento
      const segmentPaths = [];
      
      for (let i = 0; i < config.segments.length; i++) {
        const segment = config.segments[i];
        console.log(`Processando segmento ${i + 1}/${config.segments.length}`);
        
        job.progress = 20 + (i / config.segments.length) * 60;
        
        const segmentPath = await this.processSegment(segment, tempDir, i, config);
        segmentPaths.push(segmentPath);
      }

      job.progress = 85;
      console.log('Concatenando segmentos...');

      // Concatenar todos os segmentos
      await this.concatenateSegments(segmentPaths, outputPath, config);

      job.status = 'completed';
      job.progress = 100;
      job.outputFile = outputFilename;
      job.fileSize = fs.statSync(outputPath).size;
      job.completedAt = new Date().toISOString();
      job.downloadUrl = `/api/download/${jobId}`;

      // Limpar arquivos temporários
      fs.rmSync(tempDir, { recursive: true, force: true });

      console.log(`Job ${jobId} concluído com sucesso`);

    } catch (error) {
      console.error(`Erro no job ${jobId}:`, error);
      const job = videoJobs.get(jobId);
      job.status = 'error';
      job.error = error.message;
    }
  }

  async processSegment(segment, tempDir, index, config) {
    const duration = segment.duration || 3;
    const [width, height] = config.resize.split('x').map(Number);
    
    if (segment.type === 'image') {
      // Criar imagem com texto sobreposto
      const imagePath = await this.createImageWithText(segment, tempDir, index, width, height);
      
      // Converter imagem para vídeo
      const videoPath = path.join(tempDir, `segment_${index}.mp4`);
      
      return new Promise((resolve, reject) => {
        ffmpeg(imagePath)
          .inputOptions(['-loop 1'])
          .outputOptions([
            '-c:v libx264',
            '-t ' + duration,
            `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
            '-pix_fmt yuv420p',
            '-r ' + (config.fps || 30)
          ])
          .output(videoPath)
          .on('end', () => resolve(videoPath))
          .on('error', reject)
          .run();
      });
    } else if (segment.type === 'video') {
      // Processar vídeo existente
      const videoPath = path.join(tempDir, `segment_${index}.mp4`);
      
      return new Promise((resolve, reject) => {
        ffmpeg(segment.mediaUrl)
          .outputOptions([
            '-c:v libx264',
            `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
            '-pix_fmt yuv420p',
            '-r ' + (config.fps || 30)
          ])
          .output(videoPath)
          .on('end', () => resolve(videoPath))
          .on('error', reject)
          .run();
      });
    }
  }

  async createImageWithText(segment, tempDir, index, width, height) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fundo preto
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Carregar e desenhar imagem de fundo
    if (segment.mediaUrl) {
      try {
        const image = await loadImage(segment.mediaUrl);
        
        // Calcular dimensões mantendo proporção
        const imageAspect = image.width / image.height;
        const canvasAspect = width / height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspect > canvasAspect) {
          drawWidth = width;
          drawHeight = width / imageAspect;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        } else {
          drawHeight = height;
          drawWidth = height * imageAspect;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
      }
    }

    // Adicionar texto se especificado
    if (segment.text) {
      const fontSize = segment.fontSize || 50;
      const fontColor = segment.fontColor || '#ffffff';
      
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Posição do texto
      let textY;
      switch (segment.textPosition) {
        case 'top':
          textY = fontSize;
          break;
        case 'bottom':
          textY = height - fontSize;
          break;
        default:
          textY = height / 2;
      }
      
      // Quebrar texto em linhas
      const lines = this.wrapText(ctx, segment.text, width - 40);
      const lineHeight = fontSize * 1.2;
      const startY = textY - (lines.length - 1) * lineHeight / 2;
      
      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight);
      });
    }

    // Salvar imagem
    const imagePath = path.join(tempDir, `image_${index}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);
    
    return imagePath;
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  async concatenateSegments(segmentPaths, outputPath, config) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      
      segmentPaths.forEach(segmentPath => {
        command.input(segmentPath);
      });
      
      command
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',
          '-r ' + (config.fps || 30)
        ])
        .complexFilter([
          segmentPaths.map((_, i) => `[${i}:v]`).join('') + `concat=n=${segmentPaths.length}:v=1[outv]`
        ])
        .outputOptions(['-map [outv]'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }
}

const processor = new VideoProcessor();

// Endpoints da API

// Criar vídeo
app.post('/api/create-video', async (req, res) => {
  try {
    const config = req.body;
    
    if (!config || (!config.segments && !config.template_id) ) {
      return res.status(400).json({ 
        error: 'Configuração inválida: segmentos ou template_id são obrigatórios' 
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

  if (!job) {
    return res.status(404).json({ error: 'Job não encontrado' });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Vídeo ainda não está pronto' });
  }

  const filePath = path.join(__dirname, 'outputs', job.outputFile);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arquivo não encontrado' });
  }

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="video_${jobId}.mp4"`);
  res.setHeader('Content-Length', fs.statSync(filePath).size);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on('error', (error) => {
    console.error('Erro ao enviar arquivo:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao enviar arquivo' });
    }
  });
});

// Templates CRUD
app.post('/api/templates', (req, res) => {
  try {
    const template = req.body;
    const templateId = uuidv4();
    
    template.id = templateId;
    template.created_at = new Date().toISOString();
    
    templates.set(templateId, template);
    
    res.json({
      success: true,
      template_id: templateId,
      message: 'Template salvo com sucesso'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/templates', (req, res) => {
  const templateList = Array.from(templates.values());
  res.json(templateList);
});

app.get('/api/templates/:templateId', (req, res) => {
  const { templateId } = req.params;
  const template = templates.get(templateId);
  
  if (!template) {
    return res.status(404).json({ error: 'Template não encontrado' });
  }
  
  res.json(template);
});

app.put('/api/templates/:templateId', (req, res) => {
  const { templateId } = req.params;
  const template = templates.get(templateId);
  
  if (!template) {
    return res.status(404).json({ error: 'Template não encontrado' });
  }
  
  const updatedTemplate = { ...template, ...req.body, updated_at: new Date().toISOString() };
  templates.set(templateId, updatedTemplate);
  
  res.json({ success: true, message: 'Template atualizado com sucesso' });
});

app.delete('/api/templates/:templateId', (req, res) => {
  const { templateId } = req.params;
  
  if (!templates.has(templateId)) {
    return res.status(404).json({ error: 'Template não encontrado' });
  }
  
  templates.delete(templateId);
  res.json({ success: true, message: 'Template deletado com sucesso' });
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
  console.log('🎬 ClipCraft API Server com FFmpeg');
  console.log(`📍 Servidor rodando em: http://localhost:${PORT}`);
  console.log('📋 Endpoints disponíveis:');
  console.log('   POST /api/create-video - Criar vídeo');
  console.log('   GET  /api/job-status/:id - Status do job');
  console.log('   GET  /api/download/:id - Download do vídeo');
  console.log('   POST /api/templates - Salvar template');
  console.log('   GET  /api/templates - Listar templates');
  console.log('   PUT  /api/templates/:id - Atualizar template');
  console.log('   DELETE /api/templates/:id - Deletar template');
});
