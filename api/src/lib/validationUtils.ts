import * as R from 'ramda'
import * as EmailValidator from 'email-validator'

const isNotNil = R.complement(R.isNil)
const isValidSender = R.pipe<string, string[], boolean>(
  R.match(/^[\w\s]+ <(.*)>$/),
  R.cond([
    [R.complement(R.isEmpty), R.pipe(R.prop(1 as unknown as string), EmailValidator.validate)],
    [R.T, R.always(false)]
  ])
)
const isViaEmail = R.propEq('via', 'email')
const isInvalidEmail = R.pipe(
  EmailValidator.validate,
  R.not
)
const validJson = (str: string) => R.tryCatch(
  R.pipe(
    JSON.parse,
    R.always(true)
  ),
  R.always(false)
)( str )
const invalidJson = R.complement(validJson)
const defaultJsonString = R.when(
  invalidJson,
  R.always('{}')
)
const parseJson = R.pipe(
  defaultJsonString,
  JSON.parse
)
const invalidEmailSender = R.ifElse(
  isViaEmail,
  R.pipe(
    R.prop('template_data'),
    parseJson,
    R.prop('sender'),
    R.complement(isValidSender)
  ),
  R.always(false)
)

export {
  validJson,
  invalidJson,
  defaultJsonString,
  parseJson,
  invalidEmailSender,
  isViaEmail,
  isInvalidEmail,
  isValidSender,
  isNotNil
}
