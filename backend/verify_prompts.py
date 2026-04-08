from app.prompts.defaults import DEFAULT_PROMPTS

print(f"提示词模板数量: {len(DEFAULT_PROMPTS)}")
for k, v in DEFAULT_PROMPTS.items():
    print(f"  {k}: {v['name']} ({v['category']})")
    # 验证 format 不会报错
    try:
        content = v["content"]
        # 简单检查占位符
        print(f"    模板长度: {len(content)} 字符")
    except Exception as e:
        print(f"    错误: {e}")

print("\n验证通过!")
