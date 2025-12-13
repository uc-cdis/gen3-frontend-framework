// scripts/scan-routes.ts
import fs from 'fs';
import path from 'path';

const EXCLUDED_DIRS = ['/', '/Login', 'admin'];

function scanRoutes(dir: string, base = ''): string[] {
  const routes: string[] = [];
  if (!fs.existsSync(dir)) return routes;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const routePath = path.join(base, entry.name);
    if (
      entry.isFile() &&
      routePath.endsWith('.tsx') &&
      !routePath.startsWith('_')
    ) {
      routes.push(`${base}/${entry.name.replace(/\.tsx$/, '') || '/'}`);
    }

    if (entry.isDirectory()) {
      // Recurse into subdirectories
      routes.push(...scanRoutes(fullPath, path.join('/', base, entry.name)));
    }
  }

  return routes;
}

// Scan both app and pages directories
const appRoutes = scanRoutes('./app');
const pagesRoutes = scanRoutes('./src/pages', '')
  .map((r) => r.replace(/\/index$/, '') || '/')
  .filter((r) => !EXCLUDED_DIRS.includes(r));

const allRoutes = [...new Set([...appRoutes, ...pagesRoutes])];

console.log('Found routes:', allRoutes);

// Generate middleware config
const config = {
  matcher:
    allRoutes.length > 0
      ? allRoutes
      : [
          '/((?!_next/static|_next/image|_next/data|favicon.ico|/Login|.*\\.ico$|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.json$).*)',
        ],
};

fs.writeFileSync(
  './config/nextjs-routes.json',
  JSON.stringify(config, null, 2),
);
