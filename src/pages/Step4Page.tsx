import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { generateFinalDraft } from '@/services/aiService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StepProgress from '@/components/StepProgress';
import PaperCard from '@/components/PaperCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ArrowLeft, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Step4Page() {
  const navigate = useNavigate();
  const { currentPlan, updatePlan } = useLessonPlan();
  const [loading, setLoading] = useState(false);
  const [customReq, setCustomReq] = useState('');
  const [finalDraft, setFinalDraft] = useState('');

  if (!currentPlan) {
    navigate('/create');
    return null;
  }

  const needFixProblems = currentPlan.problems.filter(p => p.status === '需修改');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateFinalDraft(
        currentPlan.optimized || currentPlan.draft,
        currentPlan.problems,
        customReq
      );
      setFinalDraft(result);
      toast.success('终稿生成成功');
    } catch {
      toast.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const updated = {
      ...currentPlan,
      finalDraft: finalDraft || (currentPlan.optimized || currentPlan.draft),
      currentStep: 5,
      status: '已终稿' as const,
      versions: [...currentPlan.versions, {
        step: 4,
        stepName: '定终稿·做整合',
        timestamp: Date.now(),
        content: finalDraft || (currentPlan.optimized || currentPlan.draft),
      }],
    };
    updatePlan(updated);
    navigate('/step/5');
  };

  return (
    <div className="min-h-screen bg-background">
      {loading && <LoadingOverlay message="AI正在生成终稿..." />}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <StepProgress currentStep={3} />

        <div className="mt-8 mb-6">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-1">定终稿 · 做整合</h2>
          <p className="text-sm text-muted-foreground">汇总问题并修改，输出完整干净的终版教案</p>
        </div>

        <div className="space-y-6">
          {/* 问题汇总 */}
          <PaperCard title="需修改问题汇总" subtitle={`共 ${needFixProblems.length} 个问题需要修改`}>
            {needFixProblems.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">没有标记为"需修改"的问题，可直接生成终稿</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needFixProblems.map((p, idx) => (
                  <div key={p.id} className="p-3 rounded-lg bg-muted/50 border-l-4 border-l-primary">
                    <p className="text-xs text-primary font-medium mb-1">{p.dimension}</p>
                    <p className="text-sm text-foreground">{p.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">建议：{p.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </PaperCard>

          {/* 补充要求 */}
          <PaperCard title="补充修改要求（选填）">
            <Textarea
              placeholder="输入您额外的修改要求..."
              value={customReq}
              onChange={e => setCustomReq(e.target.value)}
              className="bg-background border-primary/20 min-h-[80px]"
            />
          </PaperCard>

          {/* 生成终稿 */}
          {!finalDraft ? (
            <Button
              onClick={handleGenerate}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              生成终稿
            </Button>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <PaperCard title="终稿预览" subtitle="以下是修改后的完整教案">
                <div className="max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {finalDraft}
                  </pre>
                </div>
              </PaperCard>

              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setFinalDraft('')} className="border-primary/30 text-primary">
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

          {!finalDraft && (
            <div className="flex items-center justify-start">
              <Button variant="ghost" onClick={() => navigate('/step/3')} className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                返回上一步
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}