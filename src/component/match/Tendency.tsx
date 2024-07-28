import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';
import { STACK, ROUTES } from 'constants/routes';
import { modalStyle, layoutStyle, commonStyle, styles } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import { useUserInfo } from 'hooks/useUserInfo';


const { width, height } = Dimensions.get('window');

export default function Tendency({ addData, isEditBtn, isNoDataArea }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  const memberBase = useUserInfo();

  return (
    <>
      {((isEmptyData(addData?.height) || isEmptyData(addData?.form_body) || isEmptyData(addData?.job_name) || isEmptyData(addData?.religion) ||
        isEmptyData(addData?.drinking) || isEmptyData(addData?.smoking)) || isNoDataArea) ? (

        <SpaceView viewStyle={_styles.tendencyWrap}>
          <SpaceView pt={7} pb={7}>
            <Text style={[styles.fontStyle('B', 15, '#fff'), {textAlign: 'center'}]}>성향</Text>
          </SpaceView>

          <SpaceView ml={2} mr={2} mb={2} viewStyle={_styles.infoArea}>

            {isEmptyData(addData.mbti_type_name) && (
              <SpaceView viewStyle={_styles.infoItem}>
                <Image source={ICON.mbtiIcon} style={styles.iconSquareSize(30)} />
                <SpaceView ml={10}><Text style={styles.fontStyle('SB', 16, '#44B6E5')}>{addData.mbti_type_name}</Text></SpaceView>
              </SpaceView>
            )}
            {isEmptyData(addData.religion_name) && (
              <SpaceView viewStyle={_styles.infoItem}>
                <Image source={ICON.religionIcon} style={styles.iconSquareSize(30)} />
                <SpaceView ml={10}><Text style={styles.fontStyle('SB', 16, '#44B6E5')}>{addData.religion_name}</Text></SpaceView>
              </SpaceView>
            )}
            {isEmptyData(addData.drinking_name) && (
              <SpaceView viewStyle={_styles.infoItem}>
                <Image source={ICON.drinkingIcon} style={styles.iconSquareSize(30)} />
                <SpaceView ml={10}><Text style={styles.fontStyle('SB', 16, '#44B6E5')}>{addData.drinking_name}</Text></SpaceView>
              </SpaceView>
            )}
            {isEmptyData(addData.smoking_name) && (
              <SpaceView viewStyle={_styles.infoItem}>
                <Image source={ICON.smokeIcon} style={styles.iconSquareSize(30)} />
                <SpaceView ml={10}><Text style={styles.fontStyle('SB', 16, '#44B6E5')}>{addData.smoking_name}</Text></SpaceView>
              </SpaceView>
            )}
            
          </SpaceView>
        </SpaceView>
      ) : (
        <>

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
  tendencyWrap: {
    backgroundColor: '#44B6E5',
    borderRadius: 15,
  },
  infoArea: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    //borderTopLeftRadius: 0,
    //borderTopRightRadius: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
});