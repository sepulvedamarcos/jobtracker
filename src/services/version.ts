import fs from 'fs';
import path from 'path';

export function getVersion(): string {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    return pkg.version ?? '0.0.0';
  } catch (err) {
    return '0.0.0';
  }
}

export default getVersion;
