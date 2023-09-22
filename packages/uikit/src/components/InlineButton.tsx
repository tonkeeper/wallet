import { TouchableOpacity } from './TouchableOpacity';
import { SText } from './Text';
import { memo } from 'react';

interface InlineButtonProps {
  onPress?: () => void;
  title: string;
}

export const InlineButton = memo<InlineButtonProps>((props) => {
  const { title, onPress } = props;
  return (
    <TouchableOpacity onPress={onPress}>
      <SText color="textAccent" type="label1">
        {title}
      </SText>
    </TouchableOpacity>
  );
});
