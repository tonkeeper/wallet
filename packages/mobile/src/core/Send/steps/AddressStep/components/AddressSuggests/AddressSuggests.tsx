import { SuggestedAddress } from '../../../../Send.interface';
import { List } from '$uikit';
import React, { FC, memo } from 'react';
import Animated, { Keyframe, SequencedTransition } from 'react-native-reanimated';
import { AddressSuggestCell } from '../AddressSuggestCell/AddressSuggestCell';

const enteringKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  100: {
    opacity: 1,
  },
});

const exitingKeyframe = new Keyframe({
  0: {
    opacity: 1,
  },
  100: {
    opacity: 0,
  },
});

interface Props {
  scrollY: Animated.SharedValue<number>;
  addresses: SuggestedAddress[];
  onPressSuggest: (suggest: SuggestedAddress) => void;
}

const AddressSuggestsComponent: FC<Props> = (props) => {
  const { scrollY, addresses, onPressSuggest } = props;

  return (
    <List separator={false}>
      {addresses.map((item, index) => (
        <Animated.View
          key={`${item.type}_${item.address}`}
          entering={enteringKeyframe.delay(250).duration(250)}
          exiting={exitingKeyframe.duration(250)}
          layout={SequencedTransition.duration(250)}
        >
          <AddressSuggestCell
            separator={index < addresses.length - 1}
            scrollY={scrollY}
            suggest={item}
            onPress={onPressSuggest}
          />
        </Animated.View>
      ))}
    </List>
  );
};

export const AddressSuggests = memo(AddressSuggestsComponent);
