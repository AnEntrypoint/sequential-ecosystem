import fs from 'fs-extra';
import path from 'path';
export async function writeFileAtomicString(filePath, content) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
  await fs.writeFile(filePath, content, 'utf8');
}
export async function readFileAsString(filePath) {
  return await fs.readFile(filePath, 'utf8');
}
export default { writeFileAtomicString, readFileAsString };
