import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { calibrateDraft } from '@/services/aiService';
import { CALIBRATION_DIMENSIONS } from '@/types/lessonPlan';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import StepProgress from '@/components/StepProgress';
import PaperCard from '@/components/PaperCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Step5Page() {
  const navigate = useNavigate();
  const { currentPlan, updatePlan } = useLessonPlan();
  const [loading, setLoading] = useState(false);
  const [selectedDims, setSelectedDims] = useState<string[]>(['1', '2', '3']);
  const [calibrated, setCalibrated] = useState('');
  const [showCompare, setShowCompare] = useState(false);

  if (!currentPlan) {
    navigate('/create');
    return null;
  }

  const toggleDim = (id: string) => {
    setSelectedDims(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCalibrate = async () => {
    if (selectedDims.length === 0) { toast.error('请至少选择一个校准维度'); return; }
    setLoading(true);
    try {
      const result = await calibrateDraft(currentPlan.finalDraft || currentPlan.optimized || currentPlan.draft, selectedDims);
      setCalibrated(result);
      setShowCompare(true);
      toast.success('校准完成');
    } catch {
      toast.error('校准失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const updated = {
      ...currentPlan,
      calibrated: calibrated || (currentPlan.finalDraft || currentPlan.optimized || currentPlan.draft),
      currentStep: 6,
      status: '已校准' as const,
      versions: [...currentPlan.versions, {
        step: 5,
        stepName: '上海味道校准',
        timestamp: Date.now(),
        content: calibrated || (currentPlan.finalDraft || currentPlan.optimized || currentPlan.draft),
      }],
    };
    updatePlan(updated);
    navigate(`/complete/${currentPlan.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {loading && <LoadingOverlay message="AI正在进行上海味道校准..." />}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <StepProgress currentStep={4} />

        <div className="mt-8 mb-6">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-1">上海味道校准</h2>
          <p className="text-sm text-muted-foreground">上海幼教专属功能，润物细无声的上海风味教案</p>
        </div>

        {!showCompare ? (
          <div className="space-y-6">
            {/* 校准维度 */}
            <PaperCard title="选择校准维度">
              <div className="space-y-4">
                {CALIBRATION_DIMENSIONS.map(dim => (
                  <div key={dim.id} className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{dim.icon}</span>
                        <p className="text-sm font-medium text-foreground">{dim.label}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{dim.desc}</p>
                    </div>
                    <Switch
                      checked={selectedDims.includes(dim.id)}
                      onCheckedChange={() => toggleDim(dim.id)}
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={handleCalibrate}
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                一键校准
              </Button>
            </PaperCard>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* 对比展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaperCard title="校准前" className="h-full">
                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">
                    {currentPlan.finalDraft || currentPlan.optimized || currentPlan.draft}
                  </pre>
                </div>
              </PaperCard>
              <PaperCard title="校准后" className="h-full border-primary/40">
                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {calibrated}
                  </pre>
                </div>
              </PaperCard>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setShowCompare(false)} className="border-primary/30 text-primary">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                返回修改
              </Button>
              <Button onClick={handleComplete} className="bg-primary text-primary-foreground hover:bg-primary/90">
                完成
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {!showCompare && (
          <div className="mt-6">
            <Button variant="ghost" onClick={() => navigate('/step/4')} className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              返回上一步
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}