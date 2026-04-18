import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const entriesToCopy = [
    'landing.html',
    'manifest.webmanifest',
    'sw.js',
    'web-app.js',
    'assets',
    'v2'
];

async function build() {
    await rm(distDir, { recursive: true, force: true });
    await mkdir(distDir, { recursive: true });

    await Promise.all(
        entriesToCopy.map(entry =>
            cp(path.join(rootDir, entry), path.join(distDir, entry), { recursive: true })
        )
    );

    console.log(`Build completed: ${distDir}`);
}

build().catch(error => {
    console.error('Build failed');
    console.error(error);
    process.exitCode = 1;
});
