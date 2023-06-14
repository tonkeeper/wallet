import { useMemo } from 'react';

export const useCommentMaxLength = (comment: string) => {
  /*
    Динамически ограничиваем максимальную длину текста, равную одной ячейке в тон формате (1023 бита)
    Это решает проблему мерцающего инпута, которая была при асинхронном хэндлинге введённого коммента
   */
  const dynamicMaxLength = useMemo(() => {
    const maxLength = 122;
    // eslint-disable-next-line no-undef
    const commentBits = new TextEncoder().encode(comment).length * 8;
    const calculatedMaxLength = Math.trunc(
      maxLength - Math.min(61, commentBits - comment.length * 8),
    );

    return calculatedMaxLength;
  }, [comment]);

  return dynamicMaxLength;
};
