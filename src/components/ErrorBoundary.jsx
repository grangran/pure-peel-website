import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  handleGoHome = () => {
    window.history.pushState({ page: "/" }, "", "/")
    window.dispatchEvent(new Event("hashchange"))
    this.handleReset()
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-12">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Something Went Wrong
                </h1>
                <p className="text-gray-700 mb-2">
                  We're sorry, but something unexpected happened. Don't worry, your data is safe.
                </p>
                <p className="text-gray-600 text-sm">
                  Our team has been notified and we're working to fix the issue.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={this.handleReset}
                  className="px-8 py-4 text-base font-bold rounded-xl border-0 cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans bg-linear-to-br from-amber-500 to-amber-600 text-black shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:from-amber-400 hover:to-amber-500 hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(245,158,11,0.5)] active:translate-y-0"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="px-8 py-4 text-base font-bold rounded-xl border-2 border-amber-500 text-amber-600 bg-transparent cursor-pointer transition-all duration-300 uppercase tracking-wide font-sans hover:bg-amber-50 hover:border-amber-600 active:translate-y-0"
                >
                  Go Home
                </button>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="bg-gray-50 rounded-lg p-4 mt-2 overflow-auto max-h-64">
                    <pre className="text-xs text-red-600 whitespace-pre-wrap">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Render children normally if no error
    return this.props.children
  }
}

export default ErrorBoundary


