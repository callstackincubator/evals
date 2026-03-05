import { ModelLogoSquare } from "@/components/tables/table-badges";

interface AxisTickPayload {
  value?: string;
  payload?: Record<string, string | number>;
}

interface ModelAxisTickProps {
  modelIdByLabel?: Record<string, string>;
  x?: number;
  y?: number;
  payload?: AxisTickPayload;
}

export function ModelAxisTick({ modelIdByLabel, x = 0, y = 0, payload }: ModelAxisTickProps) {
  const modelLabel = String(payload?.value ?? "");
  const modelId = modelIdByLabel?.[modelLabel] ?? String(payload?.payload?.modelId ?? "");
  const displayLabel =
    modelLabel.length > 16 ? `${modelLabel.slice(0, 13).trimEnd()}...` : modelLabel;

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-60} y={8} width={120} height={34}>
        <div className="flex items-center justify-center gap-1 text-sm text-zinc-400">
          <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
          <span className="max-w-[92px] truncate" title={modelLabel}>{displayLabel}</span>
        </div>
      </foreignObject>
    </g>
  );
}
