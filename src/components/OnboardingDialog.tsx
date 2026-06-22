import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Search, FileCheck, MapPin } from 'lucide-react';

const ONBOARDING_KEY = 'lesson_plan_onboarding_done';

const steps = [
  {
    icon: BookOpen,
    title: '什么是"4+1"方法？',
    desc: '"4+1"教案迭代法是一种系统化的教案打磨方法，通过四个核心步骤加一个特色校准，帮助教师从初稿到终稿逐步完善教案质量。',
  },
  {
    icon: Sparkles,
    title: '第一步：搭骨架·出初稿',
    desc: '填写教案基本信息，AI自动生成符合《3-6岁儿童学习与发展指南》的教案框架。',
  },
  {
    icon: Search,
    title: '第二步：填血肉·做丰满',
    desc: '选择优化方向，AI将教案变得更具体、更落地、更有画面感。',
  },
  {
    icon: FileCheck,
    title: '第三步：挑毛病·找真问题',
    desc: 'AI从多个维度诊断教案问题，帮助您发现盲点。',
  },
  {
    icon: MapPin,
    title: '第四步：定终稿·做整合',
    desc: '汇总问题并修改，输出完整干净的终版教案。',
  },
];

export default function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setOpen(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            欢迎使用 4+1教案迭代助手
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === 0 ? (
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <s.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">第五步：上海味道校准</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                上海幼教专属功能，从儿童主体性、生成空间、收放平衡三个维度润色教案，体现"润物细无声"的上海幼教风格。
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-2">
          {[0, 1].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        <DialogFooter className="gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="border-primary/30 text-primary">
              上一步
            </Button>
          )}
          {step < 1 ? (
            <Button onClick={() => setStep(1)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              下一步
            </Button>
          ) : (
            <Button onClick={handleClose} className="bg-primary text-primary-foreground hover:bg-primary/90">
              开始使用
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}