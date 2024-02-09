import { useSubscriptions } from '../../hooks/useSubscriptions';

export const useSubscription = (address?: string) => {
  const subscriptions = useSubscriptions((state) => state.subscriptions);
  if (address) {
    return subscriptions[address];
  }

  return null;
};
