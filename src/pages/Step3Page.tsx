import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { generateProblems } from '@/services/aiService';
import { PROBLEM_DIMENSIONS } from '@/types/lessonPlan';
import type { ProblemItem } from '@/types/lessonPlan';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import StepProgress from '@/components/StepProgress';
import PaperCard from '@/components/PaperCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ArrowLeft, ArrowRight, Sparkles, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { genId } from '@/services/aiService';

export default function Step3Page() {
  const navigate = useNavigate();
  const { currentPlan, updatePlan } = useLessonPlan();
  const [loading, setLoading] = useState(false);
  const [selectedDims, setSelectedDims] = useState<string[]>(PROBLEM_DIMENSIONS.map(d => d.id));
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [generated, setGenerated] = useState(false);
  const [newProblem, setNewProblem] = useState('');

  if (!currentPlan) {
    navigate('/create');
    return null;
  }

  const toggleDim = (id: string) => {
    setSelectedDims(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedDims.length === 0) { toast.error('请至少选择一个维度'); return; }
    setLoading(true);
    try {
      const result = await generateProblems(currentPlan.optimized || currentPlan.draft, selectedDims);
      setProblems(result);
      setGenerated(true);
      toast.success('问题清单已生成');
    } catch {
      toast.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const updateProblemStatus = (id: string, status: ProblemItem['status']) => {
    setProblems(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const addCustomProblem = () => {
    if (!newProblem.trim()) return;
    setProblems(prev => [...prev, {
      id: genId(),
      dimension: '自定义问题',
      description: newProblem,
      analysis: '教师自行发现的问题',
      suggestion: '请根据实际情况进行调整',
      status: '需修改',
    }]);
    setNewProblem('');
  };

  const handleNext = () => {
    const updated = {
      ...currentPlan,
      problems,
      currentStep: 4,
      versions: [...currentPlan.versions, {
        step: 3,
        stepName: '挑毛病·找真问题',
        timestamp: Date.now(),
        content: JSON.stringify(problems),
      }],
    };
    updatePlan(updated);
    navigate('/step/4');
  };

  return (
    <div className="min-h-screen bg-background">
      {loading && <LoadingOverlay message="AI正在分析教案问题..." />}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <StepProgress currentStep={2} />

        <div className="mt-8 mb-6">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-1">挑毛病 · 找真问题</h2>
          <p className="text-sm text-muted-foreground">AI从多个维度诊断教案，帮助您发现盲点</p>
        </div>

        {!generated ? (
          <div className="space-y-6">
            {/* 当前教案 */}
            <PaperCard title="当前教案" subtitle="以下是将要诊断的教案内容">
              <div className="max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">
                  {currentPlan.optimized || currentPlan.draft}
                </pre>
              </div>
            </PaperCard>

            {/* 维度选择 */}
            <PaperCard title="选择诊断维度">
              <div className="space-y-3">
                {PROBLEM_DIMENSIONS.map(dim => (
                  <label key={dim.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    <Checkbox
                      checked={selectedDims.includes(dim.id)}
                      onCheckedChange={() => toggleDim(dim.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">{dim.label}</p>
                      <p className="text-xs text-muted-foreground">{dim.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                生成问题清单
              </Button>
            </PaperCard>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            {/* 问题清单 */}
            {problems.map((p, idx) => (
              <PaperCard key={p.id} className={`border-l-4 ${
                p.status === '可接受' ? 'border-l-green-600' :
                p.status === '需修改' ? 'border-l-primary' :
                'border-l-muted-foreground'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {p.dimension}
                    </span>
                    <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">问题描述</p>
                    <p className="text-sm text-foreground">{p.description}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">原因分析</p>
                    <p className="text-sm text-foreground/80">{p.analysis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">改进建议</p>
                    <p className="text-sm text-foreground/80">{p.suggestion}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={p.status === '可接受' ? 'default' : 'outline'}
                    onClick={() => updateProblemStatus(p.id, '可接受')}
                    className={`text-xs ${
                      p.status === '可接受'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'border-green-600/30 text-green-700 hover:bg-green-50'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    可接受
                  </Button>
                  <Button
                    size="sm"
                    variant={p.status === '需修改' ? 'default' : 'outline'}
                    onClick={() => updateProblemStatus(p.id, '需修改')}
                    className={`text-xs ${
                      p.status === '需修改'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-primary/30 text-primary hover:bg-primary/5'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    需修改
                  </Button>
                  <Button
                    size="sm"
                    variant={p.status === '驳回' ? 'default' : 'outline'}
                    onClick={() => updateProblemStatus(p.id, '驳回')}
                    className={`text-xs ${
                      p.status === '驳回'
                        ? 'bg-muted-foreground text-white hover:bg-muted-foreground/90'
                        : 'border-muted-foreground/30 text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    驳回
                  </Button>
                </div>
              </PaperCard>
            ))}

            {/* 添加自定义问题 */}
            <PaperCard title="添加自定义问题">
              <div className="flex gap-2">
                <Textarea
                  placeholder="描述您发现的问题..."
                  value={newProblem}
                  onChange={e => setNewProblem(e.target.value)}
                  className="bg-background border-primary/20 min-h-[60px] flex-1"
                />
                <Button
                  onClick={addCustomProblem}
                  variant="outline"
                  className="border-primary/30 text-primary shrink-0 self-end"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </PaperCard>

            <div className="flex items-center justify-between gap-4">
              <Button variant="ghost" onClick={() => { setGenerated(false); setProblems([]); }} className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                返回修改
              </Button>
              <Button onClick={handleNext} className="bg-primary text-primary-foreground hover:bg-primary/90">
                确认，进入下一步
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {!generated && (
          <div className="mt-6">
            <Button variant="ghost" onClick={() => navigate('/step/2')} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              返回上一步
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}