const fs = require('fs');
const path = require('path');
const posixPath = path.posix;

// Constants
const DIRECTORY_ICON = '📂';
const FILE_ICON = '📝';

// Files and directories to exclude
const EXCLUDE_DIRS = ['.git', '.github', 'img', '_sidebar.md', '.docsify'];

function generateSidebar(rootDir, currentDir = '', depth = 0) {
  const items = [];
  const fullPath = path.join(rootDir, currentDir);
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDE_DIRS.includes(entry.name)) continue;

    const relativePath = posixPath.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      // Only include directories with markdown files or subdirectories
      const subEntries = fs.readdirSync(path.join(fullPath, entry.name));
      const hasContent = subEntries.some(e =>
        e.endsWith('.md') ||
        (fs.statSync(path.join(fullPath, entry.name, e)).isDirectory() &&
          !EXCLUDE_DIRS.includes(e))
      );

      if (hasContent) {
        const indent = '\t'.repeat(depth);
        items.push(`${indent}- [${DIRECTORY_ICON} ${entry.name}](/${relativePath}/)`);

        // Recursively process subdirectories
        const subItems = generateSidebar(rootDir, relativePath, depth + 1);
        items.push(...subItems);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md') && !['README.md', 'index.md'].includes(entry.name)) {
      const indent = '\t'.repeat(depth);
      const displayName = entry.name.replace('.md', '');
      items.push(`${indent}- [${FILE_ICON} ${displayName}](/${relativePath})`);
    }
  }

  return items;
}

function main() {
  // Get target directories from command line arguments
  const targetDirs = process.argv.length > 2
    ? process.argv.slice(2)
    : [process.cwd()];

  let allItems = [
    `- [${DIRECTORY_ICON} 首页](/)`,
    `- [${DIRECTORY_ICON} 目录](/_sidebar.md)`
  ];

  // Process each target directory
  for (const dir of targetDirs) {
    const rootDir = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
    allItems.push(...generateSidebar(rootDir));
  }

  fs.writeFileSync('_sidebar.md', allItems.join('\n') + '\n');
  console.log('Sidebar generated successfully!');
}

main();
