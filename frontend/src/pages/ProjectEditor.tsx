import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message, Typography, Avatar, Space, Badge, Modal, Input, Divider, Tag } from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  PlusOutlined, 
  ThunderboltOutlined, 
  ScheduleOutlined, 
  EyeOutlined, 
  CompassOutlined, 
  CloudFilled,
  WarningFilled,
  ExportOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  HistoryOutlined,
  SettingOutlined,
  BellOutlined,
  AimOutlined
} from '@ant-design/icons';
import { projectsApi } from '../api';

const { Text, Title, Paragraph } = Typography;

export default function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Canvas states
  const [canvasPos, setCanvasPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Prevent Browser Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY;
        setZoom(prev => {
          const factor = 0.001;
          const next = prev - delta * factor;
          return Math.min(2, Math.max(0.1, next));
        });
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0')) {
            e.preventDefault();
            if (e.key === '=' || e.key === '+') setZoom(z => Math.min(2, z + 0.1));
            if (e.key === '-') setZoom(z => Math.max(0.1, z - 0.1));
            if (e.key === '0') setZoom(1);
        }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Reset/Fit View Function
  const resetView = () => {
    if (!project) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    const contentWidth = 1430; 
    const padding = 80;
    
    const fitZoom = Math.min(1, (vw - padding * 2) / contentWidth);
    setZoom(fitZoom);

    // Fine-tuned centering: Content is roughly 650px high
    // We remove almost all paddings and use pure math
    const startX = padding;
    const contentHeight = 650 * fitZoom;
    const startY = (vh - contentHeight) / 2 - 40; // Offset up by 40px for visual balance
    
    setCanvasPos({ x: startX, y: startY });
  };

  // Init centering & fit-to-view
  useEffect(() => {
    if (project) {
        resetView();
    }
  }, [project]);

  // Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editIdea, setEditIdea] = useState('');
  const [editTheme, setEditTheme] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editPerspective, setEditPerspective] = useState('自动分析');
  const [editCharacters, setEditCharacters] = useState(5);
  const [editWordCount, setEditWordCount] = useState(15000);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for precise connections
  const node1Ref = useRef<HTMLDivElement>(null);
  const node2Ref = useRef<HTMLDivElement>(null);
  const node3Part1Ref = useRef<HTMLDivElement>(null);
  const node3Part2Ref = useRef<HTMLDivElement>(null);
  const node3Part3Ref = useRef<HTMLDivElement>(null);
  const [connections, setConnections] = useState({ n1n2: "", n2n3: [] as string[] });

  useEffect(() => {
    if (project && node1Ref.current && node2Ref.current && node3Part1Ref.current) {
        // Wait for render
        setTimeout(() => {
            const n1 = node1Ref.current?.getBoundingClientRect();
            const n2 = node2Ref.current?.getBoundingClientRect();
            const p1 = node3Part1Ref.current?.getBoundingClientRect();
            const p2 = node3Part2Ref.current?.getBoundingClientRect();
            const p3 = node3Part3Ref.current?.getBoundingClientRect();
            
            if (n1 && n2 && p1 && p2 && p3) {
                const mainRect = document.querySelector('main')?.getBoundingClientRect();
                if (mainRect) {
                    const getRel = (rect: DOMRect) => ({
                        x: (rect.left - mainRect.left) / zoom,
                        y: (rect.top - mainRect.top) / zoom,
                        w: rect.width / zoom,
                        h: rect.height / zoom
                    });
                    
                    const r1 = getRel(n1);
                    const r2 = getRel(n2);
                    const rp1 = getRel(p1);
                    const rp2 = getRel(p2);
                    const rp3 = getRel(p3);

                    const n1n2 = `M ${r1.x + r1.w} ${r1.y + r1.h / 2} L ${r2.x} ${r2.y + r2.h / 2}`;
                    
                    const n2Center = { x: r2.x + r2.w, y: r2.y + r2.h / 2 };
                    const paths = [
                        `M ${n2Center.x} ${n2Center.y} L ${rp1.x} ${rp1.y + rp1.h / 2}`,
                        `M ${n2Center.x} ${n2Center.y} L ${rp2.x} ${rp2.y + rp2.h / 2}`,
                        `M ${n2Center.x} ${n2Center.y} L ${rp3.x} ${rp3.y + rp3.h / 2}`,
                    ];
                    setConnections({ n1n2, n2n3: paths });
                }
            }
        }, 100);
    }
  }, [project, zoom, canvasPos]);

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const res = await projectsApi.get(id!);
      setProject(res.data);
      // Sync edit states
      setEditTitle(res.data.title || '');
      setEditIdea(res.data.idea || '');
      setEditTheme(res.data.theme || '');
      setEditGenre(res.data.genre || '');
      setEditPerspective(res.data.perspective || '自动分析');
      setEditCharacters(res.data.characters || 5);
      setEditWordCount(res.data.word_count || 15000);
    } catch (e) {
      message.error("唤起故事星图失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      await projectsApi.update(id, {
        title: editTitle,
        idea: editIdea,
        theme: editTheme,
        genre: editGenre,
        perspective: editPerspective,
        characters: editCharacters,
        word_count: editWordCount
      });
      message.success("时空锚点已更新");
      setIsEditModalOpen(false);
      loadProject();
    } catch (e) {
      message.error("编织更新失败");
    } finally {
      setIsSaving(false);
    }
  };

  if (!project || loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e14' }}><Spin size="large" tip="系统正在编织时空纤维..." /></div>;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // 不干预按钮、输入框、弹窗等交互组件
    if (target.closest('button, input, textarea, a, .ant-modal, .ant-btn, .ant-select')) return;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX - canvasPos.x, y: e.clientY - canvasPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCanvasPos({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
        className="canvas-area"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
            height: '100vh', 
            width: '100vw',
            background: '#0a0e14', 
            color: '#fff', 
            position: 'fixed',
            inset: 0,
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab'
        }}
    >
      <div 
        style={{ 
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)', 
            backgroundSize: '40px 40px',
            backgroundPosition: `${canvasPos.x}px ${canvasPos.y}px`,
            pointerEvents: 'none'
        }} 
      />
      
      {/* 🚀 TopNavBar */}
      <header style={{ position: 'fixed', top: 0, width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10, 14, 20, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0, 227, 253, 0.1)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--secondary)'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
            <ArrowLeftOutlined />
            <span style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2 }}>返回首页</span>
          </div>
          <Text className="serif-text" style={{ fontSize: 24, fontWeight: 900, fontStyle: 'italic', letterSpacing: '-1.5px', color: 'var(--primary)' }}>短篇大爆炸！</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <Button 
            type="text" 
            icon={<SaveOutlined />} 
            loading={isSaving}
            onClick={handleUpdateProject}
            style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}
           >
             保存
           </Button>
           <Button type="primary" icon={<ExportOutlined />} style={{ background: 'var(--primary)', border: 'none', height: 40, padding: '0 24px', borderRadius: 12, fontWeight: 900, boxShadow: '0 8px 24px rgba(255, 122, 251, 0.3)' }}>导出</Button>
           <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.1)', height: 24, margin: '0 8px' }} />
           <BellOutlined style={{ color: '#94a3b8', fontSize: 18, cursor: 'pointer' }} />
           <SettingOutlined style={{ color: '#94a3b8', fontSize: 18, cursor: 'pointer' }} />
        </div>
      </header>

      {/* 🌌 Narrative Canvas */}
      <main 
        style={{ 
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate3d(${canvasPos.x}px, ${canvasPos.y}px, 0) scale(${zoom})`,
            transformOrigin: '0 0',
            display: 'flex', 
            alignItems: 'center', 
            padding: '24px', // Minimal structural padding
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        
        {/* SVG Connection Filaments - Fixed within main coordinate space */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
           <path d={connections.n1n2} stroke="rgba(0, 227, 253, 0.4)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
           {connections.n2n3.map((p, i) => (
               <path key={i} d={p} stroke="rgba(0, 227, 253, 0.3)" strokeWidth="1" fill="none" />
           ))}
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 100, position: 'relative', zIndex: 1, padding: '24px' }}>
          
          {/* Node 1: Core Synthesis (Rounded Full) */}
          <section ref={node1Ref} className="glass-panel active-glow" style={{ width: 400, padding: '40px', borderRadius: 60, border: '1px solid rgba(0, 227, 253, 0.1)', background: 'rgba(27, 32, 40, 0.6)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ width: 6, height: 28, background: 'var(--primary)', borderRadius: 10 }}></div>
                <Title level={2} className="serif-text" style={{ fontSize: 28, fontWeight: 950, fontStyle: 'italic', color: '#fff', margin: 0 }}>核心构思</Title>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                    <Text style={{ fontSize: 9, fontWeight: 950, color: 'var(--secondary)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>作品书名</Text>
                    <Paragraph className="serif-text" style={{ fontSize: 24, color: '#fff', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 }}>{project.title}</Paragraph>
                </div>
                <div>
                    <Text style={{ fontSize: 9, fontWeight: 950, color: 'var(--secondary)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>短篇简介</Text>
                    <Paragraph className="serif-text" style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{project.idea || "在星系边缘的一座废弃灯塔上，最后一名看守者发现了一段跨越光年的秘密通讯。"}</Paragraph>
                </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <Text style={{ fontSize: 9, fontWeight: 950, color: 'var(--secondary)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>主题</Text>
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, padding: '6px 12px', borderRadius: 8, lineHeight: 1.5 }}>
                              {project.theme || "孤独与希望"}
                            </div>
                        </div>
                        <div>
                            <Text style={{ fontSize: 9, fontWeight: 950, color: 'var(--secondary)', letterSpacing: 2, display: 'block', marginBottom: 6 }}>类型</Text>
                            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, padding: '6px 12px', borderRadius: 8, lineHeight: 1.5 }}>
                              {project.genre || "硬科幻"}
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingTop: 20, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>叙事视角</Text>
                            <Text style={{ fontSize: 11, color: '#fff' }}>{project.perspective || '自动分析'}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>角色数量</Text>
                            <Text style={{ fontSize: 11, color: '#fff' }}>{project.characters || 5} 位核心</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, color: '#64748b' }}>目标总字数</Text>
                            <Text style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 900 }}>{project.word_count || 15000} 字</Text>
                        </div>
                    </div>
            </div>
            
            <Button 
                block 
                onClick={() => setIsEditModalOpen(true)}
                style={{ marginTop: 40, height: 44, borderRadius: 12, border: '1px solid rgba(255, 122, 251, 0.2)', background: 'rgba(0,0,0,0.2)', color: 'var(--primary)', fontWeight: 950, fontSize: 10 }}
            >
                编辑构思
            </Button>
          </section>

          {/* Node 2: System Enhancement */}
          <section ref={node2Ref} style={{ width: 360, background: 'rgba(15, 20, 26, 0.4)', backdropFilter: 'blur(16px)', borderRadius: 24, border: '1px solid rgba(0, 227, 253, 0.05)', padding: 32, position: 'relative', flexShrink: 0 }}>
             <div style={{ position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: 14, background: '#0a0e14', border: '1px solid rgba(0, 227, 253, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ThunderboltOutlined style={{ color: 'var(--secondary)', fontSize: 14 }} />
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <Title level={4} style={{ margin: 0, color: 'var(--secondary)', fontStyle: 'italic', fontSize: 18 }}>系统补全</Title>
                <Tag style={{ border: 0, background: 'rgba(0, 227, 253, 0.1)', color: 'var(--secondary)', fontSize: 9, fontWeight: 900 }}>AI 增强</Tag>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12, borderLeft: '2px solid var(--tertiary)' }}>
                    <Text style={{ fontSize: 9, fontWeight: 950, color: 'var(--tertiary)', marginBottom: 4, display: 'block' }}>时代背景</Text>
                    <Paragraph style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>后人类时代的熵增纪元，物质能量极度匮乏的冰冷宇宙。</Paragraph>
                </div>
                <div style={{ padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12, borderLeft: '2px solid var(--secondary)' }}>
                    <Text style={{ fontSize: 9, fontWeight: 950, color: 'var(--secondary)', marginBottom: 4, display: 'block' }}>关键道具</Text>
                    <Paragraph style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>量子信使：一个能捕捉平行宇宙微弱脉冲的手持装置。</Paragraph>
                </div>
                <div style={{ padding: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12, borderLeft: '2px solid var(--primary)' }}>
                    <Text style={{ fontSize: 9, fontWeight: 950, color: 'var(--primary)', marginBottom: 4, display: 'block' }}>结局倾向</Text>
                    <Paragraph style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>开放式结局，在黑暗中亮起一盏新的微光。</Paragraph>
                </div>
             </div>
          </section>

          {/* Node 3: Narrative Arc Part Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 0 }}>
             
             {/* Part 01: 起 */}
             <div ref={node3Part1Ref} className="arc-node" style={{ width: 420, padding: 24, borderRadius: 20, background: 'rgba(32, 38, 47, 0.2)', backdropFilter: 'blur(8px)', borderLeft: '4px solid var(--primary)', cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                   <div>
                      <Text style={{ fontSize: 10, fontWeight: 950, color: 'var(--primary-dim)', letterSpacing: 2 }}>第一部分 · 起</Text>
                      <h3 className="serif-text" style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>孤独的看守者</h3>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 9, color: '#64748b', display: 'block' }}>阶段目标</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}>1,500字</Text>
                   </div>
                </div>
                <Paragraph style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>介绍看守者艾萨克的日常生活，强调其彻底的孤独。灯塔突然收到一段来自已毁灭母星的诡异信号。</Paragraph>
                <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                   <Space style={{ fontSize: 10, color: 'var(--tertiary)' }}><ThunderboltOutlined /> 忧郁</Space>
                   <Space style={{ fontSize: 10, color: 'var(--secondary)' }}><ScheduleOutlined /> 00:00 - 15:00</Space>
                </div>
             </div>

             {/* Part 02: 承 */}
             <div ref={node3Part2Ref} className="arc-node" style={{ width: 420, padding: 24, borderRadius: 20, background: 'rgba(32, 38, 47, 0.2)', backdropFilter: 'blur(8px)', borderLeft: '4px solid var(--secondary)', cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                   <div>
                      <Text style={{ fontSize: 10, fontWeight: 950, color: 'var(--secondary)', letterSpacing: 2 }}>第二部分 · 承</Text>
                      <h3 className="serif-text" style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>译码与回响</h3>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 9, color: '#64748b', display: 'block' }}>阶段目标</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}>2,500字</Text>
                   </div>
                </div>
                <Paragraph style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>随着信号被还原，他发现那不是求救，而是一段记载了生命种子坐标的DNA序列。</Paragraph>
                <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                   <Space style={{ fontSize: 10, color: 'var(--primary)' }}><ThunderboltOutlined /> 好奇</Space>
                   <Space style={{ fontSize: 10, color: 'var(--secondary)' }}><ScheduleOutlined /> 15:00 - 40:00</Space>
                </div>
             </div>

             {/* Part 03: 转 */}
             <div ref={node3Part3Ref} className="arc-node" style={{ width: 420, padding: 24, borderRadius: 20, background: 'rgba(32, 38, 47, 0.2)', backdropFilter: 'blur(8px)', borderLeft: '4px solid var(--tertiary)', cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                   <div>
                      <Text style={{ fontSize: 10, fontWeight: 950, color: 'var(--tertiary)', letterSpacing: 2 }}>第三部分 · 转</Text>
                      <h3 className="serif-text" style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '4px 0 0 0' }}>最终的抉择</h3>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <Text style={{ fontSize: 9, color: '#64748b', display: 'block' }}>阶段目标</Text>
                      <Text style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}>2,000字</Text>
                   </div>
                </div>
                <Paragraph style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>灯塔能源即将耗尽。艾萨克必须决定：维持生命，还是将种子发射向远方的恒星。</Paragraph>
                <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                   <Space style={{ fontSize: 10, color: '#ff6e84' }}><WarningFilled /> 高燃</Space>
                   <Space style={{ fontSize: 10, color: 'var(--secondary)' }}><ScheduleOutlined /> 40:00 - 65:00</Space>
                </div>
             </div>

          </div>

        </div>
      </main>

      {/* 🧭 Bottom Utility Bar */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', padding: '12px 32px', background: 'rgba(21, 26, 33, 0.8)', backdropFilter: 'blur(24px)', borderRadius: 40, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 32, zIndex: 1000, boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)' }}>
            <EyeOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2 }}>专注模式</span>
         </div>
         <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.1)', height: 20 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ZoomOutOutlined style={{ color: '#64748b', cursor: 'pointer', fontSize: 16 }} onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} />
            <Text style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace', width: 44, textAlign: 'center', fontWeight: 'bold' }}>
                {Math.round(zoom * 100)}%
            </Text>
            <ZoomInOutlined style={{ color: '#64748b', cursor: 'pointer', fontSize: 16 }} onClick={() => setZoom(Math.min(2, zoom + 0.1))} />
          </div>
         <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.1)', height: 20 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
             <CloudFilled style={{ fontSize: 14 }} />
             <span style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2 }}>概览地图</span>
          </div>
          <Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.1)', height: 20 }} />
          <div 
            className="utility-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', cursor: 'pointer', padding: '6px 12px', borderRadius: 20, transition: 'all 0.3s' }} 
            onClick={resetView}
          >
            <AimOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 10, fontWeight: 950, letterSpacing: 2 }}>重置视图</span>
          </div>
      </div>

      {/* 🕹️ Floating FAB Group */}
      <div style={{ position: 'fixed', bottom: 40, right: 40, display: 'flex', flexDirection: 'column', gap: 20 }}>
         <button style={{ width: 60, height: 60, borderRadius: 30, background: 'var(--secondary)', color: 'var(--on-secondary)', border: 'none', boxShadow: '0 8px 32px rgba(0, 227, 253, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.scale = '1.1'} onMouseOut={e => e.currentTarget.style.scale = '1'}><PlusOutlined style={{ fontSize: 24 }} /></button>
         <button style={{ width: 60, height: 60, borderRadius: 30, background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', boxShadow: '0 8px 32px rgba(255, 122, 251, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.scale = '1.1'} onMouseOut={e => e.currentTarget.style.scale = '1'}><ThunderboltOutlined style={{ fontSize: 24 }} /></button>
      </div>

      <style>{`
        .arc-node:hover { transform: translateY(-4px); background: rgba(32, 38, 47, 0.4) !important; border-left-width: 8px !important; }
        .utility-btn:hover { background: rgba(0, 227, 253, 0.1); color: var(--secondary) !important; }
        .utility-btn:active { transform: scale(0.95); background: rgba(0, 227, 253, 0.2); }
        .edit-modal .ant-modal-content { background: #151a21; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; color: #fff; }
        .edit-modal .ant-modal-header { background: transparent; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .edit-modal .ant-modal-title { color: #fff !important; }
        .edit-modal .ant-input { background: rgba(0,0,0,0.3) !important; color: #fff !important; border-color: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* ✏️ Edit Synthesis Modal */}
      <Modal
        title={<span className="serif-text" style={{ fontSize: 20 }}>修订核心构思</span>}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleUpdateProject}
        confirmLoading={isSaving}
        className="edit-modal"
        okText="确认快照"
        cancelText="取消"
        width={500}
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 20 }}>
          <div>
            <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 8 }}>作品书名</Text>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="输入新的推演书名..." />
          </div>
          <div>
            <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 8 }}>短篇简介</Text>
            <Input.TextArea rows={4} value={editIdea} onChange={e => setEditIdea(e.target.value)} placeholder="输入故事核心概述..." />
          </div>
          <div>
            <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 8 }}>主题</Text>
            <Input value={editTheme} onChange={e => setEditTheme(e.target.value)} placeholder="故事的主旨灵魂..." />
          </div>
          <div>
            <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 8 }}>类型</Text>
            <Input value={editGenre} onChange={e => setEditGenre(e.target.value)} placeholder="题材标签..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <Text style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 6 }}>叙事视角</Text>
              <Input value={editPerspective} onChange={e => setEditPerspective(e.target.value)} placeholder="视角..." />
            </div>
            <div>
              <Text style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 6 }}>角色数量</Text>
              <Input type="number" value={editCharacters} onChange={e => setEditCharacters(parseInt(e.target.value))} />
            </div>
            <div>
              <Text style={{ color: '#94a3b8', fontSize: 11, display: 'block', marginBottom: 6 }}>字数目标</Text>
              <Input type="number" value={editWordCount} onChange={e => setEditWordCount(parseInt(e.target.value))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
