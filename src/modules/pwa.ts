import { useRegisterSW } from 'virtual:pwa-register/vue'

export function registerPWA() {
  const intervalMS = 60 * 60 * 1000

  useRegisterSW({
    onRegistered(r) {
      r &&
        setInterval(() => {
          r.update()
        }, intervalMS)
    }
  })
}
