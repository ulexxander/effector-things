import { PersistentStorage } from "../src";
import { sleep } from "./helpers";

export class MemoryStorage implements PersistentStorage {
  private items = new Map<string, string>();

  getItem(key: string) {
    return this.items.get(key) || null;
  }

  setItem(key: string, value: string) {
    this.items.set(key, value);
  }

  removeItem(key: string) {
    this.items.delete(key);
  }
}

export class MemoryStorageAsync implements PersistentStorage {
  private items = new Map<string, string>();

  static GET_ITEM_DELAY = 2;
  static SET_ITEM_DELAY = 4;
  static REMOVE_ITEM_DELAY = 2;

  async getItem(key: string) {
    await sleep(MemoryStorageAsync.GET_ITEM_DELAY);
    return this.items.get(key) || null;
  }

  async setItem(key: string, value: string) {
    await sleep(MemoryStorageAsync.SET_ITEM_DELAY);
    this.items.set(key, value);
  }

  async removeItem(key: string) {
    await sleep(MemoryStorageAsync.REMOVE_ITEM_DELAY);
    this.items.delete(key);
  }
}
