#!/usr/bin/env node
// @ts-check

import { xixth } from 'xixth';

new xixth({
	packageName: 'neinth',
	pathCopyHandlers: {
		config: {
			src: 'neinth.config.mjs',
			dest: 'neinth.config.mjs',
		},
		neinth: {
			src: 'neinth',
			dest: 'neinth',
		},
		neinthWatch: {
			src: 'neinth-watch',
			dest: 'neinth-watch',
		},
	},
});
