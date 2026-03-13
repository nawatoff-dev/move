export type ExportCategory = 'journal' | 'analysis' | 'performance';

export async function savePdf(blob: Blob, filename: string, _category: ExportCategory) {
  const isIframe = window.self !== window.top;

  // Use showSaveFilePicker for manual selection as requested in the reference video
  // Note: This API is restricted in cross-origin iframes (like the AI Studio preview)
  if (!isIframe && 'showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'PDF Document',
          accept: { 'application/pdf': ['.pdf'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // User cancelled or other error
      if ((err as Error).name === 'AbortError') return;
      console.error('Save File Picker Error:', err);
    }
  }

  // Fallback to standard download if API not supported, user cancels, or running in an iframe
  // In an iframe, this is the only reliable way to save a file.
  // TIP: Users can enable "Ask where to save each file before downloading" in their browser 
  // settings to get a "Save As" dialog even with this fallback.
  downloadFallback(blob, filename);

  if (isIframe) {
    console.info('Note: The "Save As" dialog is restricted by the browser when running inside a preview iframe. The file has been sent to your Downloads folder. To use the manual "Save As" feature, please open the application in a new tab.');
  }
}

function downloadFallback(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
