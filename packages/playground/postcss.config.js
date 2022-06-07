const overrideBrowserslist = [
  '>15%',
  'last 15 versions',
  'chrome >= 40',
  'safari >= 8',
  'Firefox ESR',
  'firefox >= 18',
  'edge >= 12',
  'not ie <= 8'
]

const autoprefixer = {
  overrideBrowserslist,
  flexbox: true,
  // grid: 'autoplace'
}

module.exports = {
  plugins: {
    'autoprefixer': autoprefixer,
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      overrideBrowserslist,
      autoprefixer,
      stage: 3,
      features: {
        'custom-properties': false,
      },
    }
  },
}
