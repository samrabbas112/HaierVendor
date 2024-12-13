// notificationStore.ts

class NotificationStore {
  private localStorageKey = 'notifications'

  // Get value from local storage
  public getValue(): string | null {
    return localStorage.getItem(this.localStorageKey)
  }

  // Set value in local storage
  public setValue(value: string): void {
    localStorage.setItem(this.localStorageKey, value)
  }
}

// Export a singleton instance for use across the app
const notificationStore = new NotificationStore()
export default notificationStore
