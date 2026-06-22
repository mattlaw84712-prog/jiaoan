-- ============================================================
-- 4+1 教案迭代助手 - Supabase 建表脚本
-- 使用方法：登录 Supabase 仪表盘 → SQL Editor → 粘贴执行
-- ============================================================

-- 1. 创建 profiles 表（用户资料）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建 lesson_plans 表（教案数据）
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_user_id ON public.lesson_plans(user_id);

-- 3. 启用行级安全（RLS）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- 4. profiles 表 RLS 策略
CREATE POLICY "用户可以查看自己的资料"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "用户可以创建自己的资料"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "用户可以更新自己的资料"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. lesson_plans 表 RLS 策略
CREATE POLICY "用户只能查看自己的教案"
  ON public.lesson_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的教案"
  ON public.lesson_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的教案"
  ON public.lesson_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的教案"
  ON public.lesson_plans FOR DELETE
  USING (auth.uid() = user_id);

-- 6. 注册时自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();