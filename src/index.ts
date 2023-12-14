import { existsSync, readFileSync } from 'node:fs'

/**
 * Load file from disk and parse into KeyValue object
 * @param file
 * @returns
 */
export function loadAndParse(file: string): Record<string, string> {
  if (!existsSync(file)) {
    throw new Error(`key-value file doesn't exist: ${file}`)
  }
  file = readFileSync(file).toString()
  return parse(file)
}

/**
 * Key-value parsing logic
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
