import React, { memo, useCallback } from 'react';
import { Text } from '$uikit/Text/Text';
import { t } from '$translation';
import { TouchableOpacity, View } from 'react-native';
import { Haptics, ns } from '$utils';
import { useTheme } from '$hooks';
import { ChartPeriod } from '$store/zustand/chart';

export interface PeriodSelectorProps {
  selectedPeriod: ChartPeriod;
  disabled?: boolean;
  onSelect: (newPeriod: ChartPeriod) => void;
}

const mappedPeriods = Object.values(ChartPeriod)
  .map((period) => ({ value: period, label: t(`chart.periods.${period}`) }))
  .reverse();

export const Period: React.FC<{
  onSelect: () => void;
  selected?: boolean;
  label: string;
  disabled?: boolean;
}> = (props) => {
  const theme = useTheme();
  const backgroundColor = props.selected
    ? theme.colors.backgroundSecondary
    : 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={props.selected || props.disabled}
      onPress={props.onSelect}
      style={{ paddingVertical: ns(7.5), borderRadius: ns(18), flex: 1, backgroundColor }}
    >
      <Text variant="label2" textAlign="center">
        {props.label}
      </Text>
    </TouchableOpacity>
  );
};

export const PeriodSelectorComponent: React.FC<PeriodSelectorProps> = (props) => {
  const handleSelect = useCallback(
    (value: ChartPeriod) => () => {
      Haptics.selection();
      props.onSelect(value);
    },
    [props],
  );

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: ns(24),
        paddingHorizontal: ns(27),
      }}
    >
      {mappedPeriods.map((period) => (
        <Period
          disabled={props.disabled}
          key={period.value}
          onSelect={handleSelect(period.value)}
          label={period.label}
          selected={props.selectedPeriod === period.value}
        />
      ))}
    </View>
  );
};

export const PeriodSelector = memo(PeriodSelectorComponent);
