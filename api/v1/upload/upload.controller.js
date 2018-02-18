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
 * @apiHeader {String} Content-Length   The file size in bytes
 * @apiHeader {String} x-maxup-digest     The file SHA1 used to check integrity
 * @apiHeader {String} x-maxup-size       The file size in bytes
 * @apiHeader {String} x-maxup-filename   The name of the file
 * @apiHeader {String} x-maxup-site       Site to be deployed to
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST "https://api.zeit.co/v2/now/files" \
 *        -H "Authorization: Bearer $TOKEN" \
 *        -H "Content-Type: application/octet-stream" \
 *        -H "Content-Length: 145" \
 *        -H "x-maxup-digest: 514b5ffa5ef016df7f5f42370157d49f97526a42" \
 *        -H "x-maxup-size: 145" \
 *        -H "x-maxup-site: testsite.maxup.sh"
 *        -d 'file contents'
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "File uploaded successfully!"
 *     }
 */
