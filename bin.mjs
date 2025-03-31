#!/usr/bin/env node

// @ts-check

import { runtime } from 'neinth/src/runtime.export.mjs';
import { xixth } from 'xixth';

new xixth({
	packageName: 'neinth',
	flagCallbacks: {
		async beforeCopy() {
			new runtime();
		},
	},
});
