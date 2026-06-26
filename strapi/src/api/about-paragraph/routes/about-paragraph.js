'use strict'

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/about-paragraphs',
      handler: 'about-paragraph.find',
      config: { auth: false },
    },
  ],
}
