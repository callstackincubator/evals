import { ModelLogoSquare } from "@/components/tables/table-badges";

interface AxisTickPayload {
  value?: string;
  payload?: Record<string, string | number>;
}

interface ModelAxisTickProps {
  align?: "center" | "left";
  labelWidth?: number;
  modelIdByLabel?: Record<string, string>;
  orientation?: "x" | "y";
  x?: number;
  y?: number;
  payload?: AxisTickPayload;
}

export function ModelAxisTick({
  align = "center",
  labelWidth = 120,
  modelIdByLabel,
  orientation = "x",
  x = 0,
  y = 0,
  payload,
}: ModelAxisTickProps) {
  const modelLabel = String(payload?.value ?? "");
  const modelId = modelIdByLabel?.[modelLabel] ?? String(payload?.payload?.modelId ?? "");
  const maxLength = orientation === "y" ? 18 : 16;
  const sliceLength = orientation === "y" ? 15 : 13;
  const displayLabel =
    modelLabel.length > maxLength ? `${modelLabel.slice(0, sliceLength).trimEnd()}...` : modelLabel;
  const isYAxis = orientation === "y";
  const xOffset = isYAxis ? -labelWidth + 10 : -(labelWidth / 2);
  const yOffset = isYAxis ? -14 : 8;
  const height = isYAxis ? 28 : 34;
  const maxTextWidth = isYAxis ? labelWidth - 28 : labelWidth - 28;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={xOffset} y={yOffset} width={labelWidth} height={height}>
        <div
          className="flex items-center gap-1 text-sm text-zinc-400"
          style={{
            justifyContent: align === "left" ? "flex-start" : "center",
            paddingLeft: isYAxis ? "4px" : "0",
          }}
        >
          <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
          <span
            className="truncate"
            style={{ maxWidth: `${maxTextWidth}px` }}
            title={modelLabel}
          >
            {displayLabel}
          </span>
        </div>
      </foreignObject>
    </g>
  );
}
