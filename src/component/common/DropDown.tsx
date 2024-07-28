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
  const [selectedItem, setSelectedItem] = useState('');

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectItem = (item:string) => {
    setSelectedItem(item);
    setIsOpen(false);

    props.callBackFunction(item);
  };

  return (
    <View style={_styles.container}>
      <TouchableOpacity onPress={handleToggleDropdown} style={_styles.dropdownButton}>
        <Image source={ICON.commonSelect} style={styles.iconSquareSize(20)} />
        <SpaceView ml={10} mr={10}><Text style={styles.fontStyle('EB', 17, '#46F66F')}>{selectedItem || '블라인드 카드'}</Text></SpaceView>
        <Image source={ICON.selectDown} style={styles.iconSquareSize(15)} />
      </TouchableOpacity>
      {isOpen && (
        <View style={_styles.dropdown}>
          <TouchableOpacity onPress={() => handleSelectItem('BLIND')} style={_styles.item}>
            <Text style={_styles.itemText}>블라인드 카드</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelectItem('VIBE')} style={_styles.item}>
            <Text style={_styles.itemText}>바이브</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelectItem('COUPLE')} style={_styles.item}>
            <Text style={_styles.itemText}>커플 시나리오</Text>
          </TouchableOpacity>
        </View>
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
  dropdownButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(67,67,67,0.5)',
  },
  dropdown: {
    position: 'absolute',
    top: 50, // Adjust this value according to your design
    width: '100%',
    borderRadius: 11,
    backgroundColor: '#3496BE',
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemText: {
    fontFamily: 'SUITE-ExtraBold',
    fontSize: 16,
    color: '#fff',
  },

});
