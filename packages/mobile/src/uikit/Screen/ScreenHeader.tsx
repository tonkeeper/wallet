import { ns } from '$utils';
import React from 'react';
import { View } from 'react-native';
import { NavBar } from '../NavBar/NavBar';

interface ScreenHeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
  hideBackButton?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = (props) => {
  const { rightContent, hideBackButton } = props;

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

  return (
    <NavBar 
      rightContent={rightContentContainer} 
      hideBackButton={hideBackButton}
    >
      {props.title}
    </NavBar>
  );
};
