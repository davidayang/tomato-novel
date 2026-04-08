import os
import re

FRONTEND_DIR = r"d:\360MoveData\Users\Administrator\Desktop\novelcreator\tomato-novel\frontend\src\pages"

# 1. Update ProjectWizard.tsx
wizard_path = os.path.join(FRONTEND_DIR, "ProjectWizard.tsx")
with open(wizard_path, "r", encoding="utf-8") as f:
    wizard_content = f.read()

# Add Input to imports
wizard_content = wizard_content.replace(
    "import { Steps, Card, Button, Spin, message, Tag, Radio, Space, Descriptions } from 'antd';",
    "import { Steps, Card, Button, Spin, message, Tag, Radio, Space, Descriptions, Input, Form } from 'antd';"
)

# Replace loadProject logic to populate stepData
load_project_old = """  const loadProject = async () => {
    if (!id) return;
    const res = await projectsApi.get(id);
    setProject(res.data);
    setCurrent(res.data.wizard_step || 0);
  };"""

load_project_new = """  const loadProject = async () => {
    if (!id) return;
    const res = await projectsApi.get(id);
    const p = res.data;
    setProject(p);
    setCurrent(p.wizard_step || 0);
    
    // 初始化已有数据展示
    const initialData: any = {};
    if (p.genre || p.audience) {
      initialData[0] = { genre: p.genre, audience: p.audience, tone: p.tone, brief_analysis: p.theme };
    }
    if (p.core_conflict) {
      initialData[2] = { core_conflict: p.core_conflict, characters: [] };
    }
    if (p.story_direction_options) {
      try { initialData[3] = JSON.parse(p.story_direction_options); } catch(e){}
    }
    if (p.outline) {
      try { initialData[4] = JSON.parse(p.outline); } catch(e){}
    }
    if (p.intro_text) {
      initialData[5] = { intro_text: p.intro_text };
    }
    setStepData((prev: any) => ({ ...prev, ...initialData }));
  };

  const handleUpdateProject = async (updates: any) => {
    if (!id) return;
    try {
      await projectsApi.update(id, updates);
      message.success('更新成功');
      loadProject();
    } catch(e) {
      message.error('更新失败');
    }
  };
"""
wizard_content = wizard_content.replace(load_project_old, load_project_new)

# Improve renderStep to include editable fields and feedback
wizard_render_old = """      case 0:
        return (
          <Card title="Step 1: 类型分析">
            <p>创意：{project?.idea}</p>
            <Button type="primary" onClick={() => runStep(0)}>开始分析</Button>"""

wizard_render_new = """      case 0:
        return (
          <Card title="Step 1: 类型分析">
            <div style={{marginBottom: 16}}>
              <b>补充或修改创意：</b>
              <Input.TextArea 
                value={project?.idea} 
                onChange={(e) => setProject({...project, idea: e.target.value})}
                rows={3} 
              />
              <Button style={{marginTop: 8}} onClick={() => handleUpdateProject({idea: project?.idea})}>保存创意设定</Button>
            </div>
            <Button type="primary" onClick={() => runStep(0)}>开始 AI 分析</Button>"""
wizard_content = wizard_content.replace(wizard_render_old, wizard_render_new)

with open(wizard_path, "w", encoding="utf-8") as f:
    f.write(wizard_content)


# 2. Update ProjectEditor.tsx to use a Modal setting instead of separate page
editor_path = os.path.join(FRONTEND_DIR, "ProjectEditor.tsx")
with open(editor_path, "r", encoding="utf-8") as f:
    editor_content = f.read()

editor_imports_old = "import { Button, Tag, Input, message, Spin } from 'antd';"
editor_imports_new = "import { Button, Tag, Input, message, Spin, Modal, Form, Select } from 'antd';"
editor_content = editor_content.replace(editor_imports_old, editor_imports_new)

# Add Modal states
editor_old_state = "const [actionLoading, setActionLoading] = useState('');"
editor_new_state = """const [actionLoading, setActionLoading] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsForm] = Form.useForm();"""
editor_content = editor_content.replace(editor_old_state, editor_new_state)

# Replace navigate to settings with Modal open
editor_old_toolbar = "<Button size=\"small\" onClick={() => navigate(`/editor/${id}/settings`)}>设置</Button>"
editor_new_toolbar = """<Button size="small" onClick={() => {
            settingsForm.setFieldsValue(project);
            setSettingsModalVisible(true);
          }}>项目设置</Button>"""
editor_content = editor_content.replace(editor_old_toolbar, editor_new_toolbar)

# Add handleSaveSettings function
editor_old_export = "  const handleExport = async () => {"
editor_new_export = """  const handleSaveSettings = async () => {
    try {
      const values = await settingsForm.validateFields();
      await projectsApi.update(id!, values);
      message.success('设置保存成功');
      setSettingsModalVisible(false);
      loadAll();
    } catch(e) {
      // validate failed or net error
    }
  };

  const handleExport = async () => {"""
editor_content = editor_content.replace(editor_old_export, editor_new_export)

# Add Modal JSX
editor_old_return_end = "    </div>\n  );\n}\n"
editor_new_return_end = """      {/* 设置 Modal */}
      <Modal 
        title="项目基本设置" 
        open={settingsModalVisible} 
        onOk={handleSaveSettings} 
        onCancel={() => setSettingsModalVisible(false)}
      >
        <Form form={settingsForm} layout="vertical">
          <Form.Item name="title" label="书名">
            <Input />
          </Form.Item>
          <Form.Item name="target_words" label="目标字数">
            <Select options={[
              { value: 10000, label: '1万字' }, { value: 20000, label: '2万字' },
              { value: 30000, label: '3万字' }, { value: 50000, label: '5万字' }, { value: 60000, label: '6万字' },
            ]} />
          </Form.Item>
          <Form.Item name="idea" label="核心创意">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
"""
editor_content = editor_content.replace(editor_old_return_end, editor_new_return_end)

with open(editor_path, "w", encoding="utf-8") as f:
    f.write(editor_content)

print("Updated ProjectWizard.tsx and ProjectEditor.tsx successfully.")
