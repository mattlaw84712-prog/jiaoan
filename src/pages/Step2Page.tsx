import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { optimizeDraft } from '@/services/aiService';
import { OPTIMIZE_OPTIONS } from '@/types/lessonPlan';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import StepProgress from '@/components/StepProgress';
import PaperCard from '@/components/PaperCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Step2Page() {
  const navigate = useNavigate();
  const { currentPlan, updatePlan } = useLessonPlan();
  const [loading, setLoading] = useState(false);
  const [selectedOpts, setSelectedOpts] = useState<string[]>([]);
  const [customReq, setCustomReq] = useState('');
  const [optimized, setOptimized] = useState('');
  const [showCompare, setShowCompare] = useState(false);

  if (!currentPlan) {
    navigate('/create');
    return null;
  }

  const toggleOpt = (id: string) => {
    setSelectedOpts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const labels = OPTIMIZE_OPTIONS.filter(o => selectedOpts.includes(o.id)).map(o => o.label);
      const result = await optimizeDraft(currentPlan.draft, labels, customReq);
      setOptimized(result);
      setShowCompare(true);
      toast.success('优化完成');
    } catch {
      toast.error('优化失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const updated = {
      ...currentPlan,
      optimized: optimized || currentPlan.draft,
      currentStep: 3,
      versions: [...currentPlan.versions, {
        step: 2,
        stepName: '填血肉·做丰满',
        timestamp: Date.now(),
        content: optimized || currentPlan.draft,
      }],
    };
    updatePlan(updated);
    navigate('/step/3');
  };

  const handleBack = () => {
    navigate('/step/1');
  };

  return (
    <div className="min-h-screen bg-background">
      {loading && <LoadingOverlay message="AI正在优化教案..." />}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <StepProgress currentStep={1} />

        <div className="mt-8 mb-6">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-1">填血肉 · 做丰满</h2>
          <p className="text-sm text-muted-foreground">选择优化方向，让教案更具体、更落地、更有画面感</p>
        </div>

        {!showCompare ? (
          <div className="space-y-6">
            {/* 当前教案 */}
            <PaperCard title="当前教案" subtitle="以下是将要优化的教案内容">
              <div className="max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">
                  {currentPlan.draft}
                </pre>
              </div>
            </PaperCard>

            {/* 优化方向 */}
            <PaperCard title="选择优化方向">
              <div className="space-y-3">
                {OPTIMIZE_OPTIONS.map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    <Checkbox
                      checked={selectedOpts.includes(opt.id)}
                      onCheckedChange={() => toggleOpt(opt.id)}
                    />
                    <span className="text-sm text-foreground">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">自定义优化要求（选填）</p>
                <Textarea
                  placeholder="输入您希望优化的其他方向..."
                  value={customReq}
                  onChange={e => setCustomReq(e.target.value)}
                  className="bg-background border-primary/20 min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleOptimize}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                开始优化
              </Button>
            </PaperCard>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* 对比展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaperCard title="优化前" className="h-full">
                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">
                    {currentPlan.draft}
                  </pre>
                </div>
              </PaperCard>
              <PaperCard title="优化后" className="h-full border-primary/40">
                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {optimized}
                  </pre>
                </div>
              </PaperCard>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setShowCompare(false)} className="border-primary/30 text-primary">
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

        {!showCompare && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              返回上一步
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}