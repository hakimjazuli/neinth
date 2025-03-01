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
 * import using npm
 * ```shell
 * npm i neinth
 * ```
 * it is important to use `npm`, so you can get starter project;
 * 
 * ## how to use
 * - refer to [neintConfig](#neinthconfig) for `configuration`;
 * - refer to [neinth](#neinth) for handling your logic;
 * - you can run on your terminal, to starts watching your changes on your `neinth` instances (`export` as `default`) on your `neinthConfig.folderPath`:
 * 
 * ```shell
 * npx neinth
 * ```
 * or
 * ```shell
 * bunx neinth
 * ```
 * - neinth only support `.mjs` extention out of the box, but you can still use `.ts` or `.mts` by generating `.mjs` files inside the `neinthConfig.folderPath`
 * 
 */
export { infos } from './src/helpers/infos.export.mjs';
export { neinth } from './src/main/neinth.export.mjs';
export { neinthConfig } from './src/neinthConfig.export.mjs';
/**
 * @template {neinthList} neinthPath
 * @typedef {import('./src/list/neinthList.mjs').getNeinth<neinthPath>} getNeinth
 */
/**
 * @typedef {import('./src/list/neinthList.mjs').neinthList} neinthList
 */