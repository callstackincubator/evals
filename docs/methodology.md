# methodology

This repo evaluates model performance on React Native tasks using three eval types within a capability group.

## eval types

1) behavior evals
- measure user-visible behavior only
- no constraints on library choice

2) preference evals
- measure whether the model prefers a recommended approach
- preference is scored but does not hard-fail behavior

3) constraint evals
- require a specific library or technique
- constraint checks are required for pass

## eval results

Evals write `eval-results.json` with boolean fields:

- `behavior_pass`: behavior requirements met
- `preference_pass`: preferred technique used (optional)
- `constraint_pass`: required technique used
- `overall_pass`: true only when behavior and constraint pass

Results should be read by eval type, not collapsed into a single score unless behavior and constraint checks both pass.

## validation plan

- convergent validity: compare `behavior_pass` with independent human ratings of behavior quality
- discriminant validity: verify `preference_pass` and `constraint_pass` do not trivially track `behavior_pass`
- reliability: rerun evals across environments and verify stability of pass rates
- sensitivity: introduce controlled perturbations to prompts and ensure metric changes match expectations
