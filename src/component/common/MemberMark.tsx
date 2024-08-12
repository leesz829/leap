import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import { styles } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';

/* ######################################################################
#########################################################################
#### 인증레벨 노출 Component
#########################################################################
###################################################################### */
//export default function MemberMark({ authAcctCnt, sizeType }) {
const MemberMark = React.memo(({ sizeType, respectGrade, bestFaceName, highAuthYn, variousAuthYn }) => {

  let _fontSize = 13;
  let _iconSize = 15;

  if(sizeType == 'S') {
    _fontSize = 9;
    _iconSize = 10;
  }
  
  return (
    <>
      <SpaceView viewStyle={{flexWrap: 'wrap', flexDirection: 'row'}}>

        {/* 리스펙트 등급 표시 */}
        {isEmptyData(respectGrade) && (
          <SpaceView viewStyle={_styles.itemWrap('#fff')}>
            <Image source={ICON.sparkler} style={styles.iconSquareSize(_iconSize)} />
            <SpaceView ml={2}><Text style={styles.fontStyle('SB', _fontSize, '#000000')}>{respectGrade}</Text></SpaceView>
          </SpaceView>
        )}

        {/* 가장 득표수가 많은 바이브 표시 */}
        {isEmptyData(bestFaceName) && (
          <SpaceView viewStyle={_styles.itemWrap('#40E0D0')}>
            <Text style={styles.fontStyle('SB', _fontSize, '#fff')}>#웃는게 예뻐요</Text>
          </SpaceView>
        )}

        {/* 높은 인증 레벨 노출 */}
        {(isEmptyData(highAuthYn) && highAuthYn == 'Y') && (
          <SpaceView viewStyle={_styles.itemWrap('#C740E0')}>
            <Text style={styles.fontStyle('SB', _fontSize, '#fff')}>높은 인증 레벨</Text>
          </SpaceView>
        )}

        {/* 다양한 인증 노출 */}
        {(isEmptyData(variousAuthYn) && variousAuthYn == 'Y') && (
          <SpaceView viewStyle={_styles.itemWrap('#3875DF')}>
            <Text style={styles.fontStyle('SB', _fontSize, '#fff')}>다양한 인증</Text>
          </SpaceView>
        )}

      </SpaceView>
    </>
  );
})



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  itemWrap: (bgcr:string) => {
    return {
      backgroundColor: bgcr,
      borderRadius: 12,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginRight: 5,
      marginBottom: 5,
    };
  },

});


export default MemberMark;