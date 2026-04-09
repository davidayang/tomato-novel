import { useState, useEffect } from 'react';
import { FloatButton, Drawer, Typography, Tag, Space, Button, Empty, Collapse, message } from 'antd';
import { 
  BugOutlined, 
  ClearOutlined, 
  SyncOutlined, 
  UserOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

// 步骤 Key 到中文标题的映射
const STEP_TITLES: any = {
  "type_analysis": "核心类型深度分析",
  "intro_generation": "爆款作品导语生成",
  "word_plan": "字数与节奏演化规划",
  "conflict_and_world": "核心冲突与世界观构建",
  "character_suggestion": "高吸引力人设库推演",
  "story_directions": "多维叙事走向分叉",
  "outline_generation": "全篇剧情逻辑大纲",
  "rhythm_design": "章节创作节奏模版",
  "beat_summary": "场景梗概自动化细化",
  "beat_expand": "剧情内容高沉浸扩写",
  "beat_polish": "语体风格深度去AI化",
  "beat_rewrite": "局部场景定向重构",
  "impact_analysis": "剧情修改一致性检测",
  "书名": "作品书名创意推演",
  "简介": "爆款简介深度雕琢",
  "类型": "市场化类型标签定位",
  "主题": "叙事灵魂与主题探讨",
  "叙事视角": "最佳叙事角度分析",
  "PromptSettings": "提示词实验室配置",
  "Wizard": "创作向导互动",
  "ProjectList": "作品中枢管理",
  "General": "通用神经元调用",
  "Stream": "流式文本生成中"
};

/**
 * 全局手动记录日志的方法 (供外部调用)
 */
export const logUserAction = async (step: string, action: string, detail: string = "") => {
  try {
    await fetch('/api/debug/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step, action, detail })
    });
  } catch (e) {
    console.warn("Log failed", e);
  }
};

export default function DebugConsole() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/debug/logs');
      const data = await resp.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/debug/clear', { method: 'POST' });
      setLogs([]);
      message.success("历史痕迹已抹除");
    } catch (err) {
      message.error("清空失败");
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const renderLogItem = (item: any) => {
    const isLLM = item.type === 'llm_call';
    const friendlyTitle = STEP_TITLES[item.step] || (isLLM ? "AI 处理步骤" : "用户操作行为");

    return (
      <div key={item.id} className={`log-item-v2 ${item.type}`}>
        <div className="log-main">
          <div className="log-icon">
            {isLLM ? <RobotOutlined /> : <UserOutlined />}
          </div>
          <div className="log-body">
            <div className="log-top-row">
              <Text className="log-title">{friendlyTitle}</Text>
              <div style={{ flex: 1 }} />
              <Text className="log-time">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
            </div>
            
            <div className="log-content-summary">
              {isLLM ? (
                <Space size={4}>
                  <Tag color="cyan" style={{ border: 'none', background: 'rgba(0,227,253,0.1)' }}>{item.model}</Tag>
                  <Tag color="green" style={{ border: 'none', background: 'rgba(82,196,26,0.1)' }}>{item.latency}ms</Tag>
                  <Text className="summary-text">完成神经网络调用</Text>
                </Space>
              ) : (
                <Space size={4}>
                  <Text className="action-text">{item.action}</Text>
                  {item.detail && <Text className="detail-text">({item.detail})</Text>}
                </Space>
              )}
            </div>

            {isLLM && (
               <Collapse ghost size="small" className="log-collapse">
                  <Panel header={<span style={{ fontSize: 11, color: '#31c0cf' }}><ThunderboltOutlined /> 洞察 LLM 思维链 Payload</span>} key="1">
                     <div className="code-view">
                        <Text strong style={{ color: '#00e3fd', fontSize: 10 }}>[REQUEST PROMPT]</Text>
                        <Paragraph className="code-snippet">{item.prompt}</Paragraph>
                        <Text strong style={{ color: '#ff7afb', fontSize: 10 }}>[AI RESPONSE]</Text>
                        <Paragraph className="code-snippet response">{item.response}</Paragraph>
                     </div>
                  </Panel>
               </Collapse>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <FloatButton
        icon={<BugOutlined />}
        type="primary"
        className="debug-fab"
        onClick={() => setOpen(true)}
        tooltip={<div>打开创作流水线调试</div>}
      />

      <Drawer
        title={
          <div className="drawer-header-content">
            <div className="header-title">
               <InfoCircleOutlined style={{ color: '#ff7afb' }} />
               <span>创作流水线全局观测台</span>
            </div>
            <Space>
              <Button size="small" type="text" className="h-btn" icon={<SyncOutlined spin={loading} />} onClick={fetchLogs}>同步</Button>
              <Button size="small" type="text" className="h-btn danger" icon={<ClearOutlined />} onClick={clearLogs}>抹除</Button>
            </Space>
          </div>
        }
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={540}
        styles={{ 
            body: { background: '#0a0e14', padding: '12px 0' },
            header: { background: '#13181e', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px' } 
        }}
      >
        {logs.length === 0 ? (
          <Empty description={<span style={{ color: '#445166' }}>暂无神经脉冲日志</span>} style={{ marginTop: 100 }} />
        ) : (
          <div className="log-list-v2">
             {logs.map(renderLogItem)}
          </div>
        )}

        <style>{`
          .debug-fab { right: 24px; bottom: 84px; width: 48px; height: 48px; background: #ff7afb !important; border: none; box-shadow: 0 0 20px rgba(255,122,251,0.4) !important; transition: 0.3s; }
          .debug-fab:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(255,122,251,0.6) !important; }

          .drawer-header-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
          .header-title { display: flex; alignItems: center; gap: 10px; color: #f1f3fc; font-weight: 700; font-size: 16px; letter-spacing: 0.05em; }
          .h-btn { color: #64748b !important; }
          .h-btn:hover { color: #fff !important; background: rgba(255,255,255,0.05) !important; }
          .h-btn.danger:hover { color: #ff4d4f !important; }

          .log-item-v2 { padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.03); transition: 0.2s; }
          .log-item-v2:hover { background: rgba(255,255,255,0.02); }
          .log-main { display: flex; gap: 16px; }
          .log-icon { 
             width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
             font-size: 16px; flex-shrink: 0;
          }
          .llm_call .log-icon { background: rgba(0,227,253,0.1); color: #00e3fd; }
          .user_action .log-icon { background: rgba(255,122,251,0.1); color: #ff7afb; }

          .log-body { flex: 1; min-width: 0; }
          .log-top-row { display: flex; align-items: center; margin-bottom: 4px; }
          .log-title { color: #f1f3fc; font-weight: 600; font-size: 13px; }
          .log-time { color: #445166; font-size: 11px; font-family: monospace; }
          
          .log-content-summary { margin-bottom: 4px; }
          .summary-text { font-size: 12px; color: #64748b; }
          .action-text { font-size: 12px; color: #ff7afb; font-weight: 700; }
          .detail-text { font-size: 11px; color: #64748b; margin-left: 4px; }

          .log-collapse .ant-collapse-header { padding: 0 !important; }
          .code-view { 
             margin-top: 12px; background: #000; padding: 12px; border-radius: 8px; 
             border: 1px solid rgba(255,255,255,0.05); max-height: 400px; overflow-y: auto;
          }
          .code-snippet { 
             color: #94a3b8; font-size: 11px; font-family: 'JetBrains Mono', monospace; 
             margin: 6px 0 16px; white-space: pre-wrap; word-break: break-all;
             background: rgba(255,122,251,0.02); padding: 8px; border-radius: 4px;
          }
          .code-snippet.response { color: #e2e8f0; background: rgba(0,227,253,0.02); }
        `}</style>
      </Drawer>
    </>
  );
}
