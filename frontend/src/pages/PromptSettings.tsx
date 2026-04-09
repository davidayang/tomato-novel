import { useState, useEffect } from 'react';
import { 
  Typography, Button, Modal, Form, Input, Card, Space, 
  message, Tag, Empty, Spin, Popconfirm, Badge
} from 'antd';
import { 
  RocketOutlined, 
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  NodeIndexOutlined,
  BgColorsOutlined,
  InteractionOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined, 
  UserOutlined, 
  ProjectOutlined, 
  ReadOutlined, 
  FormOutlined, 
  AuditOutlined, 
  ScissorOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 创作流程顺序与元数据定义
const PROMPT_ORDER = [
  { key: 'type_analysis', label: '类型分析与定位', phase: '内核溯源 Genesis', icon: <RocketOutlined /> },
  { key: 'intro_generation', label: '爆款简介生成', phase: '内核溯源 Genesis', icon: <BgColorsOutlined /> },
  { key: 'word_plan', label: '字数节奏规划', phase: '故事核 Nucleus', icon: <NodeIndexOutlined /> },
  { key: 'conflict_and_world', label: '冲突与世界观', phase: '故事核 Nucleus', icon: <GlobalOutlined /> },
  { key: 'character_suggestion', label: '全维角色设计', phase: '生命演化 Evolve', icon: <UserOutlined /> },
  { key: 'story_directions', label: '叙事走向推演', phase: '生命演化 Evolve', icon: <InteractionOutlined /> },
  { key: 'outline_generation', label: '全篇情节大纲', phase: '叙事坍缩 Collapse', icon: <ProjectOutlined /> },
  { key: 'rhythm_design', label: '节奏点模版化', phase: '叙事坍缩 Collapse', icon: <ThunderboltOutlined /> },
  { key: 'beat_summary', label: '节奏点梗概细化', phase: '工坊创作 Workroom', icon: <ReadOutlined /> },
  { key: 'beat_expand', label: '正文深度扩写', phase: '工坊创作 Workroom', icon: <FormOutlined /> },
  { key: 'beat_polish', label: 'AI去味与润色', phase: '工坊创作 Workroom', icon: <AuditOutlined /> },
  { key: 'beat_rewrite', label: '场景局部重构', phase: '工坊创作 Workroom', icon: <ScissorOutlined /> },
  { key: 'impact_analysis', label: '修改影响检测', phase: '治理检测 Management', icon: <SafetyCertificateOutlined /> }
];

export default function PromptSettings() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form] = Form.useForm();

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/prompts');
      const data = await resp.json();
      setPrompts(data);
    } catch (err) {
      message.error("获取提示词失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrompts(); }, []);

  const handleSetDefault = async (pId: string, pKey: string) => {
    try {
      await fetch(`/api/prompts/${pId}/activate?key=${pKey}`, { method: 'POST' });
      message.success("已切换至当前在用");
      fetchPrompts();
    } catch (err) {
      message.error("切换失败");
    }
  };

  const handleDelete = async (pId: string) => {
    try {
      await fetch(`/api/prompts/${pId}`, { method: 'DELETE' });
      message.success("已成功移出实验室");
      fetchPrompts();
    } catch (err) {
      message.error("删除失败");
    }
  };

  const openEditor = (prompt?: any, key?: string) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setIsNew(false);
      form.setFieldsValue(prompt);
    } else {
      setEditingPrompt({ key });
      setIsNew(true);
      const meta = PROMPT_ORDER.find(o => o.key === key);
      form.setFieldsValue({ 
        key, 
        name: `${meta?.label || '自定义'}备选`, 
        category: meta?.phase || 'Custom', 
        content: '' 
      });
    }
    setShowEditor(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (isNew) {
        await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
      } else {
        await fetch(`/api/prompts/${editingPrompt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: values.content })
        });
      }
      message.success("同步至剧情矩阵");
      setShowEditor(false);
      fetchPrompts();
    } catch (err) {
      message.error("保存失败");
    }
  };

  // 渲染结构化非编辑行
  const renderReadonlyTags = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const isTag = line.trim().startsWith('<') && line.trim().endsWith('>');
      if (isTag) {
        return <div key={i} className="struct-row"><code className="tag-code">{line}</code></div>;
      }
      return null;
    }).filter(v => v !== null);
  };

  const renderStepRow = (step: any) => {
    const stepPrompts = prompts.filter(p => p.key === step.key);
    const activePrompt = stepPrompts.find(p => p.is_active);
    const alternates = stepPrompts.filter(p => !p.is_active);

    return (
      <div key={step.key} className="prompt-meta-row">
        <div className="step-col info">
          <div className="step-icon-box">{step.icon}</div>
          <div className="step-text">
            <Text className="phase-label">{step.phase}</Text>
            <Title level={4} className="step-label">{step.label}</Title>
          </div>
        </div>

        <div className="divider-dash" />

        <div className="step-col active">
          {activePrompt ? (
            <Card className="prompt-card active-card" size="small">
              <div className="card-header">
                <Tag color="#00e3fd" className="status-tag">当前在用</Tag>
                <div style={{ flex: 1 }} />
                <Button type="text" icon={<EditOutlined />} onClick={() => openEditor(activePrompt)} />
              </div>
              <div className="card-preview">
                {activePrompt.content.slice(0, 150)}...
              </div>
            </Card>
          ) : (
            <Empty description="未配置核心提示词" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>

        <div className="divider-dash" />

        <div className="step-col alternates">
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {alternates.map(p => (
              <div key={p.id} className="alternate-chip">
                <div className="chip-info" onClick={() => handleSetDefault(p.id, p.key)}>
                  <HistoryOutlined />
                  <span className="chip-name">{p.name || '备选方案'}</span>
                </div>
                <div className="chip-actions">
                  <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEditor(p)} />
                  <Popconfirm title="确定移出矩阵？" onConfirm={() => handleDelete(p.id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>
                </div>
              </div>
            ))}
            <Button 
                type="dashed" 
                block 
                icon={<PlusOutlined />} 
                onClick={() => openEditor(undefined, step.key)}
                className="add-alt-btn"
            >
              添加备选方案
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  return (
    <div className="prompt-page-wrapper">
      <div className="page-header-minimal">
        <div className="header-left">
          <h1 className="serif-text">提示词矩阵</h1>
          <p className="subtitle">原子级配置每一个叙事坍缩点。建议优先使用内置方案，仅在微调逻辑时新增备选。</p>
        </div>
        <div className="header-stats">
          <Badge status="processing" text={`${prompts.length} 个活跃模板`} style={{ color: '#fff' }} />
        </div>
      </div>

      {loading ? (
        <div className="loading-state"><Spin size="large" tip="载入矩阵数据..." /></div>
      ) : (
        <div className="matrix-stack">
          {PROMPT_ORDER.map(renderStepRow)}
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        title={isNew ? `新增 【${PROMPT_ORDER.find(o => o.key === editingPrompt?.key)?.label}】 备选方案` : "编辑提示词"}
        open={showEditor}
        onCancel={() => setShowEditor(false)}
        footer={null}
        width={800}
        className="prompt-editor-modal"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="模板全称" hidden={!isNew}>
             <Input placeholder="输入便于区分的名称" />
          </Form.Item>
          
          <div className="struct-instruction">
             <Text type="secondary" style={{ fontSize: 12 }}>提示：系统结构化标签已识别（锁定预览见上方）。请在输入框内保持 R-T-C-O 框架的一致性。</Text>
          </div>

          <div className="struct-preview-area">
             {editingPrompt?.content && renderReadonlyTags(editingPrompt.content)}
          </div>

          <Form.Item label="Prompt 逻辑内容" name="content" rules={[{ required: true }]}>
             <TextArea 
                placeholder="在此编写详细的 AI 指令..." 
                autoSize={{ minRows: 15, maxRows: 25 }} 
                className="fancy-textarea"
              />
          </Form.Item>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
             <Button onClick={() => setShowEditor(false)}>取消</Button>
             <Button type="primary" htmlType="submit" className="save-btn">确认写入矩阵</Button>
          </div>
        </Form>
      </Modal>

      <style>{`
        .prompt-page-wrapper { padding: 40px 48px; min-height: 100vh; background: #0a0e14; color: #fff; }
        .page-header-minimal { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; }
        .serif-text { font-family: 'Newsreader', serif; font-size: 36px; margin: 0; }
        .subtitle { color: #64748b; margin: 8px 0 0; font-size: 14px; max-width: 600px; }

        .matrix-stack { display: flex; flex-direction: column; gap: 0; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; overflow: hidden; }
        .prompt-meta-row { display: flex; min-height: 180px; background: rgba(25, 30, 38, 0.4); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .prompt-meta-row:last-child { border-bottom: none; }
        
        .divider-dash { width: 1px; border-left: 1px dashed rgba(255,255,255,0.1); }
        
        .step-col { padding: 24px; display: flex; flex-direction: column; justify-content: center; }
        .step-col.info { width: 280px; flex-shrink: 0; background: rgba(0,0,0,0.2); }
        .step-col.active { flex: 1; min-width: 400px; }
        .step-col.alternates { width: 340px; flex-shrink: 0; }

        .step-icon-box { font-size: 32px; color: #00e3fd; margin-bottom: 12px; }
        .phase-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
        .step-label { margin: 4px 0 0 !important; color: #f1f3fc !important; }

        .prompt-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(0, 227, 253, 0.1); border-radius: 12px; height: 100%; transition: all 0.3s; }
        .active-card { box-shadow: 0 0 20px rgba(0, 227, 253, 0.05); }
        .active-card:hover { border-color: rgba(0, 227, 253, 0.3); background: rgba(0, 227, 253, 0.03); }
        .card-header { display: flex; align-items: center; margin-bottom: 8px; }
        .status-tag { font-size: 10px; padding: 0 8px; border: none; }
        .card-preview { font-size: 13px; color: #94a3b8; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

        .alternate-chip { 
            display: flex; align-items: center; justify-content: space-between; 
            padding: 8px 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); 
            border-radius: 8px; font-size: 13px; color: #94a3b8; transition: 0.3s; cursor: pointer;
        }
        .alternate-chip:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.1); color: #fff; }
        .chip-info { flex: 1; display: flex; align-items: center; gap: 8px; }
        .chip-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        .chip-actions { display: flex; gap: 4px; }
        .chip-actions button { color: #64748b !important; padding: 4px !important; }

        .add-alt-btn { 
            background: transparent !important; color: #64748b !important; border-color: rgba(255,255,255,0.1) !important; 
            height: 40px !important; border-radius: 8px !important; font-size: 12px !important;
        }
        .add-alt-btn:hover { border-color: #ff7afb !important; color: #ff7afb !important; }

        .loading-state { height: 60vh; display: flex; align-items: center; justify-content: center; color: #00e3fd; }

        .prompt-editor-modal .ant-modal-content { background: #1a1f26 !important; border: 1px solid rgba(255,255,255,0.1); color: #fff; }
        .prompt-editor-modal .ant-modal-header { background: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .prompt-editor-modal .ant-modal-title { color: #fff !important; }
        .fancy-textarea { 
            background: rgba(0,0,0,0.3) !important; color: #e2e8f0 !important; font-family: 'JetBrains Mono', monospace; 
            font-size: 13px !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important;
            padding: 16px !important;
        }
        .fancy-textarea:focus { border-color: #ff7afb !important; box-shadow: 0 0 10px rgba(255, 122, 251, 0.1) !important; }
        .struct-instruction { margin-bottom: 8px; padding: 8px 12px; background: rgba(0,0,0,0.2); border-left: 3px solid #ff7afb; border-radius: 0 4px 4px 0; }
        .struct-preview-area { margin-bottom: 16px; background: rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
        .struct-row { padding: 4px 12px; border-bottom: 1px solid rgba(255,255,255,0.02); background: rgba(0,227,253,0.03); }
        .tag-code { color: #00e3fd; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; opacity: 0.8; }
        .save-btn { background: #ff7afb !important; border: none !important; color: #57005a !important; font-weight: 700 !important; }
      `}</style>
    </div>
  );
}
