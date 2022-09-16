import React from 'react';
import { View } from 'react-native';
import { ErrorScreen } from '../screens/ErrorScreen';

type ErrorBoundaryState = {
  isError: boolean;
  retry: number;
  message: string;
}

export class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);

    this.state = { isError: false, retry: 0, message: '' };
  }

  componentDidCatch(error: Error) {
    const message = `${error?.message} \n ----- \n ${error?.stack}`;
    this.setState({ isError: true, message });
  }

  private refresh = () => {
    this.setState({ 
      retry: this.state.retry + 1,
      isError: false, 
      message: '',
    });
  }

  render() {
    if (this.state.isError) {
      return (
        <ErrorScreen 
          message={this.state.message}
          refresh={this.refresh} 
        />
      );
    }

    return (
      <View key={'try-' + this.state.retry} style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}
