
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResultsTable } from './components/ResultsTable';
import { LogoIcon, SparklesIcon } from './components/icons';
import { Spinner } from './components/Spinner';
import { analyzeResumes } from './services/geminiService';
import { parseFiles } from './services/fileParserService';
import { type Candidate, type ParsedResume } from './types';

export default function App(): React.ReactNode {
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<Candidate[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeClick = useCallback(async () => {
    if (resumeFiles.length === 0 || !jobDescription.trim()) {
      setError('Please upload at least one resume and provide a job description.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const parsedResumes: ParsedResume[] = await parseFiles(resumeFiles);
      if(parsedResumes.some(r => r.content.trim() === '')) {
        console.warn("Some files could not be parsed or were empty.");
      }
      const nonEmptyResumes = parsedResumes.filter(r => r.content.trim() !== '');
      if (nonEmptyResumes.length === 0) {
        throw new Error("Could not extract text from any of the uploaded resumes. Please check the file formats and content.");
      }
      const result = await analyzeResumes(nonEmptyResumes, jobDescription);
      
      // Sort candidates by match percentage in descending order
      const sortedResult = result.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setAnalysisResult(sortedResult);

    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
      setError(`Analysis Failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [resumeFiles, jobDescription]);

  const canAnalyze = resumeFiles.length > 0 && jobDescription.trim().length > 0 && !isLoading;

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Candidate Match</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-8">
            
            <div>
              <h2 className="text-xl font-semibold text-slate-700 mb-1">Step 1: Upload Resumes</h2>
              <p className="text-slate-500 mb-4">Upload multiple resumes in PDF or DOCX format.</p>
              <FileUpload files={resumeFiles} setFiles={setResumeFiles} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-700 mb-1">Step 2: Paste Job Description</h2>
              <p className="text-slate-500 mb-4">Provide the job description for the role you're hiring for.</p>
              <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleAnalyzeClick}
                disabled={!canAnalyze}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    <span>Analyzing Candidates...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-6 w-6" />
                    <span>Analyze & Rank Candidates</span>
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Analysis Results</h2>
              <ResultsTable candidates={analysisResult} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Candidate Match. All rights reserved.</p>
      </footer>
    </div>
  );
}
