import { useNavigate, useParams } from 'react-router-dom';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PaperCard from '@/components/PaperCard';
import { ArrowLeft, Copy, Share2, Home, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { STATUS_COLORS, STEP_NAMES } from '@/types/lessonPlan';

export default function DetailPage() {
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
      navigator.share({ title: plan.title, text: finalContent }).catch(() => {});
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

        {/* 教案信息 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl md:text-2xl font-serif text-foreground">{plan.title}</h2>
            <Badge className={STATUS_COLORS[plan.status]}>{plan.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {plan.form.ageGroup} · {plan.form.domains.join('、')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {plan.form.duration}分钟
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              创建于 {format(new Date(plan.createdAt), 'yyyy-MM-dd HH:mm')}
            </span>
          </div>
        </div>

        {/* 教案内容 */}
        <PaperCard title="教案内容">
          <div className="max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-[1.8] text-foreground">
              {finalContent}
            </pre>
          </div>
        </PaperCard>

        {/* 版本记录 */}
        {plan.versions.length > 0 && (
          <PaperCard title="迭代版本记录" className="mt-6">
            <div className="space-y-3">
              {plan.versions.map((v, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-foreground">
                      第{v.step}步：{v.stepName}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(v.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground/70">
                      {v.content.length > 500 ? v.content.substring(0, 500) + '...' : v.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </PaperCard>
        )}

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
          <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
            <Home className="w-4 h-4 mr-1.5" />
            返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}