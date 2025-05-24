
# ClipCraft - Sistema de Criação de Vídeos

Sistema completo para criação de vídeos curtos para redes sociais com API própria.

## Funcionalidades

- ✅ Criação de vídeos nos formatos 1:1, 9:16, 4:5 e 16:9
- ✅ Templates otimizados para redes sociais
- ✅ API RESTful completa
- ✅ Painel administrativo
- ✅ Processamento assíncrono com status em tempo real
- ✅ Upload e download de arquivos
- ✅ Documentação da API interativa

## Instalação

### Frontend (React)
```bash
npm install
npm run dev
```

### Backend (Node.js API)
```bash
cd server
npm install
npm start
```

## Endpoints da API

### Criação de Vídeos
- `POST /api/create-video` - Criar novo vídeo
- `GET /api/job-status/:id` - Status do processamento
- `GET /api/download/:id` - Download do vídeo

### Gerenciamento
- `GET /api/jobs` - Listar todos os jobs
- `DELETE /api/jobs/:id` - Deletar job
- `POST /api/upload` - Upload de arquivo
- `GET /api/health` - Health check

### Templates
- `GET /api/templates` - Templates disponíveis

## Estrutura do Projeto

```
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── lib/               # API client e utilitários
│   └── pages/             # Páginas da aplicação
├── server/                # Backend API
│   ├── index.js          # Servidor Express
│   ├── package.json      # Dependências do backend
│   ├── uploads/          # Arquivos enviados
│   ├── outputs/          # Vídeos processados
│   └── temp/             # Arquivos temporários
└── README.md
```

## Uso da API

### Exemplo: Criar vídeo
```javascript
const config = {
  segments: [
    {
      id: "seg1",
      type: "image",
      mediaUrl: "https://exemplo.com/imagem.jpg",
      duration: 5,
      text: "Meu Texto",
      textPosition: "center",
      fontSize: 60,
      fontColor: "#ffffff"
    }
  ],
  resize: "1080x1080",
  fps: 30
};

const response = await fetch('/api/create-video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(config)
});

const { job_id } = await response.json();
```

### Exemplo: Verificar status
```javascript
const status = await fetch(`/api/job-status/${job_id}`);
const jobData = await status.json();

if (jobData.status === 'completed') {
  // Download disponível em jobData.download_url
}
```

## Configuração para Produção

1. Configure as variáveis de ambiente
2. Altere a URL base da API em `src/lib/api.ts`
3. Configure proxy reverso (nginx/apache)
4. Configure SSL/HTTPS

## Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query

### Backend
- Node.js
- Express
- Multer (upload de arquivos)
- CORS

## Licença

MIT License
