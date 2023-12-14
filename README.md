# key-value-parser

Simple key-value parser

Given a KEY=value string, this parser will strip comments and empty lines and return a plain javascript object. For example, given
the following input:

```txt
# This is an example file

MONGODB_HOST=mymongohost.example.com
MONGODB_USER=username
MONGODB_PASSWORD=bingo # this is an inline comment

# If you need to preserve leading or trailing white space, you need to use quotes
WITH_WHITE_SPACE = ' Hello '

INFO_TEXT = 'This is a multiline
value. It can contain quotes other than the
quotes surrounding it; " for instance. Or you
can escape it: \' ' # this is a trailing comment
```

You will get the following object back:

```json
{
  "MONGODB_HOST": "mymongohost.example.com",
  "MONGODB_USER": "username",
  "MONGODB_PASSWORD": "bingo",
  "WITH_WHITE_SPACE": " Hello ",
  "INFO_TEXT": `This is a multiline
value. It can contain quotes other than the
quotes surrounding it; " for instance. Or you
can escape it: ' `
}
```

## Usage

If you already have your key-values in a string, you can pass it tot the `parse`-function:

```typescript
import { parse } from 'key-value-parser'

const mydata = `
# This is an example file

MONGODB_HOST=mymongohost.example.com
MONGODB_USER=username
MONGODB_PASSWORD=bingo # this is an inline comment

`
const parsed = parse(mydata)
```

There's also a convenience function for loading and parsing a file from disk:

```typescript
import { loadAndParse } from 'key-value-parser'

const myfile = '.env'
const parsed = loadAndParse(myfile)
```

## Type safety

The parsed data is always in the form of `Record<string, string>`. If you want to add type safety, I highly recommend [zod](https://github.com/colinhacks/zod). Here's an example:

```typescript
import { z } from 'zod'
import { loadAndParse } from 'key-value-parser'

/**
 * Zod preprocessor
 * Accept strings, floats or ints, but output ints
 */
export const StringToIntSchema = z.preprocess((arg) => {
  if (typeof arg === 'number') {
    return Math.round(arg)
  } else if (typeof arg === 'string') {
    return parseInt(arg)
  }
  return arg
}, z.number().int())

// The expected schema
export const EnvSchema = z.object({
  SERVER_HOST: z.string(),
  SERVER_PORT: StringToIntSchema,
})

let env: z.infer<typeof EnvSchema>

try {
  const parsed = loadAndParse('.env')
  env = EnvSchema.parse(parsed)
  nodeEnv = NodeEnvSchema.parse(process.env.NODE_ENV)
} catch (error) {
  console.error('Error loading .env file')
  console.error(error)
  process.exit()
}

/***
 * The exported data is guaranteed to have the following shape:
 * {
 *   SERVER_HOST: string
 *   SERVER_PORT: number
 * }
 *
 * and SERVER_PORT is even guaranteed to be an integer
 */
export { env }
```
