import { ns } from '$utils';
import React, { memo } from 'react';
import { View } from 'react-native';
import { NavBar } from '../NavBar/NavBar';
import { ScreenLargeHeader } from './ScreenLagreHeader';

interface ScreenHeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
  backButton?: boolean;
  large?: boolean;
}

export const ScreenHeader = memo<ScreenHeaderProps>((props) => {
  const { rightContent, backButton = true } = props;

  const rightContentContainer = React.useMemo(() => {
    if (rightContent) {
      return (
        <View style={{ marginRight: ns(16) }}>
          {rightContent}
        </View>
      );
    }

    return null;
  }, [rightContent]);


  if (props.large) {
    return (
      <ScreenLargeHeader 
        navBarTitle={props.title}
      />
    )
  }

  return (
    <NavBar 
      rightContent={rightContentContainer} 
      hideBackButton={!backButton}
    >
      {props.title}
    </NavBar>
  );
});