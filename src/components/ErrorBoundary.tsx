import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary: Fängt unerwartete Laufzeitfehler in Kindkomponenten ab
 * und zeigt ein sauberes Fallback-UI im Cosmic-Glass-Design.
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border-strong)',
              borderRadius: '20px',
              padding: '32px 24px',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>☀️</div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-bright)' }}>
              Etwas ist schiefgelaufen / Something went wrong
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
              Die Sonnenzeit-App hat einen unerwarteten Fehler abgefangen.
            </p>
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              🔄 Seite neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
