
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Zap, BarChart3, Settings, Play, Download, Clock, CheckCircle, AlertCircle, Plus, Code, Palette, Layers } from "lucide-react";
import { VideoCreator } from "@/components/VideoCreator";
import { AdminPanel } from "@/components/AdminPanel";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { TemplateGallery } from "@/components/TemplateGallery";

const Index = () => {
  const [activeTab, setActiveTab] = useState("creator");

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
                  ClipCraft
                </h1>
                <p className="text-sm text-gray-600">Sistema de Criação de Vídeos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                API Ativa
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="creator" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Criar Vídeo</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Painel Admin</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Templates</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>API Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* Video Creator Tab */}
          <TabsContent value="creator" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Crie Vídeos Incríveis em Segundos
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Combine imagens, textos, áudios e efeitos para criar vídeos profissionais 
                automaticamente via API ou interface visual.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">150+</p>
                      <p className="text-sm text-gray-600">Vídeos Criados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">2.3s</p>
                      <p className="text-sm text-gray-600">Tempo Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">98%</p>
                      <p className="text-sm text-gray-600">Taxa Sucesso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-sm text-gray-600">Templates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <VideoCreator />
          </TabsContent>

          {/* Admin Panel Tab */}
          <TabsContent value="admin" className="space-y-6">
            <AdminPanel />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <TemplateGallery />
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
