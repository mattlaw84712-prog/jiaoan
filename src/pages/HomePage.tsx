import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLessonPlan } from '@/contexts/LessonPlanContext';
import { Plus, Search, Trash2, FileText, Clock, Tag, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import OnboardingDialog from '@/components/OnboardingDialog';
import { STATUS_COLORS } from '@/types/lessonPlan';
import type { LessonPlan } from '@/types/lessonPlan';
import { format } from 'date-fns';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { plans, deletePlan, searchPlans, loading } = useLessonPlan();
  const [search, setSearch] = useState('');

  const filteredPlans = useMemo(() => searchPlans(search), [searchPlans, search]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingDialog />

      {/* 顶部区域 */}
      <div className="border-b border-primary/10 bg-card">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-2">
                4+1 教案迭代助手
              </h1>
              <p className="text-sm text-muted-foreground">
                帮助幼儿园教师按照"4+1"方法高效打磨教案
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => navigate('/create')}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                新建教案
              </Button>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-9 h-9 cursor-pointer border border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {(profile?.username || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {profile?.username || user.email || '用户'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和列表 */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        {/* 搜索栏 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索教案标题、年龄段或领域..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card border-primary/20 focus:border-primary/40"
          />
        </div>

        {/* 教案列表 */}
        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              {search ? '未找到相关教案' : '还没有教案'}
            </p>
            {!search && (
              <Button
                onClick={() => navigate('/create')}
                variant="outline"
                className="border-primary/30 text-primary mt-2"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                创建第一份教案
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onDelete={deletePlan} onClick={() => navigate(`/detail/${plan.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ plan, onDelete, onClick }: { plan: LessonPlan; onDelete: (id: string) => void; onClick: () => void }) {
  return (
    <div
      className="paper-texture rounded-xl border border-primary/20 shadow-card p-4 md:p-5 cursor-pointer hover:shadow-hover transition-shadow group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-foreground truncate">{plan.title}</h3>
            <Badge className={`${STATUS_COLORS[plan.status]} text-xs shrink-0`}>
              {plan.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {plan.form.ageGroup} · {plan.form.domains.join('、')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(plan.updatedAt), 'yyyy-MM-dd HH:mm')}
            </span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-card border-primary/20">
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除教案「{plan.title}」吗？此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-primary/30">取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(plan.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}