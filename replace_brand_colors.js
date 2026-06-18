const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname);
const targetExtensions = ['.tsx', '.ts', '.js', '.jsx', '.css', '.scss', '.json'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (targetExtensions.includes(path.extname(entry.name))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      // Replace brand name
      content = content.replace(/Instituto Peruano de Compliance/g, 'Instituto Peruano de Compliance');
      // Replace orphan "Instituto Peruano de Compliance" if any (optional)
      content = content.replace(/\bBrenner\b/g, 'Instituto Peruano de Compliance');
      // Replace orange hex colors with CSS variables
      const replacements = [
        { regex: /#004EBB/gi, replacement: 'var(--primary)' },
        { regex: /#76C0E3/gi, replacement: 'var(--accent)' },
        { regex: /rgb\s*\(\s*242\s*,\s*111\s*,\s*33\s*\)/gi, replacement: 'var(--primary)' },
        { regex: /rgb\s*\(\s*255\s*,\s*111\s*,\s*0\s*\)/gi, replacement: 'var(--accent)' },
        { regex: /rgba\s*\(\s*242\s*,\s*111\s*,\s*33\s*,\s*[^)]+\)/gi, replacement: 'rgba(var(--primary-rgb), 1)' },
        { regex: /rgba\s*\(\s*255\s*,\s*111\s*,\s*0\s*,\s*[^)]+\)/gi, replacement: 'rgba(var(--accent-rgb), 1)' }
      ];
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk(projectRoot);
