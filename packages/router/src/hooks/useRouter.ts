import { useNavigation } from '@react-navigation/native';

export const useRouter = () => {
  const nav = useNavigation<any>();

  return {
    navigate: (route: string) => nav.navigate(route),
    goBack: () => nav.goBack(),
  };
};
