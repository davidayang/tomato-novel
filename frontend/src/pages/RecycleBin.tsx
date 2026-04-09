import { useState, useEffect } from 'react';
import { Modal, Tag, Typography, message, Button } from 'antd';
import { 
  DeleteOutlined, 
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
      message.error('由于信标干扰，无法读取回收站内容');
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
    <div style={{ padding: '40px 48px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
      
      {/* 🌌 Atmospheric Backdrop */}
      <div style={{ position: 'absolute', top: '-5%', right: '5%', width: '30vw', height: '30vw', background: 'rgba(255,122,251,0.04)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* 🚀 Header Section: Tighter Thursday Standard */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
             <h1 className="serif-text" style={{ fontSize: 40, fontWeight: 800, color: '#f1f3fc', margin: 0, letterSpacing: '-0.01em' }}>回收站</h1>
             
             {/* The Cyber Dog Anchor - Sitting tight next to title */}
             <div className="dog-anchor" style={{ flexShrink: 0 }}>
               <div className="dog-hologram">
                 <img src="/assets/images/cyber_dog.png" alt="SCRAPS-01" className="cyber-dog-img" />
                 <div className="dog-label">SCRAPS-01</div>
               </div>
             </div>
          </div>
          
          <p style={{ color: '#64748b', maxWidth: 800, fontSize: 16, lineHeight: 1.8, fontWeight: 300, letterSpacing: '0.02em', margin: 0 }}>
             在这里，被遗忘的故事碎片可以重新亮起，或者彻底归于虚无。每颗尘埃都曾是闪亮的群星。
          </p>
        </div>

        {projects.length === 0 ? (
          <div style={{ padding: '120px 0', textAlign: 'center', opacity: 0.3 }}>
             <div style={{ fontSize: 48, marginBottom: 16, fontWeight: 100 }}>∅</div>
             <p className="serif-text" style={{ fontSize: 18, fontStyle: 'italic' }}>回收站空空如也，连回响都没有</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {projects.map((p) => (
              <div 
                key={p.id}
                className="purge-card"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32 }}>
                   <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                         <h3 className="serif-text" style={{ fontSize: 26, fontWeight: 700, color: '#f1f3fc', margin: 0 }}>{p.title}</h3>
                         <Tag style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#64748b', border: 'none', fontSize: 10, fontWeight: 800, borderRadius: 4 }}>GPT-4 Turbo</Tag>
                      </div>
                      <Paragraph style={{ color: '#a8abb3', fontSize: 14, lineHeight: 1.8, margin: 0, maxWidth: 900, opacity: 0.8 }}>
                        {p.idea || '这是一段被遗弃的思想残片，正在等待最终的审判。'}
                      </Paragraph>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff6e84', fontSize: 11, marginTop: 20, fontWeight: 700, letterSpacing: '0.05em' }}>
                         <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restart_alt</span>
                         <span>坍缩于 3天前</span>
                      </div>
                   </div>

                   <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                      <Button 
                        className="btn-restore"
                        icon={<UndoOutlined />} 
                        onClick={(e) => handleRestore(p.id, e)}
                      >还原</Button>
                      <Button 
                        className="btn-purge"
                        icon={<DeleteOutlined />} 
                        onClick={(e) => handlePurge(p.id, e)}
                      >永久抹除</Button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .purge-card {
           background: rgba(21, 26, 33, 0.4);
           backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.04);
           border-radius: 20px;
           padding: 32px;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .purge-card:hover {
           background: rgba(21, 26, 33, 0.6);
           border-color: rgba(0, 227, 253, 0.15);
           transform: translateX(4px);
        }

        .dog-hologram {
          position: relative; width: 140px; height: 140px;
          background: rgba(10, 14, 20, 0.8); border-radius: 16px;
          overflow: hidden; border: 1px solid rgba(255,255,255,0.04);
        }
        .cyber-dog-img {
          width: 100%; height: 100%; object-fit: contain;
          object-position: center bottom;
          opacity: 0.85; mix-blend-mode: plus-lighter;
          animation: dogFloat 5s ease-in-out infinite;
          filter: brightness(1.1) drop-shadow(0 0 10px rgba(0,227,253,0.15));
        }
        .dog-label {
          position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
          background: #ff7afb; color: #57005a; font-size: 9px; font-weight: 900;
          padding: 2px 10px; border-radius: 4px; letter-spacing: 0.1em;
        }

        .btn-restore {
          background: transparent !important; border: 1px solid rgba(0, 227, 253, 0.2) !important;
          color: #00e3fd !important; height: 40px !important; padding: 0 20px !important;
          border-radius: 10px !important; transition: all 0.2s !important;
          font-weight: 600 !important; font-size: 13px !important;
        }
        .btn-restore:hover {
          background: rgba(0, 227, 253, 0.1) !important; border-color: #00e3fd !important;
        }

        .btn-purge {
          background: transparent !important; border: 1px solid rgba(255, 110, 132, 0.2) !important;
          color: #ff6e84 !important; height: 40px !important; padding: 0 20px !important;
          border-radius: 10px !important; transition: all 0.2s !important;
          font-weight: 600 !important; font-size: 13px !important;
        }
        .btn-purge:hover {
          background: rgba(255, 110, 132, 0.1) !important; border-color: #ff6e84 !important;
        }

        @keyframes dogFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <style>{`
        .purge-card {
           background: rgba(21, 26, 33, 0.4);
           backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.05);
           border-radius: 24px;
           padding: 32px;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .purge-card:hover {
           background: rgba(21, 26, 33, 0.6);
           border-color: rgba(0, 227, 253, 0.2);
           transform: translateX(4px);
        }

        .dog-hologram {
          position: relative; width: 180px; height: 180px;
          background: rgba(0,0,0,0.3); border-radius: 20px;
          overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
        }
        .cyber-dog-img {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.8; mix-blend-mode: plus-lighter;
          animation: dogFloat 4s ease-in-out infinite;
        }
        .dog-label {
          position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
          background: #ff7afb; color: #000; font-size: 10px; font-weight: 900;
          padding: 2px 8px; border-radius: 4px; letter-spacing: 0.1em;
        }

        .btn-restore {
          background: transparent !important; border: 1.5px solid rgba(0, 227, 253, 0.2) !important;
          color: #00e3fd !important; height: 44px !important; padding: 0 24px !important;
          border-radius: 12px !important; transition: all 0.2s !important;
        }
        .btn-restore:hover {
          background: rgba(0, 227, 253, 0.1) !important; border-color: #00e3fd !important;
          box-shadow: 0 0 15px rgba(0, 227, 253, 0.2);
        }

        .btn-purge {
          background: transparent !important; border: 1.5px solid rgba(255, 110, 132, 0.2) !important;
          color: #ff6e84 !important; height: 44px !important; padding: 0 24px !important;
          border-radius: 12px !important; transition: all 0.2s !important;
        }
        .btn-purge:hover {
          background: rgba(255, 110, 132, 0.1) !important; border-color: #ff6e84 !important;
          box-shadow: 0 0 15px rgba(255, 110, 132, 0.2);
        }

        @keyframes dogFloat {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
