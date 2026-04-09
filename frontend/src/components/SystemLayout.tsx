import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import DebugConsole from './DebugConsole';

export default function SystemLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [eyelidStage, setEyelidStage] = useState<'closed' | 'opening' | 'done'>('done');

  // 处理睁眼动画逻辑
  useEffect(() => {
    if (location.state && (location.state as any).fromLogin) {
      setEyelidStage('closed');
      const t1 = setTimeout(() => setEyelidStage('opening'), 400);
      const t2 = setTimeout(() => setEyelidStage('done'), 3500);
      // 清除 state 防止刷新再次触发
      window.history.replaceState({}, document.title);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [location]);

  const handleLogout = () => {
    navigate('/login', { state: { fromLogout: true } });
  };

  const userMenuItems: MenuProps['items'] = [
    { 
      key: 'profile', 
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#00e3fd' }}>person</span>
          <span style={{ fontWeight: 600 }}>个人信息</span>
        </div>
      )
    },
    { type: 'divider' },
    { 
      key: 'logout', 
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0', color: '#ff6e84' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          <span style={{ fontWeight: 600 }}>断开脑链接口</span>
        </div>
      ),
      onClick: handleLogout
    }
  ];

  const menuItems = [
    { key: '/', label: '作品列表', icon: 'library_books', path: '/' },
    { key: '/api-settings', label: 'API 管理', icon: 'hub', path: '/api-settings' },
    { key: '/prompts', label: '提示词管理', icon: 'psychology', path: '/prompts' },
    { key: '/recycle', label: '回收站', icon: 'delete', path: '/recycle' }
  ];

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#0a0e14', color: '#f1f3fc', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 👁️ 全局睁眼遮罩 - 覆盖整个布局 */}
      {eyelidStage !== 'done' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '101vw', height: '101vh', zIndex: 99999, pointerEvents: 'none', marginLeft: '-1px' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '50%',
            background: '#000',
            transition: 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            transform: eyelidStage === 'opening' ? 'translateY(-100%)' : 'translateY(0)',
            boxShadow: '0 10px 80px 30px rgba(0,0,0,0.95)'
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%',
            background: '#000',
            transition: 'transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            transform: eyelidStage === 'opening' ? 'translateY(100%)' : 'translateY(0)',
            boxShadow: '0 -10px 80px 30px rgba(0,0,0,0.95)'
          }} />
          <div style={{
             position: 'absolute', top: 'calc(50% - 1px)', left: 0, width: '100%', height: '2px',
             background: 'rgba(255,255,255,0.05)',
             boxShadow: '0 0 15px 5px rgba(255,255,255,0.03)',
             opacity: eyelidStage === 'opening' ? 0 : 1,
             transition: 'opacity 0.6s'
          }} />
        </div>
      )}

      {/* 🌟 Top Navigation */}
      <header style={{ position: 'fixed', top: 0, width: '100%', height: 72, background: 'rgba(10, 14, 20, 0.8)', backdropFilter: 'blur(20px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', boxShadow: '0 0 20px rgba(0,227,253,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <h1 className="serif-text" style={{ fontSize: 24, fontStyle: 'italic', fontWeight: 900, background: 'linear-gradient(to right, #ff7afb, #00e3fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.025em', cursor: 'pointer' }} onClick={() => navigate('/')}>
             短篇大爆炸！
           </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', gap: 24, paddingRight: 24, borderRight: '1px solid rgba(68, 72, 79, 0.3)', alignItems: 'center' }}>
            <span className="material-symbols-outlined nav-icon">search</span>
            <span className="material-symbols-outlined nav-icon">notifications</span>
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#151a21', border: '1px solid rgba(0,227,253,0.3)', overflow: 'hidden', cursor: 'pointer' }}>
               <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKFw3PfSOURYFFHaNynTsktE2YiQ5otSdNz_1gXPTLedIm4ihwnNKC3ZFBtqxJWqzNaBbBHMli2RRNx5Cnkf_e9jwEqrJikG5upHVrPh9D1M70RzWRIB12eWZO5F1lsqYnOHJvtUDGu3WOKfS5S3AH8L2e-2dUL-KPnsHdaUsqN94ITZr_aPd-hOo3V8fAN_0G0VlJJIAGIEiKGOYBnO5dKJ3vwHbaIrmHgNmy-evt2GTbb-NGmUhlENt65kxYKwBBTW_FoJArXAZd" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
            </div>
          </Dropdown>
        </div>
      </header>

      <div style={{ display: 'flex', paddingTop: 72, flex: 1 }}>
        {/* 📌 Left Side Sidebar */}
        <aside style={{ width: 260, borderRight: '1px solid rgba(0,227,253,0.08)', background: '#0a0e14', padding: '32px 16px 32px 16px', position: 'fixed', top: 72, height: 'calc(100vh - 72px)', zIndex: 900 }}>
          <div style={{ padding: '0 8px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, rgba(255,122,251,0.1), rgba(0,227,253,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="material-symbols-outlined" style={{ background: 'linear-gradient(to bottom, #ff7afb, #00e3fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 20 }}>auto_awesome</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#f1f3fc' }}>创作中心</div>
                <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Deep Space</div>
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {menuItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <div key={item.key} onClick={() => navigate(item.path)} className={`nav-item ${isActive ? 'active' : ''}`} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', cursor: 'pointer',
                  color: isActive ? '#00e3fd' : '#a8abb3',
                  background: isActive ? 'rgba(0,227,253,0.05)' : 'transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: 14, fontWeight: 600,
                  position: 'relative',
                  overflow: 'hidden',
                  margin: '0 -16px' // Offset aside padding to touch edges
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: isActive ? '#00e3fd' : 'inherit', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                  {item.label}
                  {isActive && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, background: '#00e3fd' }} />}
                </div>
              );
            })}
          </nav>


        </aside>

        {/* 📄 Main Content Area */}
        <main style={{ flex: 1, marginLeft: 260, padding: 0, position: 'relative', minHeight: 'calc(100vh - 72px)' }}>
            <Outlet />
        </main>
      </div>

      <DebugConsole />

      <style>{`
        .nav-icon { color: #64748b; cursor: pointer; transition: all 0.2s; font-size: 22px; }
        .nav-icon:hover { color: #00e3fd; transform: scale(1.1); }
        .nav-item:hover { background: rgba(255,255,255,0.03) !important; color: #ff7afb !important; }
        .nav-item.active:hover { color: #00e3fd !important; }
      `}</style>
    </div>
  );
}
