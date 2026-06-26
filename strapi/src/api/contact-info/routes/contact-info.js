'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/contact-info',
      handler: 'contact-info.find',
      config: { auth: false },
    },
  ],
}
