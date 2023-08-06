import React from 'react';
import { Button, View } from '$uikit';
import { Steezy } from '$styles';
import { memo, useMemo } from 'react';
import { isArray } from 'lodash';

export interface ProgrammableButton {
  label?: string;
  style?: string;
  uri?: string;
}

export interface ProgrammableButtonsProps {
  buttons: ProgrammableButton[];
}

const ProgrammableButtonsComponent = (props: ProgrammableButtonsProps) => {
  const buttons = useMemo(() => {
    if (!props.buttons || !isArray(props.buttons)) {
      return [];
    }

    return props.buttons.slice(0, 5).filter((button) => button?.label && button?.uri);
  }, [props.buttons]);

  return (
    <View style={styles.container}>
      {buttons.map((button) => (
        <View key={button.label} style={styles.buttonContainer}>
          <Button mode="secondary">{button.label}</Button>
        </View>
      ))}
    </View>
  );
};

export const ProgrammableButtons = memo(ProgrammableButtonsComponent);

const styles = Steezy.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 16,
  },
});
