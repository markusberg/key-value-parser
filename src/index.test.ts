import { describe, expect, it } from 'vitest'

import { parse } from './index.js'

describe('.env parser', () => {
  it('should handle leading and trailing white space', () => {
    const keyValues = `noLeadingOrTrailing=one
 leadingWhitespace=two
trailingWhitespace=three    
  leadingAndTrailing=four   
`
    const parsed = parse(keyValues)
    expect(parsed).toStrictEqual({
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
    expect(parsed).toStrictEqual({
      noLeadingOrTrailing: 'one',
      leadingWhitespace: 'two',
      trailingWhitespace: 'three',
      leadingAndTrailing: 'four',
    })
  })

  it('should handle three types of quotes, and multiline values', () => {
    const keyValues = `singleQuotes='one'

    #This= is a comment with an equal sign
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
    expect(parsed).toStrictEqual({
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

# another comment
withQuotes='five'
withEqualSign="six=seven"
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
    expect(parsed).toStrictEqual({
      withQuotes: 'five',
      withEqualSign: 'six=seven',
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
    expect(parsed).toStrictEqual({
      empty: '',
      test: 'one',
      empty2: '',
      test2: 'two',
      empty3: '',
      test3: 'hello',
    })
  })
})
