## Vibe
- 极简MUJI风，温暖安静有质感，日式和纸美学与北欧极简的融合

## Color
- Primary: #8B4513 (砖红色)
- On Primary: #F7F3EB (温暖米白)
- Accent: #A0937D (暖灰色)
- On Accent: #F7F3EB (温暖米白)
- Background: #F7F3EB (温暖米白)
- Foreground: #3D2B1F (深棕色)
- Muted: #E8E2D8 (浅米灰)
- Border: #C4B8A8 (暖灰边框)
- Secondary: #D4C5B0 (浅暖灰)

## Typography
- Heading: Noto Serif SC (family: 'Noto Serif SC', serif, weight: 600, url: https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap)
- Body: Noto Sans SC (family: 'Noto Sans SC', sans-serif, weight: 400, url: https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&display=swap)

## Visual Language
- 核心视觉签名：纸张微肌理背景，通过CSS噪点纹理模拟和纸质感，配合砖红色细线边框的圆角卡片
- 材质与深度：柔和的纸张阴影（box-shadow: 0 2px 12px rgba(139,69,19,0.08)），无硬阴影，温暖柔和的层次感
- 容器与按钮：圆角卡片（border-radius: 12px），浅米色背景，砖红色细线边框（1px solid #8B4513）；按钮为砖红色填充，米白文字，hover时轻微加深
- 布局节奏：大量留白，每屏信息量适中，行间距1.8以上，温暖安静不拥挤

## Animation
- 入场：卡片淡入上移（opacity 0→1, translateY 12px→0, 300ms ease-out）
- 交互：按钮hover轻微缩放（scale 1.02），进度条平滑过渡
- 滚动/过渡：步骤切换时内容区域平滑淡入淡出

## Forbidden
- 禁止使用大色块铺底，Primary/Accent仅用于小面积焦点元素
- 禁止使用通用投影、渐变背景、毛玻璃效果作为核心视觉签名
- 禁止使用emoji作为图标，使用lucide-react图标库

## Additional Notes
- 所有用户可见文案使用中文
- 教案展示区使用类纸张微肌理背景（CSS噪点纹理）
- 进度指示：顶部细线进度条，当前步骤用砖红色高亮
- 状态标签使用不同颜色区分：初稿(暖灰)、优化中(砖红)、已终稿(深棕)、已校准(暖灰)