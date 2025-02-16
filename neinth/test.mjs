// @ts-check

import { neinth } from 'neinth';

export default new neinth('neinth-starter/test.php', async ({ import_, fullPath }) => {
	/**
	 * @type {import('./import_test.mjs')['default']}
	 */
	const name = await import_('./import_test.mjs');
	return `<?php 

class ${name.className} {
/**
 * written into ${fullPath}
 */  
}`;
});
