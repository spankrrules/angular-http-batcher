function UrlEncoder() {
  var self = this;

  self.key = 'UrlEncoder';
  self.encode = encode;
  self.decode = decode;

  function encode(params, prefix) {

    var items = [];

    for (var field in params) {

      var key = prefix ? prefix + "[" + field + "]" : field;
      var type = typeof params[field];

      switch (type) {

      case "object":

        //handle arrays appropriately x[]=1&x[]=3
        if (params[field].constructor == Array) {
          params[field].each(function (val) {
            items.push(key + "[]=" + val);
          }, this);
        } else {
          //recusrively construct the sub-object
          items = items.concat(this.encode(params[field], key));
        }
        break;
      case "function":
        break;
      default:
        items.push(key + "=" + escape(params[field]));
        break;
      }
    }

    return items.join("&");
  }

  function decode(params) {

    var obj = {};
    var parts = params.split("&");

    parts.forEach(function (kvs) {

      var kvp = kvs.split("=");
      var key = decodeURIComponent(kvp[0]);
      var val = unescape(kvp[1]);

      if (/\[\w+\]/.test(key)) {

        var rgx = /\[(\w+)\]/g;
        var top = /^([^\[]+)/.exec(key)[0];
        var sub = rgx.exec(key);

        if (!obj[top]) {
          obj[top] = {};
        }

        var unroot = function (o) {

          if (sub === null) {
            return;
          }

          var sub_key = sub[1];

          sub = rgx.exec(key);

          if (!o[sub_key]) {
            o[sub_key] = sub ? {} : val;
          }

          unroot(o[sub_key]);
        };


        unroot(obj[top]);

        //array
      } else if (/\[\]$/.test(key)) {
        key = /(^\w+)/.exec(key)[0];
        if (!obj[key]) {
          obj[key] = [];
        }
        obj[key].push(val);
      } else {
        obj[key] = val;
      }

    });

    return obj;
  }

}

UrlEncoder.$inject = [];

angular.module(window.ahb.name).service('UrlEncoder', UrlEncoder);
