import { ColorType, ScreenNavigationProp } from '@types';
import { Color } from 'assets/styles/Color';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Modal, TouchableOpacity, View, Image, Text, ScrollView, Dimensions, StyleSheet, FlatList } from 'react-native';
import Carousel, { getInputRangeFromIndexes } from 'react-native-snap-carousel';
import { useUserInfo } from 'hooks/useUserInfo';
import LinearGradient from 'react-native-linear-gradient';
import { IMAGE, PROFILE_IMAGE, findSourcePath, ICON } from 'utils/imageUtils';
import { CommaFormat, isEmptyData, formatNowDate } from 'utils/functions';
import AsyncStorage from '@react-native-community/async-storage';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, withSpring, withSequence, withDelay, Easing, withRepeat, interpolate, Extrapolate, stopClock, cancelAnimation } from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { STACK, ROUTES } from 'constants/routes';
//import Modal from 'react-native-modal';



/* ################################################################################################################
###################################################################################################################
###### 인증 정보 팝업 Component
###################################################################################################################
################################################################################################################ */

interface Props {
  isVisible?: boolean; // popup state
  setIsVisible?: any; // popup setState
  closeModal: () => void;
  confirmCallbackFunc?: Function | undefined; // 확인 Callback 함수
  authList?: any;
}

const { width, height } = Dimensions.get('window');

export default function AuthInfoPopup({ isVisible, setIsVisible, closeModal, confirmCallbackFunc, authList }: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const memberBase = useUserInfo();

  const onModfy = async () => {
    closeModal();
    navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_AUTH });
  }

  useFocusEffect(
    React.useCallback(() => {

      return () => {
      };
    }, []),
  );

  // ################################################################ 초기 실행 함수

  return (
    <>
      <Modal visible={isVisible} transparent={true}>
        <View style={modalStyle.modalBackground}>
          <View style={[modalStyle.modalStyle1, {overflow: 'hidden'}]}>
            <LinearGradient
              colors={['#3D4348', '#1A1E1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={_styles.popupContainer}>

              <SpaceView pl={15} pr={15} mt={15} mb={10} viewStyle={_styles.titleArea}>
                <Text style={_styles.titleText}>{memberBase?.nickname}님의{'\n'}인증 정보</Text>
                <TouchableOpacity style={[_styles.authRegiBtn, {marginLeft: 5}]} onPress={() => { onModfy(); }}>
                  <Image source={ICON.penSquare} style={styles.iconSquareSize(15)} />
                  <Text style={_styles.authRegiText}>수정</Text>
                </TouchableOpacity>
              </SpaceView>

              <ScrollView style={{height: 350, flexGrow: 1}} showsVerticalScrollIndicator={true}>
                <SpaceView pl={10} pr={10}>
                  {authList?.map((item, index) => {
                    const authCode = item.common_code;
                    let authIcon = ICON.authJob;

                    if(authCode == 'EDU') {
                      authIcon = ICON.authEdu;
                    } else if(authCode == 'INCOME') {
                      authIcon = ICON.authAsset;
                    } else if(authCode == 'ASSET') {
                      authIcon = ICON.authAsset;
                    } else if(authCode == 'SNS') {
                      authIcon = ICON.authAsset;
                    } else if(authCode == 'VEHICLE') {
                      authIcon = ICON.authAsset;
                    }

                    return (
                      <>
                        <LinearGradient
                          colors={['#F1B10E', '#EEC80C']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={_styles.authItemWrap}>

                          <SpaceView viewStyle={_styles.itemSubBg} />

                          <SpaceView ml={20} mr={8} mt={8} mb={8} viewStyle={{flexDirection: 'column', justifyContent: 'space-between'}}>
                            <SpaceView mb={15} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                              <SpaceView>
                                <Image source={authIcon} style={styles.iconSquareSize(20)} />
                              </SpaceView>

                              {isEmptyData(item?.auth_slogan) && (
                                <SpaceView pt={3} viewStyle={{justifyContent: 'center'}}>
                                  <Text style={_styles.sloganText}>{item?.auth_slogan}</Text>
                                </SpaceView>
                              )}
                            </SpaceView>

                            <SpaceView>
                              <Text style={_styles.textStyle(12, '#4A4846', 'L')} numberOfLines={2}>
                                {isEmptyData(item?.auth_comment) ? (
                                  <>"{item?.auth_comment}"</>
                                ) : (
                                  <>"작성한 인증 코멘트가 없습니다."</>
                                )}
                              </Text>
                            </SpaceView>
                          </SpaceView>

                        </LinearGradient>
                      </>
                    )
                  })}
                </SpaceView>
              </ScrollView>

              <SpaceView pt={10} pr={10} mt={10} mb={10} viewStyle={_styles.confirmBtnArea}>
                <TouchableOpacity onPress={() => { closeModal(); }}>
                  <Text style={_styles.confirmBtnText}>확인</Text>
                </TouchableOpacity>
              </SpaceView>
              
            </LinearGradient>

          </View>
        </View>
      </Modal>
    </>
  );
};




{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  popupWrap: {
    width: '100%',
    borderRadius: 15,
    backgroundColor: 'red',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  popupContainer: {
    //paddingHorizontal: 10,
  },
  titleArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 223, 209, 0.45)',
    paddingBottom: 15,
  },
  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    color: '#FFDD00',
  },

  textStyle: (_fSize:number, _fColor:string, _fType:string) => {
    let _fontFmaily = 'Pretendard-Regular';
    if(_fType == 'SB') {
      _fontFmaily = 'Pretendard-SemiBold';
    } else if(_fType == 'EB') {
      _fontFmaily = 'Pretendard-ExtraBold';
    } else if(_fType == 'B') {
      _fontFmaily = 'Pretendard-Bold';
    } else if(_fType == 'L') {
      _fontFmaily = 'Pretendard-Light';
    }

    return {
      fontFamily: _fontFmaily,
      fontSize: _fSize,
      color: isEmptyData(_fColor) ? _fColor : '#fff',
    };
  },
  authList: {
    width: width,
    overflow: 'hidden',
    marginRight: 15,
  },
  authItem: {
    width: 130,
    height: 220,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  authItemWrap: {
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    overflow: 'hidden',
    minHeight: 90,
    marginBottom: 10,
  },
  itemSubBg: {
    backgroundColor: '#0EE9F1',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 12,
  },
  sloganText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#0EE9F1',
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  modBtn: {
    /* position: 'absolute',
    top: 0,
    right: 0, */
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  modBtnText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#D5CD9E',
    marginLeft: 3,
  },
  authRegiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  authRegiText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#D5CD9E',
    marginLeft: 3,
  },
  confirmBtnArea: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(225, 223, 209, 0.45)',
  },
  confirmBtnText: {
    backgroundColor: '#FFDD00',
    color: '#3D4348',
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 45,
  },

});
