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
export const KeywordDropDown: FC<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectItem = (code:string, name:string) => {
    setSelectedItem(name);
    setIsOpen(false);

    //props.callBackFunction(item);
  };

  return (
    <View style={_styles.container}>
      <TouchableOpacity onPress={handleToggleDropdown} style={_styles.dropdownButton}>
        <SpaceView ml={10} mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>{selectedItem || '선택'}</Text></SpaceView>
        <Image source={ICON.story_moreAdd} style={styles.iconNoSquareSize(10, 17)} />
      </TouchableOpacity>
      {isOpen && (
        <View style={_styles.dropdown}>
          <TouchableOpacity onPress={() => handleSelectItem('KW01', '나들이 명소')} style={_styles.item}>
            <Text style={_styles.itemText}>나들이 명소</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelectItem('KW02', 'OTT 뭐볼까?')} style={_styles.item}>
            <Text style={_styles.itemText}>OTT 뭐볼까?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSelectItem('KW03', '이력서/면접')} style={_styles.item}>
            <Text style={_styles.itemText}>이력서/면접</Text>
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
    width: 150,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    //backgroundColor: 'rgba(67,67,67,0.5)',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 30,
    width: 150,
    borderRadius: 11,
    //backgroundColor: '#3496BE',
  },
  item: {
    paddingVertical: 10,
  },
  itemText: {
    fontFamily: 'SUITE-Bold',
    fontSize: 11,
    color: '#fff',
    textAlign: 'right',
  },

});
