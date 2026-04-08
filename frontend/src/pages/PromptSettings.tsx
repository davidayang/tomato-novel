import { useState } from 'react';
import { Typography } from 'antd';

const { Paragraph } = Typography;

// ===== 模拟数据 =====
const MOCK_PROMPTS = [
  { id: '1', title: '硬核科幻世界观构建', desc: '基于费米悖论与热力学第二定律，构建一个处于资源枯竭边缘的戴森球社会...', category: 'HARD SCI-FI', color: '#ff7afb', time: '2小时前使用', tags: '#CYBERPUNK' },
  { id: '2', title: '悬疑小说转折点生成', desc: '在第三章结尾引入一个颠覆主角身份的证据，通过不可靠叙事手法增加逻辑闭环...', category: 'SUSPENSE', color: '#ff833f', time: '昨日使用', tags: '#MYSTERY' },
  { id: '3', title: '赛博朋克对话风格修正', desc: '将标准中文对话转化为具有高科技、低生活质感的街道黑话，融合俚语与仿生技术术语...', category: 'AI MASTER', color: '#00e3fd', time: '15分钟前使用', featured: true },
  { id: '4', title: '克苏鲁神话氛围渲染', desc: '通过描述非几何图形的建筑与无法名状的低语，营造一种人类认知边界崩溃的绝望感...', category: 'FANTASY', color: '#64748b', time: '3天前使用', tags: '#HORROR' },
  { id: '5', title: '人物性格弧光映射', desc: '根据主角的初始缺陷，设计三个递进的冲突事件，强制其做出违背本能的选择以实现成长...', category: 'LOGIC', color: '#64748b', time: '1周前使用', tags: '#CHARACTER' },
];

export default function PromptSettings() {
  const [prompts] = useState(MOCK_PROMPTS);

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1400, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      
      {/* 🌌 Atmospheric Backdrop */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'rgba(255,122,251,0.05)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '-5%', left: '10%', width: '35vw', height: '35vw', background: 'rgba(0,227,253,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* 页头 */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: 44, fontWeight: 700, fontFamily: 'Newsreader, serif', margin: 0, letterSpacing: '-0.02em', color: '#f1f3fc' }}>提示词矩阵</h1>
            <p style={{ color: '#64748b', marginTop: 10, maxWidth: 500, fontSize: 16 }}>管理您的叙事核心。每一条提示词都是一颗即将引爆宇宙的创意奇点。</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,227,253,0.1)', color: '#00e3fd', fontWeight: 900, padding: '14px 28px', borderRadius: 16, border: '1px solid rgba(0,227,253,0.2)', cursor: 'pointer', fontSize: 15, transition: 'all 0.3s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#00e3fd'; e.currentTarget.style.color = '#003a42'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,227,253,0.1)'; e.currentTarget.style.color = '#00e3fd'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add_circle</span>
            创建新模板
          </button>
        </header>

        {/* 提示词卡片阵列 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
          {prompts.map((p) => (
            <div 
              key={p.id}
              className="prompt-card"
              style={{ 
                  background: p.featured ? 'linear-gradient(135deg, rgba(21, 26, 33, 0.8), rgba(0, 227, 253, 0.05))' : 'rgba(21, 26, 33, 0.4)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: 24, 
                  padding: 32, 
                  border: `1px solid ${p.featured ? 'rgba(0, 227, 253, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`, 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 280,
                  boxShadow: p.featured ? '0 12px 40px rgba(0, 227, 253, 0.1)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span style={{ 
                  fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', padding: '4px 10px', 
                  borderRadius: 6, background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}25`,
                  textTransform: 'uppercase'
                }}>
                  {p.category}
                </span>
                <div className="card-actions" style={{ display: 'flex', gap: 6, opacity: 0.4, transition: 'opacity 0.3s' }}>
                  <span className="material-symbols-outlined nav-icon" style={{ fontSize: 18 }}>edit</span>
                  <span className="material-symbols-outlined nav-icon" style={{ fontSize: 18 }}>delete</span>
                </div>
              </div>

              <h3 className="serif-text prompt-title" style={{ fontSize: 22, fontWeight: 700, color: p.featured ? '#00e3fd' : '#f1f3fc', marginBottom: 16, transition: 'all 0.3s' }}>{p.title}</h3>
              <Paragraph style={{ color: p.featured ? '#a8abb3' : '#64748b', fontSize: 14, lineHeight: 1.8, marginBottom: 32, flex: 1 }}>{p.desc}</Paragraph>
              
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 20 }}>
                {p.featured ? (
                  <div style={{ height: 4, width: '100%', background: 'rgba(0,227,253,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 18 }}>
                    <div style={{ width: '85%', height: '100%', background: '#00e3fd', boxShadow: '0 0 10px rgba(0,227,253,0.5)' }}></div>
                  </div>
                ) : (
                  <div style={{ height: 1, width: '100%', background: 'linear-gradient(90deg, transparent, rgba(0,227,253,0.2), transparent)', marginBottom: 20 }} />
                )}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                       <span className="material-symbols-outlined" style={{ fontSize: 14 }}>history</span> {p.time}
                    </div>
                    {p.tags && <span style={{ fontSize: 10, fontWeight: 900, color: '#475569', letterSpacing: '0.05em' }}>{p.tags}</span>}
                    {p.featured && <span style={{ fontSize: 10, fontWeight: 900, color: '#00e3fd' }}>高频使用</span>}
                 </div>
              </div>
            </div>
          ))}

          {/* 新增占位符 */}
          <div style={{ 
            borderRadius: 24, padding: 32, border: '2px dashed rgba(255, 255, 255, 0.05)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            gap: 16, cursor: 'pointer', transition: 'all 0.3s' 
          }}
          className="prompt-add-placeholder"
          onMouseOver={e => { e.currentTarget.style.borderColor = '#ff7afb40'; e.currentTarget.style.background = 'rgba(255,122,251,0.02)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'transparent'; }}
          >
             <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#475569' }}>add</span>
             </div>
             <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>创建新模板</div>
                <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>向宇宙发射新的创意脉冲</div>
             </div>
          </div>
        </div>

        {/* 底部统计 */}
        <div style={{ 
          marginTop: 64, padding: '40px 60px', background: 'rgba(15, 20, 26, 0.4)', 
          backdropFilter: 'blur(24px)', borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 40
        }}>
           <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
              <div>
                 <div style={{ fontSize: 32, fontWeight: 700, color: '#00e3fd', fontFamily: 'Newsreader, serif' }}>42</div>
                 <div style={{ fontSize: 10, color: '#444', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>已存提示词</div>
              </div>
              <div>
                 <div style={{ fontSize: 32, fontWeight: 700, color: '#ff7afb', fontFamily: 'Newsreader, serif' }}>12.5k</div>
                 <div style={{ fontSize: 10, color: '#444', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>累计调用次数</div>
              </div>
              <div>
                 <div style={{ fontSize: 32, fontWeight: 700, color: '#ff833f', fontFamily: 'Newsreader, serif' }}>98%</div>
                 <div style={{ fontSize: 10, color: '#444', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4 }}>生成转化率</div>
              </div>
           </div>
           <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(0,227,253,0.2)', background: 'transparent', color: '#00e3fd', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>导出提示词包</button>
              <button style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,122,251,0.2)', background: 'transparent', color: '#ff7afb', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>云端同步</button>
           </div>
        </div>
      </div>

      <style>{`
        .prompt-card:hover { transform: translateY(-8px); border-color: rgba(255, 122, 251, 0.3) !important; background: rgba(21, 26, 33, 0.8) !important; }
        .prompt-card:hover .card-actions { opacity: 1 !important; }
        .prompt-card:hover .prompt-title { color: #ff7afb !important; }
        .card-actions span:hover { color: #00e3fd; transform: scale(1.2); }
      `}</style>
    </div>
  );
}
