
import { type Candidate } from '../types';

function convertToCSV(data: Candidate[]): string {
  if (data.length === 0) {
    return '';
  }

  const headers = ['Rank', 'Candidate Name', 'Match Percentage', 'Key Notes'];
  const rows = data.map((candidate, index) => [
    index + 1,
    `"${candidate.candidateName.replace(/"/g, '""')}"`,
    candidate.matchPercentage,
    `"${candidate.keyNotes.replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export function exportToCsv(filename: string, data: Candidate[]): void {
  const csvString = convertToCSV(data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
