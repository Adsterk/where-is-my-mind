const PWA_CONFIG = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  publicExcludes: ['!noprecache/**/*'],
  buildExcludes: [/middleware-manifest\.json$/],
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  sw: '/sw.js',
  fallbacks: {
    document: '/offline.html'
  },
  cacheStartUrl: true,
  dynamicStartUrl: true
}

module.exports = { PWA_CONFIG } 