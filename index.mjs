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
 * ## installing starter project
 * > you might need to stick to single package manager to run the binary:
 * ```shell
 * npm i neinth
 * npx neinth-starter -p your-package-name
 * ```
 *
 * ## installing distributed `neinth script` project
 * > from symlinked using `link` api of your package manager:
 * - installation:
 * ```shell
 * npm link your-package-name
 * npx neinth-package -i -p your-package-name
 * ```
 * - update:
 * ```shell
 * npx neinth-package -p your-package-name
 * ```
 * > distributed npm library:
 * - installation:
 * ```shell
 * npm i your-package-name
 * npx neinth-package -i -p your-package-name
 * ```
 * - update:
 * ```shell
 * npx neinth-package -p your-package-name
 * ```
 * > the `i` flag are for fresh installation;
 *
 * ## running `neinth-src`
 * - refer to [neinth](#neinth) for handling your logic;
 *
 * ```shell
 * npx neinth
 * ```
 * - neinth only support `.mjs` extention out of the box, but you can still use `.ts` or `.mts` by generating `.mjs` files inside the `neinth-src`
 *
 * ## convenience for distributing `neinth script`
 * dir structure:
 * > `package root`
 * >- `neinth-src`
 * >>- `your-package-name`: must refer to valid distributed `package.json.name`, whether `symlinked` or through `npm`;
 * >>>- `core`: this path are not to be edited by user and are used for when updating distributed packages;
 * >>>- other then `core`: these dirs are to be able to be safely edited, and must not be needed to be auto overwrited when updating, any update that requires modification in any of these dirs must be documented for manual update;
 *
 */
export { infos } from './src/helpers/infos.export.mjs';
export { neinth } from './src/main/neinth.export.mjs';
export { runtime } from './src/runtime.export.mjs';
/**
 * @template {neinthList} neinthPath
 * @typedef {import('./src/list/neinthList.mjs').getNeinth<neinthPath>} getNeinth
 */
/**
 * @typedef {import('./src/list/neinthList.mjs').neinthList} neinthList
 */
