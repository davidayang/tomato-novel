"""配置测试API并清理旧提示词"""
import sqlite3
import datetime

conn = sqlite3.connect('data.db')
c = conn.cursor()

# 查看所有表
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print("数据库表:", tables)

# 清理旧的提示词（让系统用新的RTCO模板重新初始化）
try:
    c.execute("DELETE FROM prompt_templates")
    print("已清理旧提示词模板")
except Exception as e:
    print(f"清理提示词失败: {e}")

# 先清理旧的默认API配置
try:
    c.execute("UPDATE api_configs SET is_default = 0 WHERE is_default = 1")
except:
    pass

# 插入用户提供的API配置
now = datetime.datetime.now().isoformat()
try:
    c.execute(
        "INSERT INTO api_configs (id, config_type, provider, name, api_key, base_url, model, is_default, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            'dashscope-qwen',
            'text',
            'custom',
            'Qwen-DashScope',
            'sk-sp-24b23e3cab68405693d71422092fde87',
            'https://coding.dashscope.aliyuncs.com/v1',
            'qwen3.5-plus',
            1,
            1,
            now,
            now,
        )
    )
    print("已添加 Qwen-DashScope 文本API配置")
except Exception as e:
    print(f"添加API配置失败: {e}")

# 查看当前API配置
c.execute("SELECT id, name, provider, model, is_default FROM api_configs")
for row in c.fetchall():
    print(f"  API配置: {row}")

conn.commit()
conn.close()
print("完成!")
