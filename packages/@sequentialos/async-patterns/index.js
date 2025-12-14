export async function retry(fn, maxRetries = 3, delayMs = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
}
export async function timeout(promise, ms) {
  return Promise.race([promise, new Promise((_, r) => setTimeout(() => r(new Error('Timeout')), ms))]);
}
export async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export default { retry, timeout, delay };
