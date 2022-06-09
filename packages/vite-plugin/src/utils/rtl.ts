const rtlMark = '[[rtl]]'
const ltrMark = '[[ltr]]'

export const defaultRtlOptions: RtlOptions = {
  type: 'syntax',

  syntax: `<?php if($rtl): ?>${rtlMark}<?php else: ?>${ltrMark}<?php endif; ?>`,

  transformDirInUrl: false,
  transformEdgeInUrl: false,
}

export function getRtlOptions(rtl: any): Rtl {
  return typeof rtl === 'boolean'
    ? rtl
      ? defaultRtlOptions
      : false
    : {
      ...defaultRtlOptions,
      ...rtl
    }
}

export type Rtl = RtlOptions | false

export interface RtlOptions {
  transformDirInUrl: boolean
  transformEdgeInUrl: boolean

  /**
   * @default 'syntax'
   */
  type: 'new-html' | 'syntax'

  syntax: string
}
