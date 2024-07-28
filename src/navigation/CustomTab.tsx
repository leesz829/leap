import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as React from 'react';
import { Color } from 'assets/styles/Color';
import TabIcon from 'component/TabIcon';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { BottomTabDescriptorMap } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { commonStyle, layoutStyle, styles } from 'assets/styles/Styles';


const CustomTab = ({
  state,
  descriptors,
  navigation,
}: {
  state: TabNavigationState<ParamListBase>;
  descriptors: BottomTabDescriptorMap;
  navigation: any;
}) => {
  return (
    <>
      <View style={_styles.tabContainer} key={'CustomTab'}>
        {state.routes.map((route, index) => {

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          if (options.tabBarShowLabel) {
            return (
              <>
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  disabled={isFocused ? true : false}
                  accessibilityRole="button"
                  style={_styles.tab}
                  testID={options.tabBarTestID}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  accessibilityState={isFocused ? { selected: true } : {}}
                >
                  <TabIcon name={route.name} isFocused={isFocused} />
                  {/* <Text style={styles.fontStyle('SB', 12, '#fff')}>{label}</Text> */}
                </TouchableOpacity>
              </>
            );
          }

          return null;
        })}
      </View>
    </>
  );
};

export default CustomTab;

const _styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 62,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16112A',
    paddingHorizontal: 25,
  },
});
