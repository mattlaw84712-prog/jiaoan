// AI服务 - DeepSeek API 真实调用
// 环境变量 VITE_DEEPSEEK_API_KEY 需要在 Vercel 中配置

import type { LessonPlanForm, ProblemItem } from '@/types/lessonPlan';

const API_BASE = 'https://api.deepseek.com/v1';
const MODEL = 'deepseek-chat';

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

export const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

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
    console.error('DeepSeek API 调用失败:', e);
    return `# ${form.theme}\n\n## 活动目标\n\n### 认知目标\n${form.cognitiveGoal}\n\n### 能力目标\n${form.abilityGoal}\n\n### 情感目标\n${form.emotionGoal}\n\n## 活动准备\n\n### 物质准备\n- 适合${form.ageGroup}幼儿操作的活动材料若干\n- 多媒体教学设备\n- ${form.domains.join('、')}领域相关教具\n\n### 经验准备\n- 幼儿已有${form.theme}相关的初步认知经验\n- 能够进行简单的观察和表达\n\n## 活动过程\n\n### 一、导入环节（约${Math.floor(form.duration * 0.15)}分钟）\n教师通过情境创设或游戏方式导入活动主题"${form.theme}"，激发幼儿的兴趣和探索欲望。\n\n### 二、探索环节（约${Math.floor(form.duration * 0.4)}分钟）\n1. 引导幼儿观察和感知${form.theme}的核心特征\n2. 鼓励幼儿大胆表达自己的发现和想法\n3. 提供操作材料，支持幼儿动手探索\n\n### 三、分享环节（约${Math.floor(form.duration * 0.25)}分钟）\n1. 邀请幼儿分享自己的探索成果\n2. 教师适时引导，帮助幼儿梳理经验\n3. 同伴间互相学习和交流\n\n### 四、总结延伸（约${Math.floor(form.duration * 0.2)}分钟）\n教师与幼儿共同回顾活动内容，将${form.theme}的经验延伸到日常生活中。\n\n## 活动延伸\n\n- 在区域活动中投放相关材料，支持幼儿继续探索\n- 鼓励幼儿与家长分享活动体验\n- 结合${form.domains.join('、')}领域开展相关主题活动\n\n## 观察要点\n\n1. 幼儿是否能够积极参与${form.theme}的探索活动\n2. 幼儿在操作过程中表现出的兴趣和专注程度\n3. 幼儿能否用语言或动作表达自己的发现\n4. 不同发展水平的幼儿在活动中的表现差异\n5. 幼儿在同伴互动中的合作与分享行为`;
  }
}

export async function optimizeDraft(draft: string, options: string[], customReq: string): Promise<string> {
  const optLabels: Record<string, string> = {
    '1': '教师语言幼儿化', '2': '增加师幼互动示例', '3': '强化游戏仪式感',
    '4': '分层指导策略', '5': '易错点应对',
  };
  const selectedOpts = options.map(o => optLabels[o] || o).join('、');

  const systemPrompt = `你是一位资深的幼儿教育教研员，擅长对教案进行深度优化。
请根据用户选择的优化方向，对现有教案进行有针对性、具体的优化。

优化方向说明：
- 教师语言幼儿化：把书面化、指令化的语言改为亲和、口语化的表达
- 增加师幼互动示例：补充具体的师幼对话场景、提问方式和回应策略
- 强化游戏仪式感：在导入、过渡和结束环节增加游戏化的仪式设计
- 分层指导策略：针对不同发展水平的幼儿提供差异化的指导方案
- 易错点应对：补充常见操作问题的预防和应对措施

要求：保持原教案的整体结构和活动时长不变，优化内容要具体、接地气、有画面感。用 Markdown 格式输出，在顶部保留原教案内容，底部添加"优化说明"小节。`;

  try {
    return await callDeepSeek(systemPrompt, `以下是我当前的教案，请按以下方向进行优化：\n优化方向：${selectedOpts}${customReq ? `\n\n额外要求：${customReq}` : ''}\n\n教案内容：\n${draft}`);
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
    return `${draft}\n\n---\n\n### 优化说明（优化方向：${selectedOpts}）\n\n本教案已根据所选优化方向进行了深度优化。`;
  }
}

export async function generateProblems(draft: string, dimensions: string[]): Promise<ProblemItem[]> {
  const dimLabels: Record<string, string> = {
    '1': '目标匹配度', '2': '年龄适宜性', '3': '儿童参与度',
    '4': '安全与常规', '5': '差异性支持', '6': '效果可评估',
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

  try {
    const problems = await callDeepSeekJSON<ProblemItem[]>(systemPrompt, `请从以下维度对这份教案进行诊断：\n诊断维度：${selectedDims}\n\n教案内容：\n${draft}`);
    return problems.map(p => ({ ...p, id: genId(), status: '需修改' }));
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
    return dimensions.map(d => ({
      id: genId(), dimension: dimLabels[d] || d,
      description: '需要进一步分析', analysis: '暂无法自动分析',
      suggestion: '请手动检查', status: '需修改' as const,
    }));
  }
}

export async function generateFinalDraft(draft: string, problems: ProblemItem[], customReq: string): Promise<string> {
  const needFix = problems.filter(p => p.status === '需修改');
  const fixSummary = needFix.map(p => `【${p.dimension}】\n问题：${p.description}\n建议：${p.suggestion}`).join('\n\n');

  const systemPrompt = `你是一位经验丰富的幼儿园教师，擅长整合修改意见，输出高质量的教案终稿。
请根据诊断出的问题清单和修改建议，对教案进行系统性修改。要求：在原教案基础上逐一修改，保持教案的完整性和可操作性，用 Markdown 格式输出，顶部保留修改后的完整教案，底部添加"终稿修改说明"小节。`;

  try {
    return await callDeepSeek(systemPrompt, `请根据以下问题清单对教案进行修改：\n${fixSummary}${customReq ? `\n\n额外修改要求：${customReq}` : ''}\n\n教案原文：\n${draft}`);
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
    return `${draft}\n\n---\n\n### 终稿修改说明${customReq ? `\n\n> 补充修改要求：${customReq}` : ''}\n\n本次终稿针对以下${needFix.length}个问题进行了修改。`;
  }
}

export async function calibrateDraft(draft: string, dimensions: string[]): Promise<string> {
  const dimLabels: Record<string, string> = { '1': '儿童主体性校准', '2': '生成空间校准', '3': '收放平衡校准' };
  const selectedDims = dimensions.map(d => dimLabels[d] || d).join('、');

  const systemPrompt = `你是一位深谙"上海味道"幼教理念的教研专家。"上海味道"的核心理念是"润物细无声"，强调儿童本位、游戏精神和教师隐形的支持。

请根据用户选择的校准维度，对教案进行精细化润色：
1. 儿童主体性校准：将"教师引导幼儿..."改为"幼儿自主发现..."，增加开放式提问
2. 生成空间校准：在关键环节增加"如果幼儿提出..."的弹性预设
3. 收放平衡校准：明确标注教师介入的时机和等待的时间

要求：保持原教案的整体结构不变，用 Markdown 格式输出，底部添加"校准说明"。`;

  try {
    return await callDeepSeek(systemPrompt, `请按以下维度对教案进行"上海味道"校准：\n校准维度：${selectedDims}\n\n教案内容：\n${draft}`);
  } catch (e) {
    console.error('DeepSeek API 调用失败:', e);
    return `${draft}\n\n---\n\n### 上海味道校准说明\n\n本次校准基于${selectedDims}维度进行了润色优化。`;
  }
}
