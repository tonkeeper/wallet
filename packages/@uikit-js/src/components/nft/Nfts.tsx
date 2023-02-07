import { NftItemRepr, NftItemsRepr } from '@tonkeeper/core-js/src/tonApi';
import React, { FC, useState } from 'react';
import styled, { css } from 'styled-components';
import { Body3, Label2 } from '../Text';
import { NftNotification } from './NftNotification';

const Grid = styled.div`
  display: grid;
  margin: 0 0 2rem 0;
  gap: 0.5rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;

export const NftBlock = styled.div<{ hover?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;

  background: ${(props) => props.theme.backgroundContent};

  border-radius: ${(props) => props.theme.cornerSmall};

  overflow: hidden;

  ${(props) =>
    props.hover
      ? css`
          cursor: pointer;

          &:hover {
            background: ${props.theme.backgroundContentTint};
          }
        `
      : undefined}
`;

export const Image = styled.div<{ url?: string }>`
  width: 100%;
  padding-bottom: 100%;

  ${(props) =>
    props.url &&
    css`
      background-image: url('${props.url}');
    `}
  background-size: cover;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.75rem 0.5rem;
  white-space: nowrap;
`;

const Header = styled(Label2)`
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Body = styled(Body3)`
  color: ${(props) => props.theme.textSecondary};
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const NftItem: FC<{
  nft: NftItemRepr;
  resolution: string;
  onOpen: (nft: NftItemRepr) => void;
}> = React.memo(({ nft, resolution, onOpen }) => {
  const image = nft.previews?.find((item) => item.resolution === resolution);
  return (
    <NftBlock hover onClick={() => onOpen(nft)}>
      <Image url={image?.url} />
      <Text>
        <Header>{nft.dns ?? nft.metadata.name}</Header>
        <Body>{nft.collection?.name ?? nft.metadata.description}</Body>
      </Text>
    </NftBlock>
  );
});

export const NftsList: FC<{ nfts: NftItemsRepr | undefined }> = ({ nfts }) => {
  const [nftItem, setNftItem] = useState<NftItemRepr | undefined>(undefined);

  return (
    <>
      <Grid>
        {(nfts?.nftItems ?? []).map((item) => (
          <NftItem
            key={item.address}
            nft={item}
            resolution="500x500"
            onOpen={setNftItem}
          />
        ))}
      </Grid>
      <NftNotification
        nftItem={nftItem}
        handleClose={() => setNftItem(undefined)}
      />
    </>
  );
};
