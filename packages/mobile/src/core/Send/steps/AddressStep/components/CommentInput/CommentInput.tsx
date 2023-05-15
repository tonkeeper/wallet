import { useCommentMaxLength } from '$core/Send/hooks';
import { useTranslator } from '$hooks';
import { FormItem, Input, Text } from '$uikit';
import React, { FC, Ref, memo, useCallback, useMemo, useState } from 'react';
import * as S from './CommentInput.style';

interface Props {
  innerRef?: Ref<any>;
  comment: string;
  isCommentRequired: boolean;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
}

const CommentInputComponent: FC<Props> = (props) => {
  const { innerRef, comment, isCommentRequired, setComment, onSubmit } = props;

  const t = useTranslator();

  const [commentRequiredError, setCommentRequiredError] = useState(false);

  const dynamicMaxLength = useCommentMaxLength(comment);

  const commentCharactersLeftCount = dynamicMaxLength - comment.length;

  const commentCharactersExceededCount = comment.length - dynamicMaxLength;

  const commentCharactersLeftText =
    commentCharactersLeftCount >= 0 && commentCharactersLeftCount < 25
      ? t('send_screen_steps.comfirm.comment_characters_left', {
          count: commentCharactersLeftCount,
        })
      : null;

  const commentCharactersExceededText =
    commentCharactersExceededCount > 0
      ? t('send_screen_steps.comfirm.comment_characters_exceeded', {
          count: commentCharactersExceededCount,
        })
      : null;

  const commentDescription =
    isCommentRequired || commentCharactersLeftText || commentCharactersExceededText ? (
      <Text color="foregroundSecondary" variant="body2">
        {isCommentRequired ? (
          <Text variant="body2" color="accentOrange">
            {t('send_screen_steps.comfirm.comment_required_text')}
          </Text>
        ) : null}
        {isCommentRequired && (commentCharactersLeftText || commentCharactersExceededText)
          ? '\n'
          : null}
        {commentCharactersLeftText ? (
          <Text variant="body2" color="accentOrange">
            {commentCharactersLeftText}
          </Text>
        ) : null}
        {commentCharactersExceededText ? (
          <Text variant="body2" color="accentNegative">
            {commentCharactersExceededText}
          </Text>
        ) : null}
      </Text>
    ) : undefined;

  const commentInputValue = (
    <>
      {comment.slice(0, dynamicMaxLength)}
      <S.CommentExceededValue>{comment.slice(dynamicMaxLength)}</S.CommentExceededValue>
    </>
  );

  const handleCommentChange = useCallback(
    (text: string) => {
      setCommentRequiredError(isCommentRequired && text.length === 0);
      setComment(text);
    },
    [setComment, isCommentRequired],
  );

  return (
    <FormItem description={commentDescription}>
      <Input
        innerRef={innerRef}
        isFailed={commentRequiredError}
        value={commentInputValue}
        onChangeText={handleCommentChange}
        label={
          isCommentRequired
            ? t('send_screen_steps.comfirm.comment_label_required')
            : t('send_screen_steps.comfirm.comment_label')
        }
        returnKeyType="next"
        onSubmitEditing={onSubmit}
        multiline
        blurOnSubmit
        withPasteButton={isCommentRequired}
      />
    </FormItem>
  );
};

export const CommentInput = memo(CommentInputComponent);
