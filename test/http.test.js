/*!
 * Copyright 2019 Jorge Proaño.
 */

/* eslint-env node, mocha */

'use strict'

// process.env.DEBUG = 'mech*'

const { expect } = require('chai')

const prettierFactory = require('../lib')

const pretty = prettierFactory({ colorize: false })

describe('Http Formatter', function () {
  it('Should work with standard Pino HTTP logs', function () {
    const line =
      '{"pid":13961,"hostname":"MacBook-Pro-4","level":30,"time":1548867061669,"msg":"request completed","res":{"statusCode":200,"header":"HTTP/1.1 200 OK\\r\\ncontent-type: application/json; charset=utf-8\\r\\ncache-control: no-cache\\r\\nvary: accept-encoding\\r\\ncontent-encoding: gzip\\r\\ndate: Thu, 21 Jul 2016 17:34:52 GMT\\r\\nconnection: close\\r\\ntransfer-encoding: chunked\\r\\n\\r\\n"},"responseTime":17,"req":{"id":8,"method":"GET","url":"/api/activity/component","headers":{"host":"localhost:20000","connection":"keep-alive","cache-control":"max-age=0","authorization":"Basic QWxhZGRpbjpPcGVuU2VzYW1l","accept":"application/json","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36","referer":"http://localhost:20000/","accept-encoding":"gzip, deflate, sdch","accept-language":"en-US,en;q=0.8,de;q=0.6","cookie":"_ga=GA1.1.204420087.1444842476"},"remoteAddress":"127.0.0.1","remotePort":61543},"v":1}\n'
    const prettified = pretty(line)
    expect(prettified).to.equal(
      '2019-01-30-11:51:01 │ app ❯ GET 200 /api/activity/component ➔ 127.0.0.1 +17ms - request completed \n'
    )
  })

  it('Should work with @cactus logs', function () {
    const line =
      '{"level":30,"time":1548867061669,"pid":2636,"hostname":"lab100-production","app":"api","name":"http","req_id":"voltorb-d228e0","req":{"method":"GET","url":"/clinic/patient/91755894","headers":{"x-forwarded-for":"146.203.121.6","host":"api.lab100.org","authorization":"[redacted]","x-lab100-app-secret":"a2828af8-0e59-40e5-997e-c597c064e27b","x-lab100-app-uuid":"1836194970","accept":"application/json"},"userId":"91755894","httpVersion":"1.1","remoteAddress":"146.203.121.6","remotePort":28798},"res":{"statusCode":200,"header":"HTTP/1.1 200 OK\\r\\nX-Lab100-Service-uuid: org.lab100.api\\nX-Lab100-Service-Instance: worker-2636\\nServer: api/1.10.0\\nX-Request-ID: voltorb-d228e0\\nReferrer-Policy: same-origin\\nAccess-Control-Allow-Headers: Content-Type, X-Lab100-APP-UUID, X-Lab100-APP-Secret, X-Lab100-Debug\\nAccess-Control-Expose-Headers: X-Request-ID, X-Response-Time, X-Lab100-Service-uuid, X-Lab100-Service-Instance, X-Lab100-Message, X-Lab100-Auth-ExpiresIn, X-Lab100-Auth-Method\\nAccess-Control-Allow-Methods: GET,PUT,POST,DELETE\\nAccess-Control-Allow-Credentials: true\\nAccess-Control-Allow-Origin: *\\nVary: Origin, X-Lab100-APP-uuid, Accept-Encoding\\nX-Lab100-Message: OK\\nContent-Type: application/json; charset=utf-8\\nContent-Length: 5494\\nETag: W/\\"1576-pABgZQLMPdlosgb8r13sETG+kAs\\"\\nX-Lab100-Auth-ExpiresIn: 1.7976931348623157e+308\\nX-Lab100-Auth-Method: Application\\nX-Response-Time: 19.546519\\nDate: Wed, 30 Jan 2019 16:51:01 GMT\\nConnection: keep-alive"},"duration":19.546519,"v":1}\n'
    const prettified = pretty(line)
    expect(prettified).to.equal(
      '2019-01-30-11:51:01 │ api:http ❯ GET 200 /clinic/patient/91755894 ➔ 146.203.121.6 +19ms - OK @91755894 ⇆ voltorb-d228e0\n'
    )
  })
})
