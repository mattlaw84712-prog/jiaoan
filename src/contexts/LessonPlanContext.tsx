import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LessonPlan, LessonPlanForm } from '@/types/lessonPlan';
import { genId } from '@/services/aiService';
import { supabase } from '@/db/supabase';
import { useAuth } from './AuthContext';

interface LessonPlanContextType {
  plans: LessonPlan[];
  currentPlan: LessonPlan | null;
  loading: boolean;
  createPlan: (form: LessonPlanForm) => LessonPlan;
  updatePlan: (plan: LessonPlan) => void;
  deletePlan: (id: string) => void;
  setCurrentPlan: (plan: LessonPlan | null) => void;
  setCurrentPlanById: (id: string) => void;
  searchPlans: (keyword: string) => LessonPlan[];
}

const LessonPlanContext = createContext<LessonPlanContextType | undefined>(undefined);

function normalizePlan(row: any): LessonPlan {
  return row.data as LessonPlan;
}

export function LessonPlanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // 用户登录后从 Supabase 加载教案
  useEffect(() => {
    if (!user) {
      setPlans([]);
      setCurrentPlan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from('lesson_plans')
      .select('data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('加载教案失败:', error);
          setPlans([]);
        } else {
          setPlans((data || []).map(normalizePlan));
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  const createPlan = useCallback((form: LessonPlanForm): LessonPlan => {
    const now = Date.now();
    const plan: LessonPlan = {
      id: genId(),
      title: form.theme,
      form,
      currentStep: 1,
      status: '初稿',
      draft: '',
      optimized: '',
      problems: [],
      finalDraft: '',
      calibrated: '',
      versions: [],
      createdAt: now,
      updatedAt: now,
    };

    // 乐观更新：先本地添加
    setPlans(prev => [plan, ...prev]);
    setCurrentPlan(plan);

    // 后台写入 Supabase
    if (user) {
      supabase
        .from('lesson_plans')
        .insert({ id: plan.id, user_id: user.id, data: plan })
        .then(({ error }) => {
          if (error) console.error('保存教案失败:', error);
        });
    }

    return plan;
  }, [user]);

  const updatePlan = useCallback((updated: LessonPlan) => {
    const finalPlan = { ...updated, updatedAt: Date.now() };

    // 乐观更新
    setPlans(prev => prev.map(p => p.id === finalPlan.id ? finalPlan : p));
    setCurrentPlan(finalPlan);

    // 后台同步到 Supabase
    if (user) {
      supabase
        .from('lesson_plans')
        .update({ data: finalPlan, updated_at: new Date().toISOString() })
        .eq('id', finalPlan.id)
        .then(({ error }) => {
          if (error) console.error('更新教案失败:', error);
        });
    }
  }, [user]);

  const deletePlan = useCallback((id: string) => {
    // 乐观更新
    setPlans(prev => prev.filter(p => p.id !== id));
    if (currentPlan?.id === id) {
      setCurrentPlan(null);
    }

    // 后台同步到 Supabase
    if (user) {
      supabase
        .from('lesson_plans')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('删除教案失败:', error);
        });
    }
  }, [user, currentPlan]);

  const setCurrentPlanById = useCallback((id: string) => {
    const plan = plans.find(p => p.id === id) || null;
    setCurrentPlan(plan);
  }, [plans]);

  const searchPlans = useCallback((keyword: string): LessonPlan[] => {
    if (!keyword.trim()) return plans;
    const kw = keyword.toLowerCase();
    return plans.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      p.form.ageGroup.includes(kw) ||
      p.form.domains.some(d => d.includes(kw))
    );
  }, [plans]);

  return (
    <LessonPlanContext.Provider value={{
      plans,
      currentPlan,
      loading,
      createPlan,
      updatePlan,
      deletePlan,
      setCurrentPlan,
      setCurrentPlanById,
      searchPlans,
    }}>
      {children}
    </LessonPlanContext.Provider>
  );
}

export function useLessonPlan() {
  const ctx = useContext(LessonPlanContext);
  if (!ctx) throw new Error('useLessonPlan must be used within LessonPlanProvider');
  return ctx;
}
