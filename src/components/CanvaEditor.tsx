import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Type, 
  Move, 
  Copy, 
  Trash2, 
  Save,
  Eye,
  Settings,
  Download,
  ChevronUp,
  ChevronDown,
  Code
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface Element {
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

interface Segment {
  id: string;
  name: string;
  duration: number;
  transition: string;
  backgroundColor: string;
  elements: Element[];
}

interface Template {
  id?: string;
  name: string;
  description: string;
  width: number;
  height: number;
  fps: number;
  segments: Segment[];
  variables: Record<string, any>;
}

const ASPECT_RATIOS = {
  "9:16": { width: 1080, height: 1920, label: "Stories/Reels (9:16)" },
  "16:9": { width: 1920, height: 1080, label: "Landscape (16:9)" },
  "1:1": { width: 1080, height: 1080, label: "Square (1:1)" },
  "4:5": { width: 1080, height: 1350, label: "Portrait (4:5)" }
};

export const CanvaEditor = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [template, setTemplate] = useState<Template>({
    name: "Novo Template",
    description: "",
    width: 1080,
    height: 1080,
    fps: 30,
    segments: [{
      id: 'segment-1',
      name: 'Segmento 1',
      duration: 5,
      transition: 'fadein',
      backgroundColor: '#ffffff',
      elements: []
    }],
    variables: {}
  });
  
  const [activeSegmentId, setActiveSegmentId] = useState('segment-1');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<Element | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showVariables, setShowVariables] = useState(false);
  const [showApiInfo, setShowApiInfo] = useState(false);

  const activeSegment = template.segments.find(s => s.id === activeSegmentId);
  const selectedElement = activeSegment?.elements.find(e => e.id === selectedElementId);

  const updateTemplateSize = (aspectRatio: keyof typeof ASPECT_RATIOS) => {
    const { width, height } = ASPECT_RATIOS[aspectRatio];
    setTemplate(prev => ({ ...prev, width, height }));
  };

  const addSegment = () => {
    const newSegment: Segment = {
      id: `segment-${Date.now()}`,
      name: `Segmento ${template.segments.length + 1}`,
      duration: 5,
      transition: 'fadein',
      backgroundColor: '#ffffff',
      elements: []
    };
    
    setTemplate(prev => ({
      ...prev,
      segments: [...prev.segments, newSegment]
    }));
    setActiveSegmentId(newSegment.id);
  };

  const addElement = (type: 'image' | 'video' | 'text') => {
    if (!activeSegment) return;

    const newElement: Element = {
      id: `element-${Date.now()}`,
      type,
      variable: `$${type}_${activeSegment.elements.length + 1}`,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : 200,
      height: type === 'text' ? 100 : 200,
      rotation: 0,
      opacity: 1,
      zIndex: activeSegment.elements.length,
      
      ...(type === 'text' && {
        text: 'Texto exemplo',
        fontSize: 32,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        textAlign: 'center',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        shadow: false,
        outline: false,
        outlineColor: '#000000',
        outlineWidth: 2
      }),
      
      ...(type !== 'text' && {
        mediaUrl: type === 'image' 
          ? 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400'
          : 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        borderRadius: 0,
        shadow: false
      })
    };

    setTemplate(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === activeSegmentId
          ? { ...segment, elements: [...segment.elements, newElement] }
          : segment
      )
    }));

    setSelectedElementId(newElement.id);
  };

  const updateElement = (elementId: string, updates: Partial<Element>) => {
    setTemplate(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === activeSegmentId
          ? {
              ...segment,
              elements: segment.elements.map(element =>
                element.id === elementId ? { ...element, ...updates } : element
              )
            }
          : segment
      )
    }));
  };

  const deleteElement = (elementId: string) => {
    setTemplate(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === activeSegmentId
          ? {
              ...segment,
              elements: segment.elements.filter(element => element.id !== elementId)
            }
          : segment
      )
    }));
    setSelectedElementId(null);
  };

  const duplicateElement = (elementId: string) => {
    const element = activeSegment?.elements.find(e => e.id === elementId);
    if (!element) return;

    const duplicated: Element = {
      ...element,
      id: `element-${Date.now()}`,
      variable: `${element.variable}_copy`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: activeSegment.elements.length
    };

    setTemplate(prev => ({
      ...prev,
      segments: prev.segments.map(segment =>
        segment.id === activeSegmentId
          ? { ...segment, elements: [...segment.elements, duplicated] }
          : segment
      )
    }));
  };

  // Layer control functions
  const bringForward = (elementId: string) => {
    if (!activeSegment) return;
    
    const element = activeSegment.elements.find(e => e.id === elementId);
    if (!element) return;

    const maxZIndex = Math.max(...activeSegment.elements.map(e => e.zIndex));
    if (element.zIndex < maxZIndex) {
      updateElement(elementId, { zIndex: element.zIndex + 1 });
      
      // Adjust the element that was previously at this z-index
      const elementToSwap = activeSegment.elements.find(e => e.zIndex === element.zIndex + 1 && e.id !== elementId);
      if (elementToSwap) {
        updateElement(elementToSwap.id, { zIndex: element.zIndex });
      }
    }
  };

  const sendBackward = (elementId: string) => {
    if (!activeSegment) return;
    
    const element = activeSegment.elements.find(e => e.id === elementId);
    if (!element) return;

    const minZIndex = Math.min(...activeSegment.elements.map(e => e.zIndex));
    if (element.zIndex > minZIndex) {
      updateElement(elementId, { zIndex: element.zIndex - 1 });
      
      // Adjust the element that was previously at this z-index
      const elementToSwap = activeSegment.elements.find(e => e.zIndex === element.zIndex - 1 && e.id !== elementId);
      if (elementToSwap) {
        updateElement(elementToSwap.id, { zIndex: element.zIndex });
      }
    }
  };

  const saveTemplate = async () => {
    try {
      // Extrair variáveis dos elementos
      const variables: Record<string, any> = {};
      template.segments.forEach(segment => {
        segment.elements.forEach(element => {
          if (element.variable) {
            variables[element.variable] = {
              type: element.type,
              defaultValue: element.type === 'text' ? element.text : element.mediaUrl,
              description: `${element.type} element`
            };
          }
        });
      });

      const templateData = {
        name: template.name,
        description: template.description,
        width: template.width,
        height: template.height,
        fps: template.fps,
        segments: template.segments as unknown as Json,
        variables: variables as unknown as Json
      };

      let result;
      if (template.id) {
        // Update existing template
        result = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', template.id)
          .select()
          .single();
      } else {
        // Create new template
        result = await supabase
          .from('templates')
          .insert(templateData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setTemplate(prev => ({ ...prev, id: result.data.id }));
      toast({
        title: "Template Salvo",
        description: `Template salvo com sucesso!`
      });
      setShowVariables(true);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Erro ao salvar template",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência",
    });
  };

  const generateApiExample = () => {
    if (!template.id) return '';
    
    const variables: Record<string, any> = {};
    template.segments.forEach(segment => {
      segment.elements.forEach(element => {
        if (element.variable) {
          variables[element.variable] = element.type === 'text' ? element.text : element.mediaUrl;
        }
      });
    });

    return `POST /api/create-video
{
  "template_id": "${template.id}",
  "variables": ${JSON.stringify(variables, null, 2)},
  "resize": "${template.width}x${template.height}",
  "fps": ${template.fps}
}`;
  };

  const handleMouseDown = (e: React.MouseEvent, element: Element, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElementId(element.id);
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
      setDraggedElement(element);
    }
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - element.x,
        y: e.clientY - rect.top - element.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging && draggedElement) {
      const newX = Math.max(0, Math.min(template.width / 2 - selectedElement.width, mouseX - dragStart.x));
      const newY = Math.max(0, Math.min(template.height / 2 - selectedElement.height, mouseY - dragStart.y));
      
      updateElement(selectedElement.id, { x: newX, y: newY });
    } else if (isResizing && resizeHandle) {
      let newWidth = selectedElement.width;
      let newHeight = selectedElement.height;
      let newX = selectedElement.x;
      let newY = selectedElement.y;

      switch (resizeHandle) {
        case 'n':
          newHeight = Math.max(20, selectedElement.height - (mouseY - selectedElement.y));
          newY = Math.min(selectedElement.y, mouseY);
          break;
        case 's':
          newHeight = Math.max(20, mouseY - selectedElement.y);
          break;
        case 'e':
          newWidth = Math.max(20, mouseX - selectedElement.x);
          break;
        case 'w':
          newWidth = Math.max(20, selectedElement.width - (mouseX - selectedElement.x));
          newX = Math.min(selectedElement.x, mouseX);
          break;
        case 'ne':
          newWidth = Math.max(20, mouseX - selectedElement.x);
          newHeight = Math.max(20, selectedElement.height - (mouseY - selectedElement.y));
          newY = Math.min(selectedElement.y, mouseY);
          break;
        case 'nw':
          newWidth = Math.max(20, selectedElement.width - (mouseX - selectedElement.x));
          newHeight = Math.max(20, selectedElement.height - (mouseY - selectedElement.y));
          newX = Math.min(selectedElement.x, mouseX);
          newY = Math.min(selectedElement.y, mouseY);
          break;
        case 'se':
          newWidth = Math.max(20, mouseX - selectedElement.x);
          newHeight = Math.max(20, mouseY - selectedElement.y);
          break;
        case 'sw':
          newWidth = Math.max(20, selectedElement.width - (mouseX - selectedElement.x));
          newHeight = Math.max(20, mouseY - selectedElement.y);
          newX = Math.min(selectedElement.x, mouseX);
          break;
      }

      updateElement(selectedElement.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setDraggedElement(null);
    setResizeHandle(null);
  };

  const renderResizeHandles = (element: Element) => {
    if (selectedElementId !== element.id) return null;

    const handles = [
      { key: 'nw', style: { top: -6, left: -6, cursor: 'nw-resize' } },
      { key: 'n', style: { top: -6, left: element.width / 2 - 6, cursor: 'n-resize' } },
      { key: 'ne', style: { top: -6, right: -6, cursor: 'ne-resize' } },
      { key: 'e', style: { top: element.height / 2 - 6, right: -6, cursor: 'e-resize' } },
      { key: 'se', style: { bottom: -6, right: -6, cursor: 'se-resize' } },
      { key: 's', style: { bottom: -6, left: element.width / 2 - 6, cursor: 's-resize' } },
      { key: 'sw', style: { bottom: -6, left: -6, cursor: 'sw-resize' } },
      { key: 'w', style: { top: element.height / 2 - 6, left: -6, cursor: 'w-resize' } }
    ];
    
    return handles.map(handle => (
      <div
        key={handle.key}
        className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm z-50"
        style={{ ...handle.style, cursor: handle.style.cursor }}
        onMouseDown={(e) => handleMouseDown(e, element, handle.key)}
      />
    ));
  };

  const renderElement = (element: Element) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      opacity: element.opacity,
      zIndex: element.zIndex,
      cursor: isDragging ? 'grabbing' : 'grab',
      border: selectedElementId === element.id ? '2px solid #3b82f6' : '1px dashed #ccc',
      borderRadius: element.type !== 'text' ? (element.borderRadius || 0) : 0,
      boxShadow: element.type !== 'text' && element.shadow ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
    };

    if (element.type === 'text') {
      const textStyle: React.CSSProperties = {
        fontSize: element.fontSize,
        fontFamily: element.fontFamily,
        fontWeight: element.fontWeight,
        textAlign: element.textAlign as any,
        color: element.color,
        textShadow: element.shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none',
        WebkitTextStroke: element.outline ? `${element.outlineWidth}px ${element.outlineColor}` : 'none',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        hyphens: 'auto'
      };

      return (
        <div
          key={element.id}
          style={{
            ...style,
            backgroundColor: element.backgroundColor,
            borderRadius: element.borderRadius || 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.textAlign === 'center' ? 'center' : 
                           element.textAlign === 'right' ? 'flex-end' : 'flex-start',
            padding: '8px',
            overflow: 'hidden'
          }}
          onMouseDown={(e) => handleMouseDown(e, element)}
          onClick={() => setSelectedElementId(element.id)}
        >
          <span style={textStyle}>
            {element.text || element.variable}
          </span>
          {renderResizeHandles(element)}
        </div>
      );
    }

    return (
      <div
        key={element.id}
        style={style}
        onMouseDown={(e) => handleMouseDown(e, element)}
        onClick={() => setSelectedElementId(element.id)}
      >
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
          {element.type === 'image' ? <ImageIcon /> : <Video />}
          <span className="ml-2">{element.variable}</span>
        </div>
        {renderResizeHandles(element)}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Esquerda - Elementos */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Elementos</h3>
        </div>
        
        <div className="p-4 space-y-2">
          <Button
            onClick={() => addElement('text')}
            variant="outline"
            className="w-full justify-start"
          >
            <Type className="w-4 h-4 mr-2" />
            Texto
          </Button>
          
          <Button
            onClick={() => addElement('image')}
            variant="outline"
            className="w-full justify-start"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Imagem
          </Button>
          
          <Button
            onClick={() => addElement('video')}
            variant="outline"
            className="w-full justify-start"
          >
            <Video className="w-4 h-4 mr-2" />
            Vídeo
          </Button>
        </div>

        <Separator />

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Segmentos</h4>
            <Button onClick={addSegment} size="sm" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {template.segments.map(segment => (
              <div
                key={segment.id}
                className={`p-2 rounded cursor-pointer ${
                  activeSegmentId === segment.id ? 'bg-blue-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveSegmentId(segment.id)}
              >
                <div className="text-sm font-medium">{segment.name}</div>
                <div className="text-xs text-gray-500">{segment.duration}s</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Área Central - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Input
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
              className="w-64"
              placeholder="Nome do template"
            />
            
            <Select
              value={`${template.width}:${template.height}`}
              onValueChange={(value) => {
                const ratio = Object.entries(ASPECT_RATIOS).find(
                  ([_, config]) => `${config.width}:${config.height}` === value
                );
                if (ratio) {
                  updateTemplateSize(ratio[0] as keyof typeof ASPECT_RATIOS);
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ASPECT_RATIOS).map(([key, config]) => (
                  <SelectItem key={key} value={`${config.width}:${config.height}`}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline">{template.width}x{template.height}</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowVariables(!showVariables)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Variáveis
            </Button>
            {template.id && (
              <Button onClick={() => setShowApiInfo(!showApiInfo)} variant="outline">
                <Code className="w-4 h-4 mr-2" />
                API Info
              </Button>
            )}
            <Button onClick={saveTemplate}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Template
            </Button>
          </div>
        </div>

        {/* API Info Card */}
        {showApiInfo && template.id && (
          <div className="bg-blue-50 border-b p-4">
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Informações da API
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowApiInfo(false)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Template ID</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={template.id} readOnly className="font-mono text-sm" />
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(template.id!)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Dimensões</Label>
                    <Input value={`${template.width}x${template.height} @ ${template.fps}fps`} readOnly />
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Variáveis Disponíveis</Label>
                  <div className="mt-2 space-y-2">
                    {template.segments.map(segment => 
                      segment.elements.map(element => (
                        <div key={element.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{element.type}</Badge>
                            <code className="text-sm">{element.variable}</code>
                          </div>
                          <div className="text-sm text-gray-600">
                            {element.type === 'text' ? element.text : 'URL da mídia'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Exemplo de Requisição</Label>
                  <div className="relative mt-2">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                      <code>{generateApiExample()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateApiExample())}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-gray-600">
                    Use essas informações para integrar com a API
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Ver Documentação
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex justify-center">
            <div
              ref={canvasRef}
              className="relative bg-white shadow-lg"
              style={{
                width: template.width / 2,
                height: template.height / 2,
                backgroundColor: activeSegment?.backgroundColor
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {activeSegment?.elements.map(renderElement)}
              
              {activeSegment?.elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Adicione elementos ao seu template</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Direita - Configurações */}
      <div className="w-80 bg-white border-l overflow-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </h3>
        </div>

        <div className="p-4 space-y-6">
          {/* Configurações do Template */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={template.name}
                  onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={template.description}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do template..."
                />
              </div>
              
              <div>
                <Label>FPS</Label>
                <Input
                  type="number"
                  min="15"
                  max="60"
                  value={template.fps}
                  onChange={(e) => setTemplate(prev => ({ ...prev, fps: Number(e.target.value) }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Segmento */}
          {activeSegment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Segmento: {activeSegment.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={activeSegment.name}
                    onChange={(e) => {
                      setTemplate(prev => ({
                        ...prev,
                        segments: prev.segments.map(s =>
                          s.id === activeSegmentId ? { ...s, name: e.target.value } : s
                        )
                      }));
                    }}
                  />
                </div>
                
                <div>
                  <Label>Duração (segundos)</Label>
                  <Input
                    type="number"
                    value={activeSegment.duration}
                    onChange={(e) => {
                      setTemplate(prev => ({
                        ...prev,
                        segments: prev.segments.map(s =>
                          s.id === activeSegmentId ? { ...s, duration: Number(e.target.value) } : s
                        )
                      }));
                    }}
                  />
                </div>
                
                <div>
                  <Label>Transição</Label>
                  <Select
                    value={activeSegment.transition}
                    onValueChange={(value) => {
                      setTemplate(prev => ({
                        ...prev,
                        segments: prev.segments.map(s =>
                          s.id === activeSegmentId ? { ...s, transition: value } : s
                        )
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fadein">Fade In</SelectItem>
                      <SelectItem value="fadeout">Fade Out</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Cor de Fundo</Label>
                  <Input
                    type="color"
                    value={activeSegment.backgroundColor}
                    onChange={(e) => {
                      setTemplate(prev => ({
                        ...prev,
                        segments: prev.segments.map(s =>
                          s.id === activeSegmentId ? { ...s, backgroundColor: e.target.value } : s
                        )
                      }));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configurações do Elemento Selecionado */}
          {selectedElement && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Elemento: {selectedElement.type}
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => bringForward(selectedElement.id)}
                      title="Trazer para frente"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => sendBackward(selectedElement.id)}
                      title="Enviar para trás"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => duplicateElement(selectedElement.id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteElement(selectedElement.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Variável</Label>
                  <Input
                    value={selectedElement.variable}
                    onChange={(e) => updateElement(selectedElement.id, { variable: e.target.value })}
                    placeholder="$variavel"
                  />
                </div>

                {/* Posição e Tamanho */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>X</Label>
                    <Input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Y</Label>
                    <Input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Largura</Label>
                    <Input
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Altura</Label>
                    <Input
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Configurações específicas de texto */}
                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <Label>Texto</Label>
                      <Textarea
                        value={selectedElement.text}
                        onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                        placeholder="Digite o texto aqui..."
                      />
                    </div>
                    
                    <div>
                      <Label>Tamanho da Fonte</Label>
                      <Slider
                        value={[selectedElement.fontSize || 32]}
                        onValueChange={([value]) => updateElement(selectedElement.id, { fontSize: value })}
                        min={12}
                        max={120}
                        step={1}
                      />
                      <div className="text-sm text-gray-500 text-center">{selectedElement.fontSize}px</div>
                    </div>
                    
                    <div>
                      <Label>Alinhamento</Label>
                      <Select
                        value={selectedElement.textAlign}
                        onValueChange={(value) => updateElement(selectedElement.id, { textAlign: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Cor do Texto</Label>
                        <Input
                          type="color"
                          value={selectedElement.color}
                          onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Cor de Fundo</Label>
                        <Input
                          type="color"
                          value={selectedElement.backgroundColor || '#transparent'}
                          onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Sombra</Label>
                        <Switch
                          checked={selectedElement.shadow}
                          onCheckedChange={(checked) => updateElement(selectedElement.id, { shadow: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Contorno</Label>
                        <Switch
                          checked={selectedElement.outline}
                          onCheckedChange={(checked) => updateElement(selectedElement.id, { outline: checked })}
                        />
                      </div>
                    </div>
                    
                    {selectedElement.outline && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Cor do Contorno</Label>
                          <Input
                            type="color"
                            value={selectedElement.outlineColor}
                            onChange={(e) => updateElement(selectedElement.id, { outlineColor: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Espessura</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={selectedElement.outlineWidth}
                            onChange={(e) => updateElement(selectedElement.id, { outlineWidth: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Border Radius para todos */}
                <div>
                  <Label>Border Radius</Label>
                  <Slider
                    value={[selectedElement.borderRadius || 0]}
                    onValueChange={([value]) => updateElement(selectedElement.id, { borderRadius: value })}
                    min={0}
                    max={50}
                    step={1}
                  />
                  <div className="text-sm text-gray-500 text-center">{selectedElement.borderRadius || 0}px</div>
                </div>

                {/* Opacidade */}
                <div>
                  <Label>Opacidade</Label>
                  <Slider
                    value={[selectedElement.opacity * 100]}
                    onValueChange={([value]) => updateElement(selectedElement.id, { opacity: value / 100 })}
                    min={0}
                    max={100}
                    step={1}
                  />
                  <div className="text-sm text-gray-500 text-center">{Math.round(selectedElement.opacity * 100)}%</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Variáveis */}
      {showVariables && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96 overflow-auto">
            <CardHeader>
              <CardTitle>Variáveis do Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>ID do Template</Label>
                  <Input value={template.id || 'Não salvo'} readOnly />
                </div>
                
                {Object.entries(template.variables).map(([key, value]) => (
                  <div key={key}>
                    <Label>{key}</Label>
                    <Input value={`${value.type} - ${value.description}`} readOnly />
                  </div>
                ))}
                
                <Button onClick={() => setShowVariables(false)} className="w-full">
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
