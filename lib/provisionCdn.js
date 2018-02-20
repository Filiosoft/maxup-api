const axios = require('axios')
const mainSite = 'demo-maxup-sh'
const mainBackend = '4vwy2z603wzme8lk'
const config = require('../config/config')

var ax = axios.create({
  baseURL: 'https://fly.io/api/v1',
  headers: {
    'Authorization': `Bearer ${config.flyToken}`
  }
})

module.exports = async (site) => {
  let response
  // check if the hostname exists
  try {
    const resp = await ax.get(`/sites/${mainSite}/hostnames`)
    if (resp.data.data) {
      const flySite = resp.data.data.find(hostname => {
        return hostname.attributes.hostname === site
      })
      if (flySite) {
        response = flySite.attributes.preview_hostname
      }
    }
  } catch (error) {
    console.log(error)
  }

  if (response) {
    return response
  }

  // create the hostname
  try {
    const data = {
      data: {
        attributes: {
          hostname: site
        }
      }
    }
    const resp = await ax.post(`/sites/${mainSite}/hostnames`, data)
    response = resp.data.data.attributes.preview_hostname
  } catch (err) {
    throw err
  }

  // setup the backend
  try {
    const data = {
      data: {
        attributes: {
          hostname: site,
          backend_id: mainBackend,
          action_type: 'rewrite',
          path: '/',
          priority: 1,
          path_replacement: `/${site}/$path`
        }
      }
    }
    await ax.post(`/sites/${mainSite}/rules`, data)
  } catch (err) {
    throw err
  }

  return response
}
