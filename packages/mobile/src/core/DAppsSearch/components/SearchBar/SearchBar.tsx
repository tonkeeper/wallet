import { useTheme } from '$hooks/useTheme';
import { Icon } from '$uikit';
import { isIOS, isValidUrl } from '$utils';
import React, { FC, memo, useCallback, useRef } from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputSubmitEditingEventData,
} from 'react-native';
import * as S from './SearchBar.style';
import { t } from '@tonkeeper/shared/i18n';

interface Props {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: (value: string) => void;
}

const SearchBarComponent: FC<Props> = (props) => {
  const { query, setQuery, onSubmit } = props;

  const textInputRef = useRef<TextInput>(null);

  const theme = useTheme();

  const isUrl = isValidUrl(query);

  const handleSubmit = useCallback(
    (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      const text = e.nativeEvent.text.trim();

      onSubmit(text);
    },
    [onSubmit],
  );

  return (
    <S.Container>
      <S.InputContainer>
        <S.Input
          ref={textInputRef}
          value={query}
          onChangeText={setQuery}
          placeholder={t('browser.search_label')}
          placeholderTextColor={theme.colors.foregroundSecondary}
          autoFocus={true}
          keyboardType={isIOS ? 'web-search' : 'url'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          selectTextOnFocus={true}
          selectionColor={theme.colors.accentPrimary}
          keyboardAppearance={theme.isDark ? 'dark' : 'light'}
        />
        <S.IconContainer>
          <Icon name={isUrl ? 'ic-globe-16' : 'ic-magnifying-glass-16'} />
        </S.IconContainer>
      </S.InputContainer>
    </S.Container>
  );
};

export const SearchBar = memo(SearchBarComponent);
