import { ColorType } from '@types';
import { Color } from 'assets/styles/Color';
import { layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Modal, TouchableOpacity, View, Image, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { isEmptyData } from 'utils/functions';
import { ICON, IMAGE } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';

/* ################################################################################################################
###################################################################################################################
###### 셀렉트 팝업 UI Component
###################################################################################################################
################################################################################################################ */

interface Props {
  popupVisible?: boolean; // popup state
  setPopupVIsible?: any; // popup setState
  isConfirm?: boolean; // confirm 여부
  title?: string; // 팝업 제목
  dataList?: any;
  confirmCallbackFunc?: Function | undefined; // 확인 Callback 함수
  cancelCallbackFunc?: Function | undefined;
}

export const SelectPopup = (props: Props) => {
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

  const onPressItem = async (item:any) => {
    //setCurrentIndex(index);
    //onPressCancel();

    if(isEmptyData(props.confirmCallbackFunc)) {
      props.confirmCallbackFunc && props.confirmCallbackFunc(item);
    }

    props.setPopupVIsible(false);
  };

  return (
    <>
      <Modal 
        visible={props.popupVisible} 
        transparent={true} 
        onRequestClose={() => onPressCancel}>

        <View style={modalStyle.modalBackground}>

          {/* 배경 영역 */}
          <Pressable 
            style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}} 
            onPress={onPressCancel} />

          <View style={[modalStyle.modalStyle1, {overflow: 'hidden'}]}>
            <LinearGradient
              colors={['#fff', '#fff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >

              {/* ########################################################### 타이틀 영역 */}
              {/* <TouchableOpacity onPress={onPressCancel}>
                <SpaceView pr={20} mt={20} viewStyle={[layoutStyle.alignEnd]}>
                  <Image source={ICON.closeBlack} style={styles.iconSize18} />
                </SpaceView>
              </TouchableOpacity> */}

              <SpaceView viewStyle={_styles.titleWrap}>
                <Text style={styles.fontStyle('EB', 17, '#000')}>{isEmptyData(props.title) ? props.title : '선택'}</Text>
              </SpaceView>

              {/* ########################################################### 내용 영역 */}
              <SpaceView viewStyle={_styles.contentWrap}>
                <ScrollView 
                  horizontal={false}
                  showsHorizontalScrollIndicator={false}
                  style={_styles.listWrap}>

                  {props.dataList?.map((item, index) => {
                    return (
                      <>
                        <TouchableOpacity key={'promotion_'+index} style={_styles.listItemWrap(false)} onPress={() => { onPressItem(item); }}>
                          <Text style={[styles.fontStyle('SB', 15, '#000'), {textAlign: 'center'}]}>{item.label}</Text>
                        </TouchableOpacity>
                      </>
                    )
                  })}
                </ScrollView>
              </SpaceView>

              {/* ########################################################### 버튼 영역 */}
              {/* {(!isEmptyData(props.btnExpYn) || props.btnExpYn == 'Y') &&
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
              } */}
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




  contentWrap: {
    
  },
  titleWrap: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 20,
  },
  listWrap: {
  },
  listItemWrap: (isOn:boolean) => {
    return {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      width: '100%',
    };
  },
});