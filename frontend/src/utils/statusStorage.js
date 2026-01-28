// Logic to handle 24-hour auto-deletion
export const saveStatus = (newStatus) => {
  const current = JSON.parse(localStorage.getItem('gym_statuses') || '[]');
  const statusObj = {
    id: Date.now(),
    text: newStatus,
    timestamp: Date.now()
  };
  const updated = [statusObj, ...current];
  localStorage.setItem('gym_statuses', JSON.stringify(updated));
  return updated;
};

export const getActiveStatuses = () => {
  const current = JSON.parse(localStorage.getItem('gym_statuses') || '[]');
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  // Filter out items older than 24 hours
  const active = current.filter(item => (now - item.timestamp) < twentyFourHours);
  
  // Update storage if items were removed
  if (active.length !== current.length) {
    localStorage.setItem('gym_statuses', JSON.stringify(active));
  }
  
  return active;
};

export const deleteStatusManual = (id) => {
  const current = JSON.parse(localStorage.getItem('gym_statuses') || '[]');
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem('gym_statuses', JSON.stringify(updated));
  return updated;
};