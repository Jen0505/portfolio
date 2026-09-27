/* Check the current deployment without storing the version request in browser cache.
   GitHub Pages controls its own HTTP cache headers; this is freshness checking,
   not a replacement for Cache-Control: no-store at the hosting layer. */
(() => {
  if (!/^https?:$/.test(location.protocol)) return;
  const revision = document.querySelector('meta[name="jen-page-revision"]')?.content;
  if (!revision) return;
  let busy = false;
  async function checkLatest() {
    if (busy || document.body?.classList.contains('editing') || window.jenHasUnsavedEdits) return;
    busy = true;
    try {
      const page = new URL(location.href);
      page.hash = '';
      page.search = '';
      if (page.pathname.endsWith('/')) page.pathname += 'index.html';
      const manifest = new URL(page);
      manifest.pathname += '.version.json';
      manifest.searchParams.set('_fresh', Date.now().toString());
      const options = { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(8000) };
      const response = await fetch(manifest, options);
      if (!response.ok) return;
      const latest = await response.json();
      if (!/^[a-f0-9]{20}$/.test(latest.revision) || latest.revision === revision) return;
      page.searchParams.set('_fresh', latest.revision + '-' + Date.now());
      const fresh = await fetch(page, { ...options, signal: AbortSignal.timeout(15000) });
      if (!fresh.ok || !fresh.headers.get('content-type')?.includes('text/html')) return;
      const html = await fresh.text();
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      if (parsed.querySelector('meta[name="jen-page-revision"]')?.content !== latest.revision) return;
      if (document.body?.classList.contains('editing') || window.jenHasUnsavedEdits) return;
      // Navigate to a versioned URL so scripts get a fresh document and the hash survives.
      const destination = new URL(location.href);
      if (destination.searchParams.get('v') === latest.revision) return;
      destination.searchParams.set('v', latest.revision);
      destination.searchParams.delete('_fresh');
      location.replace(destination.href);
    } catch { /* Keep the readable current page when offline or unavailable. */ }
    finally { busy = false; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkLatest, {once:true});
  else checkLatest();
  window.addEventListener('pageshow', event => { if (event.persisted) checkLatest(); });
})();
