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
      const original = content;
      // Replace brand name
      content = content.replace(/Brenner Vera/g, 'Instituto Peruano de Compliance');
      content = content.replace(/\bBrenner\b/g, 'Instituto Peruano de Compliance');
      // Replace orange colors with new palette variables or hexes
      const replacements = [
        { regex: /#f26f21/gi, replacement: '#004EBB' },
        { regex: /#ff853a/gi, replacement: '#76C0E3' },
        { regex: /#ff7f00/gi, replacement: '#76C0E3' },
        { regex: /rgb\s*\(\s*242\s*,\s*111\s*,\s*33\s*\)/gi, replacement: 'rgb(0,78,187)' },
        { regex: /rgb\s*\(\s*255\s*,\s*111\s*,\s*0\s*\)/gi, replacement: 'rgb(118,192,227)' },
        { regex: /rgba\s*\(\s*242\s*,\s*111\s*,\s*33\s*,\s*[^)]+\)/gi, replacement: 'rgba(0,78,187,1)' },
        { regex: /rgba\s*\(\s*255\s*,\s*111\s*,\s*0\s*,\s*[^)]+\)/gi, replacement: 'rgba(118,192,227,1)' }
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
