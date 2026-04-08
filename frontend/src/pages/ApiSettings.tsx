// ===== 模拟数据 =====
const MOCK_TEXT_APIS = [
  { id: '1', name: 'GPT-4 Turbo', provider: 'OpenAI', key: 'sk-proj-••••••••••••••••••••f2k1', icon: 'description', status: 'active' },
  { id: '2', name: 'Claude 3 Opus', provider: 'Anthropic', key: 'sk-ant-••••••••••••••••••••y9m2', icon: 'psychology_alt', status: 'active' },
];
const MOCK_IMAGE_APIS = [
  { id: '3', name: 'Midjourney v6', provider: 'Midjourney Inc.', key: 'mj-••••••••••••••••••••x8w1', icon: 'palette', status: 'active' },
  { id: '4', name: 'DALL-E 3', provider: 'OpenAI', key: 'sk-••••••••••••••••••••z1x9', icon: 'auto_awesome_motion', status: 'disabled' },
];

export default function ApiSettings() {

  const renderApiItem = (item: any, accentColor: string) => (
    <div key={item.id} className="api-item" style={{
      background: 'rgba(21, 26, 33, 0.4)',
      backdropFilter: 'blur(12px)', 
      borderRadius: 20, 
      padding: '24px 32px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      opacity: item.status === 'disabled' ? 0.6 : 1,
      filter: item.status === 'disabled' ? 'grayscale(1)' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      marginBottom: 16
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        {/* 左：图标+名称 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${accentColor}20, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accentColor}20` }}>
            <span className="material-symbols-outlined" style={{ color: accentColor, fontSize: 24 }}>{item.icon}</span>
          </div>
          <div>
            <h3 className="serif-text" style={{ fontSize: 20, fontWeight: 700, color: '#f1f3fc', margin: 0 }}>{item.name}</h3>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontWeight: 500 }}>{item.provider}</p>
          </div>
        </div>

        {/* 中：密钥 */}
        <div style={{ flex: 1, maxWidth: 400, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.3)', padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <code style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.key}</code>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#475569', cursor: 'pointer' }}>{item.status === 'disabled' ? 'lock' : 'visibility'}</span>
          </div>
        </div>

        {/* 右：状态+操作 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 50,
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            background: item.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
            color: item.status === 'active' ? '#4ade80' : '#64748b',
            border: `1px solid ${item.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(100,116,139,0.2)'}`
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.status === 'active' ? '#4ade80' : '#64748b', ...(item.status === 'active' ? { animation: 'pulse-active 2s infinite' } : {}) }} />
            {item.status === 'active' ? '活跃' : '禁用'}
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="icon-btn hover-accent" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }} title="编辑">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>edit</span>
            </button>
            <button className="icon-btn hover-error" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }} title="删除">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '60px 48px', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
      
      {/* 🌌 Atmospheric Backdrop */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '40vw', height: '40vw', background: 'rgba(0,227,253,0.03)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30vw', height: '30vw', background: 'rgba(255,122,251,0.03)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 60 }}>
          <div>
            <h1 className="serif-text" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em', color: '#f1f3fc', margin: '0 0 12px 0' }}>API 管理</h1>
            <p style={{ color: '#a8abb3', fontSize: 16, margin: 0, maxWidth: 500 }}>在此配置您的生成模型访问密钥。所有密钥均经过严格加密存储。</p>
          </div>
          <button style={{ 
            display: 'flex', alignItems: 'center', gap: 10, background: '#ff7afb', color: '#57005a', 
            fontWeight: 800, padding: '16px 32px', borderRadius: 16, border: 'none', cursor: 'pointer', 
            fontSize: 15, boxShadow: '0 8px 24px rgba(255,122,251,0.2)', transition: 'all 0.3s' 
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>add_circle</span>
            <span>配置新模型</span>
          </button>
        </div>

        {/* Text Generation Section */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 6, height: 24, background: '#00e3fd', borderRadius: 10 }} />
            <h2 className="serif-text" style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#f1f3fc' }}>文字生成 API</h2>
          </div>
          <div>
            {MOCK_TEXT_APIS.map(item => renderApiItem(item, '#00e3fd'))}
          </div>
        </section>

        {/* Cover Generation Section */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 6, height: 24, background: '#ff7afb', borderRadius: 10 }} />
            <h2 className="serif-text" style={{ fontSize: 32, fontWeight: 700, margin: 0, color: '#f1f3fc' }}>封面生成 API</h2>
          </div>
          <div>
            {MOCK_IMAGE_APIS.map(item => renderApiItem(item, '#ff7afb'))}
          </div>
        </section>

        {/* Footer Banner */}
        <div style={{ 
          marginTop: 80, padding: '40px', borderRadius: 24, border: '1px solid rgba(0,227,253,0.1)', 
          background: 'linear-gradient(90deg, rgba(0,227,253,0.05) 0%, transparent 100%)',
          display: 'flex', alignItems: 'center', gap: 32
        }}>
          <div style={{ flexShrink: 0, display: 'block' }}>
            <img 
              alt="Decorative AI connection" 
              style={{ width: 128, borderRadius: 12, opacity: 0.6 }} 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiDjt01KtrT3tBQ5MnOUheHpK6G-lO-nmHNnA6cT0V-yOSwRaPEJsWVxMeOWuLyq5Kk-g-2BLgLbkMrN11AsbnEX-XfIhgVODdSEHpa9UR3c3InRht_EM2ciUzwr_FZlmYDyccL3ty8PegB7D0DlEbtXP1wLExNk_WhWKJFjdgvuGvDIrXIeKMZ9t1VMEF2whcsxT84ZYwc5nfu8rP8scyk0FKhXwPWBFK8LUH43uCj83kKBl9vr3njKS9vOohZbPDAkjQoDinoKJl" 
            />
          </div>
          <div>
            <h4 style={{ fontSize: 20, fontWeight: 700, color: '#f1f3fc', margin: '0 0 8px 0' }}>正在保护 3 个活跃端点</h4>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0, lineHeight: 1.6, maxWidth: 700 }}>
              您的所有 API 密钥均存储在符合星际标准的高强度加密保险库中。切勿向他人透露您的密钥。查阅 <a href="#" style={{ color: '#00e3fd', textDecoration: 'none' }}>安全指南</a> 了解更多信息。
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .api-item:hover { border-color: rgba(255, 255, 255, 0.2) !important; transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
        .icon-btn:hover.hover-accent { color: #00e3fd !important; }
        .icon-btn:hover.hover-error { color: #ff6e84 !important; }
        @keyframes pulse-active { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }
      `}</style>
    </div>
  );
}
