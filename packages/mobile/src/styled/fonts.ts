const montserrat = 'Montserrat';

export type fontKeys = 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';

// See https://fonts.google.com/specimen/Montserrat?preview.text=Test&preview.text_type=custom
export const FONT: { [key in fontKeys] } = {
  regular: `${montserrat}-Medium`, // 500
  medium: `${montserrat}-SemiBold`, // 600
  semiBold: `${montserrat}-Bold`, // 700
  bold: `${montserrat}-ExtraBold`, // 800
  extraBold: `${montserrat}-Black`, // 900
};

export const FONT_BY_WEIGHT = {
  '500': FONT.regular,
  '600': FONT.medium,
  '700': FONT.semiBold,
  '800': FONT.bold,
  '900': FONT.extraBold,
}