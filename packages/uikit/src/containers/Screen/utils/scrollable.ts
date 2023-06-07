export type ScrollOptions = { x?: number; y?: number; animated?: boolean };

export type ScrollableView =
  | { scrollTo(options: ScrollOptions): void }
  | { scrollToOffset(options: { offset?: number; animated?: boolean }): void }
  | { scrollResponderScrollTo(options: ScrollOptions): void };

export type ScrollableWrapper =
  | { getScrollResponder(): ScrollableView }
  | { getNode(): ScrollableView }
  | ScrollableView;

export function getScrollableNode(ref: React.RefObject<ScrollableWrapper>): ScrollableView | null {
  if (ref.current === null) {
    return null;
  }

  if (
    'scrollToTop' in ref.current ||
    'scrollTo' in ref.current ||
    'scrollToOffset' in ref.current ||
    'scrollResponderScrollTo' in ref.current
  ) {
    return ref.current as ScrollableView;
  } else if ('getScrollResponder' in ref.current) {
    return ref.current.getScrollResponder();
  } else if ('getNode' in ref.current) {
    return ref.current.getNode();
  } else {
    return ref.current;
  }
}

export function getScrollTo(scrollable: ScrollableView | null) {
  if (scrollable) {
    if ('scrollTo' in scrollable) {
      return scrollable.scrollTo;
    } else if ('scrollToOffset' in scrollable) {
      return (opts: ScrollOptions) => {
        scrollable.scrollToOffset({ offset: opts.y, animated: opts.animated });
      };
    } else if ('scrollResponderScrollTo' in scrollable) {
      return scrollable.scrollResponderScrollTo;
    }
  }

  return (opts: ScrollOptions) => {};
}
