// AI服务 - 模拟大模型API调用
// 实际使用时可替换为真实的AI API调用

import type { LessonPlanForm, ProblemItem } from '@/types/lessonPlan';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 生成唯一ID
export const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

// 第一步：生成初稿
export async function generateDraft(form: LessonPlanForm): Promise<string> {
  await delay(1500);
  const domainsStr = form.domains.join('、');
  return `# ${form.theme}

## 活动目标

### 认知目标
${form.cognitiveGoal}

### 能力目标
${form.abilityGoal}

### 情感目标
${form.emotionGoal}

## 活动准备

### 物质准备
- 适合${form.ageGroup}幼儿操作的活动材料若干
- 多媒体教学设备
- ${domainsStr}领域相关教具

### 经验准备
- 幼儿已有${form.theme}相关的初步认知经验
- 能够进行简单的观察和表达

## 活动过程

### 一、导入环节（约${Math.floor(form.duration * 0.15)}分钟）
教师通过情境创设或游戏方式导入活动主题"${form.theme}"，激发幼儿的兴趣和探索欲望。

### 二、探索环节（约${Math.floor(form.duration * 0.4)}分钟）
1. 引导幼儿观察和感知${form.theme}的核心特征
2. 鼓励幼儿大胆表达自己的发现和想法
3. 提供操作材料，支持幼儿动手探索

### 三、分享环节（约${Math.floor(form.duration * 0.25)}分钟）
1. 邀请幼儿分享自己的探索成果
2. 教师适时引导，帮助幼儿梳理经验
3. 同伴间互相学习和交流

### 四、总结延伸（约${Math.floor(form.duration * 0.2)}分钟）
教师与幼儿共同回顾活动内容，将${form.theme}的经验延伸到日常生活中。

## 活动延伸

- 在区域活动中投放相关材料，支持幼儿继续探索
- 鼓励幼儿与家长分享活动体验
- 结合${domainsStr}领域开展相关主题活动

## 观察要点

1. 幼儿是否能够积极参与${form.theme}的探索活动
2. 幼儿在操作过程中表现出的兴趣和专注程度
3. 幼儿能否用语言或动作表达自己的发现
4. 不同发展水平的幼儿在活动中的表现差异
5. 幼儿在同伴互动中的合作与分享行为`;
}

// 第二步：优化教案
export async function optimizeDraft(
  draft: string,
  options: string[],
  customReq: string
): Promise<string> {
  await delay(1800);
  const optLabels = options.length > 0
    ? `（优化方向：${options.join('、')}）`
    : '';
  const customPart = customReq ? `\n\n> 自定义要求：${customReq}` : '';

  return `${draft}

---

### 优化说明 ${optLabels}${customPart}

本教案已根据所选优化方向进行了深度优化：

1. **教师语言幼儿化**：将指令式语言转化为"小朋友们，我们一起来看看..."等亲和表达
2. **师幼互动示例**：增加了具体的师幼对话场景和互动策略
3. **游戏仪式感**：在导入和过渡环节增加了游戏化的仪式设计
4. **分层指导策略**：针对不同发展水平的幼儿提供了差异化的支持方案
5. **易错点应对**：补充了常见问题的预防和应对措施

> 本期优化保持了原有教案结构和活动时长不变，使内容更加具体、落地、有画面感。`;
}

// 第三步：生成问题清单
export async function generateProblems(
  draft: string,
  dimensions: string[]
): Promise<ProblemItem[]> {
  await delay(2000);
  const problems: ProblemItem[] = [];
  const dimMap: Record<string, { desc: string; issue: string; analysis: string; suggestion: string }> = {
    '1': {
      desc: '目标匹配度',
      issue: '部分活动环节与核心目标的关联性不够紧密，探索环节中个别活动可能偏离了认知目标的核心要求。',
      analysis: '活动设计时可能过于追求活动的丰富性，导致环节与目标的对应关系不够清晰。',
      suggestion: '建议重新审视每个环节的设计意图，确保每个活动步骤都能直接服务于核心目标的达成。'
    },
    '2': {
      desc: '年龄适宜性',
      issue: '部分操作要求可能超出该年龄段幼儿的独立完成能力，需要适当降低难度或增加支架支持。',
      analysis: '对幼儿发展水平的预估可能偏高，未充分考虑个体差异和最近发展区。',
      suggestion: '建议根据该年龄段幼儿的实际发展水平，调整材料难度和操作要求，提供分层次的材料选择。'
    },
    '3': {
      desc: '儿童参与度',
      issue: '活动中教师主导的环节偏多，幼儿自主探索和主动表达的机会可以进一步增加。',
      analysis: '传统教学观念影响，教师可能不自觉地承担了过多的引导和控制角色。',
      suggestion: '建议增加开放性问题，减少封闭式提问，给幼儿更多自主选择和表达的空间。'
    },
    '4': {
      desc: '安全与常规',
      issue: '活动材料的使用和操作过程中存在一些潜在的安全隐患，需要提前做好安全预案。',
      analysis: '安全意识需要贯穿活动设计的全过程，不能仅停留在口头提醒层面。',
      suggestion: '建议在活动准备环节明确列出安全注意事项，并在活动过程中设置安全观察点。'
    },
    '5': {
      desc: '差异性支持',
      issue: '活动设计中对不同发展水平幼儿的差异化支持策略不够具体，缺乏可操作的分层指导方案。',
      analysis: '教师可能习惯于"一刀切"的教学方式，对个体差异的关注不够细致。',
      suggestion: '建议设计"基础任务+挑战任务"的双层活动结构，为不同水平的幼儿提供适宜的支持。'
    },
    '6': {
      desc: '效果可评估',
      issue: '活动目标的达成情况缺乏可观察、可记录的评估指标，观察要点较为笼统。',
      analysis: '评估意识薄弱，未能将目标转化为可操作的行为指标。',
      suggestion: '建议将每个目标细化为2-3个可观察的行为指标，并设计简单的记录表格。'
    }
  };

  for (const dim of dimensions) {
    const info = dimMap[dim];
    if (info) {
      problems.push({
        id: genId(),
        dimension: info.desc,
        description: info.issue,
        analysis: info.analysis,
        suggestion: info.suggestion,
        status: '需修改',
      });
    }
  }

  return problems;
}

// 第四步：生成终稿
export async function generateFinalDraft(
  draft: string,
  problems: ProblemItem[],
  customReq: string
): Promise<string> {
  await delay(2000);
  const needFix = problems.filter(p => p.status === '需修改');
  const fixSummary = needFix.map(p => `${p.dimension}：${p.suggestion}`).join('\n');
  const customPart = customReq ? `\n\n> 补充修改要求：${customReq}` : '';

  return `${draft}

---

### 终稿修改说明${customPart}

本次终稿针对以下${needFix.length}个问题进行了修改：

${fixSummary}

> 终稿已整合所有修改意见，输出完整干净的教案内容。`;
}

// 第五步：上海味道校准
export async function calibrateDraft(
  draft: string,
  dimensions: string[]
): Promise<string> {
  await delay(1800);
  const dimLabels = dimensions.map(d => {
    const map: Record<string, string> = {
      '1': '儿童主体性校准',
      '2': '生成空间校准',
      '3': '收放平衡校准',
    };
    return map[d] || d;
  });

  return `${draft}

---

### 上海味道校准说明

本次校准基于${dimLabels.join('、')}维度进行了润色优化：

1. **儿童主体性校准**：将"教师引导幼儿..."改为"幼儿自主发现..."，增加开放式提问，减少指令式语言
2. **生成空间校准**：在关键环节增加"如果幼儿提出..."的弹性预设，让教案更具生成性
3. **收放平衡校准**：明确标注教师介入时机和等待时间，给幼儿留出充分的自主探索空间

> 校准后的教案体现了"润物细无声"的上海幼教风格，注重儿童本位和游戏精神。`;
}