## neinth code manager
is a simple code management library;
it helps you generates code programatically;

## installing starter project
> you might need to stick to single package manager to run the binary:
```shell
npm i neinth
npx neinth-starter -p your-package-name
```

## installing distributed `neinth script` project
> from symlinked using `link` api of your package manager:
- installation:
```shell
npm link your-package-name
npx neinth-package -p your-package-name -i
```
- update:
```shell
npx neinth-package -p your-package-name
```
> distributed npm library:
- installation:
```shell
npm i your-package-name
npx neinth-package -p your-package-name -i
```
- update:
```shell
npx neinth-package -p your-package-name
```
> the `i` flag are for fresh installation;

## running `neinth-src`
- refer to [neinth](#neinth) for handling your logic;

```shell
npx neinth
```
- neinth only support `.mjs` extention out of the box, but you can still use `.ts` or `.mts` by generating `.mjs` files inside the `neinth-src`

## convenience for distributing `neinth script`
dir structure:
> `package root`
>- `neinth-src`
>>- `your-package-name`: must refer to valid distributed `package.json.name`, whether `symlinked` or through `npm`;
>>>- `core`: this path are not to be edited by user and are used for when updating distributed packages;
>>>- other then `core`: these dirs are to be able to be safely edited, and must not be needed to be auto overwrited when updating, any update that requires modification in any of these dirs must be documented for manual update;

## exported-helpers
- [infos](#infos)
- [neinth](#neinth)
<h2 id="infos">infos</h2>

- class typeHelper for file infos using `neinth` options, `getInfos`;- containts `Dirent` and additional usefull property for the returned `file/dir`;

*) <sub>[go to exported list](#exported-helpers)</sub>

<h2 id="neinth">neinth</h2>

- snippets:>- `>>neinth_config`;>- `>>neinth_module`;```js// @ts-checkimport { neinth } from 'neinth';export default new neinth ( async ({ ...options }) => {	// your code;	// might return anything,	// which then can be listened to	// from other `neinth` instance	// by using `importNeinth`;})```- `options` are collections of `functions` that are essential and integrated to the `neinth` functionalities such as it's auto `cleanUp`:>- `writeFile`: safely write files and monitor it's produced filepath, if the name changed for any reason, the old one will be removed;>- `stringWithIndent`: replace all new line with given `indent`, usefull to generate code that written to the language where indentation dictates the interpreter/compiler direction (eg. python);>- `normalizePath`: replace path back-slash '\\' to forward-slash '/';>- `relativeToProjectAbsolute`: as it is named, and also auto process the string with `normalizePath`;>- `importNeinth`: generate `Signal` of returned value of the imported neinth callback, at first the value is set to be `undefined`;>- `getInfos`: generate `Signal<Set<infos>>`, at first the value is set to be `undefined`;>>- make sure to only call the `.value` getter, after checks that `infos` is `truthy`;>- `onCleanUp`: add callback to `neinth` `cleanUp` event;- `cleanUp` event are called during changes of `neinth` instance file, including `add`, `change` and `unlink`;- `neinth` callback argument is basically an effect (vivth $), that will autosubscribe to the `SignalInstance.value` `getter` you access inside it;- further documentation and example of use cases will be posted at [html-first/neinth](https://html-first.bss.design/)

*) <sub>[go to exported list](#exported-helpers)</sub>
