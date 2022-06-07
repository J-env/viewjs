export const UA = navigator.userAgent.toLowerCase()

export const isIE = /msie|trident/.test(UA)
export const isIE9 = indexOf('msie 9.0')
export const isEdge = indexOf('edge/')

export const isChrome = /chrome\/\d+/.test(UA) && !isEdge
export const isFF = !!UA.match(/firefox\/(\d+)/)

export const isAndroid = indexOf('android')
export const isIOS = /iphone|ipad|ipod|ios/.test(UA)

// export const isPhantomJS = /phantomjs/.test(UA)

// export const isMac = /macintosh|mac os x/i.test(UA)
// export const isWindows = /windows|win32|win64|wow64/i.test(UA)

// // Mobile
// export const isWinMobile = indexOf('windows') && indexOf('phone')

// export const isFxosMobile = (indexOf('mobile') || indexOf('tablet'))
//   && indexOf(' rv:') && indexOf('mobile')

// export const isMobile = isWinMobile || isFxosMobile
//   || /Android|webOS|iPhone|iPod|iPad|BlackBerry|bb10|meego/i.test(UA)

function indexOf(str) {
  return UA.indexOf(str) !== -1
}
