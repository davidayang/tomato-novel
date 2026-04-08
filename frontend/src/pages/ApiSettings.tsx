import { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, Switch, Button, 
  message, Spin, Popconfirm, Tooltip
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ThunderboltOutlined,
  GlobalOutlined,
  KeyOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  StarFilled,
} from '@ant-design/icons';
import axios from 'axios';

const API_BASE = '/api';

const PROVIDERS = [
  { label: 'OpenAI 官方/兼容', value: 'openai' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'Anthropic (Claude)', value: 'anthropic' },
  { label: 'Google Gemini', value: 'gemini' },
  { label: '自定义 (Custom)', value: 'custom' },
];

export default function ApiSettings() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/configs`);
      setConfigs(res.data);
    } catch (err: any) {
      message.error('获取配置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (config?: any) => {
    if (config) {
      setEditingId(config.id);
      form.setFieldsValue({
        ...config,
        // api_key usually not pre-filled if masked, user has to re-enter
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ 
        config_type: 'text', 
        provider: 'openai', 
        base_url: 'https://api.openai.com/v1',
        is_default: configs.length === 0,
        is_active: true
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await axios.put(`${API_BASE}/configs/${editingId}`, values);
        message.success('更新成功');
      } else {
        await axios.post(`${API_BASE}/configs`, values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchConfigs();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error('保存失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/configs/${id}`);
      message.success('删除成功');
      fetchConfigs();
    } catch (err: any) {
      message.error('删除失败');
    }
  };

  const handleTest = async (id: string) => {
    setTestLoading(id);
    try {
      const res = await axios.post(`${API_BASE}/configs/${id}/test`);
      if (res.data.success) {
        message.success('连接成功: ' + (res.data.response || '响应正常'));
      } else {
        message.error('连接失败: ' + res.data.message);
      }
    } catch (err: any) {
      message.error('测试出错');
    } finally {
      setTestLoading(null);
    }
  };

  const toggleActive = async (id: string, currentlyActive: boolean) => {
    try {
      // If turning ON, it becomes the new default
      // If turning OFF, it just turns off
      await axios.put(`${API_BASE}/configs/${id}`, { is_default: !currentlyActive });
      message.success(currentlyActive ? '配置已停用' : '配置已激活为核心端点');
      fetchConfigs();
    } catch (err: any) {
      message.error('操作失败');
    }
  };

  const handleTestManual = async () => {
    setTestLoading('manual');
    try {
      const values = await form.validateFields();
      const res = await axios.post(`${API_BASE}/configs/test`, values);
      if (res.data.success) {
        message.success('验证成功: ' + (res.data.response || '配置有效'));
      } else {
        message.error('验证失败: ' + res.data.message);
      }
    } catch (err: any) {
      if (err.errorFields) {
        message.warning('请先完善必要配置');
      } else {
        message.error('由于网络或配置错误，验证请求失败');
      }
    } finally {
      setTestLoading(null);
    }
  };

  const renderApiItem = (config: any) => {
    const isText = config.config_type === 'text';
    const accentColor = isText ? '#00e3fd' : '#ff7afb';
    const isShow = showKeys[config.id];
    const itemIsActive = config.is_active;

    return (
      <div key={config.id} className={`api-item-row ${!itemIsActive ? 'disabled-config' : ''}`}>
        <div className="api-item-left">
          <div className="api-icon-container" style={{ 
            background: `linear-gradient(135deg, ${accentColor}20, transparent)`,
            border: `1px solid ${accentColor}30`
          }}>
            <span className="material-symbols-outlined" style={{ color: accentColor }}>
              {isText ? (config.provider === 'anthropic' ? 'psychology_alt' : 'description') : 'palette'}
            </span>
          </div>
          <div className="api-name-box">
            <h3 className="api-title serif-text">
              {config.name}
              {itemIsActive && <span className="default-indicator" style={{ background: accentColor }} title="当前核心端点" />}
            </h3>
            <p className="api-provider">{config.provider.toUpperCase()} • {config.model}</p>
          </div>
        </div>

        <div className="api-item-middle">
          <div className="key-display-box">
            <code className="key-code">{isShow ? 'sk-••••••••••••••••' : config.api_key_masked}</code>
            <Button 
              type="text" 
              size="small" 
              className="key-action-btn"
              icon={isShow ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowKeys(prev => ({...prev, [config.id]: !prev[config.id]}))}
            />
          </div>
        </div>

        <div className="api-item-right">
          <div className="status-badge-container">
            <Tooltip title={itemIsActive ? "点击停用" : "点击设为核心启用"}>
              <Switch 
                size="small" 
                checked={itemIsActive} 
                onChange={() => toggleActive(config.id, itemIsActive)}
                className={itemIsActive ? 'switch-active' : ''}
              />
            </Tooltip>
          </div>
          
          <div className="api-actions">
            <Tooltip title="测试连接">
              <Button 
                type="text" 
                icon={<ThunderboltOutlined />} 
                loading={testLoading === config.id}
                onClick={() => handleTest(config.id)}
                className="action-btn-test"
              />
            </Tooltip>
            {itemIsActive && (
               <StarFilled className="default-star" style={{ color: accentColor }} />
            )}
            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(config)} className="action-btn-edit" />
            <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(config.id)}>
              <Button type="text" danger icon={<DeleteOutlined />} className="action-btn-delete" />
            </Popconfirm>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="api-page-wrapper">
      {/* 🌌 Grid Backdrop */}
      <div className="page-grid-overlay" />
      
      <div className="api-content-canvas">
        {/* Header */}
        <div className="canvas-header">
          <div className="header-lead">
            <h1 className="header-title serif-text">API 管理</h1>
            <p className="header-desc">在此配置您的生成模型访问密钥。所有密钥均经过严格加密存储。</p>
          </div>
          <button className="configure-new-btn" onClick={() => handleOpenModal()}>
            <span className="material-symbols-outlined">add_circle</span>
            <span>配置新模型</span>
          </button>
        </div>

        {/* Sections */}
        <div className="api-sections-stack">
          {/* Text Section */}
          <section className="api-section">
            <div className="section-header">
              <div className="section-bar" style={{ background: '#00e3fd' }} />
              <h2 className="section-title serif-text">文字生成 API</h2>
            </div>
            <div className="api-items-grid">
              {configs.filter((c: any) => c.config_type === 'text').map(renderApiItem)}
              {configs.filter((c: any) => c.config_type === 'text').length === 0 && !loading && (
                <div className="empty-placeholder">暂无文字生成核心配置</div>
              )}
            </div>
          </section>

          {/* Image Section */}
          <section className="api-section">
            <div className="section-header">
              <div className="section-bar" style={{ background: '#ff7afb' }} />
              <h2 className="section-title serif-text">封面生成 API</h2>
            </div>
            <div className="api-items-grid">
              {configs.filter((c: any) => c.config_type === 'image').map(renderApiItem)}
              {configs.filter((c: any) => c.config_type === 'image').length === 0 && !loading && (
                <div className="empty-placeholder">暂无视觉封面引擎配置</div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Security Banner */}
        <div className="security-banner">
          <div className="banner-visual">
             <img alt="Security chip" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiDjt01KtrT3tBQ5MnOUheHpK6G-lO-nmHNnA6cT0V-yOSwRaPEJsWVxMeOWuLyq5Kk-g-2BLgLbkMrN11AsbnEX-XfIhgVODdSEHpa9UR3c3InRht_EM2ciUzwr_FZlmYDyccL3ty8PegB7D0DlEbtXP1wLExNk_WhWKJFjdgvuGvDIrXIeKMZ9t1VMEF2whcsxT84ZYwc5nfu8rP8scyk0FKhXwPWBFK8LUH43uCj83kKBl9vr3njKS9vOohZbPDAkjQoDinoKJl" className="banner-img" />
          </div>
          <div className="banner-text-box">
            <h4 className="banner-title">正在保护 {configs.filter((c: any) => c.is_active).length} 个活跃端点</h4>
            <p className="banner-desc">您的 API 密钥存储在符合星际标准的高强度加密保险库中。切勿向他人透露您的密钥。查阅 <a href="#" className="banner-link">安全指南</a> 了解更多信息。</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="global-page-loading">
          <Spin size="large" />
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        title={
          <div className="modal-header-container">
            <div className="status-dot animate-pulse" style={{ background: editingId ? '#ff7afb' : '#00e3fd' }} />
            <span className="modal-header-title serif-text">
              {editingId ? '矩阵同步 - 编辑配置' : '能力唤醒 - 新增配置'}
            </span>
            <div className="meta-badge">
              <span className="meta-label">ID</span>
              <span className="meta-value">{editingId ? editingId.slice(0, 8) : 'NEW'}</span>
            </div>
          </div>
        }
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={680}
        centered
        okText="确认同步"
        cancelText="放弃"
        className="guided-modal-glass"
        closable={true}
        footer={null}
      >
        <Form 
          form={form} 
          layout="vertical" 
          className="modal-form-glass"
          onValuesChange={(changedValues) => {
            if (changedValues.provider) {
              const p = changedValues.provider;
              const isImage = form.getFieldValue('config_type') === 'image';
              
              const defaults: Record<string, { url: string, model: string }> = {
                openai: { url: 'https://api.openai.com/v1', model: isImage ? 'dall-e-3' : 'gpt-4o' },
                deepseek: { url: 'https://api.deepseek.com', model: 'deepseek-chat' },
                anthropic: { url: 'https://api.anthropic.com/v1', model: 'claude-3-5-sonnet-20240620' },
                gemini: { url: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-1.5-pro' },
              };
              
              if (defaults[p]) {
                form.setFieldsValue({
                  base_url: defaults[p].url,
                  model: defaults[p].model
                });
              }
            }
          }}
        >
          <div className="glass-form-body">
            <div className="form-row">
              <div className="form-col">
                <Form.Item name="config_type" label="核心能力类型" rules={[{ required: true }]}>
                  <Select variant="borderless" className="glass-select">
                    <Select.Option value="text">文字生成 (LLM)</Select.Option>
                    <Select.Option value="image">绘画生成 (AIGC)</Select.Option>
                  </Select>
                </Form.Item>
              </div>
              <div className="form-col">
                <Form.Item name="provider" label="架构适配器" rules={[{ required: true }]}>
                  <Select variant="borderless" className="glass-select" options={PROVIDERS} />
                </Form.Item>
              </div>
            </div>

            <Form.Item name="name" label="显示别名" rules={[{ required: true }]}>
              <Input variant="borderless" className="glass-input" placeholder="例如: 生产级 GPT-4" />
            </Form.Item>

            <Form.Item name="base_url" label="API ENDPOINT" rules={[{ required: true }]}>
              <Input variant="borderless" className="glass-input" placeholder="https://api.openai.com/v1" prefix={<GlobalOutlined className="icon-p" />} />
            </Form.Item>

            <Form.Item name="api_key" label="API ACCESS KEY">
              <Input.Password variant="borderless" className="glass-input" placeholder="输入令牌密钥" prefix={<KeyOutlined className="icon-p" />} />
            </Form.Item>

            <Form.Item name="model" label="模型名称" rules={[{ required: true }]}>
              <Input variant="borderless" className="glass-input" placeholder="例如: gpt-4o" prefix={<SettingOutlined className="icon-p" />} />
            </Form.Item>

            <div className="glass-toggle-row">
              <Form.Item name="is_default" label="启用此配置作为核心端点" valuePropName="checked" style={{ margin: 0 }}>
                <Switch size="small" />
              </Form.Item>
              <div className="toggle-info-text">开启后将作为主模型运行，并自动停用同类型其他项</div>
            </div>
          </div>

          <div className="glass-modal-footer">
            <Button 
              className="glass-btn-test" 
              onClick={handleTestManual}
              loading={testLoading === 'manual'}
              icon={<ThunderboltOutlined />}
            >
              验证连通性
            </Button>
            <div style={{ flex: 1 }} />
            <Button className="glass-btn-cancel" onClick={() => setModalVisible(false)}>
              放弃更改
            </Button>
            <Button className="glass-btn-save" onClick={handleSave}>
              确认矩阵同步
            </Button>
          </div>
        </Form>
      </Modal>

      <style>{`
        /* ✨ Global & Variable Overrides */
        .api-page-wrapper { min-height: 100vh; background: #0a0e14; position: relative; color: #f1f3fc; overflow-x: hidden; }
        .page-grid-overlay {
          position: fixed; inset: 0; pointer-events: none;
          background-image: 
            linear-gradient(rgba(0, 227, 253, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 227, 253, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 1;
        }

        .api-content-canvas { position: relative; z-index: 10; padding: 100px 48px 120px; max-width: 1200px; margin: 0 auto; }
        
        .serif-text { font-family: 'Newsreader', 'Serif', serif; }
        .header-title { font-size: 56px; font-weight: 700; margin-bottom: 8px; tracking-tight; }
        .header-desc { font-size: 16px; color: #a8abb3; max-width: 500px; margin-bottom: 48px; }

        .configure-new-btn {
          position: absolute; top: 110px; right: 48px;
          display: flex; align-items: center; gap: 8px;
          background: #ff7afb; color: #57005a; font-weight: 800;
          padding: 14px 28px; border-radius: 12px; border: none; cursor: pointer;
          box-shadow: 0 10px 30px rgba(255, 122, 251, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .configure-new-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 40px rgba(255, 122, 251, 0.3); }

        .api-sections-stack { display: flex; flex-direction: column; gap: 64px; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
        .section-bar { width: 6px; height: 24px; border-radius: 10px; }
        .section-title { font-size: 32px; font-weight: 700; margin: 0; }

        .api-items-grid { display: flex; flex-direction: column; gap: 16px; }
        .api-item-row {
          background: rgba(15, 20, 26, 0.5); backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px;
          padding: 24px 32px; display: flex; align-items: center; justify-content: space-between;
          transition: all 0.3s;
        }
        .api-item-row:hover { border-color: rgba(255, 255, 255, 0.1); background: rgba(25, 30, 38, 0.6); transform: translateX(4px); }
        .disabled-config { opacity: 0.5; filter: grayscale(0.8); }

        .api-item-left { display: flex; align-items: center; gap: 24px; min-width: 280px; }
        .api-icon-container { width: 56px; height: 56px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .api-title { font-size: 20px; font-weight: 700; color: #f1f3fc; margin: 0; display: flex; align-items: center; gap: 10px; }
        .default-indicator { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 10px currentColor; }
        .api-provider { font-size: 11px; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.1em; }

        .api-item-middle { flex: 1; max-width: 400px; padding: 0 32px; }
        .key-display-box {
          background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px; padding: 10px 16px; display: flex; align-items: center; gap: 12px;
        }
        .key-code { flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #64748b; overflow: hidden; text-overflow: ellipsis; }
        .key-action-btn { color: #445166 !important; padding: 0 !important; cursor: pointer; }

        .api-item-right { display: flex; align-items: center; gap: 48px; }
        .status-badge-container { display: flex; align-items: center; }
        .switch-active .ant-switch-inner { background: #00e3fd !important; }

        .api-actions { display: flex; align-items: center; gap: 12px; }
        .api-actions button { color: #445166; padding: 8px !important; }
        .api-actions button:hover { background: rgba(255,255,255,0.05) !important; color: #f1f3fc; }
        .default-star { font-size: 18px; filter: drop-shadow(0 0 8px currentColor); }

        .security-banner {
          margin-top: 100px; padding: 48px; border-radius: 24px;
          border: 1px solid rgba(0, 227, 253, 0.1);
          background: linear-gradient(90deg, rgba(0, 227, 253, 0.05) 0%, transparent 100%);
          display: flex; align-items: center; gap: 48px;
        }
        .banner-visual { flex-shrink: 0; width: 120px; height: 120px; }
        .banner-img { width: 100%; height: 100%; object-fit: contain; opacity: 0.8; filter: hue-rotate(20deg); }
        .banner-title { font-size: 22px; font-weight: 700; color: #f1f3fc; margin-bottom: 8px; }
        .banner-desc { color: #64748b; font-size: 14px; margin: 0; line-height: 1.6; }

        /* 💎 AI Dialog Inspired Modal Style */
        .guided-modal-glass .ant-modal-content {
          background: rgba(10, 14, 20, 0.85) !important;
          backdrop-filter: blur(40px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 64px 128px -24px rgba(0, 0, 0, 0.9) !important;
        }

        .modal-header-container {
          padding: 24px 32px;
          display: flex; align-items: center; gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 12px currentColor; }
        .modal-header-title { color: #f1f3fc; font-size: 24px; font-weight: 700; flex: 1; }
        .meta-badge {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px; padding: 4px 12px; display: flex; align-items: center; gap: 8px;
        }
        .meta-label { font-size: 9px; font-weight: 800; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; }
        .meta-value { font-family: monospace; font-size: 12px; color: #00e3fd; }

        .glass-form-body { padding: 32px 40px; }
        .modal-form-glass label {
          color: rgba(255, 255, 255, 0.4) !important;
          font-size: 11px !important; font-weight: 800 !important;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px !important;
        }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .glass-input, .glass-select .ant-select-selector {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          border-radius: 16px !important;
          min-height: 56px !important; padding: 0 20px !important;
          color: #f1f3fc !important; font-size: 15px !important;
          transition: all 0.3s !important;
        }
        .glass-input:hover, .glass-input:focus {
           background: rgba(255, 255, 255, 0.06) !important;
           border-color: rgba(0, 227, 253, 0.4) !important;
           box-shadow: 0 0 20px -5px rgba(0, 227, 253, 0.2) !important;
        }
        .icon-p { color: #00e3fd; margin-right: 12px; font-size: 18px; }

        .glass-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 16px; background: rgba(0, 0, 0, 0.2); padding: 16px 24px; border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .toggle-info-text { font-size: 12px; color: rgba(255, 255, 255, 0.3); font-style: italic; }

        .glass-modal-footer {
          padding: 24px 40px;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex; align-items: center; justify-content: flex-end; gap: 16px;
        }
        .glass-btn-test {
           background: rgba(0, 227, 253, 0.05) !important; color: #00e3fd !important;
           border: 1px solid rgba(0, 227, 253, 0.2) !important;
           height: 52px !important; border-radius: 16px !important; padding: 0 24px !important;
           font-weight: 700 !important; transition: all 0.3s !important;
        }
        .glass-btn-test:hover { background: rgba(0, 227, 253, 0.1) !important; border-color: #00e3fd !important; box-shadow: 0 0 15px rgba(0, 227, 253, 0.3); }

        .glass-btn-cancel {
          background: transparent !important; color: rgba(255, 255, 255, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          height: 52px !important; border-radius: 16px !important; padding: 0 32px !important;
        }
        .glass-btn-save {
          background: #ff7afb !important; color: #57005a !important;
          font-weight: 800 !important; border: none !important;
          height: 52px !important; border-radius: 16px !important; padding: 0 40px !important;
          font-size: 16px !important; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 16px 32px -8px rgba(255, 122, 251, 0.4) !important;
          transition: all 0.3s !important;
        }
        .glass-btn-save:hover { transform: translateY(-2px); box-shadow: 0 20px 48px -8px rgba(255, 122, 251, 0.6) !important; }

        .empty-placeholder { padding: 48px; border: 1px dashed rgba(255,255,255,0.05); border-radius: 16px; text-align: center; color: #445166; font-style: italic; }
        .global-page-loading { position: fixed; inset: 0; background: #0a0e14; display: flex; align-items: center; justify-content: center; z-index: 1000; }

        @keyframes pulse-green { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.3); } }
      `}</style>

      {/* Font imports via style tag or link in App.tsx is preferred, but for now: */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@300,0&display=swap" rel="stylesheet" />
    </div>
  );
}
