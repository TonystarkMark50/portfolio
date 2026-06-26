'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/journeys',
      handler: 'journey.find',
      config: { auth: false },
    },
  ],
}
