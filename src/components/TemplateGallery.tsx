
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Play, Copy, Palette, Image, Video, Zap, Heart, ShoppingBag, Calendar, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  duration: string;
  segments: number;
  tags: string[];
  variables: string[];
  config: any;
}

export const TemplateGallery = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const templates: Template[] = [
    {
      id: 'promo-post',
      name: 'Post Promocional',
      description: 'Template moderno para promoções e ofertas especiais com texto destacado e logo',
      category: 'marketing',
      preview: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
      duration: '5s',
      segments: 1,
      tags: ['Promoção', 'Instagram', 'Quadrado'],
      variables: ['produto_nome', 'desconto', 'logo_url'],
      config: {
        segments: [
          {
            image_url: '{{background_image}}',
            duration: 5,
            text: '{{produto_nome}}\n{{desconto}}% OFF',
            text_position: 'center',
            font_size: 60,
            font_color: '#ffffff',
            overlays: [
              {
                image_url: '{{logo_url}}',
                position: 'bottom_right',
                size: [100, 100]
              }
            ]
          }
        ],
        resize: '1080x1080',
        fps: 30
      }
    },
    {
      id: 'product-slideshow',
      name: 'Slideshow de Produtos',
      description: 'Apresentação dinâmica de múltiplos produtos com transições suaves',
      category: 'ecommerce',
      preview: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      duration: '9s',
      segments: 3,
      tags: ['Produtos', 'E-commerce', 'Slideshow'],
      variables: ['produto1_imagem', 'produto1_nome', 'produto2_imagem', 'produto2_nome', 'produto3_imagem', 'produto3_nome'],
      config: {
        segments: [
          {
            image_url: '{{produto1_imagem}}',
            duration: 3,
            text: '{{produto1_nome}}',
            text_position: 'bottom',
            transition_in: 'fadein'
          },
          {
            image_url: '{{produto2_imagem}}',
            duration: 3,
            text: '{{produto2_nome}}',
            text_position: 'bottom',
            transition_in: 'fadein'
          },
          {
            image_url: '{{produto3_imagem}}',
            duration: 3,
            text: '{{produto3_nome}}',
            text_position: 'bottom',
            transition_in: 'fadein'
          }
        ],
        resize: '1080x1920',
        fps: 30
      }
    },
    {
      id: 'story-template',
      name: 'Instagram Stories',
      description: 'Template otimizado para stories com texto animado e call-to-action',
      category: 'social',
      preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      duration: '7s',
      segments: 2,
      tags: ['Stories', 'Instagram', 'Vertical'],
      variables: ['titulo', 'subtitulo', 'cta_texto', 'background_video'],
      config: {
        segments: [
          {
            video_url: '{{background_video}}',
            start_time: 0,
            end_time: 4,
            text: '{{titulo}}',
            text_position: 'top',
            font_size: 70
          },
          {
            image_url: '{{cta_background}}',
            duration: 3,
            text: '{{subtitulo}}\n\n{{cta_texto}}',
            text_position: 'center',
            font_size: 45
          }
        ],
        resize: '1080x1920',
        fps: 30
      }
    },
    {
      id: 'event-announcement',
      name: 'Anúncio de Evento',
      description: 'Template elegante para divulgação de eventos com data e local em destaque',
      category: 'events',
      preview: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
      duration: '8s',
      segments: 2,
      tags: ['Evento', 'Convite', 'Formal'],
      variables: ['evento_nome', 'data', 'local', 'background_image'],
      config: {
        segments: [
          {
            image_url: '{{background_image}}',
            duration: 5,
            text: '{{evento_nome}}',
            text_position: 'center',
            font_size: 65,
            font_color: '#ffffff'
          },
          {
            image_url: '{{background_image}}',
            duration: 3,
            text: '📅 {{data}}\n📍 {{local}}',
            text_position: 'bottom',
            font_size: 40,
            font_color: '#ffffff'
          }
        ],
        resize: '1080x1080',
        fps: 30
      }
    },
    {
      id: 'testimonial',
      name: 'Depoimento de Cliente',
      description: 'Template para exibir depoimentos com foto do cliente e estrelas de avaliação',
      category: 'testimonial',
      preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      duration: '6s',
      segments: 1,
      tags: ['Depoimento', 'Review', 'Cliente'],
      variables: ['cliente_foto', 'cliente_nome', 'depoimento', 'estrelas'],
      config: {
        segments: [
          {
            image_url: '{{background_gradient}}',
            duration: 6,
            text: '"{{depoimento}}"\n\n{{cliente_nome}}\n{{estrelas}}',
            text_position: 'center',
            font_size: 45,
            overlays: [
              {
                image_url: '{{cliente_foto}}',
                position: 'top',
                size: [120, 120]
              }
            ]
          }
        ],
        resize: '1080x1080',
        fps: 30
      }
    },
    {
      id: 'youtube-intro',
      name: 'Intro para YouTube',
      description: 'Introdução profissional para vídeos do YouTube com logo animado',
      category: 'video',
      preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      duration: '4s',
      segments: 1,
      tags: ['YouTube', 'Intro', 'Horizontal'],
      variables: ['canal_nome', 'logo_url', 'background_video'],
      config: {
        segments: [
          {
            video_url: '{{background_video}}',
            start_time: 0,
            end_time: 4,
            text: '{{canal_nome}}',
            text_position: 'center',
            font_size: 80,
            transition_in: 'fadein',
            overlays: [
              {
                image_url: '{{logo_url}}',
                position: 'center',
                size: [150, 150]
              }
            ]
          }
        ],
        resize: '1920x1080',
        fps: 30
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos', icon: Palette },
    { id: 'marketing', name: 'Marketing', icon: Megaphone },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingBag },
    { id: 'social', name: 'Social Media', icon: Heart },
    { id: 'events', name: 'Eventos', icon: Calendar },
    { id: 'testimonial', name: 'Depoimentos', icon: Heart },
    { id: 'video', name: 'Vídeo', icon: Video }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(JSON.stringify(template.config, null, 2));
    toast({
      title: "Template Copiado!",
      description: `Configuração do template "${template.name}" copiada para a área de transferência`,
    });
  };

  const useTemplate = (template: Template) => {
    toast({
      title: "Template Aplicado!",
      description: `Template "${template.name}" aplicado no criador de vídeos`,
    });
    // Aqui integraria com o VideoCreator
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Galeria de Templates
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Escolha entre nossos templates profissionais ou use-os como base para criar seus próprios designs.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-3 right-3 flex space-x-1">
                <Badge variant="secondary" className="bg-black/70 text-white">
                  {template.duration}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge variant="outline" className="bg-white/90">
                  {template.segments} segmento{template.segments > 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{template.name}</DialogTitle>
                      <DialogDescription>
                        {template.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Preview</h4>
                          <img
                            src={template.preview}
                            alt={template.name}
                            className="w-full rounded-lg border"
                          />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Variáveis do Template</h4>
                            <div className="space-y-2">
                              {template.variables.map((variable) => (
                                <div key={variable}>
                                  <Label htmlFor={variable} className="text-sm">
                                    {variable.replace(/_/g, ' ')}
                                  </Label>
                                  <Input
                                    id={variable}
                                    placeholder={`Insira ${variable.replace(/_/g, ' ')}`}
                                    className="text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => useTemplate(template)}
                              className="flex-1"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Usar Template
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => copyTemplate(template)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Configuração JSON</h4>
                        <pre className="bg-gray-50 border rounded-lg p-4 text-xs overflow-x-auto max-h-64">
                          <code>{JSON.stringify(template.config, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  onClick={() => useTemplate(template)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Usar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-600">
            Tente selecionar uma categoria diferente ou volte mais tarde para ver novos templates.
          </p>
        </div>
      )}

      {/* Create Custom Template CTA */}
      <Card className="border-0 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Precisa de um Template Personalizado?
          </h3>
          <p className="text-gray-600 mb-4 max-w-lg mx-auto">
            Crie seus próprios templates usando nosso editor visual ou entre em contato para templates customizados.
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline">
              Criar Template
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              Solicitar Customização
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
