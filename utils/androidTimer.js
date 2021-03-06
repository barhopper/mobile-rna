import {InteractionManager} from 'react-native'
/**
 * on android long calls to setTimeout can cause issues by locking up the timer
 * this prevents that
 */
export function androidTimerWorkaround() {
  const _setTimeout = global.setTimeout
  const _clearTimeout = global.clearTimeout
  const MAX_TIMER_DURATION_MS = 60 * 1000
  if (Platform.OS === 'android') {
    // Work around issue `Setting a timer for long time`
    // see: https://github.com/firebase/firebase-js-sdk/issues/97
    const timerFix = {}
    const runTask = (id, fn, ttl, args) => {
      const waitingTime = ttl - Date.now()
      if (waitingTime <= 1) {
        try {
          InteractionManager.runAfterInteractions(() => {
            if (!timerFix[id]) {
              return
            }
            delete timerFix[id]
            fn(...args)
          })
          // eslint-disable-next-line no-empty
        } catch (e) {}
        return
      }

      const afterTime = Math.min(waitingTime, MAX_TIMER_DURATION_MS)
      timerFix[id] = _setTimeout(() => runTask(id, fn, ttl, args), afterTime)
    }

    global.setTimeout = (fn, time, ...args) => {
      if (MAX_TIMER_DURATION_MS < time) {
        const ttl = Date.now() + time
        const id = '_lt_' + Object.keys(timerFix).length
        runTask(id, fn, ttl, args)
        return id
      }
      return _setTimeout(fn, time, ...args)
    }

    global.clearTimeout = id => {
      if (typeof id === 'string' && id.startsWith('_lt_')) {
        _clearTimeout(timerFix[id])
        delete timerFix[id]
        return
      }
      _clearTimeout(id)
    }
  }
}
