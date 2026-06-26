'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/projects',
      handler: 'project.find',
      config: { auth: false },
    },
  ],
}
