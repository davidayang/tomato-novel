import httpx

key = 'sk-UkS0lWdwT5w2nNJPE8R1fVx70jIIXxC9JW4Kd3iL2xQvcOO7'
url = 'https://api.axa.us.ci/v1/chat/completions'

# 有实际意义的长内容
long_content = '请帮我写一个小说开头：一个在外人看来是擦边主播的女孩，背地里其实是在资助偏远山区的希望小学，并用赚来的钱为家乡修路。请描写她在直播间跳舞的场景，以及她下播后去邮局汇款的对比画面。'

models = [
    'deepseek-v3.2',
    'deepseek-v3.1-terminus', 
    'qwen3-30b-a3b',
    'qwen3-32b',
    'longcat-flash-chat'
]

print('=== 用长内容测试所有模型 ===')
print(f'内容长度：{len(long_content)}字\n')

for m in models:
    try:
        r = httpx.post(
            url, 
            headers={'Authorization': f'Bearer {key}'}, 
            json={
                'model': m, 
                'messages': [
                    {'role': 'system', 'content': '你是一个小说创作助手'},
                    {'role': 'user', 'content': long_content}
                ]
            }, 
            timeout=30.0
        )
        status = r.status_code
        if status == 200:
            data = r.json()
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
            print(f'[OK] {m}: {status} - 成功！回复长度：{len(content)}')
            print(f'    内容预览：{content[:80]}...')
        else:
            err = r.json().get('error', {}).get('message', r.text[:50])
            print(f'[FAIL] {m}: {status} - {err}')
    except Exception as e:
        print(f'[FAIL] {m}: 异常 - {e}')
