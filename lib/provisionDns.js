const config = require('../config/config')
const cf = require('cloudflare')({
  email: config.cfEmail,
  key: config.cfKey
})

module.exports = async (site, flyHost) => {
  try {

  } catch (err) {
    console.log(err)
  }
  try {
    const record = {
      type: 'CNAME',
      name: site,
      content: flyHost
    }
    await cf.dnsRecords.add(config.cfZone, record)
  } catch (err) {
    throw err
  }
}
