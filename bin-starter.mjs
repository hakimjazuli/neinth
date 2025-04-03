#!/usr/bin/env node
// @ts-check

import { xixth } from 'xixth';
import { renameSync, readFileSync, writeFileSync } from 'fs';
import { trySync } from 'vivth';

const packageName = 'neinth';
let goToRename = false;
let autoDocSucced = false;

new xixth({
	packageName: 'neinth',
	pathCopyHandlers: {
		neinthSrc: {
			src: 'neinth-src',
			dest: 'neinth-src',
			on: {
				async success() {
					goToRename = true;
				},
			},
		},
		neinthWatch: {
			src: 'neinth-watch',
			dest: 'neinth-watch',
		},
		'neinth-snippet': {
			src: '.vscode',
			dest: '.vscode',
			on: {
				async success() {
					console.log('🆗 successfully added `neinth-config` to your `.vscode` snippet');
				},
			},
		},
		'neinth-auto-doc': {
			src: 'dev',
			dest: 'dev',
			on: {
				async success() {
					console.log('🆗 successfully added `auto-documentation` to your `dev folder`');
					autoDocSucced = true;
				},
			},
		},
	},
	flagCallbacks: {
		async afterCopy({ p = packageName }) {
			if (!goToRename) {
				return;
			}
			if (autoDocSucced) {
				const [, error] = trySync(() => {
					const packageJsonPath = this.generatePackageAbsolutePath('package.json');
					const packageJsonString = readFileSync(packageJsonPath).toString();
					const packageJsonObj = JSON.parse(packageJsonString);
					const newScript = {
						'auto-doc': 'bun --watch ./dev/neitnth/auto-doc.mjs',
					};
					writeFileSync(
						packageJsonPath,
						JSON.stringify({
							...packageJsonObj,
							script: { ...packageJsonObj['script'], ...newScript },
						}),
						'utf-8'
					);
				});
				if (error) {
					console.error(error);
				}
			}
			const packageName_ = `neinth-src/${packageName}}`;
			const realPackageName = `neinth-src/${p}}`;
			const [, error] = trySync(() => {
				renameSync(
					this.generateProjectAbsolutePath(packageName_),
					this.generateProjectAbsolutePath(realPackageName)
				);
			});
			if (error) {
				console.error(`🚫 \`neinth\` failed to rename to real packageName`);
				return;
			}
			console.log(`🆗 \`neinth\` success to rename to "${realPackageName}"`);
		},
	},
});
