import { existsSync, readFileSync } from 'node:fs'

/**
 * Load and parse a key-value file from disk.
 *
 * Verifies that the path exists, reads the file as UTF-8 text and delegates to parse().
 *
 * @param file Path to the key-value file to load
 * @throws Error if the file does not exist
 * @returns Object mapping keys to their parsed values
 */
export function loadAndParse(file: string): Record<string, string> {
  if (!existsSync(file)) {
    throw new Error(`key-value file doesn't exist: ${file}`)
  }
  file = readFileSync(file).toString()
  return parse(file)
}

/**
 * Parse a string containing key-value pairs into an object.
 *
 * Supported syntax per line:
 * - key = value
 * - Keys can contain letters, digits, underscore, dot and hyphen
 * - Values can be unquoted or wrapped in single/double/backtick quotes
 * - Quoted values preserve whitespace and can contain escaped quotes
 * - Lines starting with # are treated as comments
 * - Blank lines are ignored
 *
 * Examples:
 * ```
 * FOO=bar
 * PATH="/some/path with spaces"
 * NOTE='contains \'quotes\''
 * ```
 *
 * @param src Text content to parse (file contents or raw string)
 * @returns Object mapping keys to their parsed values
 */
export function parse(src: string): Record<string, string> {
  const obj: Record<string, string> = {}
  const rxKeyValue =
    /^[ \t]*([\w.-]+)[ \t]*=[ \t]*('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`|[^#\n]*)[ \t]*(?:#.*)?$/gm

  // Normalize line breaks
  const lines = src.replace(/\r\n?/gm, '\n')

  let match
  while ((match = rxKeyValue.exec(lines)) !== null) {
    const key = match[1]
    const value = (match[2] || '').trim()

    // Strip surrounding quotes while preserving whitespace within quotes
    obj[key] = stripSurroundingQuotes(value)
  }

  return obj
}

/**
 * Strip surrounding quotes, and unescape content
 */
function stripSurroundingQuotes(value: string) {
  const rx = /^(['"`])([\s\S]*)\1$/gm
  if (rx.test(value)) {
    const quoteChar = value.substring(0, 1)
    const rxUnescape = new RegExp(`\\\\${quoteChar}`, 'gm')
    return value
      .replace(/^(['"`])([\s\S]*)\1$/g, '$2')
      .replaceAll(rxUnescape, quoteChar)
  } else {
    return value
  }
}
