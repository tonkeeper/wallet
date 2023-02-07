import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AuthState,
  defaultAuthState,
} from '@tonkeeper/core-js/src/entries/password';
import { AppKey } from '@tonkeeper/core-js/src/Keys';
import { useStorage } from '../hooks/storage';
import { QueryKey } from '../libs/queryKey';

export const useAuthState = () => {
  const storage = useStorage();
  return useQuery([QueryKey.password], async () => {
    const auth = await storage.get<AuthState>(AppKey.password);
    return auth ?? defaultAuthState;
  });
};

export const useMutateAuthState = () => {
  const storage = useStorage();
  const client = useQueryClient();
  return useMutation<void, Error, AuthState>(async (state) => {
    await storage.set(AppKey.password, state);
    await client.invalidateQueries([QueryKey.password]);
  });
};

export const useLookScreen = () => {
  const storage = useStorage();
  return useQuery([QueryKey.lock], async () => {
    const lock = await storage.get<boolean>(AppKey.lock);
    return lock ?? false;
  });
};

export const useMutateLookScreen = () => {
  const storage = useStorage();
  const client = useQueryClient();
  return useMutation<void, Error, boolean>(async (value) => {
    await storage.set(AppKey.lock, value);
    await client.invalidateQueries([QueryKey.lock]);
  });
};
