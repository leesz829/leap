import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import * as React from 'react';
import type { FC } from 'react';
import { useState } from 'react';
import { ICON } from 'utils/imageUtils';
import { Color } from 'assets/styles/Color';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { styles } from 'assets/styles/Styles';

interface Props {
  label: string;
  value?: string;
  callBackFunction?: (value: string) => void;
}

/**
 * 공통 드롭다운
 * @param {string} label 체크박스 라벨
 *
 *
 */
export const DropDown: FC<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    label: '블라인드 카드', value: 'BLIND'
  });

  const menuList = [
    {label: '블라인드 카드', value: 'BLIND'},
    {label: '바이브', value: 'VIBE'},
    {label: '커플 시나리오', value: 'SCENARIO'},
  ]

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectItem = (item:any) => {
    setSelectedItem(item);
    setIsOpen(false);

    props.callBackFunction(item);
  };

  return (
    <View style={_styles.container}>

      {!isOpen && (
        <TouchableOpacity onPress={handleToggleDropdown} style={_styles.dropdownButton(isOpen)}>
          {/* <Image source={ICON.commonSelect} style={styles.iconSquareSize(20)} /> */}
          <SpaceView ml={10} mr={10}><Text style={styles.fontStyle('EB', 17, '#46F66F')}>{selectedItem.label}</Text></SpaceView>
          
          {!isOpen && (
            <Image source={ICON.moreIcon} style={styles.iconSquareSize(15)} />
          )}
        </TouchableOpacity>
      )}

      {isOpen && (
        <>
          {/* <View style={_styles.dropdownWrap}>

            {menuList.map((item, index) => {
              return (item?.value != selectedItem.value) && (
                <>
                  <TouchableOpacity onPress={() => handleSelectItem(item)} style={[_styles.item, index == 1 && _styles.itmeBorder]}>
                    <Text style={styles.fontStyle('EB', 16, '#fff')}>{item.label}</Text>
                  </TouchableOpacity>
                </>
              );
            })}
          </View> */}

          <View style={_styles.dropdownWrap}>
            {menuList.map((item, index) => {
              return (
                <>
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => handleSelectItem(item)} style={[_styles.item, index == 1 && _styles.itmeBorder]}>
                    <Text style={styles.fontStyle('EB', 16, item?.value == selectedItem.value ? '#46F66F' : '#fff')}>{item.label}</Text>
                  </TouchableOpacity>
                </>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};


const _styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
    width: 180,
  },
  dropdownButton: (isOn:boolean) => {
    return {
      paddingVertical: 12,
      paddingLeft: 10,
      paddingRight: 15,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      borderBottomLeftRadius: isOn ? 0 : 25,
      borderBottomRightRadius: isOn ? 0 : 25,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isOn ? '#555D74' : 'rgba(67,67,67,0.5)',
    };
  },
  dropdownWrap: {
    position: 'absolute',
    //top: 43,
    width: '100%',
    borderRadius: 25,
    backgroundColor: '#555D74',
    borderWidth: 1,
    borderColor: '#C4B6AA',
  },
  item: {
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  itmeBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#C4B6AA',
  },

});
