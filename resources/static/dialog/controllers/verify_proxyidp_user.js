/*jshint browser:true, jQuery: true, forin: true, laxbreak:true */
/*global _: true, BrowserID: true, PageController: true */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
BrowserID.Modules.VerifyProxyIdpUser = (function() {
  "use strict";

  var bid = BrowserID,
      sc,
      win,
      add,
      email,
      auth_url,
      helpers = bid.Helpers,
      complete = helpers.complete;

  function verify(callback) {
    console.log('AOK verify_proxyidp_user.js - Changing window...');
    //this.publish("primary_user_authenticating");

    // replace any hashes that may be there already.
    var returnTo = win.document.location.href.replace(/#.*$/, "");

    var type = add ? "ADD_EMAIL" : "CREATE_EMAIL";
    var url = helpers.toURL(auth_url, {
      email: email,
      return_to: returnTo + "#" + type + "=" +email
    });
    console.log(win);
    win.document.location = url;

    complete(callback);
  }

  function cancel(callback) {
    this.close("cancel_state");
    callback && callback();
  }

  var Module = bid.Modules.PageModule.extend({
    start: function(data) {
      win = data.window || window;
      add = data.add;
      email = data.email;
      auth_url = data.auth_url;

      verify(function (a, b, c) {
        console.log("AOK callbacked");
        console.log(a, b, c);
        alert('huh');
      });
    },

    submit: verify

    // BEGIN TESTING API
    ,
    cancel: cancel
    // END TESTING API
  });

  sc = Module.sc;

  return Module;
}());

