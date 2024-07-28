import * as React from 'react';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList, Platform } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
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
          <SpaceView viewStyle={_styles.gradeWrap}>
            <Image source={ICON.sparkler} style={styles.iconSquareSize(sizeType == 'SMALL' ? 12 : 36)} />
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
  gradeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS == 'ios' ? 8 : 15,
    paddingHorizontal: 6,
    height: 20,
  },
  gradeText: (sizeType:string) => {
    return {
      fontFamily: 'SUITE-SemiBold',
      fontSize: sizeType == 'SMALL' ? 9 : 36,
      color: '#000000',
      marginLeft: sizeType == 'SMALL' ? 3 : 10,
    };
  },

});