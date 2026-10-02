(() => {
  async function compressImage(file) {
    // Small files are already fast enough. Keep them untouched.
    if (!file || !file.type.startsWith('image/') || file.size <= 280 * 1024) return file;

    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();

      const maxSide = 1280;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (!w || !h) return file;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, w, h);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.78));
      if (!blob || blob.size >= file.size) return file;
      return new File([blob], (file.name.replace(/\.[^.]+$/, '') || 'photo') + '.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // Run before React's submit handler. Compress once, then re-submit normally.
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains('edit-form')) return;
    const input = form.querySelector('input[type="file"][name="photo"]');
    if (!(input instanceof HTMLInputElement) || input.dataset.optimized === '1') return;
    const file = input.files && input.files[0];
    if (!file) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    input.dataset.optimized = '1';

    try {
      const optimized = await compressImage(file);
      if (optimized !== file) {
        const dt = new DataTransfer();
        dt.items.add(optimized);
        input.files = dt.files;
      }
    } finally {
      // Let the existing app perform the real save. Nothing else is changed.
      form.requestSubmit();
      setTimeout(() => { delete input.dataset.optimized; }, 0);
    }
  }, true);
})();
