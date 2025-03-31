// @ts-check
/**
 * generated using:
 * @see {@link https://www.npmjs.com/package/@html_first/js_lib_template | @html_first/js_lib_template}
 * @copyright
 * build and distributed under MIT licencse
 * @description
 * ## neinth code manager
 * is a simple code management library;
 * it helps you generates code programatically;
 * 
 * ## how to install
 * ```shell
 * npm i neinth
 * npx neinth-starter
 * ```
 * you might need to stick to single package manager to run the binary
 * 
 * ## how to use
 * - refer to [neinthConfig](#neinthconfig) for `configuration`;
 * - refer to [neinth](#neinth) for handling your logic;
 * - you can run on your terminal, to starts watching your changes on your `neinth` instances (`export` as `default`) on your `neinthConfig.folderPath`:
 * 
 * ```shell
 * npx neinth
 * ```
 * - neinth only support `.mjs` extention out of the box, but you can still use `.ts` or `.mts` by generating `.mjs` files inside the `neinthConfig.folderPath`
 * 
 */
export { infos } from './src/helpers/infos.export.mjs';
export { neinth } from './src/main/neinth.export.mjs';
export { neinthConfig } from './src/neinthConfig.export.mjs';
export { runtime } from './src/runtime.export.mjs';
/**
 * @template {neinthList} neinthPath
 * @typedef {import('./src/list/neinthList.mjs').getNeinth<neinthPath>} getNeinth
 */
/**
 * @typedef {import('./src/list/neinthList.mjs').neinthList} neinthList
 */