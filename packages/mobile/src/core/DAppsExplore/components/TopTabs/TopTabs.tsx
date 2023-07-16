import React, { memo } from 'react';
import * as S from './TopTabs.style';
import { ScrollView } from 'react-native';
import { Tabs } from '../../../../tabs/Wallet/components/Tabs';
import _ from 'lodash';
import { ConnectedApps } from '$core/DAppsExplore/components';
import { useFlags } from '$utils/flags';

interface TabItem {
  id: string;
  title: string;
}

interface Props {
  tabs: TabItem[];
  selectedId: string;
  onChange: (tab: string) => void;
}

const TopTabsComponent = React.forwardRef<ScrollView, Props>((props, ref) => {
  const { tabs } = props;
  const flags = useFlags(['disable_dapps']);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Tabs.Header>
      {!flags.disable_dapps ? <ConnectedApps /> : null}
      <Tabs.Bar
        value={tabs[0].id}
        onChange={_.noop}
        items={tabs.map((tab) => ({
          label: tab.title,
          value: tab.id,
        }))}
      />
    </Tabs.Header>
  );
});

export const TopTabs = memo(TopTabsComponent);
