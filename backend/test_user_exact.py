import httpx
import asyncio

async def run():
    k = 'sk-UkS0lWdwT5w2nNJPE8R1fVx70jIIXxC9JW4Kd3iL2xQvcOO7'
    u = 'https://api.axa.us.ci/v1/chat/completions'
    h = {'Authorization': f'Bearer {k}'}
    
    async with httpx.AsyncClient() as c:
        r = await c.post(u, headers=h, json={
            'model': 'longcat-flash-chat',
            'messages': [{
                'role': 'user',
                'content': "请帮我根据'一个在外人看来是擦边主播的女孩，背地里其实是在资助偏远山区的希望小学'这个创意写一段小说场景。"
            }]
        })
        print('Status:', r.status_code)
        print('Response:', r.text[:300])

asyncio.run(run())
