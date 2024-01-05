import { ColorType } from '@types';
import { Color } from 'assets/styles/Color';
import { layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Modal, TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { isEmptyData } from 'utils/functions';
import { ICON, IMAGE } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';

/* ################################################################################################################
###################################################################################################################
###### 기본 팝업 UI Component
###################################################################################################################
################################################################################################################ */

interface Props {
  popupVisible?: boolean; // popup state
  setPopupVIsible?: any; // popup setState
  isConfirm?: boolean; // confirm 여부
  title?: string; // 팝업 제목
  text?: string; // 팝업 문구
  subText?: string;
  confirmCallbackFunc?: Function | undefined; // 확인 Callback 함수
  cancelCallbackFunc?: Function | undefined;
  confirmBtnText?: string;
  cancelBtnText?: string;
  btnExpYn?: string;
  passType?: string;
  passAmt?: string;
  type?: string;
}

export const BasePopup = (props: Props) => {
  const onPressConfirm = () => {
    if(props.confirmCallbackFunc == null && typeof props.confirmCallbackFunc != 'undefined') {
      
    } else {
      props.confirmCallbackFunc && props.confirmCallbackFunc();
      props.setPopupVIsible(false);
    }
  };
  const onPressCancel = () => {
    props.cancelCallbackFunc && props.cancelCallbackFunc();
    props.setPopupVIsible(false);
  };

  return (
    <>
      <Modal visible={props.popupVisible} transparent={true}>
        <View style={modalStyle.modalBackground}>
          <View style={[modalStyle.modalStyle1, {overflow: 'hidden'}]}>
            <LinearGradient
              colors={['#3D4348', '#1A1E1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >

              {/* ########################################################### 타이틀 영역 */}
              {props.type != 'AUCTION' ? (
                <SpaceView pt={15} pb={10} pl={12} viewStyle={[layoutStyle.alignStart]}>
                  <Text style={_styles.titleText}>{isEmptyData(props.title) ? props.title : '알림'}</Text>
                </SpaceView>
              ) : (
                <TouchableOpacity onPress={onPressCancel}>
                  <SpaceView pr={20} mt={20} viewStyle={[layoutStyle.alignEnd]}>
                    <Image source={ICON.closeBlack} style={styles.iconSize18} />
                  </SpaceView>
                </TouchableOpacity>
              )}

              {/* ########################################################### 내용 영역 */}
              <SpaceView viewStyle={_styles.contentArea}>
                {props.type == 'REPORT' &&
                  <SpaceView mb={15}>
                    <Image source={ICON.sirenMark} style={styles.iconSquareSize(60)} />
                  </SpaceView>
                }

                {props.type == 'AUCTION' &&
                  <SpaceView mb={15}>
                    <Image source={ICON.hifive} style={styles.iconSquareSize(60)} />
                  </SpaceView>
                }

                {isEmptyData(props.passAmt) && (
                  <SpaceView mt={-3} mb={10}>
                    <Image style={styles.iconSquareSize(46)} source={isEmptyData(props.passType) && props.passType == 'ROYAL' ? ICON.megaCubeCyan : ICON.cubeYCyan} resizeMode={'contain'} />
                  </SpaceView>
                )}

                <Text style={_styles.msgText}>{isEmptyData(props.text) ? props.text : ''}</Text>

                {isEmptyData(props.subText) &&
                  <CommonText type={'h6'} textStyle={layoutStyle.textCenter} color={'#9c89e5'} fontWeight={'700'}>
                    {props.subText}
                  </CommonText>
                }

                {/* {isEmptyData(props.passAmt) && (
                  <SpaceView mt={5} viewStyle={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={styles.iconSquareSize(25)} source={isEmptyData(props.passType) && props.passType == 'ROYAL' ? ICON.megaCubeCyan : ICON.cubeCyan} resizeMode={'contain'} />
                    <Text style={_styles.openPopupDescIcon(props.passType)}>{!props.passAmt ? 'X 15' : 'X ' + props.passAmt}</Text>
                  </SpaceView>
                )} */}
              </SpaceView>

              {/* ########################################################### 버튼 영역 */}
              {(!isEmptyData(props.btnExpYn) || props.btnExpYn == 'Y') &&
                <SpaceView mt={10} mb={15} viewStyle={_styles.btnContainer}>
                  {props.isConfirm ? (
                    <>
                      <TouchableOpacity onPress={onPressCancel}>
                        <Text style={_styles.btnStyle('#ffffff')}>{isEmptyData(props.cancelBtnText) ? props.cancelBtnText : '닫기'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={onPressConfirm}>
                        <Text style={_styles.btnStyle('#FFDD00')}>{isEmptyData(props.confirmBtnText) ? props.confirmBtnText : '확인하기'}</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={onPressConfirm}>
                        <Text style={_styles.btnStyle('#ffffff')}>{isEmptyData(props.confirmBtnText) ? props.confirmBtnText : '확인'}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </SpaceView>
              }
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
  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    color: '#FFDD00',
  },
  msgText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    color: '#D5CD9E',
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
  },

  openPopupDescIcon: (passType: string) => {
    return {
      fontFamily: 'Pretendard-ExtraBold',
      fontSize: 16,
      color: '#32F9E4',
      marginLeft: 3,
    };
  },
  modalAuctBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 50,
    marginBottom: 40,
  },
  btnStyle: (bgcr: string) => {
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: 15,
      color: '#3D4348',
      backgroundColor: isEmptyData(bgcr) ? bgcr : '#FFFFFF',
      borderRadius: 8,
      paddingVertical: 4,
      width: 110,
      textAlign: 'center',
      marginHorizontal: 3,
      overflow: 'hidden',
    };
  },
  contentArea: {
    paddingHorizontal: 35,
    marginVertical: 13,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    //minHeight: 70,
  },
});