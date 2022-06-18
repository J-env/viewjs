import syntaxJSX from '@babel/plugin-syntax-jsx'

import { transformJSX } from './shared/visitor'

const jsx = () => ({
  name: 'viewjs: JSX DOM Expressions',
  inherits: syntaxJSX,
  visitor: {
    JSXElement: transformJSX,
    JSXFragment: transformJSX,
  }
})

const viewjs = (_ctx, opts = {}) => ({
  plugins: [
    [jsx, {
      moduleName: "solid-js/web",
      builtIns: [
        "For",
        "Show",
        "Switch",
        "Match",
        "Suspense",
        "SuspenseList",
        "Portal",
        "Index",
        "Dynamic",
        "ErrorBoundary"
      ],
      contextToCustomElements: true,
      wrapConditionals: true,
      generate: "dom",
      ...opts
    }]
  ]
})

export default viewjs
