export function ThemeScript() {
  return {
    __html: `
      try {
        let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        let theme = window.localStorage.getItem('theme')
        if (theme === 'dark' || (!theme && isDark)) {
          document.documentElement.classList.add('dark')
        }
      } catch (e) {}
    `,
  }
} 