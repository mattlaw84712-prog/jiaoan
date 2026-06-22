// 教案相关类型定义

export type AgeGroup = '托班' | '小班' | '中班' | '大班';

export type ActivityDomain = '科学' | '语言' | '艺术' | '健康' | '社会';

export type LessonPlanStatus = '初稿' | '优化中' | '已终稿' | '已校准';

export interface LessonPlanForm {
  ageGroup: AgeGroup;
  ageDetail: string;
  domains: ActivityDomain[];
  duration: number;
  theme: string;
  cognitiveGoal: string;
  abilityGoal: string;
  emotionGoal: string;
}

export interface LessonPlanContent {
  objectives: string;
  preparation: string;
  process: string;
  extension: string;
  observation: string;
}

export interface ProblemItem {
  id: string;
  dimension: string;
  description: string;
  analysis: string;
  suggestion: string;
  status: '可接受' | '需修改' | '驳回';
}

export interface VersionRecord {
  step: number;
  stepName: string;
  timestamp: number;
  content: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  form: LessonPlanForm;
  currentStep: number;
  status: LessonPlanStatus;
  draft: string;
  optimized: string;
  problems: ProblemItem[];
  finalDraft: string;
  calibrated: string;
  versions: VersionRecord[];
  createdAt: number;
  updatedAt: number;
}

export const AGE_GROUPS: AgeGroup[] = ['托班', '小班', '中班', '大班'];
export const ACTIVITY_DOMAINS: ActivityDomain[] = ['科学', '语言', '艺术', '健康', '社会'];
export const STATUS_COLORS: Record<LessonPlanStatus, string> = {
  '初稿': 'bg-secondary text-secondary-foreground',
  '优化中': 'bg-primary text-primary-foreground',
  '已终稿': 'bg-foreground text-background',
  '已校准': 'bg-accent text-accent-foreground',
};

export const OPTIMIZE_OPTIONS = [
  { id: '1', label: '教师语言幼儿化' },
  { id: '2', label: '增加师幼互动示例' },
  { id: '3', label: '强化游戏仪式感' },
  { id: '4', label: '分层指导策略' },
  { id: '5', label: '易错点应对' },
];

export const PROBLEM_DIMENSIONS = [
  { id: '1', label: '目标匹配度', desc: '环节是否支撑目标' },
  { id: '2', label: '年龄适宜性', desc: '是否匹配该年龄段' },
  { id: '3', label: '儿童参与度', desc: '孩子是否主动探究' },
  { id: '4', label: '安全与常规', desc: '有无安全隐患' },
  { id: '5', label: '差异性支持', desc: '是否关注不同水平孩子' },
  { id: '6', label: '效果可评估', desc: '有没有可操作的评估方法' },
];

export const CALIBRATION_DIMENSIONS = [
  { id: '1', label: '儿童主体性校准', desc: '把教师指令式语言改为引导式、开放式的语言', icon: '🎯' },
  { id: '2', label: '生成空间校准', desc: '增加弹性预设，让教案不是死板的剧本', icon: '🌱' },
  { id: '3', label: '收放平衡校准', desc: '明确教师介入边界，留白等待时间', icon: '⚖️' },
];

export const STEP_NAMES = [
  '搭骨架·出初稿',
  '填血肉·做丰满',
  '挑毛病·找真问题',
  '定终稿·做整合',
  '上海味道校准',
];