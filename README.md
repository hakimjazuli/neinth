## neinth code manager
- is a code management library:
>- to act as intermediary translation layer for your own runtime framework/language;
- is a `devTool` that optimize your dev time `JS` `runtime` execution:
>- during your developement time using `neinth`, the `NeintRuntimeInstance` dynamically and renew imports `neinthScritps` as you write and saves;
>- making it technically more efficient then using build in js `runtime` `--watch`, since with `neinth`, your `JS` `runtime`  doesn't need to run full code again when changes happens;

## installing starter project
> you might need to stick to single package manager to run the binary, (such as `bun`/`bunx` or others):
```shell
npm i neinth
npx neinth-starter -p your-package-name
```

## installing distributed `neinth script` project
> from symlinked using `link` api of your package manager,

> ⚠⚠⚠ the `i` flag are for fresh installation, and might overwrite same name file, suggested to rename the every other than `core` `dir` into something else; ⚠⚠⚠
- ⚠⚠⚠ installation ⚠⚠⚠:
```shell
npm link your-package-name
npx neinth-package -p your-package-name -i
```
- update:
```shell
npx neinth-package -p your-package-name
```
> distributed npm library:
- ⚠⚠⚠ installation ⚠⚠⚠:
```shell
npm i your-package-name
npx neinth-package -p your-package-name -i
```
- update:
```shell
npm i your-package-name
npx neinth-package -p your-package-name
```

## running `neinth-src`
- refer to [NeinthComponent](#neinthcomponent) for handling your logic;

```shell
npx neinth
```
- neinth only support `.mjs` extention out of the box, but you can still use `.ts` or `.mts` by generating `.mjs` files inside the `neinth-src`

## convenience for distributing `neinth script`
dir structure:
> `package root`
>- `neinth-src`
>>- `your-package-name`: must refer to valid distributed `package.json.name`, whether `symlinked` or through `npm`;
>>>- `core`: this path are not to be edited by user and are used by dev for when updating distributed packages;
>>>- other then `core`: these dirs are to be able to be safely edited, and must not be needed to be auto overwrited when updating, any update that requires modification in any of these dirs must be documented for manual update;

## further documentation and example
- use cases will be posted at [html-first/neinth](https://html-first.bss.design/);

## .vscode snippets:
- `>>Neinth_Config`:
>- use to generate config class file, importable via options `listenToNeinth`;
>- can also be used for autodocumentation, via [@html_first/js_lib_template](https://www.npmjs.com/package/@html_first/js_lib_template);
- `>>Neinth_Module`:
>- to generate neinth instance for modules;
- `>>Neinth_Watcher`:
>- generate `reactive` chokidar watcher, fully managed via `neinthScript`;
>- auto-notify on `all` event to any `neinth module` importing it via `listenToNeinth`;
- `>>Neinth_UpdateValue`:
>- typehint helper for updating the value;
- `>>Neinth_UpdateValue$`:
>- typehint helper for updating the value;
>- also an `vivth.$`;
- `>>Neinth_Worker`:
>- generate worker defintion file string;
>- should be named `${fileName}.worker.mjs`;
- `>>Neinth_GetShared`:
>- generate typehelper for getSharedData;
- `>>Neinth_SetShared`:
>- generate typehelper for setSharedData;
## version
- `-0.10.x`:
>- the `arg0` are `Effect`, therefore main function will rerun on listener/importers `autosubscribed` `Signals`;
- `0.11.x`:
>- class renames;
>- `Effects` are now callables via `this.new$` or `this.updateValue$`, for more granularity on `autoSubscribed` `Signals`;
>- this version is likely to be used as standards for future releases;
## main classes for instantition:
- [NeinthComponent](#neinthcomponent): as main logic;
- [NeinthWatcher](#neinthwatcher): as helper for watcher;
- [NeinthWorker](#neinthworker): as `workerThread` wrapper;

## exported-helpers
- [Infos](#infos)
- [StdInHandler](#stdinhandler)
- [NeinthComponent](#neinthcomponent)
- [PassiveSignal](#passivesignal)
- [SetOfFiles](#setoffiles)
- [NeinthWatcher](#neinthwatcher)
- [DataWorkers](#dataworkers)
- [NeinthWorker](#neinthworker)
- [WorkerContract](#workercontract)
<h2 id="infos">Infos</h2>

- class typeHelper for file infos using [neinthWatcher](#neinthwatcher);- containts `Dirent` and additional usefull property for the returned `file/dir`;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="stdinhandler">StdInHandler</h2>

- class wrapper for several statics, mainly for handling `stdInput`;- provides `listenToStdIn` functionality;- exported for more concise IDE for `bufferToStrings` static method;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="neinthcomponent">NeinthComponent</h2>

- is an extended Signal `PassiveSignal`;```js/** * @template returnedValue * @template sharedType * @extends {PassiveSignal<returnedValue>} */```- can be autoSubcribed by `Effect`/;- constructor no longer get `handlers` as parameters:>- `handlers` can be accessed via `this` inside `constructor` `arg0`;>>- `runInstanceFallback`: `fallback` to be called when `error` occures by some implementation(eg. server crash);>>- `instancePath`: `getter` for `relativePath` of current `NeinthComponent` to `projectRoot`;>>- `newSignal`: local state management, for two way communication;>>- `updateValue`: notify changes to all `NeinthComponentInstance` subscribers, one way communication;>>- `updateValue$`: `vivth.$` to unwrap listeners `.value` `getter`, uses returned value to notify changes to all `NeinthComponentInstance` subscribers, one way communication, is to be used as return value;>>- `new$`: `vivth.$` to unwrap listeners `.value` `getter` return void;>>- `SetOfFiles`: `Set` instance generator to be used by `synchronizeFiles`;>>- `synchronizeFiles`: neinth provide no individual fileWritter as you might need to manage write and unlink upon cleanup, and it can be quickly unmanageable if the file is then be written again anyway.>>- `listenToNeinth`: get `proxy` `PassiveSignal` for `NeinthComponent`;>>- `listenToStdIn`: `PassiveSignal<Buffer>` listened from `StdIn`;>>- `generateWatcher`: generate `NeinthWatcher` to same dir same basename with `.watcher.mjs` `extention`;>>- `listenToGeneratedWatcher`: call `listenToNeinth` targetting `generateWatcher` generated `NeinthWatcher` of the same `NeinthComponent`;>>- `indentedString`: add indentation on each line;>>- `bufferToStrings`: convert `Buffer` to `Array<string>`;>>- `bufferToCLIStrings`: the same as `bufferToStrings` however with `CLI` `abstraction` helpers;>>- `normalizePath`: convert string `\` to `/`;>>- `resolveProjectPath`: relative project path to machine absolute;>>- `importWorker`: for non blocking `process`, or just any long `process` requiring it's own thread, implemented with typehinting, trycatched into `{result, error}` object for consistency and types;>>- `getSharedData`: `get` previous data on `shared`, usefull for handling through NeinthComponent lifecycle, or on `vivth.$`;>>- `setSharedData`: `set` `shared` object, usefull for handling through NeinthComponent lifecycle, or on `vivth.$`;>>- `withCleanUp`: `NeinthComponentInstance` lifecycle management, for setting up cleanup callbacks;>>- `safeUniquePing`: wrap callback in `vivth.NewPingUnique` and `vivth.tryAsync`, to safely run them and debounce it's call:>>>- don't unwrap `SignalInstance.value` inside this `callback` as it will be out of scope;- further documentation on [html-first/neinth](https://html-first.bss.design/)

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="passivesignal">PassiveSignal</h2>

```js/** * @template V * @extends Signal<V> */```- deliberate jsdoc lock for `value` assignment, require to be bypassed with `// @ts-expect-error`, if necessary;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="setoffiles">SetOfFiles</h2>

- constructor helper for createing structured SetInstance for `neinth.handlers.synchronizeFiles`;>- `neinth.handlers.synchronizeFiles` are `storage read heavy` for `synchronization` purposes;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="neinthwatcher">NeinthWatcher</h2>

```js/** * @typedef {Object} NeinthWatcherOptions * @property {string} relativePath * @property {boolean} addFileToSet * @property {boolean} addDirToSet * @property {BufferEncoding} [encoding] *//** * @extends NeinthComponent<{watcherOptions:NeinthWatcherOptions, infos:Set<Infos>}> */```- export `NeinthWatcherInstance` as default on `neitnh-src/**/*` to be used as `directory/file` watcher;- `neinthWatcher` uses `chokidar` under the hood;- this is a simplified helper for `FSwatcher`, you can always implement your own extended `NeinthComponent`, however once your class works as you intended recomended to export outside `neinth-src`, so it's not treated as dynamic module;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="dataworkers">DataWorkers</h2>

- placeholder for `Workers` management;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="neinthworker">NeinthWorker</h2>

- instance constructor for `workerThread`;- by creating `fileName.worker.mjs`, inside `neinth-src` you can generate worker definition file via `instantiation`;>- can be used on `NeinthComponent` by calling `this.importWorker('workerPath')`;>- the return value is a `PassiveSignal`, so you need to unwrap the `.value` `getter` inside `this.new$` then if result is to be used to change `NeinthComponentInstance` `value` you can use `this.updateValue`;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="workercontract">WorkerContract</h2>

- placeholder for `Workers` `typehints` on `mainThread`;

*) <sub>[go to exported list](#exported-helpers)</sub>
