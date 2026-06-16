import { Download, FileDown, Save, Eye } from 'lucide-react';
import type { ResumeTemplate } from '../../../components/ATSResume';
import type { SaveStatus } from '../hooks/useResumeData';

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;
  return (
    <span className={`flex items-center gap-1.5 text-xs ${status === 'saving' ? 'text-blue-400' : status === 'saved' ? 'text-emerald-400' : 'text-red-400'}`}>
      {status === 'saving' && <>{'\u23F3'} Saving...</>}
      {status === 'saved' && <>{'\u2713'} Saved</>}
      {status === 'error' && <>{'\u26A0'} Error</>}
    </span>
  );
}

interface ResumeToolbarProps {
  saveStatus: SaveStatus;
  onDownloadDocx: () => void;
  onDownloadPdf: () => void;
  onRefresh: () => void;
}

export default function ResumeToolbar({ saveStatus, onDownloadDocx, onDownloadPdf, onRefresh }: ResumeToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <SaveIndicator status={saveStatus} />
      <button onClick={onDownloadDocx} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
        <FileDown className="w-3.5 h-3.5" /> DOC
      </button>
      <button onClick={onDownloadPdf} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors shadow-sm">
        <Download className="w-3.5 h-3.5" /> PDF
      </button>
      <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:bg-gray-800 transition-colors">
        <Save className="w-3.5 h-3.5" /> Refresh
      </button>
    </div>
  );
}
