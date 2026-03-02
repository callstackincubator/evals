"use client";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import type { CategoryDefinition, CategoryScore, EvalScore, ModelSummary } from "@/lib/types/evals";
import { cn, formatPct } from "@/lib/utils";
import { getPodiumRowStyle, ModelLogoSquare, RankBadge } from "@/components/tables/table-badges";

interface CategoryDrilldownTableProps {
  category: CategoryDefinition;
  models: ModelSummary[];
}

interface SelectedEvalDetails {
  modelId: string;
  modelLabel: string;
  evalItem: EvalScore;
}

function RequirementStatusPill({ status }: { status: "pass" | "fail" }) {
  const pass = status === "pass";

  return (
    <span
      className={cn(
        "inline-flex min-w-16 items-center justify-center gap-1 border border-transparent px-2 py-1 text-xs font-medium",
        pass ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300",
      )}
    >
      {pass ? <Check size={12} weight="bold" /> : <X size={12} weight="bold" />}
      {pass ? "Pass" : "Fail"}
    </span>
  );
}

function CountPill({ value, tone }: { value: number; tone: "pass" | "fail" }) {
  const pass = tone === "pass";

  return (
    <span
      className={cn(
        "inline-flex min-w-16 items-center justify-center border border-transparent px-2 py-1 font-mono text-xs font-medium",
        pass ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300",
      )}
    >
      {value}
    </span>
  );
}

function SharedColumns() {
  return (
    <colgroup>
      <col className="w-[52%]" />
      <col className="w-[16%]" />
      <col className="w-[16%]" />
      <col className="w-[16%]" />
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
    passedWeight: 0,
    totalWeight: 0,
    scorePct: 0,
  };
}

export function CategoryDrilldownTable({ category, models }: CategoryDrilldownTableProps) {
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

          <thead className="sticky top-0 z-10 bg-zinc-900/95">
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-3 font-semibold">Model</th>
              <th className="px-4 py-3 text-center font-semibold">Score</th>
              <th className="px-4 py-3 text-center font-semibold">Passed</th>
              <th className="px-4 py-3 text-center font-semibold">Failed</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(({ rank, model, categoryScore }) => {
              const isModelExpanded = expandedModelId === model.id;

              return (
                <FragmentRow
                  key={model.id}
                  modelId={model.id}
                  rank={rank}
                  isModelExpanded={isModelExpanded}
                  onToggleModel={() =>
                    setExpandedModelId((prev) => (prev === model.id ? null : model.id))
                  }
                  modelLabel={model.label}
                  score={categoryScore.scorePct}
                  passedWeight={categoryScore.passedWeight}
                  totalWeight={categoryScore.totalWeight}
                  evalRows={categoryScore.evals}
                  selectedEval={selectedEval}
                  setSelectedEval={setSelectedEval}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <EvalDetailsDrawer selectedEval={selectedEval} onClose={() => setSelectedEval(null)} />
    </>
  );
}

interface FragmentRowProps {
  modelId: string;
  rank: number;
  isModelExpanded: boolean;
  onToggleModel: () => void;
  modelLabel: string;
  score: number;
  passedWeight: number;
  totalWeight: number;
  evalRows: EvalScore[];
  selectedEval: SelectedEvalDetails | null;
  setSelectedEval: Dispatch<SetStateAction<SelectedEvalDetails | null>>;
}

function FragmentRow({
  modelId,
  rank,
  isModelExpanded,
  onToggleModel,
  modelLabel,
  score,
  passedWeight,
  totalWeight,
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
          rank <= 3 && "border-l-2",
        )}
        style={getPodiumRowStyle(rank)}
      >
        <td className="px-4 py-5 font-medium text-zinc-100">
          <div className="flex items-center gap-3">
            <RankBadge rank={rank} />
            <ModelLogoSquare modelId={modelId} modelLabel={modelLabel} />
            <span>{modelLabel}</span>
          </div>
        </td>
        <td className="px-4 py-5 text-center font-mono text-zinc-300">{formatPct(score)}</td>
        <td className="px-4 py-5 text-center whitespace-nowrap">
          <CountPill value={passedWeight} tone="pass" />
        </td>
        <td className="px-4 py-5 text-center whitespace-nowrap">
          <CountPill value={totalWeight - passedWeight} tone="fail" />
        </td>
      </tr>

      {isModelExpanded && (
        <tr className="border-b border-zinc-800 bg-zinc-900/70">
          <td colSpan={4} className="p-0">
            <div className="overflow-hidden border-t border-zinc-800 bg-zinc-900">
              <table className="min-w-full table-fixed border-collapse text-sm">
                <SharedColumns />

                <tbody>
                  {evalRows.map((evalItem) => {
                    const isSelected =
                      selectedEval?.modelId === modelId && selectedEval.evalItem.evalId === evalItem.evalId;

                    return (
                      <tr
                        key={`${modelId}:${evalItem.evalId}`}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setSelectedEval({
                            modelId,
                            modelLabel,
                            evalItem,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedEval({
                              modelId,
                              modelLabel,
                              evalItem,
                            });
                          }
                        }}
                        className={cn(
                          "cursor-pointer border-b border-zinc-800/80 hover:bg-zinc-800/70",
                          isSelected && "bg-zinc-800/60",
                        )}
                      >
                        <td className="px-4 py-5 text-zinc-100">{evalItem.name}</td>
                        <td className="px-4 py-5 text-center font-mono text-zinc-300">{formatPct(evalItem.scorePct)}</td>
                        <td className="px-4 py-5 text-center whitespace-nowrap">
                          <CountPill value={evalItem.passedWeight} tone="pass" />
                        </td>
                        <td className="px-4 py-5 text-center whitespace-nowrap">
                          <CountPill value={evalItem.totalWeight - evalItem.passedWeight} tone="fail" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface EvalDetailsDrawerProps {
  selectedEval: SelectedEvalDetails | null;
  onClose: () => void;
}

function EvalDetailsDrawer({ selectedEval, onClose }: EvalDetailsDrawerProps) {
  if (!selectedEval) {
    return null;
  }

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
            <h3 className="text-base font-semibold text-zinc-100">{selectedEval.evalItem.name}</h3>
            <p className="text-sm text-zinc-400">{selectedEval.modelLabel}</p>
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
              <thead className="bg-zinc-900 text-zinc-400">
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide">
                  <th className="px-3 py-2">Requirement</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedEval.evalItem.requirements.map((requirement) => (
                  <tr key={requirement.requirementId} className="border-b border-zinc-800/80">
                    <td className="px-3 py-2 text-zinc-200">{requirement.description}</td>
                    <td className="px-3 py-2">
                      <RequirementStatusPill status={requirement.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </>
  );
}
