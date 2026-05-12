// Network status detection
function updateNetworkStatus() {
  const statusElement = document.getElementById('network-status');
  if (!statusElement) return;
  
  if (navigator.onLine) {
    statusElement.textContent = 'Online';
    statusElement.className = 'fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-medium transition-all duration-300 bg-green-500 text-white';
  } else {
    statusElement.textContent = 'Offline';
    statusElement.className = 'fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-medium transition-all duration-300 bg-red-500 text-white';
  }
}

// Initial check
updateNetworkStatus();

// Listen for online/offline events
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// Optionally, you can also listen for visibilitychange to detect when user returns to tab
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // User returned to tab, check connection
    updateNetworkStatus();
  }
});