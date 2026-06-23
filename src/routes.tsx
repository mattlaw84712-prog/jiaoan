import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const Step1Page = lazy(() => import('./pages/Step1Page'));
const Step2Page = lazy(() => import('./pages/Step2Page'));
const Step3Page = lazy(() => import('./pages/Step3Page'));
const Step4Page = lazy(() => import('./pages/Step4Page'));
const Step5Page = lazy(() => import('./pages/Step5Page'));
const CompletePage = lazy(() => import('./pages/CompletePage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
}

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: '登录', path: '/login', element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>, public: true },
  { name: '首页', path: '/', element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
  { name: '新建教案', path: '/create', element: <SuspenseWrapper><Step1Page /></SuspenseWrapper> },
  { name: '第一步', path: '/step/1', element: <SuspenseWrapper><Step1Page /></SuspenseWrapper> },
  { name: '第二步', path: '/step/2', element: <SuspenseWrapper><Step2Page /></SuspenseWrapper> },
  { name: '第三步', path: '/step/3', element: <SuspenseWrapper><Step3Page /></SuspenseWrapper> },
  { name: '第四步', path: '/step/4', element: <SuspenseWrapper><Step4Page /></SuspenseWrapper> },
  { name: '第五步', path: '/step/5', element: <SuspenseWrapper><Step5Page /></SuspenseWrapper> },
  { name: '完成', path: '/complete/:id', element: <SuspenseWrapper><CompletePage /></SuspenseWrapper> },
  { name: '详情', path: '/detail/:id', element: <SuspenseWrapper><DetailPage /></SuspenseWrapper> },
];