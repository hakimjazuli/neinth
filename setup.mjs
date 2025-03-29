#!/usr/bin/env node
// @ts-check

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tryAsync } from 'vivth';

class setup {
	static __filename = fileURLToPath(import.meta.url);
	static __dirname = path.dirname(setup.__filename);
	static neinth = 'neinth';
	static neinthStarterFolder = path.join(setup.__dirname, setup.neinth);
	static neinthWatch = 'neinth-watch';
	static neinthWatchStarterFolder = path.join(setup.__dirname, setup.neinthWatch);
	static configFile = 'neinth.config.mjs';
	static configFileSrc = path.join(setup.__dirname, setup.configFile);
	static targetDir = process.env.INIT_CWD || process.cwd();
	static run = async () => {
		const [_, error] = await tryAsync(async () => {
			await setup.copyFiles(setup.neinthStarterFolder, path.join(setup.targetDir, setup.neinth));
			await setup.copyFiles(
				setup.neinthWatchStarterFolder,
				path.join(setup.targetDir, setup.neinthWatch)
			);
			await setup.copyTopFile(setup.configFileSrc, path.join(setup.targetDir, setup.configFile));
			console.log('✅ Starter neinth setup complete!');
		});
		if (error) {
			console.error('❌ Error setting up neinth:', error);
		}
	};
	/**
	 * @param {string} src
	 * @param {string} dest
	 */
	static copyTopFile = async (src, dest) => {
		await fs.copyFile(src, dest);
	};
	/**
	 * @param {string} src
	 * @param {string} dest
	 */
	static copyFiles = async (src, dest) => {
		await fs.mkdir(dest, { recursive: true });
		const entries = await fs.readdir(src, { withFileTypes: true });
		if (entries.length === 0) {
			console.log(`📁 Created empty directory: ${dest}`);
			return;
		}
		for (const entry of entries) {
			const srcPath = path.join(src, entry.name);
			const destPath = path.join(dest, entry.name);
			if (entry.isDirectory()) {
				await this.copyFiles(srcPath, destPath);
			} else {
				await fs.copyFile(srcPath, destPath);
				console.log(`📄 Copied: ${entry.name}`);
			}
		}
	};
}

setup.run();
