import { memo } from 'react';
import {
  EncryptedComment,
  EncryptedCommentLayout,
  EncryptedCommentProps,
} from '@tonkeeper/shared/components';
import { useContentHighlightStyle } from './useContentHighlightStyle';

type ListItemContentTextProps = Omit<EncryptedCommentProps, 'layout'>;

export const ListItemEncryptedComment = memo<ListItemContentTextProps>((props) => {
  const highlightStyle = useContentHighlightStyle();

  return (
    <EncryptedComment
      backgroundStyle={highlightStyle}
      layout={EncryptedCommentLayout.BUBBLE}
      {...props}
    />
  );
});
