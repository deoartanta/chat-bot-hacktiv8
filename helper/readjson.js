import { readFile } from 'fs/promises';

export async function readJsonFile(path) {
  try {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}