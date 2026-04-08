import { useState, useEffect } from 'react';
import { Modal, Tag, Typography, message, Dropdown, Button } from 'antd';
import { 
  DeleteOutlined, 
  MoreOutlined, 
  UndoOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { projectsApi } from '../api';

const { Paragraph } = Typography;

export default function RecycleBin() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsApi.list({ status: 'deleted' });
      setProjects(res.data);
    } catch (e) {
      message.error('无法读取回收站内容');
    } finally {
    }
  };

  const handleRestore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await projectsApi.update(id, { status: 'draft' });
      message.success('篇章已从虚无中归位');
      loadProjects();
    } catch (err) {
      message.error('由于宇宙惯性，归位失败');
    }
  };

  const handlePurge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '彻底销毁？',
      icon: <ExclamationCircleOutlined style={{ color: '#ff6e84' }} />,
      content: '这一操作将使该篇章永久消失在虚空深渊，无法通过任何时间轴找回。',
      okText: '确认销毁',
      okType: 'danger',
      cancelText: '保留',
      onOk: async () => {
        try {
          await projectsApi.delete(id);
          message.success('已彻底销毁');
          loadProjects();
        } catch (err) {
          message.error('销毁失败');
        }
      },
      className: 'glass-modal'
    });
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1400, margin: '0 auto', position: 'relative' }}>
      
      {/* 🌌 Atmospheric Backdrop */}
      <div style={{ position: 'absolute', top: '10%', right: '5%', width: '30vw', height: '30vw', background: 'rgba(255,110,132,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <header style={{ marginBottom: 48 }}>
           <h2 className="serif-text" style={{ fontSize: 36, fontWeight: 700, color: '#f1f3fc', marginBottom: 8, letterSpacing: '-0.02em' }}>回收站</h2>
           <p style={{ color: '#a8abb3', maxWidth: 600, fontWeight: 300, fontSize: 15 }}>被遗忘的篇章在此漂浮。您可以将其归位至现实，或令其彻底销毁。</p>
        </header>

        {projects.length === 0 ? (
          <div style={{ padding: '100px 0', textAlign: 'center', opacity: 0.4 }}>
             <span className="material-symbols-outlined" style={{ fontSize: 64, marginBottom: 16 }}>delete_sweep</span>
             <p className="serif-text" style={{ fontSize: 18, fontStyle: 'italic' }}>回收站空空如也，连回响都没有</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 28 }}>
            {projects.map((p) => (
              <div 
                key={p.id}
                className="story-card"
                style={{ 
                    background: 'rgba(21, 26, 33, 0.4)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: 20, 
                    padding: 28, 
                    border: '1px solid rgba(255, 255, 255, 0.05)', 
                    position: 'relative',
                    overflow: 'hidden',
                    filter: 'grayscale(0.6) opacity(0.8)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                   <Tag style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#64748b', border: 'none', fontSize: 10, fontWeight: 900, borderRadius: 4, padding: '2px 10px', margin: 0 }}>已弃置</Tag>
                   <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'restore',
                            label: '归位 (恢复)',
                            icon: <UndoOutlined />,
                            onClick: (info) => handleRestore(p.id, info.domEvent as any)
                          },
                          { type: 'divider' },
                          {
                            key: 'purge',
                            danger: true,
                            label: '彻底销毁',
                            icon: <DeleteOutlined />,
                            onClick: (info) => handlePurge(p.id, info.domEvent as any)
                          }
                        ]
                      }}
                      trigger={['click']}
                   >
                      <div style={{ cursor: 'pointer', color: '#444' }}><MoreOutlined style={{ fontSize: 20 }} /></div>
                   </Dropdown>
                </div>
                <h3 className="serif-text" style={{ fontSize: 24, fontWeight: 700, color: '#f1f3fc', marginBottom: 14 }}>{p.title}</h3>
                <Paragraph style={{ color: '#a8abb3', fontSize: 14, lineHeight: 1.8, height: 50, overflow: 'hidden' }}>{p.idea}</Paragraph>
                
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                   <Button 
                    type="text" 
                    icon={<UndoOutlined />} 
                    onClick={(e) => handleRestore(p.id, e)}
                    style={{ color: 'var(--secondary)' }}
                   >归位</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .story-card { transition: all 0.3s; }
        .story-card:hover { transform: translateY(-4px); filter: grayscale(0) opacity(1); border-color: rgba(0, 227, 253, 0.2); }
      `}</style>
    </div>
  );
}
