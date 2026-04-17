import { ModelLogoSquare } from "@/components/tables/table-badges";

const DESKTOP_SCORE_AXIS_WIDTH = 44;
const X_AXIS_LABEL_GAP = 2;
const DEFAULT_X_AXIS_LABEL_WIDTH = 64;

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

export function getDesktopModelAxisLabelWidth(containerWidth: number, labelCount: number): number {
  if (containerWidth <= 0 || labelCount <= 0) {
    return DEFAULT_X_AXIS_LABEL_WIDTH;
  }

  const chartWidth = Math.max(0, containerWidth - DESKTOP_SCORE_AXIS_WIDTH);
  const slotWidth = chartWidth / labelCount;

  return Math.max(1, Math.floor(slotWidth - X_AXIS_LABEL_GAP));
}

function getTickFontSize(labelWidth: number, orientation: "x" | "y"): number {
  if (orientation === "y") {
    return 14;
  }

  if (labelWidth < 54) {
    return 10;
  }

  if (labelWidth < 72) {
    return 11;
  }

  if (labelWidth < 92) {
    return 12;
  }

  return 14;
}

export function ModelAxisTick({
  align = "center",
  labelWidth = 88,
  modelIdByLabel,
  orientation = "x",
  x = 0,
  y = 0,
  payload,
}: ModelAxisTickProps) {
  const modelLabel = String(payload?.value ?? "");
  const modelId = modelIdByLabel?.[modelLabel] ?? String(payload?.payload?.modelId ?? "");
  const isYAxis = orientation === "y";
  const xLabelHeight = 58;
  const fontSize = getTickFontSize(labelWidth, orientation);
  const gap = isYAxis || labelWidth >= 54 ? 4 : 2;
  const xOffset = isYAxis ? -labelWidth + 10 : -(labelWidth / 2);
  const yOffset = isYAxis ? -14 : 8;
  const height = isYAxis ? 28 : xLabelHeight;

  if (!isYAxis) {
    return (
      <g transform={`translate(${x},${y})`}>
        <foreignObject x={xOffset} y={yOffset} width={labelWidth} height={height}>
          <div
            className="flex h-full w-full flex-col items-center overflow-hidden text-center leading-tight text-zinc-400"
            style={{
              boxSizing: "border-box",
              fontSize: `${fontSize}px`,
              gap: `${gap}px`,
            }}
          >
            <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
            <span
              className="font-medium"
              style={{
                display: "-webkit-box",
                maxWidth: "100%",
                overflow: "hidden",
                overflowWrap: "anywhere",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
              title={modelLabel}
            >
              {modelLabel}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={xOffset} y={yOffset} width={labelWidth} height={height}>
        <div
          className="flex min-w-0 items-center overflow-hidden text-zinc-400"
          style={{
            boxSizing: "border-box",
            gap: `${gap}px`,
            justifyContent: align === "left" ? "flex-start" : "center",
            paddingLeft: isYAxis ? "4px" : "0",
            width: "100%",
            fontSize: `${fontSize}px`,
          }}
        >
          <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
          <span
            className="min-w-0 flex-1 truncate"
            title={modelLabel}
          >
            {modelLabel}
          </span>
        </div>
      </foreignObject>
    </g>
  );
}
