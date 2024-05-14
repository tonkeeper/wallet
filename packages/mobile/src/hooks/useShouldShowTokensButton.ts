import { useInscriptionData } from '$core/ManageTokens/hooks/useInscriptionData';
import { useJettonData } from '$core/ManageTokens/hooks/useJettonData';
import { useNftData } from '$core/ManageTokens/hooks/useNftData';

export const useShouldShowTokensButton = () => {
  const jettonData = useJettonData();
  const inscriptionData = useInscriptionData();
  const nftData = useNftData();

  return Boolean(
    jettonData.length > 0 || nftData.length > 0 || inscriptionData.length > 0,
  );
};
