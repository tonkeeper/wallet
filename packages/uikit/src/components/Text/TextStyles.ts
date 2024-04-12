import { StyleSheet } from 'react-native';
import { nfs } from '../../utils';

const montserrat = 'Montserrat';

// See https://fonts.google.com/specimen/Montserrat?preview.text=Test&preview.text_type=custom
export enum Font {
  Regular = `${montserrat}-Medium`, // 500
  Medium = `${montserrat}-SemiBold`, // 600
  SemiBold = `${montserrat}-Bold`, // 700
  Bold = `${montserrat}-ExtraBold`, // 800
  ExtraBold = `${montserrat}-Black`, // 900
}

export const FontWeights = {
  '500': Font.Regular,
  '600': Font.Medium,
  '700': Font.SemiBold,
  '800': Font.Bold,
  '900': Font.ExtraBold,
};

export const TextTypes = StyleSheet.create({
  num: {
    fontSize: nfs(32),
    lineHeight: nfs(40),
    fontFamily: Font.Medium,
  },
  num2: {
    fontSize: nfs(28),
    lineHeight: nfs(36),
    fontFamily: Font.Medium,
  },
  num3: {
    fontSize: nfs(44),
    lineHeight: nfs(56),
    fontFamily: Font.Medium,
  },
  h1: {
    fontSize: nfs(32),
    lineHeight: nfs(40),
    fontFamily: Font.SemiBold,
  },
  h2: {
    fontSize: nfs(24),
    lineHeight: nfs(32),
    fontFamily: Font.SemiBold,
  },
  h3: {
    fontSize: nfs(20),
    lineHeight: nfs(28),
    fontFamily: Font.SemiBold,
  },
  label1: {
    fontSize: nfs(16),
    lineHeight: nfs(24),
    fontFamily: Font.Medium,
  },
  label2: {
    fontSize: nfs(14),
    lineHeight: nfs(20),
    fontFamily: Font.Medium,
  },
  label3: {
    fontSize: nfs(12),
    lineHeight: nfs(16),
    fontFamily: Font.Medium,
  },
  body1: {
    fontSize: nfs(16),
    lineHeight: nfs(24),
    fontFamily: Font.Regular,
  },
  body2: {
    fontSize: nfs(14),
    lineHeight: nfs(20),
    fontFamily: Font.Regular,
  },
  body3: {
    fontSize: nfs(12),
    lineHeight: nfs(16),
    fontFamily: Font.Regular,
  },
  body3Alt: {
    fontSize: nfs(13),
    lineHeight: nfs(16),
    fontFamily: Font.Regular,
  },
  body4: {
    fontSize: nfs(10),
    lineHeight: nfs(14),
    fontFamily: Font.Medium,
  },
});

export type TTextTypes = keyof typeof TextTypes;
