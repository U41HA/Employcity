import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ru.employcity.cafecart',
  appName: 'Кофейня у дома',
  // Capacitor упаковывает в нативное приложение результат `vite build`
  webDir: 'dist',
  android: {
    // фон WebView совпадает с темой, чтобы при запуске не мигал белый экран
    backgroundColor: '#ffc629',
  },
}

export default config
