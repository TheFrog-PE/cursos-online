import os

search_dir = r"C:\Users\The Frog\.gemini\antigravity\brain"
for root, dirs, files in os.walk(search_dir):
    for f in files:
        if f == "AdminDashboardPage.tsx" or f.endswith("AdminDashboardPage.tsx"):
            full_path = os.path.join(root, f)
            print(f"Found: {full_path} (Size: {os.path.getsize(full_path)} bytes)")
