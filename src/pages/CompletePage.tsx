import { useNavigate, useParams } from 'react-router-dom';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { Button } from '@/components/ui/button';
import PaperCard from '@/components/PaperCard';
import { ArrowLeft, Copy, Share2, Home, History } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { STEP_NAMES } from '@/types/lessonPlan';

export default function CompletePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { plans } = useLessonPlan();
  const plan = plans.find(p => p.id === id);

  if (!plan) {
    navigate('/');
    return null;
  }

  const finalContent = plan.calibrated || plan.finalDraft || plan.optimized || plan.draft;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalContent);
      toast.success('教案已复制到剪贴板');
    } catch {
      toast.error('复制失败，请手动选择复制');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: plan.title,
        text: finalContent,
      }).catch(() => {});
    } else {
      handleCopy();
      toast.info('已复制教案内容，可粘贴分享');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          返回首页
        </Button>

        {/* 标题 */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-1">
            教案完成
          </h2>
          <p className="text-sm text-muted-foreground">
            「{plan.title}」已通过5步迭代完成打磨
          </p>
        </div>

        {/* 完整教案 */}
        <PaperCard title="完整教案" subtitle={`${plan.form.ageGroup} · ${plan.form.domains.join('、')} · ${plan.form.duration}分钟`}>
          <div className="max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-[1.8] text-foreground">
              {finalContent}
            </pre>
          </div>
        </PaperCard>

        {/* 迭代历程 */}
        <PaperCard title="迭代历程" className="mt-6">
          <div className="space-y-3">
            {plan.versions.map((v, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-primary font-medium">{v.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{v.stepName}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(v.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {STEP_NAMES[v.step - 1] || '未知步骤'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PaperCard>

        {/* 操作按钮 */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button onClick={handleCopy} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Copy className="w-4 h-4 mr-1.5" />
            一键复制教案
          </Button>
          <Button variant="outline" onClick={handleShare} className="border-primary/30 text-primary">
            <Share2 className="w-4 h-4 mr-1.5" />
            分享教案
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/detail/${plan.id}`)} className="text-muted-foreground">
            <History className="w-4 h-4 mr-1.5" />
            查看详情
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
            <Home className="w-4 h-4 mr-1.5" />
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}