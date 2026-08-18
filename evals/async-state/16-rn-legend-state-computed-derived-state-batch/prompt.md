Using Legend State, build a cart screen with derived totals and batched updates.
Keep cart state in a Legend State observable store, model item count and subtotal as computed values inside the observable, and apply the promo action as one batched multi-field update.
Render the summary with fine-grained reactivity, isolating it with a reactive wrapper like `Memo`, so quantity changes do not re-render the whole screen.

No network requests are needed; seed the cart from the provided local catalog.
