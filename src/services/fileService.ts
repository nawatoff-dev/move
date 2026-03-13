import { get, set, del } from 'idb-keyval';

export type ExportCategory = 'journal' | 'analysis' | 'performance';

const BASE_DIR_KEY = 'zZIA_base_dir_handle';

const CATEGORY_MAP: Record<ExportCategory, string> = {
  journal: 'Journaling',
  analysis: 'Analysis_Reports',
  performance: 'Performance'
};

export async function getBaseDirectory() {
  const handle = await get(BASE_DIR_KEY);
  if (!handle) return null;

  try {
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted') return handle;
    return null;
  } catch (e) {
    await del(BASE_DIR_KEY);
    return null;
  }
}

export async function setBaseDirectory() {
  if (!('showDirectoryPicker' in window)) {
    alert('Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.');
    return null;
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      id: 'zZIA_export_root',
      mode: 'readwrite'
    });
    await set(BASE_DIR_KEY, handle);
    return handle;
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Error selecting directory:', err);
    }
    return null;
  }
}

export async function resetBaseDirectory() {
  await del(BASE_DIR_KEY);
}

export async function savePdf(blob: Blob, filename: string, category: ExportCategory) {
  // Check for File System Access API support
  if (!('showDirectoryPicker' in window)) {
    downloadFallback(blob, filename);
    return;
  }

  try {
    let baseHandle = await get(BASE_DIR_KEY);
    
    // If we have a handle, check for permissions
    if (baseHandle) {
      try {
        const permission = await baseHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          const request = await baseHandle.requestPermission({ mode: 'readwrite' });
          if (request !== 'granted') {
            baseHandle = null;
          }
        }
      } catch (e) {
        baseHandle = null;
      }
    }

    // If no handle, fallback to standard download
    if (!baseHandle) {
      downloadFallback(blob, filename);
      return;
    }

    // Get or create category subfolder
    const subfolderName = CATEGORY_MAP[category];
    const subfolderHandle = await baseHandle.getDirectoryHandle(subfolderName, { create: true });

    // Save the file
    const fileHandle = await subfolderHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    console.log(`Successfully saved ${filename} to ${subfolderName} folder.`);
  } catch (err) {
    console.error('File System Error:', err);
    downloadFallback(blob, filename);
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
