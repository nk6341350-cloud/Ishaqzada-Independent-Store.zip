(() => {
  const MAX_SIDE = 960;
  const QUALITY = 0.72;
  const THRESHOLD = 220 * 1024;

  async function optimize(file) {
    if (!file || !file.type || !file.type.startsWith('image/') || file.size <= THRESHOLD) return file;
    if (typeof DataTransfer === 'undefined') return file;

    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      if (img.decode) await img.decode();
      else await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });

      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (!w || !h) return file;
      const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return file;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
      if (!blob || blob.size >= file.size) return file;
      return new File([blob], (file.name.replace(/\.[^.]+$/, '') || 'photo') + '.jpg', {
        type: 'image/jpeg', lastModified: Date.now()
      });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  document.addEventListener('change', async (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.name !== 'photo') return;
    const file = input.files && input.files[0];
    if (!file || input.dataset.optimizing === '1') return;
    input.dataset.optimizing = '1';
    try {
      const smaller = await optimize(file);
      if (smaller !== file) {
        const dt = new DataTransfer();
        dt.items.add(smaller);
        input.files = dt.files;
      }
    } catch {}
    finally { delete input.dataset.optimizing; }
  }, true);
})();
