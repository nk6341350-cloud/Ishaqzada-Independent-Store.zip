(() => {
  function isNewProductButton(el) {
    return el instanceof HTMLElement && el.closest('button') && el.closest('button').textContent.includes('نوی جنس ثبت کړه');
  }

  document.addEventListener('touchend', (event) => {
    const target = event.target;
    if (!isNewProductButton(target)) return;
    const btn = target.closest('button');
    if (!btn) return;
    event.preventDefault();
    btn.click();
  }, { passive: false, capture: true });
})();
