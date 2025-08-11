#!/usr/bin/env node
// @ts-check

import { xixth } from 'xixth';
import { TrySync } from 'vivth';
import { writeFileSync, readFileSync } from 'fs';

let autoDocSucced = false;

/**
 * @param {string} packagePath
 * @param {string} packageName
 */
const update = (packagePath, packageName) => {
	const corePath = `${packagePath}/core`;
	new xixth({
		packageName,
		pathCopyHandlers: {
			src: {
				src: corePath,
				dest: corePath,
				on: {
					async failed({ src, dest }) {
						console.error(`🚫 \`neinth\` failed to update "${src}" to "${dest}"`);
					},
					async success({ dest }) {
						console.log(`🆗 \`neinth\` successfully update "${dest}"`);
					},
				},
			},
		},
	});
	return;
};

/**
 * @param {string} packageName
 * @param {string} packagePath
 */
const install = (packagePath, packageName) => {
	new xixth({
		packageName,
		pathCopyHandlers: {
			'neinth-auto-doc': {
				src: 'dev',
				dest: 'dev',
				on: {
					async success() {
						console.log('🆗 successfully add `auto-documentation` to your `dev folder`');
						autoDocSucced = true;
					},
				},
			},
			src: {
				src: packagePath,
				dest: packagePath,
				on: {
					async failed({ src, dest }) {
						console.error(`🚫 \`neinth\` failed to copy "${src}" to "${dest}"`);
					},
					async success({ dest }) {
						console.log(`🆗 \`neinth\` successfully copy "${dest}"`);
					},
				},
			},
		},
		flagCallbacks: {
			async afterCopy() {
				if (autoDocSucced) {
					const [, error] = TrySync(() => {
						const packageJsonPath = this.generateProjectAbsolutePath('package.json');
						const packageJsonString = readFileSync(packageJsonPath).toString();
						const packageJsonObj = JSON.parse(packageJsonString);
						const newScripts = {
							'auto-doc': `node --watch ./dev/${packageName}/auto-doc.mjs`,
						};
						writeFileSync(
							packageJsonPath,
							JSON.stringify({
								...packageJsonObj,
								scripts: { ...packageJsonObj['scripts'], ...newScripts },
							}),
							'utf-8'
						);
					});
					if (error) {
						console.error(error);
					}
				}
			},
		},
	});
};

new xixth({
	packageName: 'neinth',
	pathCopyHandlers: {
		'neinth-snippet': {
			src: '.vscode',
			dest: '.vscode',
			on: {
				async success() {
					console.log('🆗 successfully added `neinth-config` to your `.vscode` snippet');
				},
			},
		},
	},
	flagCallbacks: {
		async beforeCopy({ p = undefined, i = undefined }) {
			if (p === undefined) {
				console.error({
					flag: { p },
					error: 'flag p must be filled',
				});
				return;
			}
			const packageName = p;
			const packagePath = `neinth-src/${packageName}`;
			if (i === undefined) {
				update(packagePath, packageName);
				return;
			}
			install(packagePath, packageName);
		},
	},
});
