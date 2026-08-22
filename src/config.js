/* Winedle — optional integrations.
 *
 * Both are OFF until filled in, and both fail silently: if the counter is
 * unreachable or the analytics script is blocked, the game is unaffected. No
 * data leaves the browser while these are empty.
 */

const CONFIG = {
  /* GoatCounter site code — the xxx in https://xxx.goatcounter.com.
   * Create a free site at https://www.goatcounter.com/signup and paste it here.
   * No cookies, no personal data, no consent banner required. */
  GOATCOUNTER: 'leemoose',

  /* Deployed counter Worker, e.g. https://winedle-counter.<you>.workers.dev
   * See worker/README.md. Leave empty to keep the game fully offline. */
  COUNTER_URL: 'https://winedle-counter.leemoose.workers.dev'
};
