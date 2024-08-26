import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { ICON } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import { STACK, ROUTES } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import { isEmptyData } from 'utils/functions';
import { useUserInfo } from 'hooks/useUserInfo';


const { width } = Dimensions.get('window');

export default function ProfileAuth({ dataList, isEditBtn, memberData }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  const memberBase = useUserInfo();

  return (
    <>
      {dataList.length > 0 && (
        <SpaceView>

          {/* ########################################################################################### 타이틀 */}
          {/* <SpaceView mb={15} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            
            <SpaceView viewStyle={{flexDirection: 'row'}}>
              <Text style={_styles.textStyle(20, '#EEEAEB', 'B')}>{memberData.nickname}님의 인증 정보🤩</Text>
            </SpaceView>

            {(isEmptyData(isEditBtn) && isEditBtn) && (
              <TouchableOpacity 
                onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_AUTH }); }} 
                style={_styles.modBtn}>
                <Image source={ICON.squarePen} style={styles.iconSize16} />
                <Text style={_styles.modBtnText}>수정</Text>
              </TouchableOpacity>
            )}
          </SpaceView> */}

          {/* ########################################################################################### 인증 목록(세로) */}
          <SpaceView>
            <LinearGradient
              colors={['#C2D4F8', '#436AA5', '#36276A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{borderRadius: 20}}>

              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                style={_styles.authList}>

                {dataList?.map((item, index) => {
                  const authCode = item.common_code;
                  let authIcon = ICON.jobIcon;

                  if(authCode == 'EDU') {
                    authIcon = ICON.eduIcon;
                  } else if(authCode == 'INCOME') {
                    authIcon = ICON.incomeIcon;
                  } else if(authCode == 'ASSET') {
                    authIcon = ICON.assetIcon;
                  } else if(authCode == 'SNS') {
                    authIcon = ICON.snsIcon;
                  } else if(authCode == 'VEHICLE') {
                    authIcon = ICON.vehicleIcon;
                  }

                  return (
                    <>
                      <SpaceView viewStyle={_styles.authItem}>
                        <SpaceView mb={20} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                          <Image source={authIcon} style={styles.iconSquareSize(90)} />
                        </SpaceView>

                        <SpaceView mt={15}>
                          <Text style={styles.fontStyle('B', 12, '#fff')}>{item.code_name}인증</Text>
                          <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.fontStyle('H', 28, '#fff')}>{item?.auth_type_name}</Text>
                            <SpaceView ml={7} viewStyle={_styles.levelArea}><Text style={styles.fontStyle('SB', 14, '#fff')}>LV.{item?.auth_level}</Text></SpaceView>
                          </SpaceView>
                        </SpaceView>

                        <SpaceView mt={25}>
                          <Text style={styles.fontStyle('B', 15, '#fff')} numberOfLines={8}>
                            {isEmptyData(item?.auth_comment) ? (
                              <>{item?.auth_comment}</>
                            ) : (
                              <>{item?.comment}</>
                            )}
                          </Text>
                        </SpaceView>
                      </SpaceView>
                    </>
                  )
                })}
              </ScrollView>
            </LinearGradient>
          </SpaceView>

        </SpaceView>
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
  authList: {
    overflow: 'hidden',
  },
  authItem: {
    width: width-20,
    paddingVertical: 35,
    paddingHorizontal: 15,
    overflow: 'hidden',
  },
  levelArea: {
    backgroundColor: '#508FD8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },

});