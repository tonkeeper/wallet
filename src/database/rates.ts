import { ChartPoint, RatesMap } from '$store/rates/interface';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveRatesResult(today: RatesMap, yesterday: RatesMap) {
  await AsyncStorage.setItem(
    'rates',
    JSON.stringify({
      today,
      yesterday,
    }),
  );
}

export async function loadRatesResult(): Promise<{
  today: RatesMap;
  yesterday: RatesMap;
} | null> {
  const raw = await AsyncStorage.getItem('rates');

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function saveChartData(currency: string, points: ChartPoint[]) {
  await AsyncStorage.setItem(`chart_data_${currency}`, JSON.stringify(points));
}

export async function loadChartData(currency: string): Promise<ChartPoint[] | null> {
  const raw = await AsyncStorage.getItem(`chart_data_${currency}`);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
