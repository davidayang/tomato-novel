import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Tag, Typography, Select, message, Button, Input, Spin, Avatar } from 'antd';
import { 
  RobotOutlined, 
  SendOutlined, 
  UserOutlined, 
  ThunderboltOutlined,
  DeleteOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { projectsApi, wizardApi } from '../api';
import { logUserAction } from '../components/DebugConsole';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const TOMATO_GENRES = [
  { label: '玄幻', value: '玄幻' },
  { label: '都市', value: '都市' },
  { label: '历史', value: '历史' },
  { label: '科幻', value: '科幻' },
  { label: '武侠', value: '武侠' },
  { label: '仙侠', value: '仙侠' },
  { label: '奇幻', value: '奇幻' },
  { label: '悬疑', value: '悬疑' },
  { label: '言情', value: '言情' },
  { label: '修仙', value: '修仙' },
  { label: '脑洞大开', value: '脑洞大开' },
  { label: '新媒体', value: '新媒体' },
  { label: '虐文', value: '虐文' },
  { label: '复仇', value: '复仇' },
  { label: '救赎', value: '救赎' },
  { label: '甜宠', value: '甜宠' },
  { label: '豪门', value: '豪门' },
  { label: '总裁', value: '总裁' },
  { label: '年代文', value: '年代文' },
  { label: '种田', value: '种田' },
  { label: '萌宝', value: '萌宝' },
  { label: '团宠', value: '团宠' },
  { label: '闪婚', value: '闪婚' },
  { label: '战神', value: '战神' },
  { label: '赘婿', value: '赘婿' },
  { label: '逆袭', value: '逆袭' },
  { label: '重生', value: '重生' },
  { label: '穿越', value: '穿越' },
  { label: '快穿', value: '快穿' },
  { label: '系统', value: '系统' },
  { label: '职业', value: '职业' },
  { label: '现实', value: '现实' },
  { label: '女性', value: '女性' },
  { label: '社会', value: '社会' },
];

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsApi.list();
      setProjects(res.data);
    } catch (e) {
      setProjects([]);
    }
  };

  // Form states
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [theme, setTheme] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [perspective, setPerspective] = useState('自动分析');
  const [characters, setCharacters] = useState<number>(5);
  const [wordCount, setWordCount] = useState<number>(15000);

  const resetForm = () => {
    setTitle('');
    setAbstract('');
    setTheme('');
    setGenres([]);
    setPerspective('自动分析');
  };

  // Wizard Modal states
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [currentFieldToFix, setCurrentFieldToFix] = useState<string | null>(null);
  const [wizardMode, setWizardMode] = useState<'selecting' | 'refine' | 'direct'>('selecting');
  const [wizardSelectedGenres, setWizardSelectedGenres] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const reconstructWizardHistory = (p: any) => {
    const history: any[] = [];
    if (p.idea) {
      history.push({ id: 'h-idea', role: 'user', content: `初始灵感：${p.idea}`, timestamp: '历史回溯' });
    }
    if (p.title && p.title !== '未完成的星云') {
      history.push({ id: 'h-title', role: 'user', content: `锁定【书名】：${p.title}`, timestamp: '历史回溯' });
    }
    if (p.description) {
      history.push({ id: 'h-desc', role: 'user', content: `锁定【简介】：${p.description}`, timestamp: '历史回溯' });
    }
    if (p.genre) {
      history.push({ id: 'h-genre', role: 'user', content: `锁定【类型】：${p.genre}`, timestamp: '历史回溯' });
    }
    if (p.theme) {
      history.push({ id: 'h-theme', role: 'user', content: `锁定【主题】：${p.theme}`, timestamp: '历史回溯' });
    }
    if (p.perspective && p.perspective !== '自动分析') {
      history.push({ id: 'h-persp', role: 'user', content: `锁定【叙事视角】：${p.perspective}`, timestamp: '历史回溯' });
    }
    return history;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, wizardLoading]);

  const startSupplementation = async (projectId: string, field?: string, direction?: string) => {
    setWizardLoading(true);
    try {
      const res = await wizardApi.nucleus(projectId, field, direction);
      const data = res.data;

      if (data.status === 'done' || !data.field) {
        setChatMessages(prev => [...prev, {
          id: 'done-' + Date.now(),
          role: 'assistant',
          content: '【内核锚定成功】。星源引擎所有基础节点已就绪，当前蓝图已具备爆发潜力。',
          type: 'end',
          timestamp: '刚刚'
        }]);
        setWizardLoading(false);
        return;
      }

      setCurrentFieldToFix(data.field);
      
      const optionCount = data.options?.length || 5;
      const content = direction 
        ? `收到。基于您的反馈方向【${direction}】，我重新针对【${data.field}】推演了 ${optionCount} 个更精准的爆款建议：\n“${data.analysis}”`
        : `【神经同步成功】。目前【${data.field}】尚在虚无中。基于当前叙事蓝图，我有 ${optionCount} 个建议：\n“${data.analysis}”`;

      setChatMessages(prev => {
        // 全局深度查重：防止在同一会话中重复加载同一个决策点的初始建议
        if (!direction && prev.length > 0) {
          const assistantMsgs = prev.filter(m => m.role === 'assistant' && m.type === 'options');
          if (assistantMsgs.length > 0) {
            const lastAssistantMsg = assistantMsgs[assistantMsgs.length - 1];
            if (lastAssistantMsg.field === data.field) {
               // 如果已经有这个字段的建议了，并且中间没有用户的新反馈，则不追加
               return prev;
            }
          }
        }
        
        return [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          field: data.field,
          options: data.options,
          content: content,
          type: 'options',
          timestamp: '刚刚'
        }];
      });
    } catch (e) {
      message.error('由于宇宙干扰，AI 对话未能启动');
    }
    setWizardLoading(false);
  };

  const handleOptionSelect = async (field: string, value: string) => {
    if (!activeProjectId) return;
    setWizardLoading(true);
    try {
      const fieldMap: any = { '书名': 'title', '简介': 'description', '类型': 'genre', '主题': 'theme', '叙事视角': 'perspective' };
      const internalField = fieldMap[field] || field;
      
      await projectsApi.update(activeProjectId, { [internalField]: value });
      logUserAction("Wizard", `锁定【${field}】`, `选择项: ${value}`);
      
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'user',
        content: `锁定【${field}】：${value}`,
        timestamp: '刚刚'
      }]);

      // 自动触发下一个字段补充
      setTimeout(() => startSupplementation(activeProjectId), 600);
    } catch (e) {
      message.error('无法更新节点');
    }
    setWizardLoading(false);
  };

  const handleCustomAction = (type: 'refine' | 'direct') => {
    setWizardMode(type);
    const text = type === 'refine' 
      ? `好的，请在下方详细描述您心仪的【${currentFieldToFix}】方向，我为您重新推演。`
      : `明白。请直接在下方输入您最终决定的【${currentFieldToFix}】内容。`;
    
    logUserAction("Wizard", `切换为自定义模式: ${type}`, `针对字段: ${currentFieldToFix}`);

    setChatMessages(prev => [...prev, {
      id: 'action-' + Date.now(),
      role: 'assistant',
      content: text,
      timestamp: '刚刚'
    }]);
  };

  const handleCreateScope = async () => {
    if (!abstract.trim()) {
      message.warning('请输入作品简介');
      return;
    }
    setLoading(true);
    try {
      const res = await projectsApi.create({
        title: title.trim() || '未完成的星云',
        idea: abstract.trim(),
        genre: genres.join(','),
        theme: theme.trim(),
        perspective: perspective,
        characters_count: characters,
        target_words: wordCount,
      });
      logUserAction("ProjectList", "创建新篇章", `书名: ${title.trim() || '未完成'}`);
      setActiveProjectId(res.data.id);
      setIsModalOpen(false);
      resetForm();
      const history = reconstructWizardHistory(res.data);
      setChatMessages(history);
      setIsWizardModalOpen(true);
      startSupplementation(res.data.id);
      loadProjects(); // 动态刷新列表
    } catch (err: any) {
      message.error('无法连接到神经中枢: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTrashProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await projectsApi.update(id, { status: 'deleted' });
      message.success('篇章已移至回收站');
      loadProjects();
    } catch (err) {
      message.error('无法移动至回收站');
    }
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
      
      {/* 🌌 Atmospheric Backdrop */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'rgba(255,122,251,0.08)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '-5%', left: '10%', width: '35vw', height: '35vw', background: 'rgba(0,227,253,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <header style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
              <h2 className="serif-text" style={{ fontSize: 36, fontWeight: 700, color: '#f1f3fc', marginBottom: 8, letterSpacing: '-0.02em' }}>作品列表</h2>
              <p style={{ color: '#a8abb3', maxWidth: 600, fontWeight: 300, fontSize: 15 }}>在星辰大海中捕捉每一丝创作灵感。您的所有宇宙篇章都已在此集结。</p>
           </div>
           <button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              style={{ background: '#ff7afb', color: '#57005a', padding: '12px 32px', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 0 20px rgba(255,122,251,0.3)' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
           >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              <span>开始创作</span>
           </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
          {projects.map((p, idx) => (
            <div 
              key={p.id}
              className="story-card"
              onClick={() => {
                const isIncomplete = !p.title || p.title === '未完成的星云' || !p.genre || !p.theme || !p.perspective || p.perspective === '自动分析';
                if (isIncomplete) {
                  const isSameProject = p.id === activeProjectId;
                  setActiveProjectId(p.id);
                  if (!isSameProject) {
                    const history = reconstructWizardHistory(p);
                    setChatMessages(history);
                  }
                  setIsWizardModalOpen(true);
                  startSupplementation(p.id);
                } else {
                  navigate('/editor/' + p.id);
                }
              }}
              style={{ 
                  background: 'rgba(21, 26, 33, 0.4)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: 20, 
                  padding: 28, 
                  border: '1px solid rgba(255, 255, 255, 0.05)', 
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
                 <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.genre?.split(',').map((g: string, i: number) => (
                       <Tag key={i} style={{ background: idx === 0 ? 'rgba(0, 227, 253, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: idx === 0 ? '#00e3fd' : '#a8abb3', border: 'none', fontSize: 10, fontWeight: 900, borderRadius: 4, padding: '2px 10px', margin: 0 }}>{g}</Tag>
                    ))}
                 </div>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'delete',
                          danger: true,
                          label: '移至回收站',
                          icon: <DeleteOutlined />,
                          onClick: (info) => {
                            Modal.confirm({
                              title: '移入回收站？',
                              content: '该篇章将暂时被弃置，您可以在“回收站”中随时将其找回。',
                              okText: '确认移入',
                              okType: 'danger',
                              cancelText: '取消',
                              onOk: () => handleTrashProject(p.id, info.domEvent as any),
                              className: 'glass-modal'
                            });
                          }
                        }
                      ],
                      onClick: (e) => e.domEvent.stopPropagation()
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <div 
                      onClick={e => e.stopPropagation()} 
                      style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <MoreOutlined style={{ color: '#64748b', fontSize: 18 }} />
                    </div>
                  </Dropdown>
              </div>
              <h3 className="serif-text story-title" style={{ fontSize: 24, fontWeight: 700, color: '#f1f3fc', marginBottom: 14, transition: 'color 0.3s' }}>{p.title}</h3>
              <Paragraph style={{ color: '#a8abb3', fontSize: 14, lineHeight: 1.8, height: 50, overflow: 'hidden', marginBottom: 32, opacity: 0.8 }}>{p.idea}</Paragraph>
              
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 20 }}>
                     <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 18 }}>
                        <div style={{ width: `${Math.min(100, Math.round(((p.wizard_step || 0) / 6) * 100))}%`, height: '100%', background: idx === 0 ? 'linear-gradient(90deg, #00e3fd, #ff7afb)' : '#334155', boxShadow: idx === 0 ? '0 0 10px rgba(0,227,253,0.3)' : 'none' }}></div>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                           <span className="material-symbols-outlined" style={{ fontSize: 14 }}>history</span> 
                           {p.updated_at ? new Date(p.updated_at).toLocaleString('zh-CN', { hour12: false, month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '刚刚'}
                        </div>
                        <Text style={{ fontSize: 12, fontWeight: 900, color: '#ff7afb', letterSpacing: '0.02em' }}>
                          {(!p.title || p.title === '未完成的星云' || !p.genre) ? '补全内核' : '进入中枢'} <span style={{ fontSize: 14 }}>→</span>
                        </Text>
                     </div>
                  </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .story-card:hover { transform: translateY(-6px); background: rgba(21, 26, 33, 0.7); border-color: rgba(255, 122, 251, 0.2) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
        .story-card:hover .story-title { color: #ff7afb !important; }
        
        .glass-modal .ant-modal-content {
          background: rgba(32, 38, 47, 0.6) !important;
          backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 20px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(0, 227, 253, 0.15) !important;
        }

        .custom-input {
          background: #000000 !important;
          border: none !important;
          border-radius: 12px !important;
          color: #f1f3fc !important;
          padding: 12px 16px !important;
          transition: all 0.3s !important;
        }
        .custom-input:focus {
          background: #0a0a0a !important;
          box-shadow: 0 0 0 1px rgba(0, 227, 253, 0.3) !important;
        }
        .custom-input::placeholder {
          color: rgba(168, 171, 179, 0.3) !important;
        }

        .bento-input-container {
          background: #0f141a;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          transition: all 0.3s;
        }
        .bento-input-container:focus-within {
          background: #141a21;
          box-shadow: 0 0 0 1px rgba(0, 227, 253, 0.3);
        }
        .bento-input {
          background: transparent !important;
          border: none !important;
          color: #f1f3fc !important;
          font-size: 14px !important;
          width: 100%;
          padding: 10px 8px !important;
        }
        .bento-input:focus {
          box-shadow: none !important;
        }

        .label-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(32, 38, 47, 0.8);
          border-radius: 10px;
        }

        /* AI Oracle Modal Styles */
        .wizard-modal .ant-modal-content {
          background: rgba(10, 14, 20, 0.85) !important;
          backdrop-filter: blur(40px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 32px !important;
          overflow: hidden;
          padding: 0 !important;
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.8) !important;
        }

        .chat-bubble-ai { background: rgba(32, 38, 47, 0.4); border: 1px solid rgba(0, 227, 253, 0.1); }
        .chat-bubble-user { background: #f06cec; color: #fff; }
        
        .option-card { background: #1b2028; border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.3s; }
        .option-card:hover { border-color: #00e3fd; background: rgba(0, 227, 253, 0.05); transform: scale(1.02); }
      `}</style>

      {/* Start Creation Modal */}
      <Modal 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        centered 
        width={700}
        className="glass-modal"
        closeIcon={<span className="material-symbols-outlined" style={{ color: '#a8abb3' }}>close</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(68, 72, 79, 0.1)', background: 'rgba(27, 32, 40, 0.4)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="material-symbols-outlined" style={{ color: '#ff7afb', fontSize: 32, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h2 className="serif-text" style={{ color: '#f1f3fc', fontSize: 28, fontWeight: 700, margin: 0 }}>开启新篇章</h2>
          </div>

          <div className="custom-scrollbar" style={{ padding: 32, overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="label-text" style={{ color: '#00e3fd' }}>书名</span>
                <input className="custom-input serif-text" style={{ fontSize: 24 }} placeholder="项目书名 (留空则由 AI 建议)" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="label-text" style={{ color: '#00e3fd', marginBottom: 0 }}>短篇简介</span>
                  <span style={{ fontSize: 10, background: 'rgba(167, 1, 56, 0.2)', color: '#ff6e84', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>REQUIRED</span>
                </div>
                <textarea className="custom-input" style={{ fontSize: 16, height: 100, resize: 'none' }} placeholder="在此播下叙事的种子..." value={abstract} onChange={(e) => setAbstract(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="label-text" style={{ color: '#a8abb3' }}>主题</span>
                  <div className="bento-input-container" style={{ padding: '4px 12px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#a8abb3', fontSize: 18, marginTop: 10, alignSelf: 'flex-start' }}>psychology</span>
                    <TextArea variant="borderless" className="bento-input" style={{ minHeight: 60, resize: 'none' }} placeholder="详细主题设定 (选填)" value={theme} onChange={(e) => setTheme(e.target.value)} />
                  </div>
                </div>
                <div>
                  <span className="label-text" style={{ color: '#a8abb3' }}>类型</span>
                  <div className="bento-input-container">
                    <Select variant="borderless" mode="multiple" className="bento-input" style={{ height: 'auto', minHeight: 40 }} placeholder="选择类别..." value={genres} onChange={setGenres} options={TOMATO_GENRES} />
                  </div>
                </div>
                <div>
                  <span className="label-text" style={{ color: '#a8abb3' }}>叙事视角</span>
                  <div className="bento-input-container">
                    <select className="bento-input" style={{ background: 'transparent', border: 'none' }} value={perspective} onChange={(e) => setPerspective(e.target.value)}>
                      <option value="自动分析" style={{ background: '#1b2028' }}>自动分析</option>
                      <option value="第一人称" style={{ background: '#1b2028' }}>第一人称</option>
                      <option value="第三人称" style={{ background: '#1b2028' }}>第三人称</option>
                      <option value="全知视角" style={{ background: '#1b2028' }}>全知视角</option>
                    </select>
                  </div>
                </div>
                <div>
                  <span className="label-text" style={{ color: '#a8abb3' }}>角色数量</span>
                  <div className="bento-input-container">
                    <Input 
                      variant="borderless"
                      type="number" 
                      className="bento-input" 
                      placeholder="建议 5-10" 
                      value={characters} 
                      onChange={(e) => setCharacters(parseInt(e.target.value) || 5)} 
                    />
                  </div>
                </div>
                <div>
                  <span className="label-text" style={{ color: '#a8abb3' }}>目标字数</span>
                  <div className="bento-input-container">
                    <Input 
                      variant="borderless"
                      type="number" 
                      className="bento-input" 
                      placeholder="建议 15000+" 
                      value={wordCount} 
                      onChange={(e) => setWordCount(parseInt(e.target.value) || 15000)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button type="text" onClick={() => setIsModalOpen(false)} style={{ color: '#a8abb3' }}>取消</Button>
            <Button type="primary" onClick={handleCreateScope} loading={loading} style={{ background: '#ff7afb', border: 'none', height: 44, padding: '0 32px', borderRadius: 12 }}>开始创作 <ThunderboltOutlined /></Button>
          </div>
        </div>
      </Modal>

      {/* AI Oracle Wizard Modal */}
      <Modal open={isWizardModalOpen} onCancel={() => setIsWizardModalOpen(false)} footer={null} width={900} centered className="wizard-modal">
        <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <header style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
            <h2 className="serif-text" style={{ color: '#fff', fontSize: 20, margin: 0 }}>系统补全 - 分步式 AI 共创</h2>
          </header>

          <div ref={scrollRef} className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {chatMessages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'assistant' ? 'row' : 'row-reverse', gap: 16 }}>
                <Avatar size={40} icon={msg.role === 'assistant' ? <RobotOutlined /> : <UserOutlined />} style={{ color: msg.role === 'assistant' ? '#00e3fd' : '#ff7afb', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className={msg.role === 'assistant' ? 'chat-bubble-ai' : 'chat-bubble-user'} style={{ padding: '16px 24px', borderRadius: 24 }}>
                    <Paragraph style={{ margin: 0, color: 'inherit' }}>{msg.content}</Paragraph>
                  </div>
                  
                  {msg.type === 'options' && msg.field === '类型' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, width: '100%' }}>
                      {msg.options.map((opt: string, i: number) => {
                        const isRec = opt.includes('(推荐)');
                        const pureOpt = opt.replace('(推荐)', '').trim();
                        const isSelected = msg.field === '类型' && wizardSelectedGenres.includes(pureOpt);
                        
                        return (
                          <button 
                            key={i} 
                            className="option-card" 
                            onClick={() => {
                              if (msg.field === '类型') {
                                if (isSelected) setWizardSelectedGenres(prev => prev.filter(g => g !== pureOpt));
                                else setWizardSelectedGenres(prev => [...prev, pureOpt]);
                              } else {
                                handleOptionSelect(msg.field, opt);
                              }
                            }} 
                            style={{ 
                              padding: '14px 20px', 
                              borderRadius: 16, 
                              color: isRec ? '#00e3fd' : '#fff', 
                              textAlign: 'left', 
                              minHeight: 80,
                              borderColor: (isRec || isSelected) ? 'rgba(0, 227, 253, 0.5)' : undefined,
                              background: (isRec || isSelected) ? 'rgba(0, 227, 253, 0.08)' : undefined,
                              transition: 'all 0.2s',
                              transform: isSelected ? 'scale(0.96)' : 'scale(1)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <Text style={{ fontSize: 10, color: (isRec || isSelected) ? '#00e3fd' : '#a8abb3', fontWeight: 900 }}>
                                {isSelected ? '✓ 已入选' : `建议 ${i+1}`}
                              </Text>
                              {(isRec || isSelected) && <ThunderboltOutlined style={{ color: '#00e3fd', fontSize: 12 }} />}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{opt}</div>
                          </button>
                        );
                      })}

                      {msg.field === '类型' && wizardSelectedGenres.length > 0 && (
                        <button 
                          className="option-card" 
                          onClick={() => handleOptionSelect('类型', wizardSelectedGenres.join(','))}
                          style={{ padding: '14px 20px', borderRadius: 16, color: '#00e3fd', background: 'rgba(0, 227, 253, 0.15)', borderColor: '#00e3fd' }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 900 }}><ThunderboltOutlined /> 确认选择 ({wizardSelectedGenres.length}个)</div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>确认这些标签并锁定</div>
                        </button>
                      )}

                      {msg.field === '类型' && (
                         <div style={{ display: 'flex', alignItems: 'center', minHeight: 80 }}>
                            <Select
                              mode="multiple"
                              placeholder="➕ 从全部分类中多选..."
                              style={{ width: '100%' }}
                              options={TOMATO_GENRES}
                              value={wizardSelectedGenres}
                              onChange={setWizardSelectedGenres}
                              className="option-card"
                              variant="borderless"
                              dropdownStyle={{ background: '#1b2028', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                         </div>
                      )}

                      <button className="option-card" onClick={() => handleCustomAction('refine')} style={{ padding: '14px 20px', borderRadius: 16, color: '#ff7afb', borderStyle: 'dashed' }}>
                        <div style={{ fontSize: 12, fontWeight: 900 }}><ThunderboltOutlined /> 都不太好，重新推演</div>
                      </button>
                      <button className="option-card" onClick={() => handleCustomAction('direct')} style={{ padding: '14px 20px', borderRadius: 16, color: '#a8abb3', borderStyle: 'dashed' }}>
                        <div style={{ fontSize: 12, fontWeight: 900 }}><UserOutlined /> 直接输入{msg.field}</div>
                      </button>
                    </div>
                  )}

                  {msg.type === 'options' && msg.field !== '类型' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, width: '100%' }}>
                      {msg.options.map((opt: string, i: number) => {
                        const isRec = opt.includes('(推荐)');
                        const recColor = msg.field === '叙事视角' ? '#ff4d4f' : '#00e3fd';
                        const recBorder = msg.field === '叙事视角' ? '255, 77, 79' : '0, 227, 253';
                        
                        return (
                          <button 
                            key={i} 
                            className="option-card" 
                            onClick={() => handleOptionSelect(msg.field, opt)} 
                            style={{ 
                              padding: '14px 20px', 
                              borderRadius: 16, 
                              color: isRec ? recColor : '#fff', 
                              textAlign: 'left', 
                              minHeight: 80,
                              borderColor: isRec ? `rgba(${recBorder}, 0.5)` : undefined,
                              background: isRec ? `rgba(${recBorder}, 0.08)` : undefined
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <Text style={{ fontSize: 10, color: isRec ? recColor : '#a8abb3', fontWeight: 900 }}>
                                {isRec ? '👑 深度推荐' : `建议 ${i+1}`}
                              </Text>
                              {isRec && <ThunderboltOutlined style={{ color: recColor, fontSize: 12 }} />}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{opt}</div>
                          </button>
                        );
                      })}
                      {msg.field !== '叙事视角' && (
                        <>
                          <button className="option-card" onClick={() => handleCustomAction('refine')} style={{ padding: '14px 20px', borderRadius: 16, color: '#ff7afb', borderStyle: 'dashed' }}>
                            <div style={{ fontSize: 12, fontWeight: 900 }}><ThunderboltOutlined /> 都不太好，重新推演</div>
                          </button>
                          <button className="option-card" onClick={() => handleCustomAction('direct')} style={{ padding: '14px 20px', borderRadius: 16, color: '#a8abb3', borderStyle: 'dashed' }}>
                            <div style={{ fontSize: 12, fontWeight: 900 }}><UserOutlined /> 直接输入{msg.field}</div>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {msg.type === 'end' && (
                    <Button type="primary" block size="large" onClick={() => navigate(`/editor/${activeProjectId}`)} style={{ background: '#ff7afb', borderRadius: 16, height: 50, fontWeight: 700 }}>进场创作</Button>
                  )}
                </div>
              </div>
            ))}
            {wizardLoading && <Spin style={{ alignSelf: 'center', margin: '20px 0' }} />}
          </div>

          <div style={{ padding: '24px 32px 48px', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#000', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
              <Input 
                variant="borderless" 
                placeholder="输入您的建议或内容..." 
                style={{ flex: 1, color: '#fff' }} 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)}
                onPressEnter={() => {
                  if (!chatInput.trim() || !currentFieldToFix || !activeProjectId) return;
                  const text = chatInput.trim();
                  setChatMessages(prev => [...prev, {
                    id: 'user-' + Date.now(),
                    role: 'user',
                    content: text,
                    timestamp: '刚刚'
                  }]);
                  if (wizardMode === 'refine') {
                    logUserAction("Wizard", "用户指令定位", `引导方向: ${text}`);
                    startSupplementation(activeProjectId, currentFieldToFix, text);
                  } else {
                    logUserAction("Wizard", "用户手动锁定", `输入内容: ${text}`);
                    handleOptionSelect(currentFieldToFix, text);
                  }
                  setChatInput('');
                  setWizardMode('selecting');
                }}
              />
              <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={() => {
                if (!chatInput.trim() || !currentFieldToFix || !activeProjectId) return;
                const text = chatInput.trim();
                setChatMessages(prev => [...prev, {
                  id: 'user-btn-' + Date.now(),
                  role: 'user',
                  content: text,
                  timestamp: '刚刚'
                }]);
                if (wizardMode === 'refine') {
                  startSupplementation(activeProjectId, currentFieldToFix, text);
                } else {
                  handleOptionSelect(currentFieldToFix, text);
                }
                setChatInput('');
                setWizardMode('selecting');
              }} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
