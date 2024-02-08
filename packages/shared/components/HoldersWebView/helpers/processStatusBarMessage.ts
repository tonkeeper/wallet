import { StatusBarStyle } from 'react-native';

export function processStatusBarMessage(
  parsed: any,
  setStatusBarStyle: (style: StatusBarStyle) => void,
  setStatusBarBackgroundColor: (backgroundColor: string, animated: boolean) => void,
) {
  if (
    typeof parsed.data.name === 'string' &&
    (parsed.data.name as string).startsWith('status-bar.')
  ) {
    const actionType = parsed.data.name.split('.')[1];

    switch (actionType) {
      case 'setStatusBarStyle':
        const style = parsed.data.args[0];
        if (style === 'dark') {
          setStatusBarStyle('light-content');
        } else if (style === 'light') {
          setStatusBarStyle('dark-content');
        } else {
          console.warn('Invalid status bar style');
        }
        break;
      case 'setStatusBarBackgroundColor':
        const backgroundColor = parsed.data.args[0];
        setStatusBarBackgroundColor(backgroundColor, true);
        break;
      default:
        console.warn('Invalid status bar action type');
    }
    return true;
  }
  return false;
}
