/**
 * The callback to prepare a segment for play.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onpreprocess = function (trigger, args) {
  // dispatch by trigger because we already knew location when to be kicked by worker
  if (trigger === 'launchRule' || trigger === 'voice') {
    // get location here to shorten segment's running time
    getCurrentLocationData().then(function (address, locality) {
      if (address !== 'error') {
        da.startSegment(trigger, {
          address: address,
          locality: locality
        })
      } else {
        da.cancelSegment()
      }
    })
  } else if (trigger === 'worker') {
    if (args === null) {
      da.cancelSegment()
    } else {
      awaitor = new SegmentAwaitor()
      tts = new Tts(awaitor)
      da.startSegment(trigger, args)
    }
  }
}

/**
 * The callback to start a segment.
 * @param  {string} trigger The trigger type of a segment.
 * @param  {object} args    The input arguments.
 */
da.segment.onstart = function(trigger, args) {
  console.log('onstart', { trigger: trigger, args: args })

  // get soundscape list
  getscapes(args).then(function (list) {
    if (list && list.length > 0) {
      speak('we have no soundscape.').then(function () {
        da.stopSegment()
      })
    } else if (list) {
      speak(da.getString('startscape', {
        length: list.length
      })).then(function () {
        // store list
        new da.Storage().setItem('list', {
          address: args.address,
          locality: args.locality,
          list: list
        })
        // get the first soundscape
        getscape(list[0].id).then(function (error) {
          if (error) {
            speak('fail to get the first soundscape.').then(function () {
              new da.Storage().removeItem('list')
              da.stopSegment()
            })
          } else {
            // add current
            new da.Storage().setItem('play', list[0].id)
          }
        })
      })
    } else {
      da.stopSegment()
    }
  })
}

da.segment.onstop = function() {
  ctnlscape('stop', new da.Storage().getItem('play')).then(function (error) {
    new da.Storage().removeItem('play')
    new da.Storage().removeItem('list')
    da.stopSegment()
  })
}

da.segment.onpause = function() {
  ctnlscape('pause', new da.Storage().getItem('play'))
}

da.segment.onresume = function() {
  ctnlscape('resume', new da.Storage().getItem('play'))
}

// Implementation the oncommand callback
da.segment.oncommand = function(cmd) {
  var consumed = true

  switch (cmd.command) {
    case Command.NEXT:
      var cur = (new da.Storage().getItem('play') || {}).id
      if (cur) {
        var list = new da.Storage().getItem('list').list
        var idx = list.findIndex(function (e) {
          if (e.id === cur) return true
          else return false
        }) + 1
        if (idx > 0) {
          getscape(list[idx].id).then(function (error) {
            if (error) {
              speak('fail to get the ' + idx + ' soundscape.').then(function () {
                new da.Storage().removeItem('list')
                da.stopSegment()
              })
            } else {
              // add current
              new da.Storage().setItem('play', list[idx].id)
            }
          })
        } else {
          console.log('bug? no id in list')
        }
      } else {
        pass
      }
      break
    case Command.PREVIOUS:
      var cur = (new da.Storage().getItem('play') || {}).id
      if (cur) {
        var list = new da.Storage().getItem('list').list
        var idx = list.findIndex(function (e) {
          if (e.id === cur) return true
          else return false
        })
        idx = idx === 0 ? 0 : idx - 1
        if (idx >= 0) {
          getscape(list[idx].id).then(function (error) {
            if (error) {
              speak('fail to get the ' + idx + ' soundscape.').then(function () {
                new da.Storage().removeItem('list')
                da.stopSegment()
              })
            } else {
              // add current
              new da.Storage().setItem('play', list[idx].id)
            }
          })
        } else {
          console.log('bug? no id in list')
        }
      } else {
        pass
      }
      break
    case Command.AGAIN:
      getscape(new da.Storage().getItem('play')).then(function (error) {
        if (error) {
          speak('fail to get the current soundscape.').then(function () {
            new da.Storage().removeItem('list')
            da.stopSegment()
          })
        } else {
          // no need to update 'play'
        }
      })
      break
    case Command.DETAIL:
    case Command.BOOKMARK:
    default:
      consumed = false
      break
  }
  return consumed
}
