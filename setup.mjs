// @ts-check

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class setup {
	static __filename = fileURLToPath(import.meta.url);
	static __dirname = path.dirname(setup.__filename);
	static vscode = '.vscode';
	static vsCodeSnippets = path.join(setup.__dirname, setup.vscode);
	static neinth = 'neinth';
	static neinthStarterFolder = path.join(setup.__dirname, setup.neinth);
	static configFile = 'neinth.config.mjs';
	static configFileSrc = path.join(setup.__dirname, setup.configFile);
	static targetDir = process.env.INIT_CWD || process.cwd();
	static run = async () => {
		try {
			await setup.copyFiles(setup.vsCodeSnippets, path.join(setup.targetDir, setup.vscode));
			await setup.copyFiles(setup.neinthStarterFolder, path.join(setup.targetDir, setup.neinth));
			await setup.copyTopFile(setup.configFileSrc, path.join(setup.targetDir, setup.configFile));
			console.log('✅ Starter neinth setup complete!');
		} catch (err) {
			console.error('❌ Error setting up neinth:', err);
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
