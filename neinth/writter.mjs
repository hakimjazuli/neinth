// @ts-check

import { neinth } from 'neinth';

export default new neinth(async ({ writeFile, importNeinth }) => {
	const value = importNeinth('neinth/lib.mjs').value;
	if (!value) {
		return;
	}
	const path = `/neinth-test/${value.className}.php`;
	writeFile({
		relativePathFromProjectRoot: path,
		template: {
			string: '/dev/test.php',
			modifier: {
				PHPCLASSNAME: value.className,
				['static \\$FUNCTIONDEF;']: `static function hehe() {
		// code from content.modifier;
}`,
			},
		},
	});
});
