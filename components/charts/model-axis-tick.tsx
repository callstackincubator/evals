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

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-82} y={8} width={164} height={34}>
        <div className="flex items-center justify-center gap-1 text-sm text-zinc-400">
          <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
          <span className="max-w-[134px] truncate">{modelLabel}</span>
        </div>
      </foreignObject>
    </g>
  );
}
