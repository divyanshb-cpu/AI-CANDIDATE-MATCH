
import { type ParsedResume } from '../types';

// These are loaded from CDNs in index.html, so we declare them for TypeScript
declare const pdfjsLib: any;
declare const mammoth: any;

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return fullText;
}

async function parseDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function parseFiles(files: File[]): Promise<ParsedResume[]> {
  const parsingPromises = files.map(async (file) => {
    try {
      let content = '';
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        content = await parsePdf(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        content = await parseDocx(file);
      } else {
        console.warn(`Unsupported file type: ${file.name}`);
        return { fileName: file.name, content: '' };
      }
      return { fileName: file.name, content };
    } catch (error) {
      console.error(`Failed to parse ${file.name}:`, error);
      return { fileName: file.name, content: '' }; // Return empty content on failure
    }
  });

  return Promise.all(parsingPromises);
}
