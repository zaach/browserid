/*jshint browser:true, jQuery: true, forin: true, laxbreak:true */
/*global BrowserID:true, PageController: true */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
BrowserID.Modules.ProvisionProxyIdpUser = (function() {
  "use strict";

  var bid = BrowserID,
      user = bid.User,
      errors = bid.Errors;

  function provisionProxyIdpUser(email, auth, prov, oncomplete) {
    var self=this;

    function complete(status) {
      oncomplete && oncomplete(status);
    }
    console.log('AOK provision_proxyidp_user.js provisionProxyIdpUser called, calling user.provisionPrimaryIUser');
    user.provisionPrimaryUser(email, {auth: auth, prov: prov}, function(status, status_info) {
      console.log('AOK provision_proxyidp_user.js provisionPrimaryUser callaback');
      switch(status) {
        case "primary.already_added":
          // XXX Is this status possible?
          console.log('AOK NOT POSSIBLE, RIGHT?');
          break;
        case "primary.verified":
          self.close("primary_user_provisioned", { email: email, assertion: status_info.assertion } );
          complete(true);
          break;
        case "primary.verify":
          console.log('AOK provision_proxyidp_user.js provPrimUser callback case: proxyidp.verify');

          console.log('AOK provision_proxyidp_user.js', status_info);

          self.close("proxyidp_user_unauthenticated", {
            email: email,
            auth_url: auth
          });
          complete(true);
          break;
        case "primary.could_not_add":
          // XXX Can this happen?
          break;
        default:
          break;
      }
    }, self.getErrorDialog(errors.provisioningPrimary));
  }

  var ProvisionProxyIdpUser = bid.Modules.PageModule.extend({
    start: function(options) {
      options = options || {};

      var self = this,
          email = options.email,
          auth = options.auth,
          prov = options.prov;

      console.log('AOK provision_proxyidp_user.js starting');

      if(!email) {
        throw "missing config option: email";
      }

      if(!(auth && prov)) {
        user.addressInfo(email, function(status) {
          if(status.type === "primary" ||
             status.type === "proxyidp") {
            provisionProxyIdpUser.call(self, email, status.auth, status.prov);
          }
          else {
            self.renderError("error", { action: errors.provisioningBadPrimary });
          }
        }, self.getErrorDialog(errors.isEmailRegistered));
      }
      else {
        provisionProxyIdpUser.call(self, email, auth, prov);
      }


      ProvisionProxyIdpUser.sc.start.call(self, options);
    }

    // BEGIN TESTING API
    ,
    provisionProxyIdpUser: provisionProxyIdpUser
    // END TESTING API
  });

  return ProvisionProxyIdpUser;

}());
