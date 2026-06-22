import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LessonPlan, LessonPlanForm } from '@/types/lessonPlan';
import { genId } from '@/services/aiService';

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

const STORAGE_KEY = 'lesson_plans_data';

function loadPlans(): LessonPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function savePlans(plans: LessonPlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function LessonPlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<LessonPlan[]>(loadPlans);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    savePlans(plans);
  }, [plans]);

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
    setPlans(prev => [plan, ...prev]);
    setCurrentPlan(plan);
    return plan;
  }, []);

  const updatePlan = useCallback((updated: LessonPlan) => {
    setPlans(prev => prev.map(p => p.id === updated.id ? { ...updated, updatedAt: Date.now() } : p));
    setCurrentPlan(updated);
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    if (currentPlan?.id === id) {
      setCurrentPlan(null);
    }
  }, [currentPlan]);

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