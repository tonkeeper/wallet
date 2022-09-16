import React, { FC, useCallback, useMemo } from 'react';
import { Linking } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import {Icon, NavBar, ScrollHandler, Text} from '$uikit';
import { useTheme, useTranslator } from '$hooks';
import { ns } from '$utils';
import { CellSection, CellSectionItem } from '$shared/components';
import * as S from './LegalDocuments.style';
import { openFontLicense } from '$navigation';

export const LegalDocuments: FC = () => {
  const t = useTranslator();
  const tabBarHeight = useBottomTabBarHeight();
  const theme = useTheme();

  const handleTerms = useCallback(() => {
    Linking.openURL('https://tonkeeper.com/terms').catch((err) => console.log(err));
  }, []);

  const handlePrivacy = useCallback(() => {
    Linking.openURL('https://tonkeeper.com/privacy').catch((err) => console.log(err));
  }, []);

  const handleFontLicense = useCallback(() => {
    openFontLicense();
  }, []);

  const ChevronIcon = useMemo(() => (
    <Icon 
      name="ic-chevron-16"
      color="foregroundSecondary"
    />
  ), []);

  return (
    <S.Wrap>
      <NavBar>{t('legal_header_title')}</NavBar>
      <ScrollHandler>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: ns(16),
            paddingTop: ns(16),
            paddingBottom: tabBarHeight,
          }}
          scrollEventThrottle={16}
        >
          <CellSection> 
            <CellSectionItem 
              indicator={ChevronIcon}
              onPress={handleTerms}
            >
              {t('legal_terms')}
            </CellSectionItem>
            <CellSectionItem 
              indicator={ChevronIcon}
              onPress={handlePrivacy} 
            >
              {t('legal_privacy')}
            </CellSectionItem>
          </CellSection>

          <S.LicensesTitleWrapper>
            <Text variant="h3">{t('legal_licenses_title')}</Text>
          </S.LicensesTitleWrapper>
          <CellSection> 
            <CellSectionItem 
              indicator={ChevronIcon}
              onPress={handleFontLicense}
            >
              {t('legal_font_license')}
            </CellSectionItem>
          </CellSection>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
