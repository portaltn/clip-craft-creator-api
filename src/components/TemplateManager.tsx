
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  Search,
  Eye,
  Download,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  fps: number;
  segments: any[];
  variables: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

interface TemplateManagerProps {
  onEditTemplate?: (template: Template) => void;
  onCreateNew?: () => void;
}

export const TemplateManager = ({ onEditTemplate, onCreateNew }: TemplateManagerProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showVariables, setShowVariables] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja deletar este template?')) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        throw error;
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({
        title: "Template Deletado",
        description: "Template deletado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar template",
        variant: "destructive"
      });
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      const duplicatedTemplate = {
        name: `${template.name} (Cópia)`,
        description: `Cópia de: ${template.description}`,
        width: template.width,
        height: template.height,
        fps: template.fps,
        segments: template.segments,
        variables: template.variables
      };

      const { error } = await supabase
        .from('templates')
        .insert(duplicatedTemplate);

      if (error) {
        throw error;
      }

      await loadTemplates();
      toast({
        title: "Template Duplicado",
        description: "Template duplicado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast({
        title: "Erro",
        description: "Erro ao duplicar template",
        variant: "destructive"
      });
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates Salvos</h2>
          <p className="text-gray-600">Gerencie seus templates de vídeo</p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Templates */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template criado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Tente buscar com outros termos' : 'Crie seu primeiro template para começar'}
          </p>
          {!searchTerm && (
            <Button onClick={onCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {template.description || 'Sem descrição'}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Badge variant="secondary">{template.width}x{template.height}</Badge>
                  <Badge variant="outline">{template.fps} FPS</Badge>
                  <Badge variant="outline">{template.segments?.length || 0} segmentos</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Preview dos elementos */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium mb-2">Elementos:</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(template.variables || {}).slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {Object.keys(template.variables || {}).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{Object.keys(template.variables || {}).length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Data de criação */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  Criado em {formatDate(template.created_at)}
                </div>

                {/* Ações */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowVariables(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditTemplate?.(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Variáveis */}
      {showVariables && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto m-4">
            <CardHeader>
              <CardTitle>Template: {selectedTemplate.name}</CardTitle>
              <CardDescription>{selectedTemplate.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações do Template */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID do Template</Label>
                  <Input value={selectedTemplate.id} readOnly />
                </div>
                <div>
                  <Label>Dimensões</Label>
                  <Input value={`${selectedTemplate.width}x${selectedTemplate.height} @ ${selectedTemplate.fps}fps`} readOnly />
                </div>
              </div>

              {/* Variáveis do Template */}
              <div>
                <h4 className="font-medium mb-3">Variáveis para Integração</h4>
                <div className="space-y-3">
                  {Object.entries(selectedTemplate.variables || {}).map(([key, value]) => (
                    <div key={key} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-medium">{key}</Label>
                        <Badge variant="secondary">{value.type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{value.description}</div>
                      <Input
                        value={`Valor padrão: ${value.defaultValue}`}
                        readOnly
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Exemplo de uso da API */}
              <div>
                <h4 className="font-medium mb-3">Exemplo de Uso da API</h4>
                <div className="bg-gray-100 rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap">
{`POST /api/create-video
{
  "template_id": "${selectedTemplate.id}",
  "variables": {
${Object.keys(selectedTemplate.variables || {}).map(key => `    "${key}": "seu_valor_aqui"`).join(',\n')}
  },
  "resize": "${selectedTemplate.width}x${selectedTemplate.height}",
  "fps": ${selectedTemplate.fps}
}`}
                  </pre>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => setShowVariables(false)} className="flex-1">
                  Fechar
                </Button>
                <Button variant="outline" onClick={() => onEditTemplate?.(selectedTemplate)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
