import type { ReactNode } from 'react';
import HomePage from './pages/HomePage';
import Step1Page from './pages/Step1Page';
import Step2Page from './pages/Step2Page';
import Step3Page from './pages/Step3Page';
import Step4Page from './pages/Step4Page';
import Step5Page from './pages/Step5Page';
import CompletePage from './pages/CompletePage';
import DetailPage from './pages/DetailPage';
import LoginPage from './pages/LoginPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: '登录', path: '/login', element: <LoginPage />, public: true },
  { name: '首页', path: '/', element: <HomePage /> },
  { name: '新建教案', path: '/create', element: <Step1Page /> },
  { name: '第一步', path: '/step/1', element: <Step1Page /> },
  { name: '第二步', path: '/step/2', element: <Step2Page /> },
  { name: '第三步', path: '/step/3', element: <Step3Page /> },
  { name: '第四步', path: '/step/4', element: <Step4Page /> },
  { name: '第五步', path: '/step/5', element: <Step5Page /> },
  { name: '完成', path: '/complete/:id', element: <CompletePage /> },
  { name: '详情', path: '/detail/:id', element: <DetailPage /> },
];
