import httpx
import json
import asyncio
import sys

# 强制 UTF-8 编码输出
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# 用户提供的配置信息
API_KEY = "sk-76254405859cc33f8203f5772f1d360450f417a2c0663c41c8b0ba1791311e37"
BASE_URL = "https://free.9e.nz/v1"
MODEL = "gpt-5.2"

async def test_gpt_5_4():
    print(f"--- 🧪 开始测试 GPT-5.4 (OpenAI 协议) 连通性 ---")
    print(f"节点: {BASE_URL}")
    print(f"模型: {MODEL}")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 模拟一个简单的叙事推演请求，开启高推理力度
    data = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "你是一个顶级叙事推演 AI。"},
            {"role": "user", "content": "请用一句话告诉我，当 GPT-5.4 的逻辑原子在叙事宇宙中坍缩时，会发生什么？"}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            print("⏳ 正在等待 AI 的逻辑坍缩 (请求发送中)...")
            response = await client.post(f"{BASE_URL}/chat/completions", headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                print("\n✅ [测试成功] 模型响应正常!")
                print("-" * 50)
                print(f"🤖 AI 回复: \n{content}")
                print("-" * 50)
                
                # 检查输出性能
                usage = result.get('usage', {})
                print(f"📊 Token 消耗: Prompt({usage.get('prompt_tokens', 0)}) / Completion({usage.get('completion_tokens', 0)})")
                return True
            else:
                print(f"\n❌ [测试失败] 接口报错 (状态码 {response.status_code})")
                print(f"错误详情: {response.text}")
                return False
                
    except Exception as e:
        print(f"\n❌ [异常] 网络请求发生错误: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_gpt_5_4())
