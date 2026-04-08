import httpx

key = 'sk-UkS0lWdwT5w2nNJPE8R1fVx70jIIXxC9JW4Kd3iL2xQvcOO7'
url = 'https://api.axa.us.ci/v1/chat/completions'
models = ['deepseek-v3.2', 'deepseek-v3.1-terminus', 'qwen3-30b-a3b', 'qwen3-32b', 'longcat-flash-chat']

print('--- 开始批量探测可用模型 ---')
for m in models:
    try:
        r = httpx.post(url, headers={'Authorization': f'Bearer {key}'}, json={'model': m, 'messages': [{'role': 'user', 'content': 'hi'}]}, timeout=5.0)
        print(f'MODEL {m}: {r.status_code}')
        if r.status_code == 200:
            print(f'>>> SUCCESS! {m} 可用')
    except Exception as e:
        print(f'MODEL {m} CRASH: {e}')
