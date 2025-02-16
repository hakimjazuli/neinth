## neinth code manager
is a simple code management library;

## how to install
import using npm
```shell
npm i neinth
```
it is important to use `npm`, so you can get starter project;

## snippet
- `neinthImport_` can be used inside neinth instance declaration for typehintin of `neinth` managed imports;

## how to use
- refer to [neinthManage](#neinthmanage) for `configuration`;
- refer to [neinth](#neinth) for `file handlers`;
- when everything is ready, you can run on your terminal:

```shell
neinth
```

## exported-api
- [neinth](#neinth)
- [neinthManage](#neinthmanage)
<h2 id="neinth">neinth</h2>

- inside the `folderPath` inputed in the [neinthManage](#neinthmanage) create file handlers by exporting default of this class instance;```js// @ts-checkimport { neinth } from 'neinth';export default new neinth({...options});// orexport default neinth.loop({...options});```- options is typehinted;

*) <sub>[go to exported list](#exported-api)</sub>

<h2 id="neinthmanage">neinthManage</h2>

- if you install it using `npm`, you can find the implementation in the `./neinth.config.mjs`;- as of now we only read the config from `./neinth.config.mjs`, no other extention;- you can manually create it and fill it with:```js// @ts-checkimport { neinthManage } from 'neinth';export default new neinthManage({	folderPath: './neinth',});```and inside

*) <sub>[go to exported list](#exported-api)</sub>
