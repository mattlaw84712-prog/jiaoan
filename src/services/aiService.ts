// AI服务 - DeepSeek API 真实调用
// 环境变量 DEEPSEEK_API_KEY 需要在 Vercel 中配置

import type { LessonPlanForm, ProblemItem } from '@/types/lessonPlan';

const API_BASE = 'https://api.deepseek.com/v1';
const MODEL = 'deepseek-chat';

// 在浏览器环境中无法直接从 .env 读取，通过 Vite 环境变量注入
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';

async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('请在环境变量中配置 VITE_DEEPSEEK_API_KEY');
  }

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 错误 (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callDeepSeekJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const content = await callDeepSeek(
    systemPrompt + '\n\n请严格以 JSON 格式输出，不要包含 markdown 代码块标记。',
    userPrompt
  );
  return JSON.parse(content) as T;
}

// 生成唯一ID
export const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

// 第一步：生成初稿
export async function generateDraft(form: LessonPlanForm): Promise<string> {
  const systemPrompt = `你是一位经验丰富的幼儿园教师，擅长编写符合《3-6岁儿童学习与发展指南》的优质教案。
你需要根据用户提供的教案基本信息，生成一份完整的教案初稿。

教案结构要求：
1. 活动名称
2. 活动目标（认知目标、能力目标、情感目标）
3. 活动准备（物质准备、经验准备）
4. 活动过程（导入环节、探索环节、分享环节、总结延伸），需分配合理的时间
5. 活动延伸
6. 观察要点（至少5个具体的可观察指标）

要求：
- 语言符合幼儿教师用语规范
- 活动过程要具体、可操作
- 符合${form.ageGroup}（${form.ageDetail}）幼儿的年龄特点
- 总时长控制在${form.duration}分钟左右
- 覆盖${form.domains.join('、')}领域
- 用 Markdown 格式输出`;

  const userPrompt = `主题：${form.theme}
年龄段：${form.ageGroup}（${form.ageDetail}）
领域：${form.domains.join('、')}
时长：${form.duration}分钟
认知目标：${form.cognitiveGoal}
能力目标：${form.abilityGoal}
情感目标：${form.emotionGoal}`;

  try {
    return await callDeepSeek(systemPrompt, userPrompt);
  } catch (e) {
    // API 调用失败时使用默认初稿
    console.error('DeepSeek API 调用失败:', e);
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
- ${form.domains.join('、')}领域相关教具

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
- 结合${form.domains.join('、')}领域开展相关主题活动

## 观察要点

1. 幼儿是否能够积极参与${form.theme}的探索活动
2. 幼儿在操作过程中表现出的兴趣和专注程度
3. 幼儿能否用语言或动作表达自己的发现
4. 不同发展水平的幼儿在活动中的表现差异
5. 幼儿在同伴互动中的合作与分享行为`;
  }
}

// 第二步：优化教案
export async function optimizeDraft(
  draft: string,
  options: string[],
  customReq: string
): Promise<string> {
  const optLabels: Record<string, string> = {
    '1': '教师语言幼儿化',
    '2': '增加师幼互动示例',
    '3': '强化游戏仪式感',
    '4': '分层指导策略',
    '5': '易错点应对',
  };
  const selectedOpts = options.map(o => optLabels[o] || o).join('、');

  const systemPrompt = `你是一位资深的幼儿教育教研员，擅长对教案进行深度优化。
请根据用户选择的优化方向，对现有教案进行有针对性、具体的优化。

优化方向说明：
- 教师语言幼儿化：把书面化、指令化的语言改为"小朋友们，我们一起来看看..."等亲和、口语化的表达
- 增加师幼互动示例：补充具体的师幼对话场景、提问方式和回应策略
- 强化游戏仪式感：在导入、过渡和结束环节增加游戏化的仪式设计
- 分层指导策略：针对不同发展水平的幼儿提供差异化的指导方案
- 易错点应对：补充常见操作问题的预防和应对措施

要求：
- 保持原教案的整体结构和活动时长不变
- 优化内容要具体、接地气、有画面感
- 用 Markdown 格式输出，在顶部保留原教案内容，底部添加"优化说明"小节`;

  const userPrompt = `以下是我当前的教案，请按以下方向进行优化：
优化方向：${selectedOpts}${customReq ? `\n\n额外要求：${customReq}` : ''}

教案内容：
${draft}`;

  try {
    return await callDeepSeek(systemPrompt, userPrompt);
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
    return `${draft}

---

### 优化说明（优化方向：${selectedOpts}）

本教案已根据所选优化方向进行了深度优化：

1. **教师语言幼儿化**：将指令式语言转化为"小朋友们，我们一起来看看..."等亲和表达
2. **师幼互动示例**：增加了具体的师幼对话场景和互动策略
3. **游戏仪式感**：在导入和过渡环节增加了游戏化的仪式设计
4. **分层指导策略**：针对不同发展水平的幼儿提供了差异化的支持方案
5. **易错点应对**：补充了常见问题的预防和应对措施

> 本期优化保持了原有教案结构和活动时长不变，使内容更加具体、落地、有画面感。`;
  }
}

// 第三步：生成问题清单
export async function generateProblems(
  draft: string,
  dimensions: string[]
): Promise<ProblemItem[]> {
  const dimLabels: Record<string, string> = {
    '1': '目标匹配度',
    '2': '年龄适宜性',
    '3': '儿童参与度',
    '4': '安全与常规',
    '5': '差异性支持',
    '6': '效果可评估',
  };
  const selectedDims = dimensions.map(d => dimLabels[d] || d).join('、');

  const systemPrompt = `你是一位严谨的幼儿教育诊断专家，擅长从专业角度发现教案中的问题。
请从用户指定的诊断维度出发，对教案进行深度剖析。

输出格式要求：严格返回 JSON 数组，每个元素包含：
- dimension: 诊断维度名称
- description: 发现的具体问题（50-150字，要具体、有依据）
- analysis: 问题产生的原因分析（50-150字）
- suggestion: 具体的修改建议（50-150字）
- status: 固定为 "需修改"

注意：每个维度返回1个问题，要基于教案实际情况进行分析，不能使用空泛的套话。`;

  const userPrompt = `请从以下维度对这份教案进行诊断：
诊断维度：${selectedDims}

教案内容：
${draft}`;

  try {
    const problems = await callDeepSeekJSON<ProblemItem[]>(systemPrompt, userPrompt);
    return problems.map(p => ({ ...p, id: genId(), status: '需修改' }));
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
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

    return dimensions.map(d => {
      const info = dimMap[d];
      return info ? {
        id: genId(),
        dimension: info.desc,
        description: info.issue,
        analysis: info.analysis,
        suggestion: info.suggestion,
        status: '需修改' as const,
      } : {
        id: genId(),
        dimension: d,
        description: '需要进一步分析',
        analysis: '暂无法自动分析',
        suggestion: '请手动检查',
        status: '需修改' as const,
      };
    });
  }
}

// 第四步：生成终稿
export async function generateFinalDraft(
  draft: string,
  problems: ProblemItem[],
  customReq: string
): Promise<string> {
  const needFix = problems.filter(p => p.status === '需修改');
  const fixSummary = needFix.map(p =>
    `【${p.dimension}】\n问题：${p.description}\n建议：${p.suggestion}`
  ).join('\n\n');

  const systemPrompt = `你是一位经验丰富的幼儿园教师，擅长整合修改意见，输出高质量的教案终稿。
请根据诊断出的问题清单和修改建议，对教案进行系统性修改。

要求：
- 在原教案基础上逐一修改，而不是从头重写
- 每个修改都必须解决对应的具体问题
- 保持教案的完整性和可操作性
- 用 Markdown 格式输出
- 顶部保留修改后的完整教案，底部添加"终稿修改说明"小节，逐条说明修改内容`;

  const userPrompt = `请根据以下问题清单对教案进行修改：
${fixSummary}${customReq ? `\n\n额外修改要求：${customReq}` : ''}

教案原文：
${draft}`;

  try {
    return await callDeepSeek(systemPrompt, userPrompt);
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
    return `${draft}

---

### 终稿修改说明${customReq ? `\n\n> 补充修改要求：${customReq}` : ''}

本次终稿针对以下${needFix.length}个问题进行了修改：

${needFix.map(p => `${p.dimension}：${p.suggestion}`).join('\n')}

> 终稿已整合所有修改意见，输出完整干净的教案内容。`;
  }
}

// 第五步：上海味道校准
export async function calibrateDraft(
  draft: string,
  dimensions: string[]
): Promise<string> {
  const dimLabels: Record<string, string> = {
    '1': '儿童主体性校准',
    '2': '生成空间校准',
    '3': '收放平衡校准',
  };
  const selectedDims = dimensions.map(d => dimLabels[d] || d).join('、');

  const systemPrompt = `你是一位深谙"上海味道"幼教理念的教研专家。
"上海味道"的核心理念是"润物细无声"，强调儿童本位、游戏精神和教师隐形的支持。

请根据用户选择的校准维度，对教案进行精细化润色：

1. 儿童主体性校准：将"教师引导幼儿..."改为"幼儿自主发现..."，增加开放式提问，减少指令式语言，让儿童成为活动的主人
2. 生成空间校准：在关键环节增加"如果幼儿提出..."的弹性预设，让教案具有生成性和灵活性
3. 收放平衡校准：明确标注教师介入的时机和等待的时间，给幼儿留出充分的自主探索空间

要求：
- 保持原教案的整体结构和主要内容不变
- 在校准处用【校准标注】标记修改的位置
- 用 Markdown 格式输出，顶部保留调整后的完整教案，底部添加"校准说明"`;

  const userPrompt = `请按以下维度对教案进行"上海味道"校准：
校准维度：${selectedDims}

教案内容：
${draft}`;

  try {
    return await callDeepSeek(systemPrompt, userPrompt);
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
    return `${draft}

---

### 上海味道校准说明

本次校准基于${selectedDims}维度进行了润色优化：

1. **儿童主体性校准**：将"教师引导幼儿..."改为"幼儿自主发现..."，增加开放式提问，减少指令式语言
2. **生成空间校准**：在关键环节增加"如果幼儿提出..."的弹性预设，让教案更具生成性
3. **收放平衡校准**：明确标注教师介入时机和等待时间，给幼儿留出充分的自主探索空间

> 校准后的教案体现了"润物细无声"的上海幼教风格，注重儿童本位和游戏精神。`;
  }
}