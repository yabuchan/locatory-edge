var tts;
var awaitor;

var Emotion = {};
Emotion.DATA_NOT_FOUND = 0;
Emotion.DATA_FOUND = 1;
Emotion.CONNECTION_ERROR = 2;
Emotion.OAUTH_ERROR = 3;
Emotion.LISTS_NOT_FOUND = 4;



/**
 * The callback to prepare a segment for play.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onpreprocess = function(trigger, args) {
  console.log('onpreprocess', { trigger: trigger, args: args });
  //init
  awaitor = new SegmentAwaitor();
  tts = new Tts(awaitor);

  startVoiceStory(10, 20, 'RUN', 'soundKeyWords');

  da.startSegment(InteruptParameter.FULL, null);
};

/**
 * The callback to start a segment.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onstart = function(trigger, args) {
  console.log('onstart', { trigger: trigger, args: args });
  startVoiceStory(10, 20, 'RUN', 'soundKeyWords');

  var synthesis = da.SpeechSynthesis.getInstance();
  synthesis.speak('Hello World !', {
    onstart: function() {
      console.log('speak start');
    },
    onend: function() {
      console.log('speak onend');
      da.stopSegment();
    },
    onerror: function(error) {
      console.log('speak cancel: ' + error.messsage);
      da.stopSegment();
    }
  });

  // Get the current address (locality)
  getCurrentLocationData().then(function(address, locality) {
    if (address !== 'error') {
      var storage = new da.Storage();
      if (storage.getItem('locality') !== locality) {
        // If current locality has been changed, update the current locality stored locally request to start the segment.
        storage.setItem('locality', locality);
        da.requestStartSegment('full', {
          cueVoice: 'launchRulesAnnounce',
          cueVoiceArgs: ['worker'],
          args: locality
        });
      } else {
        // if the current locality is not changed, stop the worker itself
        da.stopWorker();
      }
    } else {
      da.stopWorker();
    }
  });

};

da.segment.onstop = function() {
  console.log('onstop');
};
da.segment.onpause = function() {
  console.log('onpause');
  awaitor.isPause = true;
};
da.segment.onresume = function() {
  console.log('onresume');
  awaitor.isPause = false;
};
// Implementation the oncommand callback
da.segment.oncommand = function(commandObject) {
  console.log('oncommand');
  console.log(JSON.stringify(commandObject));
  var consumed = true;
  //tweetManager.cancelSpeak();

  switch (commandObject.command) {
    case Command.NEXT:
      // Speak the next tweet.
      pass;
      break;
    case Command.PREVIOUS:
      // speak previous tweet.
      pass;
      break;
    case Command.AGAIN:
      // Repeat the current tweet.
      pass;
      break;
    case Command.DETAIL:
      // Speak the current tweet with detail information.
      pass;
      break;
    case Command.BOOKMARK:
      // Register the current tweet in the bookmark.
      pass;
      break;
    default:
      // Speak when the command is not supported.
      pass;
      consumed = false;
  }
  return consumed;
};

function startVoiceStory(lng, lat, activity, soundKeyWords) {

  var base_url = 'http://52.9.204.239:3000/api/emotions';
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
