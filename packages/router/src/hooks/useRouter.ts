import { useNavigation } from '@react-navigation/native';

export const useRouter = () => {
  const nav = useNavigation<any>();

  return {
    navigate: (route: string, opts?: Record<string, any>) => nav.navigate(route, opts),
    goBack: () => nav.goBack(),
  };
};
