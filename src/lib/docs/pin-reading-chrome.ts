/** Keep reading chrome inside the visible document body, not the workspace sidebars. */
export function pinReadingChrome(node: HTMLElement) {
  const place = () => {
    const frame = node.closest(".docs-display-view");
    if (!(frame instanceof HTMLElement)) return;
    const rect = frame.getBoundingClientRect();
    node.style.position = "fixed";
    node.style.top = `${rect.top}px`;
    node.style.left = `${rect.left}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
    node.style.right = "auto";
    node.style.bottom = "auto";
  };

  place();
  const frame = node.closest(".docs-display-view");
  const observer =
    frame && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(place)
      : null;
  if (frame) observer?.observe(frame);
  window.addEventListener("scroll", place, true);
  window.addEventListener("resize", place);

  return {
    destroy() {
      observer?.disconnect();
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    },
  };
}
