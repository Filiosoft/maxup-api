const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const mongoose = require('mongoose')
const appRoot = require('app-root-path')
const provisionCdn = require(`${appRoot}/lib/provisionCdn`)
const provisionDns = require(`${appRoot}/lib/provisionDns`)
const {
  promisify
} = require('util')

const s3 = new aws.S3()
const Deploy = mongoose.model('Deploy')
const User = mongoose.model('User')

module.exports = (config) => {
  /**
   * @api {get} /v1/files Upload files
   * @apiName PostFiles
   * @apiGroup Deploy
   * @apiDescription Upload files to the API.
   * @apiUse RequireAuth
   *
   * @apiSuccess {String} message         Response message (e.g. File uploaded successfully)
   *
   * @apiHeader {String} Content-Type     With the value `application/octet-stream`
   * @apiHeader {String} x-maxup-site       Site to be deployed to
   *
   * @apiExample {curl} Example usage:
   *     curl -X POST "https://api.zeit.co/v2/now/files" \
   *        -H "Authorization: Bearer $TOKEN" \
   *        -H "Content-Type: application/octet-stream" \
   *        -H "Content-Length: 145" \
   *        -H "x-maxup-site: testsite.maxup.sh"
   *        -d 'file contents'
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "message": "File uploaded successfully!"
   *     }
   */
  const deploy = async (req, res, next) => {
    const site = req.headers['x-maxup-site']
    const filename = req.headers['x-maxup-filename']

    if (!site) {
      return res.status(500).send('Please specifiy a site')
    }

    // find the current user
    let user
    try {
      user = await User.findById(req.payload._id)
      if (!user) {
        return res.status(500).send('User not found!')
      }
    } catch (err) {
      return res.status(500).send(err)
    }

    // find the deploy
    let deploy
    let newDeploy
    try {
      deploy = await Deploy.findOne({
        site
      }).exec()
    } catch (err) {
      console.log(err)
    }

    // if it doesn't exist, create the deploy
    if (!deploy) {
      newDeploy = true
      try {
        deploy = new Deploy({
          site,
          owners: [user._id]
        })
      } catch (err) {
        return res.status(500).send(err)
      }
    }

    // make sure the current user is in the owners of the deploy
    const found = deploy.owners.find(element => {
      return element.toString() === user._id.toString()
    })
    if (!found) {
      return res.status(403).send('Forbiden')
    }

    // setup the uploader's storage
    const storage = multerS3({
      s3: s3,
      bucket: 'maxup',
      contentType: (req, file, cb) => {
        cb(null, file.mimetype)
      },
      metadata: (req, file, cb) => {
        cb(null, {
          fieldName: file.fieldname
        })
      },
      key: (req, file, cb) => {
        cb(null, `${site}/${filename}`)
      }
    })

    // setup the upload
    const upload = promisify(multer({
      storage
    }).array('files', 1))

    // upload
    try {
      await upload(req, res)
    } catch (err) {
      console.log(err)
      return res.status(500).send(err)
    }

    if (newDeploy) {
      // provision CDN
      try {
        const flyHost = await provisionCdn(site)
        deploy.flyHost = flyHost
      } catch (err) {
        console.log(err)
        return res.status(500).send(err)
      }

      // provision DNS
      try {
        await provisionDns(site, deploy.flyHost)
      } catch (err) {
        console.log(err)
        return res.status(500).send(err)
      }
    }
    // update the updated date and save the deploy
    try {
      deploy.updated = new Date()
      await deploy.save()
    } catch (err) {
      console.log(err)
      return res.status(500).send(err)
    }

    // respond
    return res.status(200).json({
      message: 'Files uploaded successfully!'
    })
  }

  return {
    deploy
  }
}
