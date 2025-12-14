// scripts/scan-routes.js
// eslint-disable no-console
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

const PAGE_EXT_RE = /\.(tsx|ts|jsx|js)$/;

function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

function normalizeRoute(route) {
  let r = route.startsWith('/') ? route : `/${route}`;
  r = r.replace(/\/{2,}/g, '/');
  if (r.length > 1) r = r.replace(/\/$/, '');
  return r;
}

function filePathToRoute(relativeFilePosix) {
  // relativeFilePosix example: "admin/users/index.tsx" or "profile.tsx"
  if (!PAGE_EXT_RE.test(relativeFilePosix)) return null;

  // Exclude pages/api/*
  if (relativeFilePosix === 'api' || relativeFilePosix.startsWith('api/'))
    return null;

  const baseName = path.posix.basename(relativeFilePosix);

  // Exclude Next special pages and any file starting with "_"
  if (baseName.startsWith('_')) return null;

  // Strip extension
  let noExt = relativeFilePosix.replace(PAGE_EXT_RE, '');

  // "index" rule: "/foo/index" => "/foo", "index" => "/"
  noExt = noExt.replace(/\/index$/i, '');
  if (noExt === 'index') noExt = '';

  return normalizeRoute(noExt);
}

function scanPagesRoutes(pagesDirAbs, pagesRootAbs) {
  const routes = [];
  if (!fs.existsSync(pagesDirAbs)) return routes;

  const entries = fs.readdirSync(pagesDirAbs, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(pagesDirAbs, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '.next') continue;
      routes.push(...scanPagesRoutes(fullPath, pagesRootAbs));
      continue;
    }

    if (!entry.isFile()) continue;

    const relFromPages = path.relative(pagesRootAbs, fullPath);
    const relPosix = toPosixPath(relFromPages);

    const route = filePathToRoute(relPosix);
    if (route) routes.push(route);
  }

  return routes;
}

/**
 * Compute Next.js Pages Router routes from a pages directory.
 * @param {object} [opts]
 * @param {string} [opts.pagesDir] - absolute or relative path to pages dir (default "./src/pages")
 * @param {string[]} [opts.excludeRoutes] - exact routes to exclude (default: 403/404/500/Login)
 * @returns {string[]} sorted unique routes, e.g. ["/", "/Login", "/admin/authz"]
 */
function getPagesRoutes(opts = {}) {
  const pagesDir = path.resolve(opts.pagesDir || './src/pages');

  const excluded = new Set(
    (opts.excludeRoutes || ['/403', '/404', '/500', '/Login']).map(
      normalizeRoute,
    ),
  );

  const routes = scanPagesRoutes(pagesDir, pagesDir)
    .map(normalizeRoute)
    .filter((r) => {
      // Exclude exact matches from the excluded set
      if (excluded.has(r)) return false;

      // Exclude '/' route
      if (r === '/') return false;

      // Exclude anything under '/admin/'
      if (r === '/admin' || r.startsWith('/admin/')) return false;

      return true;
    });
  return Array.from(new Set(routes)).sort((a, b) => a.localeCompare(b));
}

/**
 * Convenience helper to write Next middleware matcher config to JSON.
 * @param {object} [opts]
 * @param {string} [opts.pagesDir]
 * @param {string} [opts.outputFile] - default "./config/nextjs-routes.json"
 * @param {string[]} [opts.excludeRoutes]
 * @returns {{ matcher: string[] }}
 */
function writeMatcherConfig(opts = {}) {
  const outputFile = path.resolve(
    opts.outputFile || './config/nextjs-routes.json',
  );
  const routes = getPagesRoutes(opts);

  const config =
    routes.length > 0
      ? { matcher: routes }
      : {
          matcher: [
            '/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(ico|png|jpg|jpeg|svg|json)$).*)',
          ],
        };
  console.log(`Adding the routes to middleware ${routes.join('\n')}`);
  console.log(`Writing Next.js matcher config to ${outputFile}`);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(config, null, 2));
  return config;
}

module.exports = {
  getPagesRoutes,
  writeMatcherConfig,
};
