'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/skills',
      handler: 'skill.find',
      config: { auth: false },
    },
  ],
}
