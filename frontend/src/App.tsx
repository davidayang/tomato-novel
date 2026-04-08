import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';
import { Component } from 'react';

// 🚀 Core Pages
import Login from './pages/Login';
import ProjectList from './pages/ProjectList';
import ProjectWizard from './pages/ProjectWizard';
import ProjectEditor from './pages/ProjectEditor';
import ApiSettings from './pages/ApiSettings';
import PromptSettings from './pages/PromptSettings';
import RecycleBin from './pages/RecycleBin';
import SystemLayout from './components/SystemLayout';

class GlobalErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#ff7afb', background: '#0a0e14', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 className="serif-text" style={{ fontStyle: 'italic', fontSize: 32 }}>多元宇宙观测中断</h1>
          <pre style={{ opacity: 0.6, fontSize: 12, marginTop: 12 }}>{(this.state.error as any)?.message}</pre>
          <button onClick={() => window.location.href='/login'} style={{ marginTop: 24, padding: '12px 24px', background: '#ff7afb', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>重启观测</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
      <ConfigProvider 
        locale={zhCN}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#ff7afb',
            colorBgBase: '#0a0e14',
            fontFamily: 'Inter, sans-serif',
            borderRadius: 12,
          },
        }}
      >
        <GlobalErrorBoundary>
          <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                
                {/* 🔒 Protected Routes wrapped in SystemLayout */}
                <Route element={<SystemLayout />}>
                    <Route path="/" element={<ProjectList />} />
                    <Route path="/api-settings" element={<ApiSettings />} />
                    <Route path="/prompts" element={<PromptSettings />} />
                    <Route path="/recycle" element={<RecycleBin />} />
                </Route>

                <Route path="/wizard/:id" element={<ProjectWizard />} />
                <Route path="/editor/:id" element={<ProjectEditor />} />
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </GlobalErrorBoundary>
      </ConfigProvider>
  );
}

export default App;
