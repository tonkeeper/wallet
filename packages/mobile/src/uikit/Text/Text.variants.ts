import { ns, nfs } from '$utils';
import { StyleSheet } from 'react-native';
import { FONT } from '$styled';

export const textVariants = StyleSheet.create({
  num: {
    fontSize: nfs(32),
    lineHeight: nfs(40),
    fontFamily: FONT.medium,
  },
  num2: {
    fontSize: nfs(28),
    lineHeight: nfs(36),
    fontFamily: FONT.medium,
  },
  h1: {
    fontSize: nfs(32),
    lineHeight: nfs(40),
    fontFamily: FONT.semiBold,
  },
  h2: {
    fontSize: nfs(24),
    lineHeight: nfs(32),
    fontFamily: FONT.semiBold,
  },
  h3: {
    fontSize: nfs(20),
    lineHeight: nfs(28),
    fontFamily: FONT.semiBold,
  },
  label1: {
    fontSize: nfs(16),
    lineHeight: nfs(24),
    fontFamily: FONT.medium,
  },
  label2: {
    fontSize: nfs(14),
    lineHeight: nfs(20),
    fontFamily: FONT.medium,
  },
  label3: {
    fontSize: nfs(12),
    lineHeight: nfs(16),
    fontFamily: FONT.medium,
  },
  body1: {
    fontSize: nfs(16),
    lineHeight: nfs(24),
    fontFamily: FONT.regular,
  },
  body2: {
    fontSize: nfs(14),
    lineHeight: nfs(20),
    fontFamily: FONT.regular,
  },
  body3: {
    fontSize: nfs(12),
    lineHeight: nfs(16),
    fontFamily: FONT.regular,
  },
  body3Alt: {
    fontSize: nfs(13),
    lineHeight: nfs(16),
    fontFamily: FONT.regular,
  },
});
export type TTextVariants = keyof typeof textVariants;
