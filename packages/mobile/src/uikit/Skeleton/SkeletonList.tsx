import { ns } from '$utils';
import React from 'react';
import { View } from 'react-native';
import { SkeletonLineOpacityAnimation } from './SkeletonLineOpacityAnimation';

const Separator: React.FC = () => {
  return (
    <View
      style={{ width: '100%', height: 1, backgroundColor: 'rgba(79, 90, 112, 0.24)' }}
    />
  );
};

const Cell: React.FC<{ withSeparator?: boolean; titleWidth: number }> = (props) => {
  return (
    <>
      <View style={{ paddingVertical: ns(16) }}>
        <View style={{ flexDirection: 'row' }}>
          <SkeletonLineOpacityAnimation
            style={{ borderRadius: 44 / 2 }}
            width={44}
            height={44}
          />
          <View style={{ justifyContent: 'center', marginLeft: ns(16) }}>
            <SkeletonLineOpacityAnimation
              height={18}
              width={props.titleWidth}
              style={{ borderRadius: ns(9), marginBottom: ns(4) }}
            />
            <SkeletonLineOpacityAnimation
              height={16}
              width={86}
              style={{ borderRadius: ns(9) }}
            />
          </View>
        </View>
      </View>
      {props.withSeparator ?? true ? <Separator /> : null}
    </>
  );
};

export const SkeletonList: React.FC = () => {
  return (
    <View style={{ margin: 16 }}>
      <View style={{ marginBottom: ns(10) }} />
      <View
        style={{
          borderRadius: ns(14),
          width: ns(64),
          height: ns(28),
          backgroundColor: '#1D2633',
          opacity: 0.32,
        }}
      />
      <View style={{ marginBottom: ns(18) }} />
      <View
        style={{
          backgroundColor: '#1D2633',
          borderTopLeftRadius: ns(16),
          borderTopRightRadius: ns(16),
          borderRadius: ns(16),
          height: ns(228),
          paddingLeft: ns(16),
          opacity: 0.32,
        }}
      >
        <Cell titleWidth={40} />
        <Cell titleWidth={76} />
        <Cell titleWidth={40} withSeparator={false} />
      </View>
    </View>
  );
};
