import { truncateDecimal } from '../number';

jest.mock("react-native-localize", () => {
  return {
    getNumberFormatSettings: () => ({
      decimalSeparator: '.',
      groupingSeparator: '.'
    }),
  };
});

test('test truncateDecimal', () => {
  expect(truncateDecimal('0', 2)).toBe('0');
  expect(truncateDecimal('0.00', 2)).toBe('0.00');
  expect(truncateDecimal('0.00129456789', 2)).toBe('0.0012');
  expect(truncateDecimal('0.129456789', 2)).toBe('0.12');
  expect(truncateDecimal('12.3456789', 2)).toBe('12.34');
  expect(truncateDecimal('123456.789', 2)).toBe('123456.78');
  expect(truncateDecimal('123456.789', 2)).toBe('123456.78');
  expect(truncateDecimal('0.0058240', 1)).toBe('0.005');
  expect(truncateDecimal('0.0009', 1)).toBe('0.0009');
  expect(truncateDecimal('123456123123123.020078912310238123213', 2)).toBe('123456123123123.020');
  expect(truncateDecimal('0.', 1)).toBe('0');
});