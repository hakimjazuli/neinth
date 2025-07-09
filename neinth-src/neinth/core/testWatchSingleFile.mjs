// @ts-check

import { NeinthWatcher } from 'neinth';

export default new NeinthWatcher({
	relativePath: '/index.mjs',
	addDirToSet: false,
	addFileToSet: true,
	encoding: 'utf8',
});
