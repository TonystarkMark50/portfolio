'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/internship',
      handler: 'internship.find',
      config: { auth: false },
    },
  ],
}
