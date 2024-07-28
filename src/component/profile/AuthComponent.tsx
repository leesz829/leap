import { layoutStyle, styles } from 'assets/styles/Styles';
import { ScreenNavigationProp } from '@types';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, Platform, ScrollView, Dimensions, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { formatNowDate, isEmptyData, CommaFormat, imagePickerOpen } from 'utils/functions';
import { ICON, findSourcePath } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { usePopup } from 'Context';
import { Modalize } from 'react-native-modalize';
import { STACK, ROUTES } from 'constants/routes';



const { width, height } = Dimensions.get('window');

const AuthComponent = React.memo(({ dataList, authPercent }) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup(); // 공통 팝업
  const isFocus = useIsFocused();

  // ##################################################################################### 초기 함수
  React.useEffect(() => {
    if(isFocus) {
      
    } else {

    }
  }, [isFocus]);

  return (
    <>
      <LinearGradient
        colors={['rgba(67,113,181,0.5)', 'rgba(59,95,212,0.5)']}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0.8, y: 1 }}
        style={_styles.wrap} >

        <SpaceView>
          <Text style={styles.fontStyle('EB', 20, '#fff')}>멤버십 인증</Text>
          <SpaceView mt={10}>
            <Text style={styles.fontStyle('SB', 12, '#fff')}>
              멤버십 인증을 통해 <Text style={styles.fontStyle('SB', 12, '#7AB0C8')}>상위 {authPercent}%</Text>의 인증 레벨을 획득한 <Text style={styles.fontStyle('SB', 12, '#7AB0C8')}>프리미엄</Text> 회원
            </Text>
          </SpaceView>
        </SpaceView>

        <SpaceView mt={30}>
          {dataList.map((item, index) => {
            const imgUrl = findSourcePath(item?.img_file_path); // 이미지 경로
            const imgDelYn = item?.del_yn; // 이미지 삭제 여부
            const imgStatus = item?.status; // 이미지 상태

            let iconSrc = ICON.jobIcon;
            
            if(item.common_code == 'EDU') {
              iconSrc = ICON.eduIcon;
            } else if(item.common_code == 'INCOME') {
              iconSrc = ICON.incomeIcon;
            } else if(item.common_code == 'ASSET') {
              if(item.auth_sub_code == 'REALTY') {
                iconSrc = ICON.realtyIcon;
              } else {
                iconSrc = ICON.bankIcon;
              }
            } else if(item.common_code == 'SNS') {
              iconSrc = ICON.snsIcon;
            } else if(item.common_code == 'VEHICLE') {
              iconSrc = ICON.vehicleIcon;
            }

            return (
              <>
                <SpaceView mb={10} viewStyle={_styles.itemWrap}>
                  <SpaceView viewStyle={{flex: 0.83}}>
                    <SpaceView mb={5} viewStyle={layoutStyle.rowStart}>
                      <LinearGradient
                        colors={['rgba(64,224,208,0.66)', 'rgba(76,76,194,0.66)']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={_styles.authMarkWrap}>
                        <Image source={ICON.auth_mark} style={styles.iconSquareSize(9)} />
                        <Text style={styles.fontStyle('B', 10, '#fff')}>{item?.auth_level}</Text>
                      </LinearGradient>
                      <SpaceView ml={5}>
                        <Text style={styles.fontStyle('EB', 16, '#fff')}>{item?.auth_type_name}</Text>
                      </SpaceView>
                    </SpaceView>
                    <SpaceView>
                      <Text style={styles.fontStyle('SB', 10, '#fff')} numberOfLines={2}>{item?.comment}</Text>
                    </SpaceView>
                  </SpaceView>
                  <SpaceView viewStyle={{flex: 0.13}}>
                    <Image source={iconSrc} style={styles.iconSquareSize(44)} />
                  </SpaceView>
                </SpaceView>
              </>
            )
          })}
        </SpaceView>

        <SpaceView mt={10} viewStyle={layoutStyle.rowEnd}>
          <TouchableOpacity 
            onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_AUTH }); }} 
            style={_styles.authBtn}>
            <Text style={styles.fontStyle('B', 12, '#fff')}>인증 관리하기</Text>
            <Text style={styles.fontStyle('B', 12, '#fff')}>{'>'}</Text>
          </TouchableOpacity>
        </SpaceView>
      </LinearGradient>
    </>
  );
});



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingTop: 30,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  itemWrap: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 73,
  },
  authMarkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    width: 30,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  authBtn: {
    backgroundColor: 'rgba(0,0,0,0.33)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 130,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 20,
  },


});





export default AuthComponent;