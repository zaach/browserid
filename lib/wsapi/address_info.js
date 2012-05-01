/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
config = require('../configuration.js'),
db = require('../db.js'),
primary = require('../primary.js'),
proxyidp = require('../proxyidp.js'),
wsapi = require('../wsapi.js'),
util = require('util');

// return information about an email address.
//   type:  is this an address with 'primary' or 'secondary' support?
//   if type is 'secondary':
//     known: is this address known to browserid?
//   if type is 'primary':
//     auth: what is the url to send the user to for authentication
//     prov: what is the url to embed for silent certificate (re)provisioning

exports.method = 'get';
exports.writes_db = false;
exports.authed = false;
exports.args = ['email'];
exports.i18n = false;

const emailRegex = /\@(.*)$/;

exports.process = function(req, resp) {
  // parse out the domain from the email
  var email = url.parse(req.url, true).query['email'];
  var m = emailRegex.exec(email);
  if (!m) {
    return httputils.badRequest(resp, "invalid email address");
  }

  primary.checkSupport(m[1], function(err, urls, publicKey) {
    if (err) {
      logger.warn('error checking "' + m[1] + '" for primary support: ' + err);
      return httputils.serverError(resp, "can't check email address");
    }

    if (urls) {
      urls.type = 'primary';
      resp.json(urls);
    } else if (proxyidp.isProxyIdP(email)) {
      // TODO DRY violation: BigTent /.well-known/browserid has these urls too
      // Of course there, they are never used :(
      //
      // TODO make sure we don't cache email address info per domain
      resp.json({
          type: 'proxyidp',
          auth: util.format('%s/proxy/%s', config.get('bigtent_url'),
                            encodeURIComponent(email)),
          prov: util.format('%s/provision', config.get('bigtent_url'))
      });
    } else {
      db.emailKnown(email, function(err, known) {
        if (err) {
          return wsapi.databaseDown(resp, err);
        } else {
          resp.json({ type: 'secondary', known: known });
        }
      });
    }
  });
};
