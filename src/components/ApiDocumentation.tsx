
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, ExternalLink, Play, Zap, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApiDocumentation = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência",
    });
  };

  const endpoints = [
    {
      method: "POST",
      path: "/api/create-video",
      description: "Criar um novo vídeo usando um template",
      body: `{
  "template_id": "550e8400-e29b-41d4-a716-446655440000",
  "variables": {
    "$text_1": "Promoção Especial 50% OFF!",
    "$image_1": "https://exemplo.com/produto.jpg",
    "$video_1": "https://exemplo.com/video-fundo.mp4"
  },
  "resize": "1080x1080",
  "fps": 30
}`,
      response: `{
  "job_id": "abc123",
  "status": "queued",
  "message": "Vídeo em processamento",
  "template_id": "550e8400-e29b-41d4-a716-446655440000",
  "estimated_duration": 45
}`
    },
    {
      method: "POST",
      path: "/api/create-video",
      description: "Criar vídeo com segmentos personalizados (sem template)",
      body: `{
  "segments": [
    {
      "image_url": "https://exemplo.com/imagem.jpg",
      "duration": 5,
      "text": "Texto sobreposto",
      "text_position": "center",
      "font_size": 50,
      "font_color": "white",
      "transition_in": "fadein"
    }
  ],
  "background_audio_url": "https://exemplo.com/audio.mp3",
  "resize": "1080x1080",
  "fps": 30
}`,
      response: `{
  "job_id": "def456",
  "status": "queued",
  "message": "Vídeo em processamento"
}`
    },
    {
      method: "GET",
      path: "/api/job-status/{job_id}",
      description: "Verificar status do job",
      response: `{
  "job_id": "abc123",
  "status": "completed",
  "progress": 100,
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:31:45Z",
  "download_url": "/api/download/abc123",
  "file_size": 15680000,
  "template_id": "550e8400-e29b-41d4-a716-446655440000",
  "duration": 10.5
}`
    },
    {
      method: "GET",
      path: "/api/download/{job_id}",
      description: "Baixar vídeo processado",
      response: "Arquivo MP4 (application/octet-stream)"
    },
    {
      method: "GET",
      path: "/api/templates",
      description: "Listar todos os templates disponíveis",
      response: `{
  "templates": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Post Promocional",
      "description": "Template para posts promocionais com texto e imagem",
      "width": 1080,
      "height": 1080,
      "fps": 30,
      "variables": {
        "$text_1": {
          "type": "text",
          "description": "Título principal",
          "defaultValue": "Seu Texto Aqui"
        },
        "$image_1": {
          "type": "image",
          "description": "Imagem do produto",
          "defaultValue": "https://exemplo.com/placeholder.jpg"
        }
      },
      "segments": 2,
      "estimated_duration": 10
    }
  ]
}`
    },
    {
      method: "GET",
      path: "/api/templates/{template_id}",
      description: "Obter detalhes de um template específico",
      response: `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Post Promocional",
  "description": "Template para posts promocionais",
  "width": 1080,
  "height": 1080,
  "fps": 30,
  "variables": {
    "$text_1": {
      "type": "text",
      "description": "Título principal",
      "defaultValue": "Seu Texto Aqui"
    },
    "$image_1": {
      "type": "image", 
      "description": "Imagem do produto",
      "defaultValue": "https://exemplo.com/placeholder.jpg"
    }
  },
  "segments": [
    {
      "id": "segment-1",
      "name": "Intro",
      "duration": 3,
      "elements": [
        {
          "type": "text",
          "variable": "$text_1",
          "x": 100,
          "y": 200,
          "fontSize": 48
        }
      ]
    }
  ]
}`
    }
  ];

  const codeExamples = {
    curl: `# Criar vídeo com template
curl -X POST https://api.clipcraft.com/api/create-video \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "550e8400-e29b-41d4-a716-446655440000",
    "variables": {
      "$text_1": "Oferta Especial!",
      "$image_1": "https://meusite.com/produto.jpg"
    },
    "resize": "1080x1080",
    "fps": 30
  }'

# Verificar status
curl https://api.clipcraft.com/api/job-status/abc123

# Baixar vídeo
curl -O https://api.clipcraft.com/api/download/abc123

# Listar templates
curl https://api.clipcraft.com/api/templates

# Obter template específico
curl https://api.clipcraft.com/api/templates/550e8400-e29b-41d4-a716-446655440000`,

    javascript: `// Listar templates disponíveis
const templatesResponse = await fetch('/api/templates');
const { templates } = await templatesResponse.json();

// Selecionar um template
const template = templates[0];
console.log('Template selecionado:', template.name);
console.log('Variáveis necessárias:', Object.keys(template.variables));

// Criar vídeo usando template
const response = await fetch('/api/create-video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    template_id: template.id,
    variables: {
      '$text_1': 'Minha Promoção Especial!',
      '$image_1': 'https://meusite.com/imagem-produto.jpg',
      '$video_1': 'https://meusite.com/video-fundo.mp4'
    },
    resize: \`\${template.width}x\${template.height}\`,
    fps: template.fps
  })
});

const { job_id } = await response.json();

// Monitorar progresso
const checkStatus = async () => {
  const statusResponse = await fetch(\`/api/job-status/\${job_id}\`);
  const status = await statusResponse.json();
  
  console.log(\`Progresso: \${status.progress}%\`);
  
  if (status.status === 'completed') {
    console.log('Vídeo pronto!');
    window.open(status.download_url);
    return true;
  } else if (status.status === 'error') {
    console.error('Erro:', status.error);
    return true;
  }
  
  return false;
};

// Verificar a cada 2 segundos
const interval = setInterval(async () => {
  const completed = await checkStatus();
  if (completed) {
    clearInterval(interval);
  }
}, 2000);`,

    python: `import requests
import time
import json

# Listar templates disponíveis
templates_response = requests.get("https://api.clipcraft.com/api/templates")
templates = templates_response.json()["templates"]

# Selecionar template
template = templates[0]
print(f"Template selecionado: {template['name']}")
print(f"Variáveis necessárias: {list(template['variables'].keys())}")

# Criar vídeo usando template
payload = {
    "template_id": template["id"],
    "variables": {
        "$text_1": "Promoção Especial 70% OFF!",
        "$image_1": "https://meusite.com/produto.jpg",
        "$video_1": "https://meusite.com/video.mp4"
    },
    "resize": f"{template['width']}x{template['height']}",
    "fps": template["fps"]
}

response = requests.post(
    "https://api.clipcraft.com/api/create-video",
    json=payload
)
job_id = response.json()["job_id"]
print(f"Job criado: {job_id}")

# Monitorar progresso
while True:
    status_response = requests.get(
        f"https://api.clipcraft.com/api/job-status/{job_id}"
    )
    status = status_response.json()
    
    print(f"Status: {status['status']} - Progresso: {status['progress']}%")
    
    if status["status"] == "completed":
        # Baixar vídeo
        video_response = requests.get(status["download_url"])
        filename = f"video_{job_id}.mp4"
        with open(filename, "wb") as f:
            f.write(video_response.content)
        print(f"Vídeo salvo como: {filename}")
        break
    elif status["status"] == "error":
        print(f"Erro: {status.get('error', 'Erro desconhecido')}")
        break
    
    time.sleep(2)`,

    n8n: `{
  "nodes": [
    {
      "name": "Get Templates",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.clipcraft.com/api/templates",
        "requestMethod": "GET"
      }
    },
    {
      "name": "Select Template",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "template_id",
              "value": "={{$json.templates[0].id}}"
            }
          ]
        }
      }
    },
    {
      "name": "Create Video with Template",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.clipcraft.com/api/create-video",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": {
          "template_id": "={{$json.template_id}}",
          "variables": {
            "$text_1": "{{$json.product_name}}",
            "$image_1": "{{$json.product_image}}",
            "$video_1": "{{$json.background_video}}"
          },
          "resize": "1080x1080",
          "fps": 30
        }
      }
    },
    {
      "name": "Check Status Loop",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.clipcraft.com/api/job-status/{{$json.job_id}}",
        "requestMethod": "GET"
      }
    },
    {
      "name": "Wait",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 5,
        "unit": "seconds"
      }
    },
    {
      "name": "Download Video",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$json.download_url}}",
        "requestMethod": "GET",
        "responseFormat": "file"
      }
    }
  ]
}`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Documentação da API
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          Integre o ClipCraft com seus sistemas de automação usando nossa API RESTful. 
          Crie vídeos usando templates personalizados ou construa do zero.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-green-100 text-green-700">
            <Zap className="w-3 h-3 mr-1" />
            API v1.0
          </Badge>
          <Badge variant="outline">Base URL: https://api.clipcraft.com</Badge>
          <Badge className="bg-blue-100 text-blue-700">
            <Database className="w-3 h-3 mr-1" />
            Templates Suportados
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
        </TabsList>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          {endpoints.map((endpoint, index) => (
            <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      endpoint.method === 'POST' ? 'default' :
                      endpoint.method === 'GET' ? 'secondary' :
                      'outline'
                    }>
                      {endpoint.method}
                    </Badge>
                    <code className="text-lg font-mono">{endpoint.path}</code>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(endpoint.path)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoint.body && (
                  <div>
                    <h4 className="font-medium mb-2">Request Body:</h4>
                    <div className="relative">
                      <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                        <code>{endpoint.body}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(endpoint.body!)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Response:</h4>
                  <div className="relative">
                    <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                      <code>{endpoint.response}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(endpoint.response)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Trabalhando com Templates</span>
              </CardTitle>
              <CardDescription>
                Templates permitem criar vídeos de forma consistente e eficiente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">1. Listar Templates</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                    <code>GET /api/templates</code>
                  </pre>
                  <p className="text-sm text-gray-600 mt-2">
                    Retorna todos os templates disponíveis com suas variáveis
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">2. Obter Template Específico</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                    <code>GET /api/templates/{`{id}`}</code>
                  </pre>
                  <p className="text-sm text-gray-600 mt-2">
                    Detalhes completos do template incluindo segmentos e elementos
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">3. Criar Vídeo com Template</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                    <code>POST /api/create-video</code>
                  </pre>
                  <p className="text-sm text-gray-600 mt-2">
                    Use template_id e forneça valores para as variáveis
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">4. Monitorar Progresso</h4>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm">
                    <code>GET /api/job-status/{`{job_id}`}</code>
                  </pre>
                  <p className="text-sm text-gray-600 mt-2">
                    Acompanhe o status e progresso do processamento
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">💡 Dicas para Templates</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Sempre liste os templates primeiro para ver as variáveis disponíveis</li>
                  <li>• Variáveis começam com $ (ex: $text_1, $image_1)</li>
                  <li>• Respeite os tipos: text para textos, image/video para mídias</li>
                  <li>• Use as dimensões do template ou especifique resize</li>
                  <li>• Templates aceleram muito o processo de criação</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Fluxo Completo com Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-medium">Listar Templates</div>
                    <div className="text-sm text-gray-600">GET /api/templates</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-medium">Escolher Template</div>
                    <div className="text-sm text-gray-600">Analisar variáveis necessárias</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-medium">Criar Vídeo</div>
                    <div className="text-sm text-gray-600">POST /api/create-video com template_id e variables</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <div className="font-medium">Monitorar Status</div>
                    <div className="text-sm text-gray-600">GET /api/job-status/{`{job_id}`} até completed</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <div className="font-medium">Baixar Vídeo</div>
                    <div className="text-sm text-gray-600">GET download_url do status</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="n8n">n8n</TabsTrigger>
            </TabsList>

            {Object.entries(codeExamples).map(([lang, code]) => (
              <TabsContent key={lang} value={lang}>
                <Card className="border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Code className="w-5 h-5" />
                        <span>Exemplo em {lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                      <code>{code}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Integration Guides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Templates vs Segmentos</span>
                </CardTitle>
                <CardDescription>
                  Quando usar cada abordagem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded">
                  <div className="font-medium text-green-800">Use Templates quando:</div>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• Criar vídeos similares repetidamente</li>
                    <li>• Quiser manter consistência visual</li>
                    <li>• Tiver um layout padrão definido</li>
                    <li>• Precisar de eficiência e velocidade</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium text-blue-800">Use Segmentos quando:</div>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Cada vídeo for único</li>
                    <li>• Precisar de controle total</li>
                    <li>• Layouts forem muito variados</li>
                    <li>• Experimentar novos designs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Teste Rápido</span>
                </CardTitle>
                <CardDescription>
                  Teste a API com templates em segundos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <code className="text-sm">
                    curl https://api.clipcraft.com/api/templates
                  </code>
                </div>
                <p className="text-sm text-gray-600">
                  Execute este comando para ver todos os templates disponíveis e suas variáveis.
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                  <Play className="w-4 h-4 mr-2" />
                  Testar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schemas Tab */}
        <TabsContent value="schemas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>VideoSegment Schema</CardTitle>
                <CardDescription>Estrutura de um segmento de vídeo</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`{
  "image_url": "string (required)",
  "video_url": "string (optional)",
  "duration": "number (required for images)",
  "start_time": "number (optional)",
  "end_time": "number (optional)",
  "text": "string (optional)",
  "text_position": "center|top|bottom",
  "font_size": "number (20-100)",
  "font_color": "string (hex color)",
  "transition_in": "fadein|fadeout|crossfadein",
  "transition_duration": "number (seconds)",
  "overlays": [
    {
      "image_url": "string",
      "position": "center|top|bottom|left|right",
      "size": [width, height],
      "duration": "number"
    }
  ]
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>VideoConfig Schema</CardTitle>
                <CardDescription>Configuração completa do vídeo</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`{
  "segments": "VideoSegment[] (required)",
  "background_audio_url": "string (optional)",
  "resize": "string (e.g., '1080x1080')",
  "fps": "number (24|30|60)",
  "max_duration": "number (seconds, max 90)"
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>JobStatus Schema</CardTitle>
                <CardDescription>Status de processamento do job</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`{
  "job_id": "string",
  "status": "queued|processing|completed|error",
  "progress": "number (0-100)",
  "created_at": "string (ISO 8601)",
  "completed_at": "string (ISO 8601, optional)",
  "download_url": "string (when completed)",
  "file_size": "number (bytes, when completed)",
  "error": "string (when error)"
}`}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Error Schema</CardTitle>
                <CardDescription>Formato de respostas de erro</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`{
  "error": "string (error message)",
  "code": "string (error code)",
  "details": "object (optional)"
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Status Codes */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Códigos de Status HTTP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code>200 OK</code>
                    <span className="text-sm text-gray-600">Sucesso</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code>201 Created</code>
                    <span className="text-sm text-gray-600">Job criado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code>400 Bad Request</code>
                    <span className="text-sm text-gray-600">Dados inválidos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code>404 Not Found</code>
                    <span className="text-sm text-gray-600">Job não encontrado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code>429 Too Many Requests</code>
                    <span className="text-sm text-gray-600">Rate limit</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <code>500 Internal Error</code>
                    <span className="text-sm text-gray-600">Erro do servidor</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
