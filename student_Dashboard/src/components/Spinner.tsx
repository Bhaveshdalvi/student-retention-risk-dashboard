import { memo } from "react";
import { motion } from "framer-motion";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    label?: string;
}

const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-[3px]",
};

export const Spinner = memo(({ size = "md", label }: SpinnerProps) => (
    <div className="flex flex-col items-center justify-center gap-3">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.85, ease: "linear" }}
            className={`${sizeMap[size]} rounded-full border-primary/20 border-t-primary`}
        />
        {label && (
            <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
        )}
    </div>
));
Spinner.displayName = "Spinner";

export const FullPageSpinner = memo(({ label = "Loading…" }: { label?: string }) => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" label={label} />
    </div>
));
FullPageSpinner.displayName = "FullPageSpinner";
