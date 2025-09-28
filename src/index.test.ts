import { strict as assert } from 'node:assert'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { loadAndParse, parse } from './index.js'

describe('.env parser', () => {
  it('should handle leading and trailing white space', () => {
    const keyValues = `noLeadingOrTrailing=one
 leadingWhitespace=two
trailingWhitespace=three    
  leadingAndTrailing=four   
`
    const parsed = parse(keyValues)
    assert.deepStrictEqual(parsed, {
      noLeadingOrTrailing: 'one',
      leadingWhitespace: 'two',
      trailingWhitespace: 'three',
      leadingAndTrailing: 'four',
    })
  })

  it('should handle comments and empty lines', () => {
    const keyValues = `
# here's a comment
noLeadingOrTrailing=one

    #This= is a comment with an equal sign
 leadingWhitespace=two
trailingWhitespace=three    # Here's a trailing comment
  leadingAndTrailing=four   
`
    const parsed = parse(keyValues)
    assert.deepStrictEqual(parsed, {
      noLeadingOrTrailing: 'one',
      leadingWhitespace: 'two',
      trailingWhitespace: 'three',
      leadingAndTrailing: 'four',
    })
  })

  it('should handle three types of quotes, and multiline values', () => {
    const keyValues = `singleQuotes='one'

doubleQuotes="two"
backticks=\`three\`    # Here's a trailing comment

multiline='one
"two"
three'

   multiline2   =    'one
two # this is not a comment
three'

`
    const parsed = parse(keyValues)
    assert.deepStrictEqual(parsed, {
      singleQuotes: 'one',
      doubleQuotes: 'two',
      backticks: 'three',
      multiline: `one
"two"
three`,
      multiline2: `one
two # this is not a comment
three`,
    })
  })

  it('should handle key-value pairs and comments with hashtags and equal signs', () => {
    const envFile = `# This is my .env file

withQuotes='five'
withEqualSign="six=seven"
withEqualSign2=six=seven
withTrailingComment=eight # this is a comment
withHash="nine # ten"

multi="apa
boll
cykel" # ignore this comment

# comment=bingo

empty=   ''
whitespace = ' eleven '

`

    const parsed = parse(envFile)
    assert.deepStrictEqual(parsed, {
      withQuotes: 'five',
      withEqualSign: 'six=seven',
      withEqualSign2: 'six=seven',
      withTrailingComment: 'eight',
      withHash: 'nine # ten',
      multi: `apa
boll
cykel`,
      empty: '',
      whitespace: ' eleven ',
    })
  })

  it('should handle different types of empty values', () => {
    const envFile = `# Here's a comment
empty=   ''
test=one
empty2=

test2=two
empty3=    # this is a comment
test3='hello'

`

    const parsed = parse(envFile)
    assert.deepStrictEqual(parsed, {
      empty: '',
      test: 'one',
      empty2: '',
      test2: 'two',
      empty3: '',
      test3: 'hello',
    })
  })

  it('should handle values with quotes', () => {
    const envFile = `plain = The name's Bond, James Bond.
escaped =   'It\'s'
quotesWithinQuotes = "It's alright!"
`

    const parsed = parse(envFile)
    assert.deepStrictEqual(parsed, {
      plain: "The name's Bond, James Bond.",
      escaped: "It's",
      quotesWithinQuotes: "It's alright!",
    })
  })

  it('should only allow keys with the following characters: [\\w.-]', () => {
    const envFile = `valid=23
inva#lid=value1
invalid@2=hello
invalid%3= test
`

    const parsed = parse(envFile)
    assert.deepStrictEqual(parsed, { valid: '23' })
  })

  it('should load and parse a key-value file', () => {
    const envPath = join('.', 'src', 'test.env')
    const parsed = loadAndParse(envPath)
    assert.deepStrictEqual(parsed, {
      MONGODB_HOST: 'mymongohost.example.com',
      MONGODB_USER: 'username',
      MONGODB_PASSWORD: 'bingo',
      WITH_WHITE_SPACE: ' Hello ',
      INFO_TEXT: `This is a multiline
value. It can contain quotes other than the
quotes surrounding it; "double-quote" for instance. Or you
can escape it: ' `,
      ANOTHER_QUOTE: 'The name\'s "Bond".',
    })
  })

  it('should throw an exception when trying to load and parse a nonexistent file', () => {
    const envPath = join('.', 'src', 'nonexistent.env')
    assert.throws(() => loadAndParse(envPath))
  })
})
