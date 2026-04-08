import { useState, useEffect, useRef } from 'react';
import { Card, Button, Spin, message, Tag, Space, Input, Typography, Avatar, Badge, Form } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi, wizardApi } from '../api';
import { 
  RobotOutlined, 
  UserOutlined, 
  SendOutlined,
  CloudFilled,
  PaperClipOutlined,
  AudioOutlined,
  CheckCircleFilled,
  ClusterOutlined,
  ThunderboltOutlined,
  DeploymentUnitOutlined,
  GroupOutlined,
  GlobalOutlined,
  BulbOutlined,
  ReadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Text, Paragraph, Title } = Typography;

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type: 'text' | 'card';
  payload?: any;
  step?: number;
  timestamp: string;
}

export default function ConversationalWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [project, setProject] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const loadProject = async () => {
    try {
        const res = await projectsApi.get(id!);
        const p = res.data;
        setProject(p);
        const initialMsgs: ChatMessage[] = [
          { id: 'start', role: 'assistant', content: `欢迎回到《${p.title}》。我是你的 AI 共创伙伴。当前我们正处于第一幕的转折点：灵感正在发生。`, type: 'text', timestamp: '刚刚' }
        ];
        if (p.genre) {
           initialMsgs.push({ id: 'h0', role: 'assistant', content: '我已根据灵感锚点完成了核心类型分析，请过目。', type: 'card', payload: { genre: p.genre, tone: p.tone, theme: p.theme || p.brief_analysis }, step: 0, timestamp: '刚刚' });
        }
        setMessages(initialMsgs);
        setCurrentStep(p.wizard_step || 0);
    } catch (e) {
        message.error("唤醒 AI Oracle 失败");
    }
  };

  const handleRunStep = async (stepNum: number) => {
    setLoading(true);
    try {
      const stepNames = ["Neural Flow", "Plot Nodes", "Characters", "World Building", "Outlining", "Intro"];
      let res;
      if (stepNum === 0) res = await wizardApi.step1(id!);
      else if (stepNum === 1) res = await wizardApi.step2(id!);
      else if (stepNum === 2) res = await wizardApi.step3(id!);
      else if (stepNum === 3) res = await wizardApi.step4(id!);
      else if (stepNum === 4) res = await wizardApi.step5Outline(id!);
      else if (stepNum === 5) res = await wizardApi.step6Intro(id!);
      
      if (res && res.data) {
        setMessages(prev => [...prev, {
            id: Math.random().toString(36),
            role: 'assistant',
            content: `【${stepNames[stepNum]}】分析完成，请确认或修改。`,
            type: 'card',
            payload: res.data,
            step: stepNum,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (e) {
      message.error("神经同步失利");
    }
    setLoading(false);
  };

  const stepsInfo = [
    { title: 'Neural Flow', icon: <DeploymentUnitOutlined />, sub: 'The Ignition' },
    { title: 'Plot Nodes', icon: <ClusterOutlined />, sub: 'The Structure' },
    { title: 'Characters', icon: <GroupOutlined />, sub: 'The Entities' },
    { title: 'World Building', icon: <GlobalOutlined />, sub: 'The Rules' },
    { title: 'AI Oracle', icon: <BulbOutlined />, sub: 'Active Dialogue' }
  ];

  if (!project) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0a0e14', color: '#fff', overflow: 'hidden' }}>
      
      {/* 🧭 Sidebar: 100% Match ai/code.html */}
      <aside style={{ width: 256, flexShrink: 0, height: '100vh', background: '#0a0e14', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: '48px 0 48px -48px rgba(0, 227, 253, 0.1)' }}>
        <div style={{ padding: '24px 12px 48px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <ReadOutlined style={{ color: 'var(--primary)', fontSize: 20 }} />
            <Text className="serif-text" style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)' }}>Project Nebula</Text>
          </div>
          <Text style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 32 }}>Act I: The Ignition</Text>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {stepsInfo.map((s, idx) => (
            <div 
                key={idx}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '12px 16px', 
                    borderRadius: 12, 
                    background: idx === currentStep ? 'rgba(0, 227, 253, 0.1)' : 'transparent',
                    color: idx === currentStep ? 'var(--secondary)' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                }}
            >
                <div style={{ fontSize: 18, opacity: idx === currentStep ? 1 : 0.4 }}>{idx === 3 ? <GlobalOutlined /> : s.icon}</div>
                <div>
                   <div style={{ fontSize: 14, fontWeight: idx === currentStep ? 700 : 500, letterSpacing: 0.5 }}>{s.title}</div>
                   {idx === currentStep && <div style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>{s.sub}</div>}
                </div>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', borderRadius: 20, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
            <h4 style={{ fontSize: 10, fontWeight: 900, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 8 }}>当前作品摘要</h4>
            <p className="serif-text" style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              {project.idea?.substring(0, 80)}...
            </p>
            <Button block style={{ marginTop: 16, height: 32, borderRadius: 8, background: 'rgba(255, 122, 251, 0.1)', border: 'none', color: 'var(--primary)', fontWeight: 900, fontSize: 10 }}>NEW CHAPTER</Button>
        </div>
      </aside>

      {/* 🌌 Main Chat Arc */}
      <main style={{ marginLeft: 256, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* Floating Top Bar */}
        <header style={{ height: 64, width: '100%', background: 'rgba(10, 14, 20, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 90 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary)' }} className="animate-pulse"></div>
                <Title level={5} className="serif-text" style={{ color: '#fff', margin: 0 }}>系统补全 - AI Oracle 对话共创</Title>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Text style={{ fontSize: 10, color: 'var(--secondary)', fontWeight: 900 }}>对话深度</Text>
                   <Text style={{ fontSize: 13, color: 'var(--secondary)', fontWeight: 900, fontFamily: 'monospace' }}>4.2</Text>
                </div>
                <Button type="text" icon={<ArrowLeftOutlined style={{ color: '#64748b' }} />} onClick={() => navigate('/')} />
            </div>
        </header>

        {/* Message Stream */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '40px 80px 180px 80px', display: 'flex', flexDirection: 'column', gap: 40, scrollBehavior: 'smooth' }}>
          {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'assistant' ? 'row' : 'row-reverse', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: msg.role === 'assistant' ? 'rgba(0, 227, 253, 0.1)' : 'rgba(255, 122, 251, 0.1)', border: msg.role === 'assistant' ? '1px solid rgba(0, 227, 253, 0.2)' : '1px solid rgba(255, 122, 251, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {msg.role === 'assistant' ? <RobotOutlined style={{ color: 'var(--secondary)', fontSize: 22 }} /> : <UserOutlined style={{ color: 'var(--primary)', fontSize: 22 }} />}
                    </div>
                    
                    <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'assistant' ? 'flex-start' : 'flex-end' }}>
                        {msg.type === 'text' ? (
                            <div className={msg.role === 'assistant' ? "glass-panel active-glow" : "glow-primary"} style={{ 
                                padding: '18px 24px', 
                                borderRadius: msg.role === 'assistant' ? '0 24px 24px 24px' : '24px 0 24px 24px',
                                background: msg.role === 'assistant' ? 'rgba(32, 38, 47, 0.6)' : 'var(--primary-container)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: '#fff'
                            }}>
                                <Paragraph className="serif-text" style={{ margin: 0, fontSize: 18, lineHeight: 1.8, color: '#f1f3fc' }}>{msg.content}</Paragraph>
                            </div>
                        ) : (
                            <div className="glass-panel" style={{ padding: 28, borderRadius: 28, width: 560, background: 'rgba(32, 38, 47, 0.4)', border: '1px solid rgba(0, 227, 253, 0.1)' }}>
                                {msg.step === 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        <Text style={{ fontSize: 11, fontWeight: 900, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: 1.5 }}>选项 A / 类型与感知</Text>
                                        <div style={{ background: '#0a0e14', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                                <div><Text style={{ fontSize: 10, color: '#64748b' }}>作品类型</Text><div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{msg.payload?.genre}</div></div>
                                                <div><Text style={{ fontSize: 10, color: '#64748b' }}>色彩基调</Text><div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>{msg.payload?.tone}</div></div>
                                            </div>
                                            <Paragraph className="serif-text" style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{msg.payload?.theme}</Paragraph>
                                        </div>
                                        <Button block type="primary" size="large" onClick={() => handleRunStep(1)} style={{ height: 50, borderRadius: 14 }}>确认逻辑，进入下一节点</Button>
                                    </div>
                                )}
                                {msg.step === 3 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        {msg.payload?.map((opt: any) => (
                                            <button 
                                                key={opt.id}
                                                style={{ textAlign: 'left', padding: 20, borderRadius: 20, background: 'var(--surface-container-high)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.3s' }}
                                                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
                                                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                                            >
                                                <Text style={{ fontSize: 10, fontWeight: 950, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>轨道 {opt.id}</Text>
                                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{opt.name}</div>
                                                <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{opt.summary}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <Text style={{ fontSize: 10, color: '#444', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{msg.role === 'assistant' ? 'AI ORACLE' : 'YOU'} • {msg.timestamp}</Text>
                    </div>
                </div>
          ))}
          {loading && (
             <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0, 227, 253, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                    <Spin size="small" style={{ color: 'var(--secondary)', margin: 'auto' }} />
                </div>
                <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: '0 24px 24px 24px', color: '#64748b', fontStyle: 'italic' }}>主编正在解析叙事突触...</div>
             </div>
          )}
        </div>

        {/* 🚀 Floating Bottom Input Component */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '24px 80px 64px 80px', background: 'linear-gradient(to top, #0a0e14 70%, transparent)' }}>
            <div className="group" style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
                <div className="input-glow-bg" style={{ position: 'absolute', inset: -1, background: 'linear-gradient(to r, var(--secondary), var(--primary))', borderRadius: 24, opacity: 0.1, filter: 'blur(20px)' }}></div>
                <div style={{ position: 'relative', background: 'var(--background)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button type="text" icon={<PaperClipOutlined style={{ color: '#444' }} />} />
                    <Input 
                        placeholder="输入你的新灵感，或针对选定的轨道进行补充..."
                        variant="borderless"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        style={{ flex: 1, background: 'transparent', color: '#fff', fontSize: 16, height: 48 }}
                        onPressEnter={() => userInput && handleRunStep(currentStep)}
                    />
                    <Space size="middle">
                        <AudioOutlined style={{ color: '#444', fontSize: 18, cursor: 'pointer' }} />
                        <button 
                            onClick={() => userInput && handleRunStep(currentStep)}
                            style={{ width: 48, height: 48, background: 'var(--primary)', border: 'none', borderRadius: 14, color: '#57005a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(255,122,251,0.4)', transition: 'all 0.3s' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <SendOutlined style={{ fontSize: 18 }} />
                        </button>
                    </Space>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px 0 14px' }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 900 }}>● <span style={{ marginLeft: 4 }}>AI 已经就绪</span></span>
                        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 900 }}>线程: OMNI-01</span>
                    </div>
                    <Text style={{ fontSize: 10, color: '#444', fontStyle: 'italic' }}>按 Enter 发送灵感，Shift + Enter 换行</Text>
                </div>
            </div>
        </div>
      </main>

      <style>{`
        .glass-panel { backdrop-filter: blur(24px); }
        .group:focus-within .input-glow-bg { opacity: 0.3 !important; }
      `}</style>
    </div>
  );
}
