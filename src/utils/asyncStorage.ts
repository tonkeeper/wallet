import AsyncStorage from '@react-native-async-storage/async-storage';

export const getTest = async () => {
  return await AsyncStorage.getItem('test');
};
