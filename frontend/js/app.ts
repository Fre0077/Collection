// On load, restore session and show collections if logged
window.addEventListener('load', () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      window.currentUser = JSON.parse(savedUser);
      window.showCollectionsView();
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
});

// Close item modal when clicking outside content
document.addEventListener('click', (e) => {
  const modal = document.getElementById('itemModal');
  if (modal && e.target === modal) {
    window.closeItemModal();
  }
});

export {};
