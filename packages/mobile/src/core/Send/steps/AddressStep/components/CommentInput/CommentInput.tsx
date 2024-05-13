import { t } from '@tonkeeper/shared/i18n';
import { FormItem, Input, Text } from '$uikit';
import React, {
  FC,
  RefObject,
  memo,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { TextInput } from 'react-native-gesture-handler';

interface Props {
  innerRef?: RefObject<TextInput>;
  comment: string;
  isAbleToEncryptComment: boolean;
  isCommentValid: boolean;
  isCommentRequired: boolean;
  isCommentEncrypted: boolean;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  setCommentEncrypted: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: () => void;
}

const CommentInputComponent: FC<Props> = (props) => {
  const {
    innerRef,
    comment,
    isAbleToEncryptComment,
    isCommentRequired,
    isCommentValid,
    isCommentEncrypted,
    setComment,
    setCommentEncrypted,
    onSubmit,
  } = props;

  const [commentRequiredError, setCommentRequiredError] = useState(false);

  const toggleEncrypted = useCallback(() => {
    setCommentEncrypted((s) => !s);
  }, [setCommentEncrypted]);

  const commentVisibilityText = isCommentEncrypted
    ? t('send_screen_steps.comfirm.comment_description_encrypted')
    : t('send_screen_steps.comfirm.comment_description');

  const commentLabel = useMemo(() => {
    if (isCommentRequired) {
      return t('send_screen_steps.comfirm.comment_label_required');
    }
    if (isCommentEncrypted) {
      return t('send_screen_steps.comfirm.comment_label_encrypted');
    }
    return t('send_screen_steps.comfirm.comment_label');
  }, [isCommentRequired, isCommentEncrypted]);

  const commentDescription =
    comment.length > 0 || isCommentRequired ? (
      <Text color="foregroundSecondary" variant="body2">
        {isCommentRequired ? (
          <Text variant="body2" color="accentOrange">
            {t('send_screen_steps.comfirm.comment_required_text')}
          </Text>
        ) : null}
        {comment.length > 0 && !isCommentRequired ? commentVisibilityText : null}
        {comment.length > 0 && isAbleToEncryptComment ? (
          <>
            {' '}
            <Text color="accentPrimary" variant="body2" onPress={toggleEncrypted}>
              {isCommentEncrypted
                ? t('send_screen_steps.comfirm.comment_decrypt')
                : t('send_screen_steps.comfirm.comment_encrypt')}
            </Text>
          </>
        ) : null}
      </Text>
    ) : undefined;

  const handleCommentChange = useCallback(
    (text: string) => {
      setCommentRequiredError(isCommentRequired && text.length === 0);
      setComment(text);
    },
    [setComment, isCommentRequired],
  );

  useEffect(() => {
    if (!isCommentRequired) {
      setCommentRequiredError(false);
    }
  }, [isCommentRequired]);

  return (
    <FormItem
      description={
        comment.length > 0 && !isCommentValid ? (
          <Text variant="body2" color="accentRed">
            {t('send_screen_steps.comfirm.comment_ascii_text')}
          </Text>
        ) : (
          commentDescription
        )
      }
    >
      <Input
        innerRef={innerRef}
        isFailed={commentRequiredError || !isCommentValid}
        isSuccessful={isCommentEncrypted}
        value={comment}
        onChangeText={handleCommentChange}
        label={commentLabel}
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
