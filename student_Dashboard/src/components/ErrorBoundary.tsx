import { Component, type ReactNode, type ErrorInfo } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background px-4">
                    <div className="glass-card p-8 max-w-md w-full text-center space-y-5">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-destructive/10">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">
                                Something went wrong
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                The backend may be waking up after inactivity. Please wait a
                                few seconds and refresh — this usually resolves itself.
                            </p>
                        </div>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh page
                        </button>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <p className="text-[10px] text-muted-foreground/50 font-mono text-left break-all">
                                {this.state.error.message}
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
