export class DataAccessLayer {
  constructor(storage) { this.storage = storage; }
  async find(key) { return this.storage.get(key); }
  async save(key, value) { return this.storage.set(key, value); }
  async delete(key) { return this.storage.delete(key); }
  async list() { return this.storage.list(); }
}
export default { DataAccessLayer };
