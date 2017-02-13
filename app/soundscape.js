/**
 * get list of soundscapes.
 * @param {Object} userinfo must have address, locality and context.
 * @param {String} userinfo.address address of current
 * @param {String} userinfo.locality city name  current location
 * @param {Object} userinfo.context user context got by prototype N
 */
var getscapes = function (userinfo) {
  var base_url = 'http://52.9.204.239/api/sounds'
  var url = base_url + '?address=' + encodeURIComponent(userinfo.address) +
    '&locality=' + encodeURIComponent(userinfo.locality) + '&activity=' + encodeURIComponent(userinfo.context.activity)
  var def = $.Deferred();

  var setting = {
    url: url,
    type: 'GET',
    dataType: 'json',
    xhr: function() {
      return da.getXhr();
    },
    success: function(data, textStatus, jqXHR) {
      if (data && data.length >0) {
        def.resolve(data)
      } else {
        def.resolve(null)
      }
      return
    },
    error: function(jqXHR, textStatus, errorThrown) {
      def.reject('ajax error jqXHR.status[' + jqXHR.status + ']')
      return
    }
  }
  $.ajax(setting)
  return def.promise()
}

/**
 * get a soundscape.
 * @param {String} id is the soundscape identifier.
 */
var getscape = function (url) {
  var def = $.Deferred();

  var setting = {
    url: decodeURIComponent(url),
    type: 'GET',
    dataType: 'audio/mpeg',
    xhr: function() {
      return da.getXhr();
    },
    success: function(data, textStatus, jqXHR) {
      if (data) {
        def.resolve(data)
      } else {
        def.reject('server-side error.')
      }
      return
    },
    error: function(jqXHR, textStatus, errorThrown) {
      def.reject('ajax error jqXHR.status[' + jqXHR.status + ']')
      return
    }
  }
  $.ajax(setting)
  return def.promise()
}

/**
 * get a soundscape.
 * @param {String} cmd can be 'stop', 'pause' and 'resume'.
 * @param {String} id is the soundscape identifier.
 */
var ctnlscape = function (cmd, id) {
  var base_url = 'http://52.9.204.239/api/sounds/launch'
  var url = base_url + '/' + "589faca20eb498aa1230c413" + '/' + cmd
  var def = $.Deferred();

  var setting = {
    url: url,
    type: 'GET',
    dataType: 'json',
    xhr: function() {
      return da.getXhr();
    },
    success: function(data, textStatus, jqXHR) {
      if (data) {
        def.resolve(data)
      } else {
        def.reject('server-side error.')
      }
      return
    },
    error: function(jqXHR, textStatus, errorThrown) {
      def.reject('ajax error jqXHR.status[' + jqXHR.status + ']')
      return
    }
  }
  $.ajax(setting)
  return def.promise()
}
