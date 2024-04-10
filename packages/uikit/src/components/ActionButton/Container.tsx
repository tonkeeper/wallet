import React, { memo, ReactNode } from 'react';
import { Separators } from './Separators';
import { View } from '../View';
import { Steezy } from '../../styles';
import { ActionButtonProps, ActionButton } from './ActionButton';

export interface ActionButtonsContainerProps {
  buttons: (ActionButtonProps & { id: string; visible?: boolean })[];
}

export const ActionButtons = memo<ActionButtonsContainerProps>((props) => {
  const buttonsToBeRendered = props.buttons.filter(
    (button) => button && (button.visible == null || button.visible),
  );

  return (
    <View style={styles.container}>
      <Separators numOfActions={buttonsToBeRendered.length} />
      {buttonsToBeRendered.map((button, index) => (
        <ActionButton
          inRow={Math.min(buttonsToBeRendered.length, 3)}
          key={button.id}
          {...button}
        />
      ))}
    </View>
  );
});

const styles = Steezy.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 19.5,
  },
});
