import httpx
import json
import asyncio
import os
import sys

# 强制 UTF-8 编码输出
sys.stdout.reconfigure(encoding='utf-8')

# 配置信息
API_KEY = "sk-sp-24b23e3cab68405693d71422092fde87"
BASE_URL = "https://coding.dashscope.aliyuncs.com/v1"
MODEL = "qwen3.5-plus"

async def test_direct_api():
    print(f"--- [1] 开始测试 DashScope 接口连通性 ---")
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": MODEL,
        "messages": [{"role": "user", "content": "你好，请回复'连接成功'"}],
        "temperature": 0.7
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(f"{BASE_URL}/chat/completions", headers=headers, json=data)
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                print(f"✅ 接口调用成功! AI 回复: {content}")
                return True
            else:
                print(f"❌ 接口报错 (状态码 {response.status_code}): {response.text}")
                return False
    except Exception as e:
        print(f"❌ 网络请求异常: {str(e)}")
        return False

async def test_backend_integration():
    print(f"\n--- [2] 开始测试后端服务集成 (8000端口) ---")
    # 模拟向导第一步：创意分析
    BACKEND_URL = "http://127.0.0.1:8000"
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # 1. 先创建一个项目
            p_resp = await client.post(f"{BACKEND_URL}/api/projects/", json={
                "title": "API测试项目",
                "description": "用于验证API连通性",
                "target_words": 10000
            })
            if p_resp.status_code != 200:
                print(f"❌ 创建项目失败: {p_resp.text}")
                return
            
            project_id = p_resp.json()['id']
            print(f"项目创建成功 (ID: {project_id})")
            
            # 2. 调用向导分析接口
            print("正在调用 AI 分析接口 (使用 RTCO 提示词)...")
            wiz_resp = await client.post(
                f"{BACKEND_URL}/api/wizard/analyze-type/{project_id}",
                params={"idea": "一个会说话的猫拯救世界"}
            )
            
            if wiz_resp.status_code == 200:
                print("✅ 后端集成测试成功!")
                print("AI 分析结果:", json.dumps(wiz_resp.json(), indent=2, ensure_ascii=False))
            else:
                print(f"❌ 后端分析报错 (状态码 {wiz_resp.status_code}): {wiz_resp.text}")
                
    except Exception as e:
        print(f"❌ 后端连接异常 (请确保 8000 端口已启动): {str(e)}")

async def main():
    success = await test_direct_api()
    if success:
        await test_backend_integration()

if __name__ == "__main__":
    asyncio.run(main())
