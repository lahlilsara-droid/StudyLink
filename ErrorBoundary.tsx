import * as React from 'react';
import { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // @ts-ignore
    if (this.state.hasError) {
      let errorMessage = "Une erreur inattendue s'est produite.";
      
      try {
        // Check if it's a Firestore JSON error
        // @ts-ignore
        const firestoreError = JSON.parse(this.state.error?.message || '{}');
        if (firestoreError.error && firestoreError.operationType) {
          errorMessage = `Erreur de base de données (${firestoreError.operationType}) : ${firestoreError.error}`;
          if (firestoreError.error.includes('permission-denied')) {
            errorMessage = "Vous n'avez pas les permissions nécessaires pour accéder à ces données. Veuillez contacter l'administrateur.";
          }
        }
      } catch (e) {
        // Not a JSON error, use the raw message if available
        // @ts-ignore
        if (this.state.error?.message) {
          // @ts-ignore
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1B2559] mb-2">Oups ! Quelque chose s'est mal passé</h2>
            <p className="text-[#A3AED0] mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#4318FF] text-white py-3 rounded-xl font-bold hover:bg-[#3311DB] transition-all"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
