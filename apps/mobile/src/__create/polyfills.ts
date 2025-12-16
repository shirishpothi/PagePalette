// Defer non-critical fetch polyfill to allow faster initial load
// This will be available by the time any fetch is actually called
let fetchPolyfillApplied = false;

const applyFetchPolyfill = () => {
  if (fetchPolyfillApplied) return;
  fetchPolyfillApplied = true;
  import('./fetch').then(({ default: updatedFetch }) => {
    // @ts-ignore
    global.fetch = updatedFetch;
  });
};

// Apply polyfill immediately but don't block
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(applyFetchPolyfill, { timeout: 100 });
} else {
  // Fallback: apply on next tick
  Promise.resolve().then(applyFetchPolyfill);
}
