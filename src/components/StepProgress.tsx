import { STEP_NAMES } from '@/types/lessonPlan';

interface StepProgressProps {
  currentStep: number;
}

export default function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="w-full">
      {/* 细线进度条 */}
      <div className="flex items-center gap-1 mb-3">
        {STEP_NAMES.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              idx < currentStep
                ? 'bg-primary'
                : idx === currentStep
                  ? 'bg-primary/60'
                  : 'bg-border'
            }`}
          />
        ))}
      </div>
      {/* 步骤标签 */}
      <div className="flex items-center justify-between">
        {STEP_NAMES.map((name, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              idx === currentStep
                ? 'text-primary font-medium'
                : idx < currentStep
                  ? 'text-primary/60'
                  : 'text-muted-foreground'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border ${
              idx === currentStep
                ? 'bg-primary text-primary-foreground border-primary'
                : idx < currentStep
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-muted text-muted-foreground border-border'
            }`}>
              {idx < currentStep ? '✓' : idx + 1}
            </span>
            <span className="hidden md:inline">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}