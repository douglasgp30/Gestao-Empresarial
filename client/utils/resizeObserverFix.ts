/**
 * Fix for ResizeObserver loop completed with undelivered notifications
 * This is a common browser warning that doesn't affect functionality
 */

// Suppress the ResizeObserver error that doesn't affect functionality
const resizeObserverErrorHandler = (error: ErrorEvent) => {
  if (
    error.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    error.message === 'ResizeObserver loop limit exceeded'
  ) {
    // Suppress this specific error as it's not critical
    error.preventDefault();
    return true;
  }
  return false;
};

// Apply the fix when the module loads
if (typeof window !== 'undefined') {
  window.addEventListener('error', resizeObserverErrorHandler);
  
  // Also handle unhandled promise rejections if they contain this error
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes('ResizeObserver loop') ||
      event.reason?.toString?.()?.includes('ResizeObserver loop')
    ) {
      event.preventDefault();
    }
  });
}

export default resizeObserverErrorHandler;
