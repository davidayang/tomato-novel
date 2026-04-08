import httpx
import json
import asyncio
import sys

# 强制 UTF-8 编码输出
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# 恢复至原始的已验证配置 (DeepSeek)
API_KEY = "sk-UkS0lWdwT5w2nNJPE8R1fVx70jIIXxC9JW4Kd3iL2xQvcOO7"
BASE_URL = "https://api.axa.us.ci/v1"
MODEL = "deepseek-v3.1-terminus"

async def test_deepseek():
    print(f"--- 🧪 恢复测试 DeepSeek 连通性 ---")
    print(f"节点: {BASE_URL}")
    print(f"模型: {MODEL}")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": "你好，请确认你的模型版本并回复'连接成功'。"}
        ],
        "temperature": 0.7,
        "max_tokens": 100
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            print("⏳ 正在请求中...")
            response = await client.post(f"{BASE_URL}/chat/completions", headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                print(f"\n✅ [恢复成功] AI 回复: \n{content}")
                return True
            else:
                print(f"\n❌ [仍然失败] 状态码 {response.status_code}")
                print(f"详情: {response.text}")
                return False
                
    except Exception as e:
        print(f"\n❌ [异常] 请求错误: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_deepseek())
