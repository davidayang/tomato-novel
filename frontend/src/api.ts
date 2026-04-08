import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

// 项目管理
export const projectsApi = {
  list: (params?: { status?: string; search?: string }) => api.get('/projects', { params }),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// 向导
export const wizardApi = {
  step1: (id: string) => api.post(`/wizard/${id}/step1-type-analysis`),
  nucleus: (id: string, field?: string, direction?: string) => 
    api.get(`/wizard/${id}/nucleus`, { params: { field, direction } }),
  step2: (id: string) => api.post(`/wizard/${id}/step2-word-plan`),
  step3: (id: string) => api.post(`/wizard/${id}/step3-conflict-world`),
  step4: (id: string) => api.post(`/wizard/${id}/step4-directions`),
  selectDirection: (id: string, directionId: string) =>
    api.post(`/wizard/${id}/step4-select-direction?direction_id=${directionId}`),
  step5Outline: (id: string) => api.post(`/wizard/${id}/step5-outline`),
  step5Rhythm: (id: string) => api.post(`/wizard/${id}/step5-rhythm`),
  step6Intro: (id: string) => api.post(`/wizard/${id}/step6-intro`),
};

// 角色
export const charactersApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/characters`),
  update: (id: string, data: any) => api.put(`/characters/${id}`, data),
  delete: (id: string) => api.delete(`/characters/${id}`),
  generate: (projectId: string) => api.post(`/projects/${projectId}/characters/generate`),
};

// 节奏点
export const rhythmApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/rhythm-points`),
  generateSummary: (rpId: string) => api.post(`/rhythm-points/${rpId}/generate-summary`),
  expand: (rpId: string) => api.post(`/rhythm-points/${rpId}/expand`),
  polish: (rpId: string) => api.post(`/rhythm-points/${rpId}/polish`),
  rewrite: (rpId: string, instruction: string) =>
    api.post(`/rhythm-points/${rpId}/rewrite`, { instruction }),
  editContent: (rpId: string, stage: string, content: string) =>
    api.put(`/rhythm-points/${rpId}/content`, { stage, content }),
};

// API配置
export const configsApi = {
  list: (type?: string) => api.get('/configs', { params: { config_type: type } }),
  create: (data: any) => api.post('/configs', data),
  update: (id: string, data: any) => api.put(`/configs/${id}`, data),
  delete: (id: string) => api.delete(`/configs/${id}`),
  test: (id: string) => api.post(`/configs/${id}/test`),
};

// 提示词
export const promptsApi = {
  list: () => api.get('/prompts'),
  get: (key: string) => api.get(`/prompts/${key}`),
  update: (key: string, content: string) => api.put(`/prompts/${key}`, { content }),
  reset: (key: string) => api.post(`/prompts/${key}/reset`),
};

// 影响检测
export const impactApi = {
  check: (projectId: string, changeType: string, changeDetail: string) =>
    api.post(`/projects/${projectId}/impact-check`, {
      change_type: changeType,
      change_detail: changeDetail,
    }),
};

// 导出
export const exportApi = {
  txt: (projectId: string) =>
    api.get(`/projects/${projectId}/export/txt`, { responseType: 'blob' }),
};

export default api;
