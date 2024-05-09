import React, { memo, useContext, useMemo } from 'react';
import {
  DefaultNavigatorOptions,
  EventMapBase,
  NavigationState,
  ParamListBase,
  RouteConfig,
  RouteGroupConfig,
  RouteProp,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { SheetActions, SheetsProvider, SheetsProviderRef } from './SheetsProvider';
import { RootStackContext } from './context/RootStackContext';
import { ModalBehaviorContext } from './context/ModalBehaviorContext';
import { SheetRoutesContext } from './context/SheetRoutesContext';
import {
  AdditionalRouteConfig,
  ModalBehavior,
  ModalRouteConfigByType,
  WithPath,
} from './types';

const isValidKey = (key: unknown) =>
  key === undefined || (typeof key === 'string' && key !== '');

const getRouteConfigsFromChildren = (children: React.ReactNode, props?: any) => {
  const configs = React.Children.toArray(children).reduce<ModalRouteConfigByType>(
    (acc, child) => {
      if (React.isValidElement(child)) {
        if (child.type === ModalScreen) {
          const { component, path, behavior, ...restProps } = child.props;
          const childProps = { ...props, ...restProps };
          const conf = { path, component, restProps: childProps };

          if (child.props.behavior === 'sheet') {
            acc.sheets.push(conf);
          } else {
            acc.native.push(conf);
          }

          return acc;
        }

        if (child.type === React.Fragment || child.type === ModalGroup) {
          if (!isValidKey(child.props.navigationKey)) {
            throw new Error(
              `Got an invalid 'navigationKey' prop (${JSON.stringify(
                child.props.navigationKey,
              )}) for the group. It must be a non-empty string or 'undefined'.`,
            );
          }

          const { children, ...restProps } = child.props;
          const groupConfig = getRouteConfigsFromChildren(children, restProps);

          if (child.props.behavior === 'sheet') {
            acc.sheets.push(...groupConfig.native);
          } else {
            acc.native.push(...groupConfig.native);
          }

          return acc;
        }
      }

      throw new Error(
        `A navigator can only contain 'Screen', 'Group' or 'React.Fragment' as its direct children (found ${
          React.isValidElement(child)
            ? `'${typeof child.type === 'string' ? child.type : child.type?.name}'${
                child.props?.name ? ` for the screen '${child.props.name}'` : ''
              }`
            : typeof child === 'object'
            ? JSON.stringify(child)
            : `'${String(child)}'`
        }). To render this component in the navigator, pass it in the 'component' prop to 'Screen'.`,
      );
    },
    { native: [], sheets: [] },
  );

  return configs;
};

export function createModalStackNavigator(ProvidersWithNavigation) {
  const Stack = createNativeStackNavigator();

  return {
    Navigator: createModalNavigator(Stack, ProvidersWithNavigation),
    Group: ModalGroup,
    Modal: ModalScreen,
  };
}

function wrapNativeModal(Component: React.ComponentType, behavior: ModalBehavior) {
  return memo<{ route: RouteProp<any> }>((props) => (
    <ModalBehaviorContext.Provider value={behavior}>
      <Component {...props} {...props.route.params} />
    </ModalBehaviorContext.Provider>
  ));
}

type ModalNavigatorProps = Omit<
  DefaultNavigatorOptions<{}, any, {}, {}>,
  'screenOptions'
> & {
  screenOptions?: NativeStackNavigationOptions;
};

function createModalNavigator(Stack: any, ProvidersWithNavigation: any) {
  const sheetsProviderOptions = {
    presentation: 'transparentModal',
    gestureEnabled: false,
    animation: 'none',
    contentStyle: {
      backgroundColor: 'transparent',
    },
  };

  return memo<ModalNavigatorProps>((props) => {
    const { screenOptions, children, ...restProps } = props;
    const RootStack = useContext(RootStackContext);

    const screenOptionsNavigator = useMemo(() => {
      const defaultOptions = {
        presentation: 'modal',
        headerShown: false,
      };

      return screenOptions
        ? Object.assign(screenOptions, defaultOptions)
        : defaultOptions;
    }, [screenOptions]);

    const routes = getRouteConfigsFromChildren(children);

    return (
      <SheetRoutesContext.Provider value={routes.sheets}>
        <ProvidersWithNavigation>
          <Stack.Navigator {...restProps} screenOptions={screenOptionsNavigator}>
            <Stack.Screen
              component={RootStack}
              name="Root"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              options={sheetsProviderOptions}
              component={SheetContainer}
              name="SheetsProvider"
            />
            {routes.native.map((route, index) => (
              <Stack.Screen
                {...route.restProps}
                key={`native-modal-${index}`}
                name={route.path}
                options={{
                  ...route.restProps.options,
                  ...(route.restProps.animation && {
                    animation: route.restProps.animation,
                  }),
                  presentation: route.restProps.behavior,
                }}
                component={wrapNativeModal(route.component, route.restProps.behavior)}
              />
            ))}
          </Stack.Navigator>
        </ProvidersWithNavigation>
      </SheetRoutesContext.Provider>
    );
  });
}

// WIP
const SheetContainer = memo<any>((props) => {
  const ref = React.useRef<SheetsProviderRef>(null);
  const { params, path, component, $$action } = props.route.params;

  React.useLayoutEffect(() => {
    const sheet = { params, path, component };

    if ($$action === SheetActions.REPLACE) {
      ref.current?.replaceStack(sheet);
    } else if ($$action === SheetActions.ADD) {
      ref.current?.addStack(sheet);
    } else {
      console.warn('No $$action');
    }
  }, [path]);

  return <SheetsProvider ref={ref} />;
});

function ModalScreen<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList,
  State extends NavigationState,
  ScreenOptions extends {},
  EventMap extends EventMapBase,
>(
  _: WithPath<RouteConfig<ParamList, RouteName, State, ScreenOptions, EventMap>> &
    AdditionalRouteConfig,
) {
  return null;
}

function ModalGroup<ParamList extends ParamListBase, ScreenOptions extends {}>(
  _: RouteGroupConfig<ParamList, ScreenOptions> & AdditionalRouteConfig,
) {
  return null;
}
