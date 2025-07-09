// @ts-check

import { NeinthRuntime } from '../NeinthRuntime.mjs';
import { trySync } from 'vivth';
import { unlinkSync } from 'fs';

/**
 * @typedef {import('neinth').writeFileType} writeFileType
 * @typedef {import('./NeinthComponent.mjs').NeinthComponent} NeinthComponent
 */

/**
 * @description
 * - constructor helper for createing structured SetInstance for `neinth.handlers.synchronizeFiles`;
 * >- `neinth.handlers.synchronizeFiles` are `storage read heavy` for `synchronization` purposes;
 */
/**
 * @extends Set<writeFileType>
 */
export class SetOfFiles extends Set {
	/**
	 * @typedef {import('fs').PathLike} PathLike
	 */
	/**
	 * @typedef {import('./list/NeinthList.mjs').NeinthList} NeinthList
	 * @typedef {`${NeinthList}:${string}`} idType
	 */
	/**
	 * @param {...writeFileType} [setOfWriteFileType]
	 */
	constructor(...setOfWriteFileType) {
		super(setOfWriteFileType ?? []);
	}
	/**
	 * @private
	 * @type {Map<idType, Set<PathLike>>}
	 */
	static mapped = new Map();
	/**
	 * @private
	 * @param {idType} id
	 * @param {Set<PathLike>} newSet
	 */
	static assign = (id, newSet) => {
		const { mapped } = SetOfFiles;
		mapped.set(id, newSet);
	};
	/**
	 * @private
	 * @param {idType} id
	 * @returns {Set<PathLike>}
	 */
	static get = (id) => {
		const { mapped } = SetOfFiles;
		if (!mapped.has(id)) {
			SetOfFiles.assign(id, new Set());
		}
		return mapped.get(id);
	};
	/**
	 * @param {NeinthList} neinthList
	 */
	static unlink = (neinthList) => {
		const absoluteNeinthPath = NeinthRuntime.resolveProjectPath(neinthList);
		SetOfFiles.mapped.forEach((paths_, neinthListOfTheID) => {
			if (!neinthListOfTheID.startsWith(neinthList)) {
				return;
			}
			paths_.forEach((path_) => {
				const [_, error] = trySync(() => {
					unlinkSync(path_);
				});
				if (!error) {
					return;
				}
				console.error(`"${absoluteNeinthPath}", error on unlinking:"${path_}"`);
			});
		});
	};
	/**
	 * - dynamically `synchronize`(`generate` and `unlink`) `files`;
	 * -neinth provide no individual fileWritter as you might need to manage write and unlink upon cleanup, and it can be quickly unmanageable if the file is then be written again anyway;
	 * @param {NeinthComponent["instancePath"]} neinthInstancePath
	 * @param {NeinthComponent["withCleanUp"]} withCleanUp
	 * @param {string} id
	 * - should be hard coded and static to be correctly managed.
	 * - must be unique inside the `neinth.asyncHandler`;
	 * @param {SetOfFiles} SetOfFilesInstance
	 * - use `SetOfFiles` to generate the `SetInstance`
	 * @returns {void}
	 */
	static synchronizeFiles = (neinthInstancePath, withCleanUp, id, SetOfFilesInstance) => {
		withCleanUp(async () => {
			SetOfFiles.write(neinthInstancePath, id, SetOfFilesInstance);
			return {
				onUnlink: async () => {
					SetOfFiles.unlink(neinthInstancePath);
				},
			};
		});
	};
	/**
	 * @private
	 * @param {writeFileType} writeFile
	 * @returns {void}
	 */
	static writeFiles = ({ relativePathFromProjectRoot, template, encoding }) => {
		const { writeFileSafe, resolveProjectPath } = NeinthRuntime;
		const fullPath = resolveProjectPath(relativePathFromProjectRoot);
		const contentModifier = template.modifier ?? {};
		let content_ = template.string ?? '';
		if (contentModifier) {
			for (const oldString in contentModifier) {
				const newString = contentModifier[oldString];
				content_ = content_.replace(new RegExp(oldString, 'gm'), newString);
			}
		}
		writeFileSafe(fullPath, content_, encoding);
	};
	/**
	 *
	 * @param {NeinthList} path_
	 * @param {string} id
	 * @param  {SetOfFiles} writeFileInstance
	 */
	static write = (path_, id, writeFileInstance) => {
		/**
		 * @type {idType}
		 */
		const ID = `${path_}:${id}`;
		const filesSet = new Set();
		const previousWritten = new Set(SetOfFiles.get(ID));
		writeFileInstance.forEach((SetOfFilesInstance) => {
			SetOfFiles.writeFiles(SetOfFilesInstance);
			filesSet.add(SetOfFilesInstance.relativePathFromProjectRoot);
		});
		previousWritten.forEach((filePath) => {
			if (filesSet.has(filePath)) {
				return;
			}
			const [_, error] = trySync(() => {
				unlinkSync(NeinthRuntime.resolveProjectPath(filePath.toString()));
			});
			if (!error) {
				return;
			}
			console.error({
				error: NeinthRuntime.parseError(error),
				message2: `unable to unlink:"${filePath}"`,
			});
		});
		SetOfFiles.assign(ID, filesSet);
	};
}
