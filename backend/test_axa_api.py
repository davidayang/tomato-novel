import httpx
import asyncio

async def run():
    k = 'sk-UkS0lWdwT5w2nNJPE8R1fVx70jIIXxC9JW4Kd3iL2xQvcOO7'
    u = 'https://api.axa.us.ci/v1/chat/completions'
    h = {'Authorization': f'Bearer {k}'}
    
    async with httpx.AsyncClient() as c:
        r_short = await c.post(u, headers=h, json={
            'model': 'longcat-flash-chat',
            'messages': [{'role': 'user', 'content': 'hi'}]
        })
        print(f'短语测试 (hi): {r_short.status_code}')
        
        r_long = await c.post(u, headers=h, json={
            'model': 'longcat-flash-chat',
            'messages': [{'role': 'user', 'content': '请帮我写一段关于捡到神秘系统的养老生活开头'}]
        })
        print(f'长篇内容测试 (养老生活开头): {r_long.status_code}')
        
        if r_long.status_code == 200:
            print('Response:', r_long.json())

asyncio.run(run())
