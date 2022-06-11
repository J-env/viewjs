import { noop } from '@viewjs/web'

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 */
function makeGetterFunction(body: string): Function {
  try {
    return new Function('scope', 'return ' + body + ';')

  } catch (e) {
    return noop
  }
}

/**
 * 将表达式解析为getter
 */
export function parseExpression(expression: string): Function {
  // scope.__get$$_ undefined
  expression = (expression || '__get$$_').trim()
  return makeGetterFunction('scope.' + expression)
}
