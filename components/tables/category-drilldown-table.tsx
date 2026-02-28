"use client";

import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import type { CategoryDefinition, EvalScore, ModelSummary } from "@/lib/types/evals";
import { cn, formatPct } from "@/lib/utils";
import {
  DeltaBadge,
  getPodiumRowStyle,
  ModelLogoSquare,
  RankBadge,
} from "@/components/tables/table-badges";

interface CategoryDrilldownTableProps {
  category: CategoryDefinition;
  models: ModelSummary[];
}

interface EvalRow {
  vanilla: EvalScore;
  callstack: EvalScore;
}

interface SelectedEvalDetails {
  modelId: string;
  modelLabel: string;
  vanilla: EvalScore;
  callstack: EvalScore;
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

function SharedColumns() {
  return (
    <colgroup>
      <col className="w-[38%]" />
      <col className="w-[14%]" />
      <col className="w-[14%]" />
      <col className="w-[12%]" />
      <col className="w-[20%]" />
    </colgroup>
  );
}

export function CategoryDrilldownTable({ category, models }: CategoryDrilldownTableProps) {
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});
  const [selectedEval, setSelectedEval] = useState<SelectedEvalDetails | null>(null);

  const rows = useMemo(() => {
    return models.map((model) => {
      const vanillaCategory = model.variants.vanilla.categories[category.id];
      const callstackCategory = model.variants.callstack.categories[category.id];
      const callstackByEvalId = new Map(
        callstackCategory.evals.map((evalItem) => [evalItem.evalId, evalItem]),
      );

      const evalRows: EvalRow[] = vanillaCategory.evals.map((evalItem) => ({
        vanilla: evalItem,
        callstack: callstackByEvalId.get(evalItem.evalId) ?? evalItem,
      }));

      return {
        model,
        vanillaCategory,
        callstackCategory,
        evalRows,
      };
    })
      .sort(
        (left, right) =>
          Math.max(right.vanillaCategory.scorePct, right.callstackCategory.scorePct) -
          Math.max(left.vanillaCategory.scorePct, left.callstackCategory.scorePct),
      )
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }));
  }, [category.id, models]);

  return (
    <>
      <div className="no-scrollbar h-full overflow-auto border border-zinc-800 bg-zinc-950">
        <table className="min-w-full table-fixed border-collapse text-sm">
          <SharedColumns />

          <thead className="sticky top-0 z-10 bg-zinc-900/95">
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-3 font-semibold">Model</th>
              <th className="px-4 py-3 font-semibold">Vanilla</th>
              <th className="px-4 py-3 font-semibold">Callstack</th>
              <th className="px-4 py-3 font-semibold">Delta</th>
              <th className="px-4 py-3 font-semibold">Req stats (V/C)</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(({ rank, model, vanillaCategory, callstackCategory, evalRows }) => {
              const isModelExpanded = Boolean(expandedModels[model.id]);

              return (
                <FragmentRow
                  key={model.id}
                  modelId={model.id}
                  rank={rank}
                  isModelExpanded={isModelExpanded}
                  onToggleModel={() =>
                    setExpandedModels((prev) => ({
                      ...prev,
                      [model.id]: !prev[model.id],
                    }))
                  }
                  modelLabel={model.label}
                  vanillaScore={vanillaCategory.scorePct}
                  callstackScore={callstackCategory.scorePct}
                  vanillaPassed={vanillaCategory.passedRequirements}
                  vanillaTotal={vanillaCategory.totalRequirements}
                  callstackPassed={callstackCategory.passedRequirements}
                  callstackTotal={callstackCategory.totalRequirements}
                  evalRows={evalRows}
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
        onClose={() => setSelectedEval(null)}
      />
    </>
  );
}

interface FragmentRowProps {
  modelId: string;
  rank: number;
  isModelExpanded: boolean;
  onToggleModel: () => void;
  modelLabel: string;
  vanillaScore: number;
  callstackScore: number;
  vanillaPassed: number;
  vanillaTotal: number;
  callstackPassed: number;
  callstackTotal: number;
  evalRows: EvalRow[];
  selectedEval: SelectedEvalDetails | null;
  setSelectedEval: Dispatch<SetStateAction<SelectedEvalDetails | null>>;
}

function FragmentRow({
  modelId,
  rank,
  isModelExpanded,
  onToggleModel,
  modelLabel,
  vanillaScore,
  callstackScore,
  vanillaPassed,
  vanillaTotal,
  callstackPassed,
  callstackTotal,
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
        <td className="px-4 py-5 text-zinc-300">{formatPct(vanillaScore)}</td>
        <td className="px-4 py-5 text-zinc-300">{formatPct(callstackScore)}</td>
        <td className="px-4 py-5">
          <DeltaBadge value={callstackScore - vanillaScore} />
        </td>
        <td className="px-4 py-5 text-zinc-300 whitespace-nowrap">
          {vanillaPassed}/{vanillaTotal} | {callstackPassed}/{callstackTotal}
        </td>
      </tr>

      {isModelExpanded && (
        <tr className="border-b border-zinc-800 bg-zinc-900/70">
          <td colSpan={5} className="p-0">
            <div className="overflow-hidden border-t border-zinc-800 bg-zinc-900">
              <table className="min-w-full table-fixed border-collapse text-sm">
                <SharedColumns />

                <thead className="bg-zinc-800 text-zinc-400">
                  <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide">
                    <th className="px-4 py-2">Eval</th>
                    <th className="px-4 py-2">Vanilla</th>
                    <th className="px-4 py-2">Callstack</th>
                    <th className="px-4 py-2">Delta</th>
                    <th className="px-4 py-2">Req stats (V/C)</th>
                  </tr>
                </thead>

                <tbody>
                  {evalRows.map(({ vanilla, callstack }) => {
                    const isSelected =
                      selectedEval?.modelId === modelId && selectedEval.vanilla.evalId === vanilla.evalId;

                    return (
                      <tr
                        key={`${modelId}:${vanilla.evalId}`}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          setSelectedEval({
                            modelId,
                            modelLabel,
                            vanilla,
                            callstack,
                          })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedEval({
                              modelId,
                              modelLabel,
                              vanilla,
                              callstack,
                            });
                          }
                        }}
                        className={cn(
                          "cursor-pointer border-b border-zinc-800/80 hover:bg-zinc-800/70",
                          isSelected && "bg-zinc-800/60",
                        )}
                      >
                        <td className="px-4 py-5 text-zinc-100">
                          <div className="flex items-center gap-3">
                            <span>{vanilla.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-zinc-300">{formatPct(vanilla.scorePct)}</td>
                        <td className="px-4 py-5 text-zinc-300">{formatPct(callstack.scorePct)}</td>
                        <td className="px-4 py-5">
                          <DeltaBadge value={callstack.scorePct - vanilla.scorePct} />
                        </td>
                        <td className="px-4 py-5 text-zinc-300 whitespace-nowrap">
                          {vanilla.passedRequirements}/{vanilla.totalRequirements} | {" "}
                          {callstack.passedRequirements}/{callstack.totalRequirements}
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
            <h3 className="text-base font-semibold text-zinc-100">{selectedEval.vanilla.name}</h3>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Prompt</p>
          <pre className="mt-2 overflow-auto border border-zinc-800 bg-zinc-900 p-3 text-xs leading-relaxed text-zinc-200 whitespace-pre-wrap">
            {selectedEval.vanilla.prompt}
          </pre>

          <div className="mt-4 border border-zinc-800 bg-zinc-950">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide">
                  <th className="px-3 py-2">Requirement</th>
                  <th className="px-3 py-2">Vanilla</th>
                  <th className="px-3 py-2">Callstack</th>
                </tr>
              </thead>
              <tbody>
                {selectedEval.vanilla.requirements.map((requirement) => {
                  const callstackRequirement =
                    selectedEval.callstack.requirements.find(
                      (item) => item.requirementId === requirement.requirementId,
                    ) ?? requirement;

                  return (
                    <tr key={requirement.requirementId} className="border-b border-zinc-800/80">
                      <td className="px-3 py-2 text-zinc-200">{requirement.text}</td>
                      <td className="px-3 py-2">
                        <RequirementStatusPill status={requirement.status} />
                      </td>
                      <td className="px-3 py-2">
                        <RequirementStatusPill status={callstackRequirement.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </>
  );
}
