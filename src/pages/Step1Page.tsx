import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { generateDraft } from '@/services/aiService';
import { AGE_GROUPS, ACTIVITY_DOMAINS } from '@/types/lessonPlan';
import type { AgeGroup, ActivityDomain } from '@/types/lessonPlan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import StepProgress from '@/components/StepProgress';
import PaperCard from '@/components/PaperCard';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ArrowLeft, Sparkles, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function Step1Page() {
  const navigate = useNavigate();
  const { createPlan, updatePlan, currentPlan, setCurrentPlan } = useLessonPlan();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  // 表单状态
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('中班');
  const [ageDetail, setAgeDetail] = useState('');
  const [domains, setDomains] = useState<ActivityDomain[]>(['科学']);
  const [duration, setDuration] = useState(30);
  const [theme, setTheme] = useState('');
  const [cognitiveGoal, setCognitiveGoal] = useState('');
  const [abilityGoal, setAbilityGoal] = useState('');
  const [emotionGoal, setEmotionGoal] = useState('');

  const toggleDomain = (d: ActivityDomain) => {
    setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const handleGenerate = async () => {
    if (!theme.trim()) { toast.error('请输入活动主题'); return; }
    if (domains.length === 0) { toast.error('请至少选择一个活动领域'); return; }
    if (!cognitiveGoal.trim() && !abilityGoal.trim() && !emotionGoal.trim()) {
      toast.error('请至少填写一个核心目标'); return;
    }

    setLoading(true);
    try {
      const form = { ageGroup, ageDetail, domains, duration, theme, cognitiveGoal, abilityGoal, emotionGoal };
      const draft = await generateDraft(form);

      let plan;
      if (currentPlan && currentPlan.currentStep === 1) {
        plan = { ...currentPlan, form, draft, title: theme, status: '初稿' as const };
        updatePlan(plan);
      } else {
        plan = createPlan(form);
        plan.draft = draft;
        plan.title = theme;
        updatePlan(plan);
      }
      setPreview(true);
      toast.success('初稿生成成功');
    } catch {
      toast.error('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!currentPlan) return;
    const updated = {
      ...currentPlan,
      currentStep: 2,
      status: '优化中' as const,
      versions: [...currentPlan.versions, { step: 1, stepName: '搭骨架·出初稿', timestamp: Date.now(), content: currentPlan.draft }],
    };
    updatePlan(updated);
    navigate('/step/2');
  };

  return (
    <div className="min-h-screen bg-background">
      {loading && <LoadingOverlay message="AI正在生成教案初稿..." />}

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          返回首页
        </Button>

        {/* 进度条 */}
        <div className="mb-8">
          <StepProgress currentStep={0} />
        </div>

        {/* 标题 */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-1">搭骨架 · 出初稿</h2>
          <p className="text-sm text-muted-foreground">填写教案基本信息，AI将自动生成教案框架</p>
        </div>

        {!preview ? (
          <PaperCard title="教案基本信息" subtitle="请填写以下信息，AI将据此生成教案初稿">
            <div className="space-y-5">
              {/* 年龄段 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">年龄段</Label>
                  <Select value={ageGroup} onValueChange={v => setAgeGroup(v as AgeGroup)}>
                    <SelectTrigger className="bg-background border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_GROUPS.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">活动时长（分钟）</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    className="bg-background border-primary/20"
                    min={10}
                    max={120}
                  />
                </div>
              </div>

              {/* 细分描述 */}
              <div className="space-y-2">
                <Label className="text-foreground">年龄段细分描述（选填）</Label>
                <Input
                  placeholder="如：4-5岁，已有初步的观察经验"
                  value={ageDetail}
                  onChange={e => setAgeDetail(e.target.value)}
                  className="bg-background border-primary/20"
                />
              </div>

              {/* 活动领域 */}
              <div className="space-y-2">
                <Label className="text-foreground">活动领域（可多选）</Label>
                <div className="flex flex-wrap gap-3">
                  {ACTIVITY_DOMAINS.map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={domains.includes(d)}
                        onCheckedChange={() => toggleDomain(d)}
                      />
                      <span className="text-sm text-foreground">{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 活动主题 */}
              <div className="space-y-2">
                <Label className="text-foreground">活动主题</Label>
                <Input
                  placeholder="如：有趣的磁铁、春天的花朵"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="bg-background border-primary/20"
                />
              </div>

              {/* 核心目标 */}
              <div className="space-y-4">
                <Label className="text-foreground">核心目标</Label>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">认知目标</Label>
                    <Textarea
                      placeholder="如：了解磁铁的基本特性"
                      value={cognitiveGoal}
                      onChange={e => setCognitiveGoal(e.target.value)}
                      className="bg-background border-primary/20 min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">能力目标</Label>
                    <Textarea
                      placeholder="如：能够通过实验发现磁铁的吸铁特性"
                      value={abilityGoal}
                      onChange={e => setAbilityGoal(e.target.value)}
                      className="bg-background border-primary/20 min-h-[60px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">情感目标</Label>
                    <Textarea
                      placeholder="如：对科学探索活动产生兴趣"
                      value={emotionGoal}
                      onChange={e => setEmotionGoal(e.target.value)}
                      className="bg-background border-primary/20 min-h-[60px]"
                    />
                  </div>
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerate}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                生成初稿
              </Button>
            </div>
          </PaperCard>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <PaperCard title="教案初稿预览" subtitle="您可以查看和微调以下内容">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground bg-transparent p-0 m-0">
                  {currentPlan?.draft}
                </pre>
              </div>
            </PaperCard>

            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setPreview(false)}
                className="border-primary/30 text-primary"
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                返回修改
              </Button>
              <Button
                onClick={handleNext}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                确认，进入下一步
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}