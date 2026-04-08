import { Typography } from 'antd';
import { 
  BulbOutlined, 
  ThunderboltOutlined, 
  GlobalOutlined, 
  ApiOutlined, 
  ClusterOutlined, 
  UserOutlined, 
  DeploymentUnitOutlined, 
  CheckCircleOutlined,
  RightOutlined,
  BlockOutlined,
  NodeIndexOutlined,
  ReadOutlined,
  RocketOutlined,
  EyeOutlined,
  ScissorOutlined,
  ProjectOutlined,
  AuditOutlined,
  FormOutlined
} from '@ant-design/icons';

const { Paragraph } = Typography;

// ===== 超细化项目流程流水线 (Detailed Step-by-Step) =====
const PROMPT_PIPELINE = [
  { 
    phase: 'PHASE I: THE GENESIS · 创世起源', 
    color: '#00e3fd',
    steps: [
      { id: '1', title: '核心灵感提炼', desc: '从原始创意中萃取核心核动力点。', category: 'STEP_01_A', icon: <BulbOutlined /> },
      { id: '2', title: '流行类型推荐', desc: '结合市场趋势分析最契合的网文频道。', category: 'STEP_01_B', icon: <DeploymentUnitOutlined /> },
      { id: '3', title: '点击震撼书名', desc: '生成具有极强传播力的作品名称系统。', category: 'STEP_01_C', icon: <ThunderboltOutlined /> },
      { id: '4', title: '爆款简介雕琢', desc: '基于番茄经典套路，精准重构吸引读者的故事简介。', category: 'STEP_01_D', icon: <FormOutlined /> },
    ]
  },
  { 
    phase: 'PHASE II: THE PRISM · 棱镜解析', 
    color: '#ff7afb',
    steps: [
      { id: '5', title: '最优叙事视角', desc: '确定第一、第三或上帝视角的沉浸逻辑。', category: 'STEP_02_A', icon: <EyeOutlined /> },
      { id: '6', title: '色彩视觉基调', desc: '分析作品的艺术张力与色彩氛围模型。', category: 'STEP_02_B', icon: <ApiOutlined /> },
      { id: '7', title: '底层叙事推演', desc: '初步推导演化故事的基本演进方向。', category: 'STEP_02_C', icon: <RocketOutlined /> },
    ]
  },
  { 
    phase: 'PHASE III: THE SKELETON · 骨架构建', 
    color: '#ff833f',
    steps: [
      { id: '8', title: '三幕式核心弧线', desc: '确立起承转合的核心逻辑转折点。', category: 'STEP_03_A', icon: <NodeIndexOutlined /> },
      { id: '9', title: '关键冲突矩阵', desc: '设定维持章节期待感的冲突引爆点。', category: 'STEP_03_B', icon: <ScissorOutlined /> },
      { id: '10', title: '剧情伏笔规划', desc: '在文本流中预埋长线逻辑的奇草异蛇。', category: 'STEP_03_C', icon: <ClusterOutlined /> },
    ]
  },
  { 
    phase: 'PHASE IV: THE LIFE · 生命降临', 
    color: '#00f2fe',
    steps: [
      { id: '11', title: '主角全维侧写', desc: '定义人设的欲望、缺陷与成长曲线。', category: 'STEP_04_A', icon: <UserOutlined /> },
      { id: '12', title: '反派动机对冲', desc: '赋予对手自洽且致命的镜像逻辑。', category: 'STEP_04_B', icon: <UserOutlined /> },
      { id: '13', title: '配角功能定位', desc: '确立小说中每一片绿叶的叙事职能。', category: 'STEP_04_C', icon: <NodeIndexOutlined /> },
    ]
  },
  { 
    phase: 'PHASE V: THE CANVAS · 维度建构', 
    color: '#f9d423',
    steps: [
      { id: '14', title: '世界底层法则', desc: '锁定逻辑边界，防止设定崩坏。', category: 'STEP_05_A', icon: <GlobalOutlined /> },
      { id: '15', title: '关键道具/系统', desc: '设计支撑剧情爽点的金手指机制。', category: 'STEP_05_B', icon: <BlockOutlined /> },
      { id: '16', title: '社会权力肌理', desc: '构建世界动态平衡的各种利益集团。', category: 'STEP_05_C', icon: <ProjectOutlined /> },
    ]
  },
  { 
    phase: 'PHASE VI: THE RESONANCE · 共振输出', 
    color: '#7ed56f',
    steps: [
      { id: '17', title: '黄金开篇渲染', desc: '将指令坍缩为高沉浸感的开头段落。', category: 'STEP_06_A', icon: <ReadOutlined /> },
      { id: '18', title: '对话流抛光', desc: '强化人物对白的信息密度与性格化。', category: 'STEP_06_B', icon: <ReadOutlined /> },
      { id: '19', title: '感官描写注入', desc: '增强视觉、听觉等维度的环境描写。', category: 'STEP_06_C', icon: <GlobalOutlined /> },
    ]
  },
  { 
    phase: 'PHASE VII: THE POLISH · 坍缩精修', 
    color: '#64748b',
    steps: [
      { id: '20', title: '语体风格校测', desc: '确保全篇文字质感的极致统一。', category: 'STEP_07_A', icon: <CheckCircleOutlined /> },
      { id: '21', title: '安全性终审', desc: '执行敏感词库扫描并优化长句通顺度。', category: 'STEP_07_B', icon: <AuditOutlined /> },
    ]
  }
];

export default function PromptSettings() {
  return (
    <div style={{ padding: '80px 48px', maxWidth: 1240, margin: '0 auto', position: 'relative', background: '#0a0e14', minHeight: '100vh', color: '#fff' }}>
      
      {/* 🌌 Atmospheric Backdrop */}
      <div style={{ position: 'absolute', top: '0', right: '0', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(255,122,251,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0,227,253,0.02) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* 页头 */}
        <header style={{ marginBottom: 100, textAlign: 'center' }}>
            <h1 style={{ fontSize: 56, fontWeight: 950, fontStyle: 'italic', fontFamily: 'serif', margin: 0, letterSpacing: '-0.04em', color: '#fff', textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>提示词原子实验室</h1>
            <p style={{ color: '#94a3b8', marginTop: 24, fontSize: 20, fontWeight: 400, maxWidth: 800, margin: '24px auto 0', lineHeight: 1.6 }}>基于项目原生架构的原子级管理。每一个步骤都是叙事宇宙的坍缩奇点。</p>
        </header>

        {/* 🚀 超细化流程序列界面 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 40 }}>
          
          {/* ⚡ 全局发光轴轨 (Master Arc) */}
          <div style={{ 
              position: 'absolute', 
              left: 39, 
              top: 40, 
              bottom: 40, 
              width: 1, 
              background: 'linear-gradient(to bottom, transparent, #00e3fd, #ff7afb, #ff833f, #00f2fe, #f9d423, #7ed56f, transparent)', 
              boxShadow: '0 0 10px rgba(0,227,253,0.2)',
              zIndex: 0 
          }} />

          {PROMPT_PIPELINE.map((phase, pIdx) => (
            <section key={pIdx} style={{ position: 'relative', zIndex: 1, marginBottom: 100 }}>
              
              {/* 阶段大类标志 (Category Landmark) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 48, marginLeft: -40 }}>
                 <div style={{ 
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(10, 14, 20, 0.95)', border: `1px solid ${phase.color}`, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    boxShadow: `0 0 40px ${phase.color}15`, zIndex: 2,
                    fontSize: 28, fontWeight: 950, color: phase.color
                 }}>
                    {pIdx + 1}
                 </div>
                 <div style={{ transform: 'translateY(2px)' }}>
                    <h2 style={{ fontSize: 14, fontWeight: 950, color: phase.color, letterSpacing: 4, textTransform: 'uppercase', margin: 0 }}>{phase.phase}</h2>
                    <div style={{ height: 1, width: 120, background: `linear-gradient(90deg, ${phase.color}, transparent)`, marginTop: 12 }} />
                 </div>
              </div>

              {/* 该大类下的 细化卡片列表 - 修改为上下排列布局 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 80, maxWidth: 800 }}>
                 {phase.steps.map((s) => (
                   <div 
                    key={s.id}
                    className="atomic-card"
                    style={{ 
                      background: 'rgba(21, 26, 33, 0.3)', 
                      backdropFilter: 'blur(30px)', 
                      borderRadius: 16, 
                      padding: '24px 32px', 
                      border: '1px solid rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 24,
                      transition: 'all 0.4s ease-out',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                   >
                     {/* 编号装饰 */}
                     <div style={{ position: 'absolute', right: 24, top: 16, fontSize: 10, fontWeight: 900, color: phase.color, opacity: 0.2, letterSpacing: 1 }}>
                        #{s.id.padStart(2,'0')}
                     </div>

                     <div style={{ 
                        width: 56, height: 56, borderRadius: 14, background: `${phase.color}05`, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, 
                        border: `1px solid ${phase.color}10`, fontSize: 28, color: phase.color 
                     }}>
                        {s.icon}
                     </div>

                     <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f3fc', margin: '0 0 6px 0' }}>{s.title}</h3>
                        <Paragraph style={{ color: '#64748b', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{s.desc}</Paragraph>
                     </div>

                     <div className="card-arrow" style={{ opacity: 0, transition: '0.3s' }}>
                        <RightOutlined style={{ color: phase.color, fontSize: 16 }} />
                     </div>
                   </div>
                 ))}
              </div>

            </section>
          ))}
        </div>
      </div>

      <style>{`
        .atomic-card:hover { transform: translateX(8px); border-color: rgba(255,255,255,0.08) !important; background: rgba(30, 36, 45, 0.6) !important; box-shadow: 0 12px 24px rgba(0,0,0,0.4); }
        .atomic-card:hover .card-arrow { opacity: 1 !important; transform: translateX(4px); }
        .atomic-card:hover h3 { color: #fff !important; }
      `}</style>
    </div>
  );
}
