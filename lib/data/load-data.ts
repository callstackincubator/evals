import rawCatalog from "@/data/eval-catalog.json";
import rawResults from "@/data/model-results.json";
import { normalizeDashboardData } from "@/lib/data/normalize";
import { evalCatalogSchema, modelResultsSchema, type DashboardData } from "@/lib/types/evals";

const EXPECTED_CATEGORY_EVAL_COUNTS: Record<string, number> = {
  animation: 16,
  "async-state": 16,
  permissions: 24,
  lists: 18,
  navigation: 50,
  storage: 18,
};

function validateCategoryCounts(categoryCounts: Record<string, number>) {
  for (const [categoryId, expectedCount] of Object.entries(EXPECTED_CATEGORY_EVAL_COUNTS)) {
    if (categoryCounts[categoryId] !== expectedCount) {
      throw new Error(
        `Category ${categoryId} expected ${expectedCount} evals but received ${categoryCounts[categoryId] ?? 0}`,
      );
    }
  }
}

export function loadDashboardData(): DashboardData {
  const catalog = evalCatalogSchema.parse(rawCatalog);
  const results = modelResultsSchema.parse(rawResults);

  const categoryCounts = Object.fromEntries(
    catalog.categories.map((category) => [category.id, category.evals.length]),
  );

  validateCategoryCounts(categoryCounts);

  return normalizeDashboardData(catalog, results);
}
