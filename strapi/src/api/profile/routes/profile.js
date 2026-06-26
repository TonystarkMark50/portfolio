'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/profile',
      handler: 'profile.find',
      config: { auth: false },
    },
  ],
}
