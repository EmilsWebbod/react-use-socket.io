function loadFromStorage(store: string) {
  try {
    const serializedStore = localStorage.getItem(store);
    return JSON.parse(serializedStore || '');
  } catch (error) {
    return undefined;
  }
}

function saveToStorage(store: string, object: any) {
  try {
    localStorage.setItem(store, JSON.stringify(object));
  } catch (error) {
    // Ignore write errors
  }
}

function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (e) {
    return false;
  }
}

export { saveToStorage, loadFromStorage, clearStorage };
