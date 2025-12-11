/**
 * keystore-operations.js
 *
 * Keystore (credential) storage and retrieval
 */

import { nowISO } from '@sequentialos/sequential-utils/timestamps';

export function createKeystoreOperations(admin, client) {
  return {
    async setKeystore(key, value) {
      const { error } = await admin
        .from('keystore')
        .upsert({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          updated_at: nowISO()
        }, { onConflict: 'key' });

      if (error) throw error;
    },

    async getKeystore(key) {
      const { data, error } = await client
        .from('keystore')
        .select('value')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      try {
        return JSON.parse(data.value);
      } catch (e) {
        return data.value;
      }
    },

    async deleteKeystore(key) {
      const { error } = await admin
        .from('keystore')
        .delete()
        .eq('key', key);

      if (error) throw error;
    }
  };
}
