import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const packageJsonPath = path.join(rootDir, 'package.json');

const entriesToCopy = [
    'landing.html',
    'manifest.webmanifest',
    'web-app.js',
    'assets',
    'v2'
];

async function build() {
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    const buildVersion = `${packageJson.version}-${Date.now()}`;

    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    await Promise.all(
        entriesToCopy.map(entry =>
            cp(path.join(rootDir, entry), path.join(distDir, entry), { recursive: true })
        )
    );

    const serviceWorker = await readFile(path.join(rootDir, 'sw.js'), 'utf8');
    await writeFile(
        path.join(distDir, 'sw.js'),
        serviceWorker.replace('__APP_VERSION__', buildVersion),
        'utf8'
    );

    const landingHtml = await readFile(path.join(rootDir, 'landing.html'), 'utf8');
    await writeFile(path.join(distDir, 'index.html'), landingHtml, 'utf8');

    console.log(`Build completed: ${distDir}`);
    console.log(`Service worker version: ${buildVersion}`);
}

build().catch(error => {
    console.error('Build failed');
    console.error(error);
    process.exitCode = 1;
});
