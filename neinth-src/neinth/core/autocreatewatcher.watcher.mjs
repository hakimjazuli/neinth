// @ts-check

import { NeinthWatcher } from 'neinth';

export default new NeinthWatcher({
  relativePath: '/dev/',
  addDirToSet: true,
  addFileToSet: true,
  encoding: 'utf-8',
});
