
import React from 'react';
import { type Candidate } from '../types';
import { exportToCsv } from '../utils/csvExporter';
import { DownloadIcon, MedalIcon } from './icons';

interface ResultsTableProps {
  candidates: Candidate[];
}

export function ResultsTable({ candidates }: ResultsTableProps): React.ReactNode {

  const handleDownload = () => {
    exportToCsv('candidate_analysis_results.csv', candidates);
  };

  const getRankPill = (rank: number) => {
    switch (rank) {
      case 0:
        return <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full text-sm"><MedalIcon className="h-4 w-4 text-amber-500"/> 1st</div>;
      case 1:
        return <div className="flex items-center gap-1.5 bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded-full text-sm"><MedalIcon className="h-4 w-4 text-slate-500"/> 2nd</div>;
      case 2:
        return <div className="flex items-center gap-1.5 bg-orange-200 text-orange-800 font-semibold px-2.5 py-1 rounded-full text-sm"><MedalIcon className="h-4 w-4 text-orange-500"/> 3rd</div>;
      default:
        return <span className="font-semibold text-slate-600">{rank + 1}</span>;
    }
  };
  
  const getMatchColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">Ranked Candidates</h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <DownloadIcon className="h-5 w-5" />
          <span>Download CSV</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-16">Rank</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Candidate</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-48">Match Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Key Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {candidates.map((candidate, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-center">{getRankPill(index)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">{candidate.candidateName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className={`${getMatchColor(candidate.matchPercentage)} h-2.5 rounded-full`} style={{ width: `${candidate.matchPercentage}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{candidate.matchPercentage}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600 max-w-md">{candidate.keyNotes}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
