import { existsSync, readFileSync } from 'node:fs'

export interface KeyValue {
  [key: string]: string
}

/**
 * Load file from disk and parse into KeyValue object
 * @param file
 * @returns
 */
export function loadAndParse(file: string): KeyValue {
  if (!existsSync(file)) {
    throw new Error(`key-value file doesn't exist: ${file}`)
  }
  file = readFileSync(file).toString()
  return parse(file)
}

/**
 * Key-value parsing logic
 */
export function parse(src: string): KeyValue {
  const obj: KeyValue = {}
  const rxKeyValue =
    /^\s*([\w.-]+)\s*=\s*('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`|[^#\n]+)?\s*(?:#.*)?$/gm

  // Normalize line breaks
  const lines = src.replace(/\r\n?/gm, '\n')

  let match
  while ((match = rxKeyValue.exec(lines)) !== null) {
    const key = match[1]
    const value = (match[2] || '').trim()

    // Strip surrounding quotes while preserving whitespace within quotes
    obj[key] = value.replace(/^(['"`])([\s\S]*)\1$/g, '$2')
  }

  return obj
}
