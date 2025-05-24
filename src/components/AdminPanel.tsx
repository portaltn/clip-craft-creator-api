
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, CheckCircle, AlertCircle, RefreshCw, Download, Trash2, Server, Database, Cpu } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface SystemStats {
  activeJobs: number;
  totalJobs: number;
  successRate: number;
  avgProcessingTime: number;
  diskUsage: number;
  memoryUsage: number;
}

interface VideoJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
  error?: string;
}

export const AdminPanel = () => {
  const [stats, setStats] = useState<SystemStats>({
    activeJobs: 3,
    totalJobs: 157,
    successRate: 98.2,
    avgProcessingTime: 2.3,
    diskUsage: 68,
    memoryUsage: 42
  });

  const [jobs, setJobs] = useState<VideoJob[]>([
    {
      id: 'job_001',
      status: 'completed',
      progress: 100,
      createdAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:32:15Z',
      fileSize: 15680000
    },
    {
      id: 'job_002',
      status: 'processing',
      progress: 75,
      createdAt: '2024-01-15T10:35:00Z'
    },
    {
      id: 'job_003',
      status: 'queued',
      progress: 0,
      createdAt: '2024-01-15T10:37:00Z'
    },
    {
      id: 'job_004',
      status: 'error',
      progress: 0,
      createdAt: '2024-01-15T10:25:00Z',
      error: 'URL de mídia inválida'
    }
  ]);

  const [performanceData] = useState([
    { time: '10:00', videos: 12, avgTime: 2.1 },
    { time: '11:00', videos: 18, avgTime: 2.4 },
    { time: '12:00', videos: 15, avgTime: 2.2 },
    { time: '13:00', videos: 22, avgTime: 2.6 },
    { time: '14:00', videos: 19, avgTime: 2.3 },
    { time: '15:00', videos: 25, avgTime: 2.1 }
  ]);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) return '-';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const refreshData = () => {
    // Simular atualização de dados
    setStats(prev => ({
      ...prev,
      activeJobs: Math.floor(Math.random() * 5) + 1,
      memoryUsage: Math.floor(Math.random() * 30) + 30
    }));
  };

  const deleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Painel Administrativo</h2>
          <p className="text-gray-600 mt-2">Monitore e gerencie o sistema de criação de vídeos</p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
                <p className="text-blue-100">Jobs Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
                <p className="text-green-100">Total de Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <p className="text-purple-100">Taxa de Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgProcessingTime}s</p>
                <p className="text-orange-100">Tempo Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Jobs Ativos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Jobs de Processamento</CardTitle>
              <CardDescription>
                Acompanhe o status de todos os jobs de criação de vídeo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">{job.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {job.status === 'processing' && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                          {job.status === 'queued' && <Clock className="w-4 h-4 text-orange-500" />}
                          {job.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'error' ? 'destructive' :
                            'secondary'
                          }>
                            {job.status === 'completed' ? 'Concluído' :
                             job.status === 'processing' ? 'Processando' :
                             job.status === 'queued' ? 'Na Fila' :
                             'Erro'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 min-w-[120px]">
                          <Progress value={job.progress} className="flex-1" />
                          <span className="text-sm text-gray-500">{job.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDuration(job.createdAt, job.completedAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.fileSize ? formatFileSize(job.fileSize) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {job.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => deleteJob(job.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Vídeos Processados por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="videos" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Tempo Médio de Processamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgTime" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>Status do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status da API</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uso do Disco</span>
                    <span>{stats.diskUsage}%</span>
                  </div>
                  <Progress value={stats.diskUsage} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uso de Memória</span>
                    <span>{stats.memoryUsage}%</span>
                  </div>
                  <Progress value={stats.memoryUsage} className="w-full" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">MoviePy</span>
                  <Badge variant="secondary">v1.0.3</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Python</span>
                  <Badge variant="secondary">v3.9.7</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>Armazenamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">2.3 GB</p>
                    <p className="text-sm text-gray-600">Vídeos Processados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">450 MB</p>
                    <p className="text-sm text-gray-600">Cache Temporário</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Limpeza Automática</h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Arquivos temporários são limpos automaticamente após 24h
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Limpar Cache Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
