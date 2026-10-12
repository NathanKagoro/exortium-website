// Index arithmetic for the case-study carousel.

export function wrapIndex(index, count) {
  if (!Number.isInteger(count) || count <= 0) return 0;
  return ((Math.trunc(index) % count) + count) % count;
}

// Which slide is showing, given how far the track has scrolled.
export function indexFromScroll(scrollLeft, slideWidth, count) {
  if (!(slideWidth > 0) || !(count > 0)) return 0;
  const i = Math.round(scrollLeft / slideWidth);
  return Math.min(count - 1, Math.max(0, i));
}
