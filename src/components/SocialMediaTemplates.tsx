
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Instagram, Youtube, Smartphone, Square } from "lucide-react";

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

interface SocialMediaTemplatesProps {
  onApplyTemplate: (segments: VideoSegment[], globalSettings: any) => void;
}

export const SocialMediaTemplates = ({ onApplyTemplate }: SocialMediaTemplatesProps) => {
  const socialFormats = [
    {
      id: 'instagram_post',
      name: 'Instagram Post',
      description: 'Formato quadrado 1:1 para posts do Instagram',
      aspectRatio: 1,
      resolution: '1080x1080',
      icon: Square,
      color: 'purple',
      template: {
        segments: [
          {
            id: 'template_1',
            type: 'image' as const,
            mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&h=1080&fit=crop',
            duration: 5,
            text: 'Seu Texto Aqui',
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
      }
    },
    {
      id: 'instagram_stories',
      name: 'Instagram Stories',
      description: 'Formato vertical 9:16 para Stories e Reels',
      aspectRatio: 9/16,
      resolution: '1080x1920',
      icon: Smartphone,
      color: 'pink',
      template: {
        segments: [
          {
            id: 'template_2',
            type: 'image' as const,
            mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&h=1920&fit=crop',
            duration: 5,
            text: 'Stories & Reels',
            textPosition: 'center',
            fontSize: 70,
            fontColor: '#ffffff',
            transition: 'fadein'
          }
        ],
        globalSettings: {
          resize: '1080x1920',
          fps: 30,
          backgroundAudio: ''
        }
      }
    },
    {
      id: 'instagram_feed',
      name: 'Feed Vertical',
      description: 'Formato 4:5 otimizado para feed do Instagram',
      aspectRatio: 4/5,
      resolution: '1080x1350',
      icon: Instagram,
      color: 'orange',
      template: {
        segments: [
          {
            id: 'template_3',
            type: 'image' as const,
            mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&h=1350&fit=crop',
            duration: 5,
            text: 'Feed Vertical',
            textPosition: 'bottom',
            fontSize: 55,
            fontColor: '#ffffff',
            transition: 'fadein'
          }
        ],
        globalSettings: {
          resize: '1080x1350',
          fps: 30,
          backgroundAudio: ''
        }
      }
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Formato horizontal 16:9 para YouTube',
      aspectRatio: 16/9,
      resolution: '1920x1080',
      icon: Youtube,
      color: 'red',
      template: {
        segments: [
          {
            id: 'template_4',
            type: 'image' as const,
            mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop',
            duration: 5,
            text: 'YouTube Video',
            textPosition: 'center',
            fontSize: 80,
            fontColor: '#ffffff',
            transition: 'fadein'
          }
        ],
        globalSettings: {
          resize: '1920x1080',
          fps: 30,
          backgroundAudio: ''
        }
      }
    }
  ];

  const handleApplyTemplate = (format: typeof socialFormats[0]) => {
    onApplyTemplate(format.template.segments, format.template.globalSettings);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Templates para Redes Sociais</h3>
        <p className="text-gray-600">Escolha o formato ideal para sua rede social</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialFormats.map((format) => {
          const IconComponent = format.icon;
          return (
            <Card key={format.id} className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-${format.color}-100 rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 text-${format.color}-600`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{format.name}</CardTitle>
                    <CardDescription className="text-sm">{format.description}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {format.resolution}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <AspectRatio ratio={format.aspectRatio} className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500 text-sm font-medium">
                      Preview {format.resolution}
                    </div>
                  </AspectRatio>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Resolução:</span>
                    <span className="font-medium">{format.resolution}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Proporção:</span>
                    <span className="font-medium">{format.aspectRatio === 1 ? '1:1' : 
                      format.aspectRatio === 9/16 ? '9:16' : 
                      format.aspectRatio === 4/5 ? '4:5' : '16:9'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ideal para:</span>
                    <span className="font-medium">
                      {format.id === 'instagram_post' ? 'Posts' :
                       format.id === 'instagram_stories' ? 'Stories/Reels' :
                       format.id === 'instagram_feed' ? 'Feed' : 'YouTube'}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleApplyTemplate(format)}
                  className="w-full"
                  variant="outline"
                >
                  Usar Este Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Templates Section */}
      <Card className="border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Templates Rápidos Multi-Formato</CardTitle>
          <CardDescription>Templates que funcionam bem em qualquer formato</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => {
              const slideshow = [
                {
                  id: 'slide_1',
                  type: 'image' as const,
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
                  type: 'image' as const,
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
                  type: 'image' as const,
                  mediaUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=1080',
                  duration: 3,
                  text: 'Slide 3',
                  textPosition: 'center',
                  fontSize: 50,
                  fontColor: '#ffffff',
                  transition: 'fadein'
                }
              ];
              onApplyTemplate(slideshow, { resize: '1080x1080', fps: 30, backgroundAudio: '' });
            }}
          >
            <div>
              <div className="font-medium">Slideshow 3 Imagens</div>
              <div className="text-sm text-gray-600">Template com 3 slides de 3 segundos cada</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => {
              const promo = [
                {
                  id: 'promo_1',
                  type: 'image' as const,
                  mediaUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080',
                  duration: 7,
                  text: 'PROMOÇÃO ESPECIAL\n50% OFF',
                  textPosition: 'center',
                  fontSize: 60,
                  fontColor: '#ffffff',
                  transition: 'fadein'
                }
              ];
              onApplyTemplate(promo, { resize: '1080x1080', fps: 30, backgroundAudio: '' });
            }}
          >
            <div>
              <div className="font-medium">Post Promocional</div>
              <div className="text-sm text-gray-600">Template para promoções e ofertas</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
