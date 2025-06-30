// @ts-check

/**
 * @typedef {Object} writeFileType
 * @property {string} relativePathFromProjectRoot
 * @property {Object} template
 * @property {string} [template.string]
 * @property {{[globalMultilineRegexString:string]:string}} [template.modifier]
 * - globalMultilineRegexString are allready flagged with `gm`;
 * @property { BufferEncoding | null | undefined } [encoding]
 */
