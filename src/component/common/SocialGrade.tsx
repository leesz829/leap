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
#### 소셜 등급 노출 Component
#########################################################################
###################################################################### */
export default function SocialGrade({ grade, sizeType }) {
  
  return (
    <>
      {isEmptyData(grade) && (
        <>
          <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Image source={ICON.sparkler} style={styles.iconSquareSize(sizeType == 'SMALL' ? 16 : 36)} />
            <Text style={_styles.gradeText(sizeType)}>{grade}</Text>
          </SpaceView>
        </>
      )}
    </>
  );
}


{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  gradeText: (sizeType:string) => {
    return {
      fontFamily: 'MinSans-Bold',
      fontSize: sizeType == 'SMALL' ? 14 : 36,
      fontWeight: '800',
      color: '#000000',
      marginLeft: sizeType == 'SMALL' ? 3 : 10,
    };
  },

});