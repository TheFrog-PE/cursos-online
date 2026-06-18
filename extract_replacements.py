import json
log_path = r"C:\Users\The Frog\.gemini\antigravity\brain\ea592681-f038-4e15-87b5-aa19e415213c\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        data = json.loads(line)
        tool_calls = data.get("tool_calls", [])
        for tc in tool_calls:
            if tc.get("name") == "replace_file_content":
                args = tc.get("args", {})
                target = args.get("TargetFile")
                if target and "AdminDashboardPage.tsx" in target:
                    print(f"--- Step {data.get('step_index')} ---")
                    print(f"TargetContent:\n{args.get('TargetContent')}\n")
                    print(f"ReplacementContent:\n{args.get('ReplacementContent')}\n")
                    print("="*40)
