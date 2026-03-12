import { motion } from "framer-motion";

interface RiskGaugeProps {
  value: number; // 0-1
}

export function RiskGauge({ value }: RiskGaugeProps) {
  const percentage = value * 100;
  const angle = value * 180; // half circle
  const radius = 80;
  const cx = 100;
  const cy = 95;

  // Arc path for background
  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const needleEnd = polarToCartesian(cx, cy, radius - 10, angle);

  const getColor = () => {
    if (value <= 0.3) return "hsl(var(--risk-low))";
    if (value <= 0.6) return "hsl(var(--risk-medium))";
    return "hsl(var(--risk-high))";
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        {/* Background arc */}
        <path d={describeArc(0, 180)} fill="none" stroke="hsl(var(--border))" strokeWidth="12" strokeLinecap="round" />
        {/* Green zone */}
        <path d={describeArc(0, 54)} fill="none" stroke="hsl(var(--risk-low) / 0.4)" strokeWidth="12" strokeLinecap="round" />
        {/* Yellow zone */}
        <path d={describeArc(54, 108)} fill="none" stroke="hsl(var(--risk-medium) / 0.4)" strokeWidth="12" strokeLinecap="round" />
        {/* Red zone */}
        <path d={describeArc(108, 180)} fill="none" stroke="hsl(var(--risk-high) / 0.4)" strokeWidth="12" strokeLinecap="round" />

        {/* Active arc */}
        <motion.path
          d={describeArc(0, angle)}
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke={getColor()}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ x2: cx - radius + 10, y2: cy }}
          animate={{ x2: needleEnd.x, y2: needleEnd.y }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="4" fill={getColor()} />
      </svg>

      <motion.p
        className="text-2xl font-bold mt-1"
        style={{ color: getColor() }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {percentage.toFixed(1)}%
      </motion.p>
    </div>
  );
}
