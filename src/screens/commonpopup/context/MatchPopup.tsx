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
  confirmCallbackFunc?: Function | undefined; // 확인 Callback 함수
  cancelCallbackFunc?: Function | undefined;
  confirmBtnText?: string;
  passType?: string;
  passAmt?: string;
  memberImg?: string;
  btnIcon?: string;
  isNoPass?: boolean;
}

export const MatchPopup = (props: Props) => {
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
          <View style={[modalStyle.modalStyle1]}>
            <SpaceView viewStyle={_styles.modalWrap}>

              {/* ########################################################### 타이틀 영역 */}
              <SpaceView viewStyle={[layoutStyle.alignStart]}>
                <Text style={styles.fontStyle('H', 26, '#000000')}>{isEmptyData(props.title) ? props.title : '알림'}</Text>
              </SpaceView>

              {/* ########################################################### 내용 영역 */}
              <SpaceView viewStyle={_styles.contentArea}>
                {/* {isEmptyData(props.passAmt) && (
                  <SpaceView mt={-3} mb={10}>
                    <Image style={styles.iconSquareSize(46)} source={isEmptyData(props.passType) && props.passType == 'ROYAL' ? ICON.megaCubeCyan : ICON.cubeYCyan} resizeMode={'contain'} />
                  </SpaceView>
                )} */}

                <SpaceView mt={5}>
                  <Text style={styles.fontStyle('B', 14, '#000000')}>{isEmptyData(props.text) ? props.text : ''}</Text>
                </SpaceView>

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
              <SpaceView mt={20} viewStyle={_styles.btnContainer}>
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
                    disabled={!props.isNoPass}
                    activeOpacity={0.7}
                    onPress={onPressConfirm} 
                    style={_styles.btnWrap(props.isNoPass)}
                  >
                    {isEmptyData(props.btnIcon) && <SpaceView mr={7}><Image source={props.btnIcon} style={styles.iconSquareSize(18)} /></SpaceView> }
                    <Text style={styles.fontStyle('B', 16, '#fff')}>{isEmptyData(props.confirmBtnText) ? props.confirmBtnText : '확인하기'}</Text>
                  </TouchableOpacity>
                </SpaceView>
              </SpaceView>
            </SpaceView>

            <SpaceView viewStyle={_styles.cancelWrap}>
              <TouchableOpacity onPress={onPressCancel}>
                <Text style={styles.fontStyle('EB', 16, '#ffffff')}>여기 터치하고 닫기</Text>
              </TouchableOpacity>
            </SpaceView>
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
  btnWrap: (isOn:boolean) => {
		return {
			borderRadius: 25,
      backgroundColor: isOn ? '#44B6E5' : '#808080',
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginHorizontal: 3,
      flexDirection: 'row',
		}
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