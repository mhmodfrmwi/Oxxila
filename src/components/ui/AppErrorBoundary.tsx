import { Component, type ErrorInfo, type ReactNode } from 'react'
import { withTranslation, type WithTranslation } from 'react-i18next'

interface State {
  failed: boolean
}

/** Last line of defence: a render error shows a recovery screen instead of a blank page. */
class Boundary extends Component<WithTranslation & { children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const { t } = this.props
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl text-primary-text">
            {t('errors.boundary.title', { defaultValue: 'Something went wrong' })}
          </h1>
          <p className="mt-2 text-sm text-secondary-text">
            {t('errors.boundary.body', { defaultValue: 'Please reload the page or head back home.' })}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-full bg-button-primary px-5 py-2 text-sm text-on-emphasis"
              onClick={() => window.location.reload()}
            >
              {t('errors.boundary.reload', { defaultValue: 'Reload' })}
            </button>
            <a href="/" className="rounded-full border border-border-subtle px-5 py-2 text-sm text-primary-text">
              {t('errors.boundary.home', { defaultValue: 'Home' })}
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export const AppErrorBoundary = withTranslation()(Boundary)
