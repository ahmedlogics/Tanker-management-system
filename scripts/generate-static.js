import fs from 'node:fs';
import path from 'node:path';

async function buildStatic() {
  console.log('Starting static generation for Vercel...');
  const { default: worker } = await import('../dist/server/index.js');
  
  const clientDir = path.resolve('dist/client');
  const distDir = path.resolve('dist');

  // 1. Copy all client assets (CSS, JS, images) from dist/client to dist/
  if (fs.existsSync(clientDir)) {
    fs.cpSync(clientDir, distDir, { recursive: true });
    console.log('✓ Copied client assets to dist/');
  }

  // 2. Pre-render all app routes into static HTML files
  const routes = [
    '/',
    '/signup',
    '/signin',
    '/dashboard',
    '/deliveries',
    '/tankers',
    '/payments',
    '/orders',
    '/my-orders',
    '/complaints',
    '/book-tanker',
    '/payment',
  ];

  for (const route of routes) {
    try {
      const res = await worker.fetch(new Request(`http://localhost${route}`));
      if (res.ok) {
        const html = await res.text();
        const targetFile = route === '/'
          ? path.join(distDir, 'index.html')
          : path.join(distDir, `${route.slice(1)}.html`);
        
        const targetDirFile = route === '/'
          ? path.join(distDir, 'index.html')
          : path.join(distDir, route.slice(1), 'index.html');
        
        fs.mkdirSync(path.dirname(targetDirFile), { recursive: true });
        fs.writeFileSync(targetDirFile, html, 'utf8');
        if (route !== '/') {
          fs.writeFileSync(targetFile, html, 'utf8');
        }
        console.log(`✓ Rendered route: ${route}`);
      }
    } catch (e) {
      console.warn(`Warning on route ${route}:`, e.message);
    }
  }

  // Guarantee fallback index.html exists
  const rootIndex = path.join(distDir, 'index.html');
  if (!fs.existsSync(rootIndex)) {
    const res = await worker.fetch(new Request('http://localhost/'));
    const html = await res.text();
    fs.writeFileSync(rootIndex, html, 'utf8');
  }

  console.log('✓ Successfully generated all static HTML files for Vercel!');
}

buildStatic().catch(err => {
  console.error('Error generating static files:', err);
  process.exit(1);
});
