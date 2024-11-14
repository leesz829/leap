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
  memberImg?: string;
  isNoPass?: boolean;
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
      <Modal 
        visible={props.popupVisible} 
        transparent={true}
        onRequestClose={onPressCancel}
      >
        <TouchableOpacity style={modalStyle.modalBackground} activeOpacity={1} onPress={onPressCancel}>
          <View style={modalStyle.modalStyle1} onStartShouldSetResponder={() => true}>
            <SpaceView viewStyle={_styles.modalWrap}>

              {/* ########################################################### 타이틀 영역 */}
              {props.type != 'AUCTION' ? (
                <SpaceView viewStyle={[layoutStyle.alignStart]}>
                  <Text style={styles.fontStyle('H', 26, '#000000')}>{isEmptyData(props.title) ? props.title : '알림'}</Text>
                </SpaceView>
              ) : (
                <TouchableOpacity onPress={onPressCancel}>
                  <SpaceView pr={20} mt={20} viewStyle={[layoutStyle.alignEnd]}>
                    <Image source={ICON.closeBlack} style={styles.iconSquareSize(18)} />
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

                {/* {isEmptyData(props.passAmt) && (
                  <SpaceView mt={-3} mb={10}>
                    <Image style={styles.iconSquareSize(46)} source={isEmptyData(props.passType) && props.passType == 'ROYAL' ? ICON.megaCubeCyan : ICON.cubeYCyan} resizeMode={'contain'} />
                  </SpaceView>
                )} */}

                <SpaceView mt={5}>
                  <Text style={styles.fontStyle('B', 14, '#000000')}>{isEmptyData(props.text) ? props.text : ''}</Text>
                </SpaceView>

                {isEmptyData(props.subText) &&
                  <Text style={styles.fontStyle('B', 14, '#000000')}>{props.subText}</Text>
                }

                {isEmptyData(props.memberImg) && (
                  <SpaceView mt={25} viewStyle={layoutStyle.alignCenter}>
                    <Image source={props.memberImg} style={[_styles.memberImgWrap, styles.iconSquareSize(85)]} />
                  </SpaceView>
                )}

                {/* {isEmptyData(props.passAmt) && (
                  <SpaceView mt={5} viewStyle={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={styles.iconSquareSize(25)} source={isEmptyData(props.passType) && props.passType == 'ROYAL' ? ICON.megaCubeCyan : ICON.cubeCyan} resizeMode={'contain'} />
                    <Text style={_styles.openPopupDescIcon(props.passType)}>{!props.passAmt ? 'X 15' : 'X ' + props.passAmt}</Text>
                  </SpaceView>
                )} */}
              </SpaceView>

              {/* ########################################################### 버튼 영역 */}
              {(!isEmptyData(props.btnExpYn) || props.btnExpYn == 'Y') &&
                <SpaceView mt={20} viewStyle={_styles.btnContainer}>
                  {props.isConfirm ? (
                    <>
                      {/* <TouchableOpacity onPress={onPressCancel} style={_styles.btnWrap}>
                        <Text style={styles.fontStyle('B', 16, '#fff')}>{isEmptyData(props.cancelBtnText) ? props.cancelBtnText : '닫기'}</Text>
                      </TouchableOpacity> */}

                      <SpaceView>
                        {isEmptyData(props.passAmt) && (
                          <SpaceView viewStyle={_styles.passWrap}>
                            <SpaceView viewStyle={_styles.passBox}>
                              <Image source={props.passType == 'MEGA_CUBE' ? ICON.megaCube : ICON.cube} style={styles.iconSquareSize(17)} />
                              <Text style={styles.fontStyle('R', 9, props.isNoPass ? '#fff' : '#FF516F')}>{props.passAmt}개</Text>
                            </SpaceView>
                          </SpaceView>
                        )}

                        <TouchableOpacity 
                          style={_styles.btnWrap}
                          disabled={isEmptyData(props.passAmt) && !props.isNoPass}
                          onPress={onPressConfirm}
                        >
                          <Text style={styles.fontStyle('B', 16, '#fff')}>{isEmptyData(props.confirmBtnText) ? props.confirmBtnText : '확인하기'}</Text>
                        </TouchableOpacity>

                      </SpaceView>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity onPress={onPressConfirm} style={_styles.btnWrap}>
                        <Text style={styles.fontStyle('B', 16, '#fff')}>{isEmptyData(props.confirmBtnText) ? props.confirmBtnText : '확인'}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </SpaceView>
              }
            </SpaceView>

            <SpaceView viewStyle={_styles.cancelWrap}>
              <TouchableOpacity onPress={onPressCancel}>
                <Text style={styles.fontStyle('EB', 16, '#ffffff')}>여기 터치하고 닫기</Text>
              </TouchableOpacity>
            </SpaceView>
          </View>
        </TouchableOpacity>
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
  modalWrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  contentArea: {
    marginVertical: 13,
    zIndex: 10,
    //alignItems: 'center',
    justifyContent: 'center',
    //minHeight: 70,
  },
  btnWrap: {
    borderRadius: 25,
    backgroundColor: '#44B6E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 3,
  },
  cancelWrap: {
    position: 'absolute',
    bottom: -40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  memberImgWrap: {
    borderRadius: 60,
    overflow: 'hidden',
  },
  passWrap: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  passBox: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 25,
    paddingHorizontal: 7,
    paddingVertical: 1,
    marginHorizontal: 37,
    width: 50,
  },


});