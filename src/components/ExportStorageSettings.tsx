import React from 'react';
import { FolderOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const ExportStorageSettings: React.FC = () => {
  const { exportStorageHandle, setExportStorage, resetExportStorage } = useSettings();

  return (
    <section className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <FolderOpen size={16} />
          Export Storage Location
        </h3>
        {exportStorageHandle && (
          <button 
            onClick={resetExportStorage}
            className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Reset Folder
          </button>
        )}
      </div>

      <div className="p-6 bg-brand-surface/50 border border-brand-border rounded-2xl">
        {exportStorageHandle ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold uppercase tracking-tight">Storage Connected</span>
            </div>
            <p className="text-xs text-text-muted font-medium break-all">
              Folder: <span className="text-text-main">{exportStorageHandle.name}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['Journaling', 'Analysis_Reports', 'Performance'].map(sub => (
                <div key={sub} className="px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-[9px] font-black text-text-muted text-center uppercase tracking-tighter">
                  {sub}
                </div>
              ))}
            </div>
            <button 
              onClick={setExportStorage}
              className="w-full py-3 bg-brand-surface border border-brand-border rounded-xl text-xs font-black uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all"
            >
              Change Folder
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <FolderOpen className="text-brand-primary" size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-main uppercase mb-1">No Export Folder Selected</p>
              <p className="text-xs text-text-muted">PDFs will be saved to your default Downloads folder.</p>
            </div>
            <button 
              onClick={setExportStorage}
              className="w-full py-4 bg-brand-primary text-text-inverse font-black text-xs rounded-xl hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 uppercase tracking-widest"
            >
              Select Base Folder
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-start gap-3">
        <AlertCircle size={16} className="text-brand-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-text-muted leading-relaxed">
          Selecting a base folder allows zZIA to automatically organize your exports into subfolders. You will need to grant permission each time you restart the app.
        </p>
      </div>
    </section>
  );
};
