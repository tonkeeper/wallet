import React, { useCallback } from 'react';
import { Text } from '$uikit/Text/Text';
import { t } from '$translation';
import { TouchableOpacity, View } from 'react-native';
import { ChartPeriod } from '../Chart.types';
import { Haptics } from '$utils';
import { useTheme } from '$hooks';

export interface PeriodSelectorProps {
    selectedPeriod: ChartPeriod;
    onSelect: (newPeriod: ChartPeriod) => void;
}

const mappedPeriods = Object.values(ChartPeriod).map(period => ({ value: period, label: t(`chart.periods.${period}`) })).reverse();

export const Period: React.FC<{ onSelect: () => void; selected?: boolean; label: string }> = (props) => {
    const theme = useTheme();
    const backgroundColor = props.selected ? theme.colors.backgroundSecondary : 'transparent';

    return (
        <TouchableOpacity activeOpacity={1} disabled={props.selected} onPress={props.onSelect} style={{ paddingVertical: 7.5, borderRadius: 18, flex: 1, backgroundColor }}>
            <Text textAlign='center'>{props.label}</Text>
        </TouchableOpacity>
    )
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = (props) => {
    const handleSelect = useCallback((value: ChartPeriod) => () => {
        Haptics.selection();
        props.onSelect(value);
    }, [props.onSelect]);

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 24 }}>
            {mappedPeriods.map(period => 
                <Period 
                    key={period.value}
                    onSelect={handleSelect(period.value)} 
                    label={period.label} 
                    selected={props.selectedPeriod === period.value} 
                />
            )}
        </View>
    )
}