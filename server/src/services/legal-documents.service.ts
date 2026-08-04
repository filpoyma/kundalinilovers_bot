import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { InputFile } from 'grammy';

const legalDir = join(dirname(fileURLToPath(import.meta.url)), '../../legal');

export const LEGAL_DOCUMENTS = {
  terms: {
    filename: 'user-agreement.md',
    title: 'Пользовательское соглашение',
  },
  privacy: {
    filename: 'privacy-policy.md',
    title: 'Политика конфиденциальности',
  },
} as const;

export async function readLegalDocument(
  type: keyof typeof LEGAL_DOCUMENTS,
): Promise<string> {
  const { filename } = LEGAL_DOCUMENTS[type];
  return readFile(join(legalDir, filename), 'utf8');
}

export function getLegalDocumentInputFile(type: keyof typeof LEGAL_DOCUMENTS): InputFile {
  const { filename, title } = LEGAL_DOCUMENTS[type];
  return new InputFile(join(legalDir, filename), `${title}.md`);
}
