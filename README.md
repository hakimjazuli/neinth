## neinth code manager
is a simple code management library;
it helps you generates code programatically;

## how to install
```shell
npm i neinth
npx neinth-starter
```
you might need to stick to single package manager to run the binary

## how to use
- refer to [neintConfig](#neinthconfig) for `configuration`;
- refer to [neinth](#neinth) for handling your logic;
- you can run on your terminal, to starts watching your changes on your `neinth` instances (`export` as `default`) on your `neinthConfig.folderPath`:

```shell
npx neinth
```
- neinth only support `.mjs` extention out of the box, but you can still use `.ts` or `.mts` by generating `.mjs` files inside the `neinthConfig.folderPath`

## exported-helpers
- [infos](#infos)
- [neinth](#neinth)
- [neinthConfig](#neinthconfig)
<h2 id="infos">infos</h2>

- class typeHelper for file infos using `neinth` options, `getInfos`;- containts `Dirent` and additional usefull property for the returned `file/dir`;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="neinth">neinth</h2>

- export `neinth` instance as default on your `neinthConfig` `folderPath` (only supports `.mjs` file extention);```js// @ts-checkimport { neinth } from 'neinth';export default new neinth ( async ({ ...options }) => {	// your code;	// might return anything,	// which then can be listened to	// from other `neinth` instance	// by using `importNeinth`;})```- `options` are collections of `functions` that are essential and integrated to the `neinth` functionalities such as it's auto `cleanUp`:>- `writeFile`: safely write files and monitor it's produced filepath, if the name changed for any reason, the old one will be removed;>- `stringWithIndent`: replace all new line with given `indent`, usefull to generate code that written to the language where indentation dictates the interpreter/compiler direction (eg. python);>- `normalizePath`: replace path back-slash '\\' to forward-slash '/';>- `relativeToProjectAbsolute`: as it is named, and also auto process the string with `normalizePath`;>- `importNeinth`: generate `Signal` of returned value of the imported neinth callback, at first the value is set to be `undefined`;>- `getInfos`: generate `Signal<Set<infos>>`, at first the value is set to be `undefined`;>- `onCleanUp`: add callback to `neinth` `cleanUp` event;- `cleanUp` event are called during changes of `neinth` instance file, including `add`, `change` and `unlink`;- `neinth` callback argument is basically an effect (vivth $), that will autosubscribe to the `SignalInstance.value` `getter` you access inside it;- further documentation and example of use cases will be posted at [html-first/neinth](https://html-first.bss.design/)

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="neinthconfig">neinthConfig</h2>

- class helper to setup config on the `projectRoot`, instantiate at `neinth.config.mjs`;- includes>- ./neinth.config.mjs>- ./neinth/>- ./neinth-watch/

*) <sub>[go to exported list](#exported-helpers)</sub>
