
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Edit, Database, Code, CheckCircle } from "lucide-react";
import { CanvaEditor } from "@/components/CanvaEditor";
import { TemplateManager } from "@/components/TemplateManager";
import { ApiDocumentation } from "@/components/ApiDocumentation";

const Index = () => {
  const [activeTab, setActiveTab] = useState("editor");
  const [editingTemplate, setEditingTemplate] = useState(null);

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setActiveTab("editor");
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setActiveTab("editor");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ClipCraft Pro
                </h1>
                <p className="text-sm text-gray-600">Editor Visual de Vídeos com FFmpeg</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                FFmpeg Ativo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>API Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Editor Visual de Templates
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Crie templates visuais com elementos arrastar e soltar. 
                Sistema real com FFmpeg para geração de vídeos de alta qualidade.
              </p>
            </div>

            <CanvaEditor />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <TemplateManager 
              onEditTemplate={handleEditTemplate}
              onCreateNew={handleCreateNew}
            />
          </TabsContent>

          {/* API Documentation Tab */}
          <TabsContent value="api" className="space-y-6">
            <ApiDocumentation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
