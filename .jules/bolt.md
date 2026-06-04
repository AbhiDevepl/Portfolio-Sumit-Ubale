# Bolt's Journal

## 2025-06-04 - Reactive State Subscription
**Learning:** In the PortfolioGallery architecture, modifying state (filteredList) doesn't automatically trigger a re-render unless the renderer is explicitly subscribed to state changes.
**Action:** Always ensure `this.state.subscribe` is wired to `this.renderer.render` in the `setup` phase.
