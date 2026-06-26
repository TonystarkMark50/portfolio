'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/certifications',
      handler: 'certification.find',
      config: { auth: false },
    },
  ],
}
