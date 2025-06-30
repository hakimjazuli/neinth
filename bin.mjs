#!/usr/bin/env node

// @ts-check

import { NeinthRuntime } from 'neinth/src/NeinthRuntime.mjs';
import { xixth } from 'xixth';

new xixth({
	packageName: 'neinth',
	flagCallbacks: {
		async beforeCopy({ dev: neinthCoreDev }) {
			new NeinthRuntime(neinthCoreDev);
		},
	},
});
