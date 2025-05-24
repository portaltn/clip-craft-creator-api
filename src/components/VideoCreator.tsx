import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, Download, Plus, Trash2, Upload, Wand2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SocialMediaTemplates } from "@/components/SocialMediaTemplates";

interface VideoSegment {
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

interface VideoJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
}

export const VideoCreator = () => {
  const { toast } = useToast();
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [currentJob, setCurrentJob] = useState<VideoJob | null>(null);
  const [globalSettings, setGlobalSettings] = useState({
    backgroundAudio: '',
    resize: '1080x1080',
    fps: 30
  });

  const addSegment = () => {
    const newSegment: VideoSegment = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'image',
      mediaUrl: '',
      duration: 3,
      text: '',
      textPosition: 'center',
      fontSize: 50,
      fontColor: '#ffffff',
      transition: 'fadein'
    };
    setSegments([...segments, newSegment]);
  };

  const updateSegment = (id: string, updates: Partial<VideoSegment>) => {
    setSegments(segments.map(segment => 
      segment.id === id ? { ...segment, ...updates } : segment
    ));
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(segment => segment.id !== id));
  };

  const applyTemplate = (templateSegments: VideoSegment[], templateGlobalSettings: any) => {
    setSegments(templateSegments);
    setGlobalSettings(templateGlobalSettings);
    toast({
      title: "Template Aplicado",
      description: "Template carregado com sucesso! Você pode personalizar os elementos.",
    });
  };

  const createVideo = async () => {
    if (segments.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um segmento ao vídeo",
        variant: "destructive",
      });
      return;
    }

    // Simular criação de vídeo
    const jobId = Math.random().toString(36).substr(2, 9);
    const newJob: VideoJob = {
      id: jobId,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setCurrentJob(newJob);

    toast({
      title: "Vídeo em Processamento",
      description: `Job ID: ${jobId}`,
    });

    // Simular progresso
    const progressInterval = setInterval(() => {
      setCurrentJob(prev => {
        if (!prev) return prev;
        
        const newProgress = Math.min(prev.progress + Math.random() * 15, 100);
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return {
            ...prev,
            status: 'completed',
            progress: 100,
            downloadUrl: `/api/download/${jobId}`
          };
        }
        
        return {
          ...prev,
          status: 'processing',
          progress: newProgress
        };
      });
    }, 1000);
  };

  const downloadVideo = () => {
    if (currentJob?.downloadUrl) {
      toast({
        title: "Download Iniciado",
        description: "Seu vídeo está sendo baixado",
      });
    }
  };

  const resetJob = () => {
    setCurrentJob(null);
  };

  const socialMediaResolutions = [
    { value: '1080x1080', label: 'Instagram Post (1:1)' },
    { value: '1080x1920', label: 'Instagram Stories (9:16)' },
    { value: '1080x1350', label: 'Instagram Feed (4:5)' },
    { value: '1920x1080', label: 'YouTube (16:9)' }
  ];

  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="templates" className="flex items-center space-x-2">
          <Palette className="w-4 h-4" />
          <span>Templates</span>
        </TabsTrigger>
        <TabsTrigger value="custom" className="flex items-center space-x-2">
          <Wand2 className="w-4 h-4" />
          <span>Personalizado</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="templates">
        <SocialMediaTemplates onApplyTemplate={applyTemplate} />
      </TabsContent>

      <TabsContent value="custom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5" />
                  <span>Configuração do Vídeo</span>
                </CardTitle>
                <CardDescription>
                  Configure os segmentos e elementos do seu vídeo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Global Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="backgroundAudio">Áudio de Fundo</Label>
                    <Input
                      id="backgroundAudio"
                      placeholder="URL do áudio"
                      value={globalSettings.backgroundAudio}
                      onChange={(e) => setGlobalSettings({
                        ...globalSettings,
                        backgroundAudio: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="resize">Formato</Label>
                    <Select value={globalSettings.resize} onValueChange={(value) => 
                      setGlobalSettings({ ...globalSettings, resize: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {socialMediaResolutions.map((res) => (
                          <SelectItem key={res.value} value={res.value}>
                            {res.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fps">FPS</Label>
                    <Select value={globalSettings.fps.toString()} onValueChange={(value) => 
                      setGlobalSettings({ ...globalSettings, fps: parseInt(value) })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 FPS</SelectItem>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Segments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Segmentos do Vídeo</h3>
                    <Button onClick={addSegment} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Segmento
                    </Button>
                  </div>

                  {segments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum segmento adicionado</p>
                      <p className="text-sm">Use um template ou adicione segmentos manualmente</p>
                    </div>
                  ) : (
                    segments.map((segment, index) => (
                      <Card key={segment.id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">Segmento {index + 1}</Badge>
                              <Badge variant={segment.type === 'image' ? 'secondary' : 'default'}>
                                {segment.type === 'image' ? 'Imagem' : 'Vídeo'}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSegment(segment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Tipo de Mídia</Label>
                              <Select
                                value={segment.type}
                                onValueChange={(value: 'image' | 'video') =>
                                  updateSegment(segment.id, { type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="image">Imagem</SelectItem>
                                  <SelectItem value="video">Vídeo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>URL da Mídia</Label>
                              <Input
                                placeholder="https://exemplo.com/media"
                                value={segment.mediaUrl}
                                onChange={(e) =>
                                  updateSegment(segment.id, { mediaUrl: e.target.value })
                                }
                              />
                            </div>
                            {segment.type === 'image' && (
                              <div>
                                <Label>Duração (segundos)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={segment.duration}
                                  onChange={(e) =>
                                    updateSegment(segment.id, { duration: parseInt(e.target.value) })
                                  }
                                />
                              </div>
                            )}
                            <div>
                              <Label>Transição</Label>
                              <Select
                                value={segment.transition}
                                onValueChange={(value) =>
                                  updateSegment(segment.id, { transition: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fadein">Fade In</SelectItem>
                                  <SelectItem value="fadeout">Fade Out</SelectItem>
                                  <SelectItem value="crossfadein">Cross Fade In</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Texto Sobreposto</Label>
                            <Textarea
                              placeholder="Texto que aparecerá sobre a mídia"
                              value={segment.text}
                              onChange={(e) =>
                                updateSegment(segment.id, { text: e.target.value })
                              }
                            />
                          </div>

                          {segment.text && (
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Posição do Texto</Label>
                                <Select
                                  value={segment.textPosition}
                                  onValueChange={(value) =>
                                    updateSegment(segment.id, { textPosition: value })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="top">Topo</SelectItem>
                                    <SelectItem value="bottom">Rodapé</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Tamanho da Fonte</Label>
                                <Input
                                  type="number"
                                  min="20"
                                  max="100"
                                  value={segment.fontSize}
                                  onChange={(e) =>
                                    updateSegment(segment.id, { fontSize: parseInt(e.target.value) })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Cor da Fonte</Label>
                                <Input
                                  type="color"
                                  value={segment.fontColor}
                                  onChange={(e) =>
                                    updateSegment(segment.id, { fontColor: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <Button 
                  onClick={createVideo} 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={segments.length === 0 || currentJob?.status === 'processing'}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Criar Vídeo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Status do Job</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!currentJob ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum job ativo</p>
                    <p className="text-sm">Configure e crie um vídeo para ver o status</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Job ID:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{currentJob.id}</code>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {currentJob.status === 'queued' && <Clock className="w-4 h-4 text-orange-500" />}
                      {currentJob.status === 'processing' && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                      {currentJob.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {currentJob.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      
                      <Badge variant={
                        currentJob.status === 'completed' ? 'default' :
                        currentJob.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {currentJob.status === 'queued' ? 'Na Fila' :
                         currentJob.status === 'processing' ? 'Processando' :
                         currentJob.status === 'completed' ? 'Concluído' :
                         'Erro'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{Math.round(currentJob.progress)}%</span>
                      </div>
                      <Progress value={currentJob.progress} className="w-full" />
                    </div>

                    {currentJob.status === 'completed' && (
                      <div className="space-y-2">
                        <Button onClick={downloadVideo} className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Vídeo
                        </Button>
                        <Button onClick={resetJob} variant="outline" className="w-full">
                          Criar Novo Vídeo
                        </Button>
                      </div>
                    )}

                    {currentJob.status === 'error' && (
                      <div className="space-y-2">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700">{currentJob.error || 'Erro desconhecido'}</p>
                        </div>
                        <Button onClick={resetJob} variant="outline" className="w-full">
                          Tentar Novamente
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Templates Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const template: VideoSegment = {
                      id: Math.random().toString(36).substr(2, 9),
                      type: 'image',
                      mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
                      duration: 5,
                      text: 'Promoção Especial!',
                      textPosition: 'center',
                      fontSize: 60,
                      fontColor: '#ffffff',
                      transition: 'fadein'
                    };
                    setSegments([template]);
                  }}
                >
                  Post Promocional
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const templates: VideoSegment[] = [
                      {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'image',
                        mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
                        duration: 3,
                        text: 'Produto 1',
                        textPosition: 'bottom',
                        fontSize: 50,
                        fontColor: '#ffffff',
                        transition: 'fadein'
                      },
                      {
                        id: Math.random().toString(36).substr(2, 9),
                        type: 'image',
                        mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                        duration: 3,
                        text: 'Produto 2',
                        textPosition: 'bottom',
                        fontSize: 50,
                        fontColor: '#ffffff',
                        transition: 'fadein'
                      }
                    ];
                    setSegments(templates);
                  }}
                >
                  Slideshow Produtos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
