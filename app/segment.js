var audio

/**
 * The callback to prepare a segment for play.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onpreprocess = function (trigger, args) {
  // demo code
  new da.Storage().setItem('list', JSON.stringify([
    'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer2.mp3',
    'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer1.mp3',
    'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer3.mp3'
  ]))
  new da.Storage().setItem('play', '1')
  da.startSegment()
  return

  // dispatch by trigger because we already knew location when to be kicked by worker
  if (trigger === 'launchRule' || trigger === 'voice') {
    // get location here to shorten segment's running time
    getCurrentLocationData().then(function (address, locality) {
      if (address !== 'error') {
        getCurrentContext().then(function (context) {
          if (context) {
            da.startSegment(trigger, {
              args: {
                address: address,
                locality: locality,
                context: context
              }
            })
          } else {
            da.cancelSegment()
          }
        })
      } else {
        da.cancelSegment()
      }
    })
  } else if (trigger === 'worker') {
    if (args === null) {
      da.cancelSegment()
    } else {
      da.startSegment(trigger, args)
    }
  }
}

function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

/**
 * The callback to start a segment.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onstart = function(trigger, args) {
  // demo code
  speak('we have 3 soundscape. Let me start the first one.')
  var idx = (new da.Storage().setItem('play') - 0) || 0
  var list = JSON.parse(new da.Storage().getItem('list'))
  if (!list) {
    list = [
      'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer2.mp3',
      'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer1.mp3',
      'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer3.mp3'
    ]
  }
  pausecomp(5000)
  audio = new Audio(list[idx])
  audio.play()
  return


  // get soundscape list
  getscapes(args).then(function (list) {
    if (list && list.length > 0) {
      speak(da.getString('startscape', {
        length: list.length
      })).then(function () {
        // store list
        new da.Storage().setItem('list', JSON.stringify({
          address: args.address,
          locality: args.locality,
          list: list
        }))
        // get soundscape.
        // add current
        new da.Storage().setItem('play', list[0].id)
        // play
        audio = new Audio(decodeURIComponent(list[0].url))
        audio.play()
      })
    } else {
      speak('we have no soundscape.').then(function () {
        da.stopSegment()
      })
    }
  }).fail(function (error) {
    speak('fail to get any soundscapes.').then(function () {
      da.stopSegment()
    })
  })
}

da.segment.onstop = function() {
  if (audio) {
    audio.pause()
  }
  speak('stopped.')
  new da.Storage().removeItem('play')
  new da.Storage().removeItem('list')
  da.stopSegment()
}

da.segment.onpause = function() {
  if (audio) {
    audio.pause()
  }
}

da.segment.onresume = function() {
  if (audio) {
    audio.play()
  }
}

da.segment.oncommand = function(cmd) {
  var consumed = true

  switch (cmd.command) {
    case Command.NEXT:
      // demo code
      var idx = (new da.Storage().setItem('play') - 0) || 0
      var list = JSON.parse(new da.Storage().getItem('list'))
      if (!list) {
        list = [
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer2.mp3',
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer1.mp3',
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer3.mp3'
        ]
      }
      idx = idx + 1
      audio = new Audio(list[idx])
      audio.play()
      break

      var cur = (new da.Storage().getItem('play') || {}).id
      var list = JSON.parse(new da.Storage().getItem('list') || {}).list
      if (cur && list) {
        var idx = list.findIndex(function (e) {
          if (e.id === cur) return true
          else return false
        }) + 1
        if (idx > 0) {
          // add current
          new da.Storage().setItem('play', list[idx].id)
          // play mp3
          audio = new Audio(list[idx].url)
          audio.play()
        } else {
          speak('bug? fail to find next id.')
        }
      } else {
        speak('cannot find the next.')
      }
      break
    case Command.PREVIOUS:
      // demo code
      var idx = (new da.Storage().setItem('play') - 0) || 0
      var list = JSON.parse(new da.Storage().getItem('list'))
      if (!list) {
        list = [
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer2.mp3',
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer1.mp3',
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer3.mp3'
        ]
      }
      idx = idx === 0 ? 0 : idx - 1
      audio = new Audio(list[idx])
      audio.play()
      break


      var cur = (new da.Storage().getItem('play') || {}).id
      var list = JSON.parse(new da.Storage().getItem('list') || {}).list
      if (cur && list) {
        var idx = list.findIndex(function (e) {
          if (e.id === cur) return true
          else return false
        })
        idx = idx === 0 ? 0 : idx - 1
        if (idx >= 0) {
          // add current
          new da.Storage().setItem('play', list[idx].id)
          // play mp3
          audio = new Audio(list[idx].url)
          audio.play()
        } else {
          speak('bug? fail to find next id.')
        }
      } else {
        speak('cannot find the previous.')
      }
      break
    case Command.AGAIN:
      // demo code
      var idx = (new da.Storage().setItem('play') - 0) || 0
      var list = JSON.parse(new da.Storage().getItem('list'))
      if (!list) {
        list = [
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer2.mp3',
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer1.mp3',
          'https://s3-us-west-1.amazonaws.com/hackathon-prototype/soccer3.mp3'
        ]
      }
      audio = new Audio(list[idx])
      audio.play()
      break

      var cur = (new da.Storage().getItem('play') || {}).id
      var list = JSON.parse(new da.Storage().getItem('list') || {}).list
      if (cur && list) {
        var idx = list.findIndex(function (e) {
          if (e.id === cur) return true
          else return false
        })
        if (idx >= 0) {
          // add current
          new da.Storage().setItem('play', list[idx].id)
          // play mp3
          audio = new Audio(list[idx].url)
          audio.play()
          // // what we have argument means successful necessarily.
          // getscape(list[idx].url).then(function (ssmeta) {
          //   // add current
          //   new da.Storage().setItem('play', list[idx].id)
          //   // play mp3
          //   audio = new Audio(mp3)
          //   audio.play()
          // }).fail(function (msg) {
          //   speak('fail to get the current soundscape.').then(function () {
          //     da.stopSegment()
          //   })
          // })
        } else {
          speak('bug? fail to find current id.')
        }
      } else {
        speak('cannot find the current again.')
      }
      break
    case Command.DETAIL:
    case Command.BOOKMARK:
      speak('we have no options.')
      break
    default:
      consumed = false
      break
  }
  return consumed
}
