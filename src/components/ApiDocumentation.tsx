
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, ExternalLink, Play, Zap } from "lucide-react";
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
      description: "Criar um novo vídeo",
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
  "job_id": "abc123",
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
  "download_url": "/api/download/abc123",
  "file_size": 15680000
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
      description: "Listar templates disponíveis",
      response: `{
  "post_promocional": {
    "name": "Post Promocional",
    "description": "Template para posts promocionais",
    "segments": [...]
  }
}`
    }
  ];

  const codeExamples = {
    curl: `# Criar vídeo
curl -X POST https://api.clipcraft.com/api/create-video \\
  -H "Content-Type: application/json" \\
  -d '{
    "segments": [
      {
        "image_url": "https://exemplo.com/imagem.jpg",
        "duration": 5,
        "text": "Promoção Especial!",
        "text_position": "center"
      }
    ]
  }'

# Verificar status
curl https://api.clipcraft.com/api/job-status/{job_id}

# Baixar vídeo
curl -O https://api.clipcraft.com/api/download/{job_id}`,

    javascript: `// Criar vídeo
const response = await fetch('/api/create-video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    segments: [
      {
        image_url: 'https://exemplo.com/imagem.jpg',
        duration: 5,
        text: 'Promoção Especial!',
        text_position: 'center'
      }
    ]
  })
});

const { job_id } = await response.json();

// Verificar status
const checkStatus = async () => {
  const statusResponse = await fetch(\`/api/job-status/\${job_id}\`);
  const status = await statusResponse.json();
  return status;
};

// Baixar quando completo
if (status.status === 'completed') {
  window.open(status.download_url);
}`,

    python: `import requests
import time

# Criar vídeo
payload = {
    "segments": [
        {
            "image_url": "https://exemplo.com/imagem.jpg",
            "duration": 5,
            "text": "Promoção Especial!",
            "text_position": "center"
        }
    ]
}

response = requests.post(
    "https://api.clipcraft.com/api/create-video",
    json=payload
)
job_id = response.json()["job_id"]

# Aguardar conclusão
while True:
    status_response = requests.get(
        f"https://api.clipcraft.com/api/job-status/{job_id}"
    )
    status = status_response.json()
    
    if status["status"] == "completed":
        # Baixar vídeo
        video_response = requests.get(status["download_url"])
        with open(f"video_{job_id}.mp4", "wb") as f:
            f.write(video_response.content)
        break
    
    time.sleep(2)`,

    n8n: `{
  "nodes": [
    {
      "name": "Create Video",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.clipcraft.com/api/create-video",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": {
          "segments": [
            {
              "image_url": "{{$json.image_url}}",
              "duration": 5,
              "text": "{{$json.product_name}}",
              "text_position": "center"
            }
          ]
        }
      }
    },
    {
      "name": "Check Status",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.clipcraft.com/api/job-status/{{$json.job_id}}",
        "requestMethod": "GET"
      }
    },
    {
      "name": "Wait for Completion",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "amount": 5,
        "unit": "seconds"
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
          Integre o ClipCraft com seus sistemas de automação usando nossa API RESTful simples e poderosa.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-green-100 text-green-700">
            <Zap className="w-3 h-3 mr-1" />
            API v1.0
          </Badge>
          <Badge variant="outline">Base URL: https://api.clipcraft.com</Badge>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
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
                  <Zap className="w-5 h-5" />
                  <span>Integração com n8n</span>
                </CardTitle>
                <CardDescription>
                  Automatize a criação de vídeos com workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Adicione um nó HTTP Request</li>
                  <li>Configure o endpoint de criação</li>
                  <li>Use um nó Wait para aguardar</li>
                  <li>Verifique o status periodicamente</li>
                  <li>Baixe o vídeo quando pronto</li>
                </ol>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Tutorial Completo
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Teste Interativo</span>
                </CardTitle>
                <CardDescription>
                  Teste a API diretamente no navegador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Use nosso playground interativo para testar chamadas à API sem precisar escrever código.
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                  <Play className="w-4 h-4 mr-2" />
                  Abrir Playground
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
