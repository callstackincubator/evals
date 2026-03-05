"use client";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { CaretDown, CaretUp, X } from "@phosphor-icons/react";
import type {
  CategoryDefinition,
  CategoryScore,
  EvalMatrixEntry,
  EvalScore,
  ModelSummary,
} from "@/lib/types/evals";
import { cn, formatNumber, formatPct } from "@/lib/utils";
import { getPodiumRowStyle, ModelLogoSquare, RankBadge } from "@/components/tables/table-badges";

interface CategoryDrilldownTableProps {
  category: CategoryDefinition;
  models: ModelSummary[];
  evalMatrixById: Record<string, EvalMatrixEntry[]>;
}

interface SelectedEvalDetails {
  evalId: string;
  evalName: string;
  requirementsTotal: number;
}

function SharedColumns() {
  return (
    <colgroup>
      <col className="w-[52%]" />
      <col className="w-[24%]" />
      <col className="w-[24%]" />
    </colgroup>
  );
}

function emptyCategory(category: CategoryDefinition): CategoryScore {
  return {
    categoryId: category.id,
    categoryName: category.name,
    iconKey: category.iconKey,
    evalCount: 0,
    evals: [],
    scorePct: 0,
    contributionPct: 0,
    tokensUsed: 0,
  };
}

export function CategoryDrilldownTable({ category, models, evalMatrixById }: CategoryDrilldownTableProps) {
  const [expandedModelId, setExpandedModelId] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<SelectedEvalDetails | null>(null);

  const rows = useMemo(() => {
    return models
      .map((model) => {
        const categoryScore = model.categories[category.id] ?? emptyCategory(category);
        return { model, categoryScore };
      })
      .sort((left, right) => right.categoryScore.scorePct - left.categoryScore.scorePct)
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }));
  }, [category, models]);

  return (
    <>
      <div className="no-scrollbar h-full overflow-auto border border-zinc-800 bg-zinc-950">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <SharedColumns />

          <thead className="sticky top-0 z-10">
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-3 font-semibold">Model</th>
              <th className="px-4 py-3 text-center font-semibold">Score</th>
              <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Tokens Used</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(({ rank, model, categoryScore }, index) => {
              const isModelExpanded = expandedModelId === model.id;
              const isFirst = index === 0;
              const isLast = index === rows.length - 1;

              return (
                <FragmentRow
                  key={model.id}
                  modelId={model.id}
                  rank={rank}
                  isFirst={isFirst}
                  isLast={isLast}
                  isModelExpanded={isModelExpanded}
                  onToggleModel={() =>
                    setExpandedModelId((prev) => (prev === model.id ? null : model.id))
                  }
                  modelLabel={model.label}
                  score={categoryScore.scorePct}
                  tokensUsed={categoryScore.tokensUsed}
                  evalRows={categoryScore.evals}
                  selectedEval={selectedEval}
                  setSelectedEval={setSelectedEval}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <EvalDetailsDrawer
        selectedEval={selectedEval}
        evalMatrixById={evalMatrixById}
        onClose={() => setSelectedEval(null)}
      />
    </>
  );
}

interface FragmentRowProps {
  modelId: string;
  rank: number;
  isFirst: boolean;
  isLast: boolean;
  isModelExpanded: boolean;
  onToggleModel: () => void;
  modelLabel: string;
  score: number;
  tokensUsed: number;
  evalRows: EvalScore[];
  selectedEval: SelectedEvalDetails | null;
  setSelectedEval: Dispatch<SetStateAction<SelectedEvalDetails | null>>;
}

function FragmentRow({
  modelId,
  rank,
  isFirst,
  isLast,
  isModelExpanded,
  onToggleModel,
  modelLabel,
  score,
  tokensUsed,
  evalRows,
  selectedEval,
  setSelectedEval,
}: FragmentRowProps) {
  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        onClick={onToggleModel}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggleModel();
          }
        }}
        className={cn(
          "cursor-pointer border-b border-zinc-800/80 hover:bg-zinc-900/60",
          isFirst && "border-t-0",
          isLast && !isModelExpanded && "border-b-0",
          rank <= 3 && "border-l-2",
        )}
        style={getPodiumRowStyle(rank)}
      >
        <td className="px-4 py-5 font-medium text-zinc-100">
          <div className="flex items-center gap-3">
            <RankBadge rank={rank} />
            <span
              aria-hidden
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center border",
                isModelExpanded
                  ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400",
              )}
            >
              {isModelExpanded ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
            </span>
            <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
            <span>{modelLabel}</span>
          </div>
        </td>
        <td className="px-4 py-5 text-center font-mono text-zinc-300">{formatPct(score)}</td>
        <td className="px-4 py-5 text-center font-mono text-zinc-300 whitespace-nowrap">
          {formatNumber(tokensUsed)}
        </td>
      </tr>

      {isModelExpanded && evalRows.map((evalItem, evalIndex) => {
        const isSelected = selectedEval?.evalId === evalItem.evalId;
        const isEvalLast = evalIndex === evalRows.length - 1;
        const removeBottomBorder = isLast && isEvalLast;

        return (
          <tr
            key={`${modelId}:${evalItem.evalId}`}
            role="button"
            tabIndex={0}
            onClick={() =>
              setSelectedEval({
                evalId: evalItem.evalId,
                evalName: evalItem.name,
                requirementsTotal: evalItem.requirementsTotal,
              })
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedEval({
                  evalId: evalItem.evalId,
                  evalName: evalItem.name,
                  requirementsTotal: evalItem.requirementsTotal,
                });
              }
            }}
            className={cn(
              "cursor-pointer border-b border-zinc-800/80 bg-zinc-900/70 hover:bg-zinc-800/70",
              removeBottomBorder && "border-b-0",
              isSelected && "bg-zinc-800/60",
            )}
          >
            <td className="px-4 py-5 text-zinc-100">{evalItem.name}</td>
            <td className="px-4 py-5 text-center font-mono text-zinc-300">{formatPct(evalItem.scorePct)}</td>
            <td className="px-4 py-5 text-center font-mono text-zinc-300 whitespace-nowrap">
              {formatNumber(evalItem.tokensUsed)}
            </td>
          </tr>
        );
      })}
    </>
  );
}

interface EvalDetailsDrawerProps {
  selectedEval: SelectedEvalDetails | null;
  evalMatrixById: Record<string, EvalMatrixEntry[]>;
  onClose: () => void;
}

function EvalDetailsDrawer({ selectedEval, evalMatrixById, onClose }: EvalDetailsDrawerProps) {
  if (!selectedEval) {
    return null;
  }

  const rows = evalMatrixById[selectedEval.evalId] ?? [];

  return (
    <>
      <button
        type="button"
        aria-label="Close eval details"
        className="fixed inset-0 z-30 bg-black/50"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl border-l border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">{selectedEval.evalName}</h3>
            <p className="text-sm text-zinc-400">Requirements: {formatNumber(selectedEval.requirementsTotal)}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center border border-zinc-800 text-zinc-300 hover:bg-zinc-900"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="no-scrollbar h-[calc(100%-65px)] overflow-auto p-4">
          <div className="mt-2 border border-zinc-800 bg-zinc-950">
            <table className="min-w-full border-collapse text-sm">
              <thead className="text-zinc-400">
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Model</th>
                  <th className="px-4 py-3 text-center font-semibold">Score</th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">Tokens Used</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const rank = index + 1;
                  const isLast = index === rows.length - 1;

                  return (
                    <tr
                      key={`${selectedEval.evalId}:${row.modelId}`}
                      className={cn(
                        "border-b border-zinc-800/80 first:border-t-0",
                        isLast && "border-b-0",
                        rank <= 3 && "border-l-2",
                      )}
                      style={getPodiumRowStyle(rank)}
                    >
                      <td className="px-4 py-4 font-medium text-zinc-100">
                        <div className="flex items-center gap-3">
                          <RankBadge rank={rank} />
                          <ModelLogoSquare modelId={row.modelId} modelLabel={row.modelLabel} />
                          <span>{row.modelLabel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-zinc-300">{formatPct(row.scorePct)}</td>
                      <td className="px-4 py-4 text-center font-mono text-zinc-300 whitespace-nowrap">
                        {formatNumber(row.tokensUsed)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rows.length === 0 && (
              <p className="px-4 py-6 text-sm text-zinc-400">No eval data available for this item.</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
