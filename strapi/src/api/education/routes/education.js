'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/educations',
      handler: 'education.find',
      config: { auth: false },
    },
  ],
}
