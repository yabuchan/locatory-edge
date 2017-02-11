/**
 * get list of soundscapes.
 * @param {Object} location must have address and locality.
 * @param {String} location.address address of current location
 * @param {String} location.locality city name of current location
 */
var getscapes = function (location) {
  var base_url = 'http://52.9.204.239:3000/api/sounds'
  var url = base_url + '?lng=' + lng + '&lat=' + lat + '&activity=' + activity + '&soundKeyWords=' + soundKeyWords;
  var def = $.Deferred();

  console.log('query starting...');

  var setting = {
    url: url,
    type: 'GET',
    dataType: 'json',
    xhr: function() {
      return da.getXhr();
    },
    success: function(data, textStatus, jqXHR) {
      console.log('ajax success');
      if (data.length === 0) {
        def.resolve(Emotion.DATA_NOT_FOUND);
        return;
      }
      console.log(Emotion.object);
      Emotion.object = data[data.length - 1];
      def.resolve(Emotion.DATA_FOUND);
      return;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log('ajax error jqXHR.status[' + jqXHR.status + ']');
      var msg;
      switch (jqXHR.status) {
        case 401:
          msg = Emotion.OAUTH_ERROR;
          break;
        case 404:
          msg = Emotion.LISTS_NOT_FOUND;
          break;
        default:
          msg = Emotion.CONNECTION_ERROR;
      }
      def.reject(msg);
      return;
    }
  };
  $.ajax(setting);
  return def.promise();
}

/**
 * get a soundscape.
 * @param {String} id is the soundscape identifier.
 */
var getscape = function (id) {}

/**
 * get a soundscape.
 * @param {String} cmd can be 'stop', 'pause' and 'resume'.
 * @param {String} id is the soundscape identifier.
 */
var ctnlscape = function (cmd, id) {}
