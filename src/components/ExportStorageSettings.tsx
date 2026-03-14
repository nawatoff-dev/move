import React from 'react';
import { FolderOpen, X, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const ExportStorageSettings: React.FC = () => {
  const { exportStorageHandle, setExportStorage, resetExportStorage } = useSettings();

  return (
    <section className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <FolderOpen size={16} />
          Export Storage Location
        </h3>
        {exportStorageHandle && (
          <button
            onClick={resetExportStorage}
            className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
            title="Reset storage location"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="bg-brand-surface/50 p-4 rounded-xl border border-brand-border space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${exportStorageHandle ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-surface text-text-muted'}`}>
            <FolderOpen size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-main truncate">
              {exportStorageHandle ? exportStorageHandle.name : 'No folder selected'}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              {exportStorageHandle 
                ? 'Your exports will be saved to this directory.' 
                : 'Select a base directory for your PDF exports.'}
            </p>
          </div>
          {exportStorageHandle && (
            <CheckCircle2 size={20} className="text-brand-primary mt-1" />
          )}
        </div>

        <button
          onClick={setExportStorage}
          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border ${
            exportStorageHandle
              ? 'bg-brand-surface border-brand-border text-text-main hover:bg-brand-surface/80'
              : 'bg-brand-primary border-brand-primary text-text-inverse hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20'
          }`}
        >
          {exportStorageHandle ? 'Change Folder' : 'Select Folder'}
        </button>
      </div>

      <p className="text-[11px] text-text-muted italic leading-relaxed">
        Note: The File System Access API allows the application to save files directly to your local storage. 
        You will be prompted for permission when saving files.
      </p>
    </section>
  );
};
