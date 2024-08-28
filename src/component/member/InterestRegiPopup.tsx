import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList, Platform, KeyboardAvoidingView, InputAccessoryView, TextInput, Keyboard, Modal, Pressable  } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, withSpring, withSequence, withDelay, Easing, withRepeat, interpolate, Extrapolate, cancelAnimation, stopClock } from 'react-native-reanimated';
import { ROUTES, STACK } from 'constants/routes';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { Modalize } from 'react-native-modalize';



interface Props {
  isVisible: boolean;
  storyBoardSeq: number;
  storyReplySeq: number;
  depth: number;
  isSecret: boolean;
  interestList: [];
  callbackFunc: (intList:[]) => void;
}

const { width, height } = Dimensions.get('window');

const InterestRegiPopup = forwardRef((props, ref) => {
  const dispatch = useDispatch();

  const memberBase = useUserInfo(); // 본인 데이터
  const modalizeRef = useRef(null); // 모달 ref

  const { callbackFunc } = props;

  // 부모 컴포넌트 handle
  useImperativeHandle(ref, () => ({
    openModal: (list:any, chkList:any) => {
      //console.log('type :::::: ' , type);
      //getStoryLikeList(type, seq);
      //modalizeRef.current?.open();
      setInterestList(list);
      setCheckIntList(chkList);
      popup_onOpen();
    },
    closeModal: () => {
      //modalizeRef.current?.close();
      popup_onClose();
    },
  }));

  // 팝업 활성화
  const popup_onOpen = () => {
    modalizeRef.current?.open();
  }

  // 팝업 닫기
  const popup_onClose = () => {
    console.log('close!!');
    modalizeRef.current?.close();
  };

  const [interestList, setInterestList] = React.useState([]);
  const [selectGroupCode, setSelectGroupCode] = React.useState('INTEREST_CATEGORY_01');

  // 관심사 체크 목록
	const [checkIntList, setCheckIntList] = React.useState([{code_name: "", common_code: "", interest_seq: ""}]);

  // 관심사 그룹 선택
  const onInterestGroup = async (groupCode:string) => {
    setSelectGroupCode(groupCode);
  };

  React.useEffect(() => {

  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
      };
    }, []),
  );

  return (
    <>
      <Modalize
        ref={modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={_styles.modalWrap}
        modalHeight={height-100} 
        onOverlayPress={() => { popup_onClose(); }}
        FooterComponent={
					<>
						<SpaceView pl={10} pr={10} mb={20}>
              <TouchableOpacity
                onPress={() => {
                  callbackFunc(checkIntList);
                }}
                style={_styles.saveBtn}
              >
                <Text style={styles.fontStyle('B', 12, '#fff')}>저장하기</Text>

              </TouchableOpacity>
						</SpaceView>
					</>
				}
      >
        <SpaceView>
          <SpaceView mt={20} viewStyle={{alignItems: 'center'}}>
            <View style={{backgroundColor: '#808080', borderRadius: 5, width: 35, height: 5}} />
          </SpaceView>
          <SpaceView viewStyle={_styles.headerWrap}>
            <Text style={styles.fontStyle('EB', 24, '#fff')}>관심사 추가/삭제</Text>
          </SpaceView>
          <SpaceView>
            <ScrollView horizontal={true}>
              {interestList.map((item, index) => (
                <TouchableOpacity 
                  key={item.group_code + '_' + index} 
                  style={_styles.groupCodeWrap(selectGroupCode == item.group_code)}
                  onPress={() => {
                    onInterestGroup(item.group_code);
                  }}
                >
                  <Text style={styles.fontStyle('EB', 14, (selectGroupCode == item.group_code ? '#46F66F' : '#808080'))}>{item.group_code_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SpaceView>
        </SpaceView>

        <View style={_styles.listWrap}>
					{interestList.map((item, index) => (  
            <>
              {selectGroupCode == item.group_code && (
                  <>
                    <SpaceView mt={20} mb={10} key={item.group_code + '_' + index} viewStyle={_styles.rowStyle}>
                      {item.list.map((i, idx) => {
                        const groupCode = item?.group_code;
                        let tmpCommonCode = '';
                        let tmpCnt = 0;
                        let icon = ICON.int_active;
        
                        for (let j = 0; j < checkIntList.length; j++) {
                          if(checkIntList[j].common_code == i.common_code){
                            tmpCommonCode = i.common_code
                            tmpCnt = j;
                            break;
                          }
                        }

                        // 아이콘 설정
                        if(groupCode == 'INTEREST_CATEGORY_01') {
                          icon = ICON.int_lifestyle;
                        } else if(groupCode == 'INTEREST_CATEGORY_02') {
                          icon = ICON.int_leisure;
                        } else if(groupCode == 'INTEREST_CATEGORY_03') {
                          icon = ICON.int_food;
                        } else if(groupCode == 'INTEREST_CATEGORY_04') {
                          icon = ICON.int_body;
                        } else if(groupCode == 'INTEREST_CATEGORY_05') {
                          icon = ICON.int_active;
                        } else if(groupCode == 'INTEREST_CATEGORY_06') {
                          icon = ICON.int_social;
                        } else if(groupCode == 'INTEREST_CATEGORY_07') {
                          icon = ICON.int_entertainment;
                        } else if(groupCode == 'INTEREST_CATEGORY_08') {
                          icon = ICON.int_game;
                        }

                        return (
                          <SpaceView key={i.common_code} mr={10} mb={10}>
                            <TouchableOpacity 
                              style={_styles.interestItemWrap(i.common_code === tmpCommonCode)}
                              onPress={() => {
                                if(checkIntList.length > 19 && i.common_code !== tmpCommonCode) {

                                } else {
                                  if(i.common_code === tmpCommonCode){
                                    setCheckIntList(checkIntList.filter(value => value.common_code != tmpCommonCode))
                                  } else {
                                    setCheckIntList(intValue => [...intValue, i])
                                  }
                                }
                              }}
                            >
                              <Image source={icon} style={styles.iconSquareSize(15)} />
                              <SpaceView ml={3}><Text style={styles.fontStyle('B', 14, '#fff')}>{i.code_name}</Text></SpaceView>
                            </TouchableOpacity>
                          </SpaceView>
                        )
                      })}
                    </SpaceView>
                  </>
              )}
            </>
					))}
				</View>
      </Modalize>
    </>
  );
});




{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  modalWrap: {
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    overflow: 'hidden', 
    backgroundColor: '#1B1633',
  },
  rowStyle : {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
  interestItemWrap: (isOn:boolean) => {
		return {
			backgroundColor: isOn ? '#1F5AFB' : '#808080',
      borderRadius: 25,
      borderColor: '#40E0D0',
      borderWidth: 1,
      paddingHorizontal: 13,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };
	},
  interestBox: {
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#D5CD9E',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 5,
		paddingHorizontal: 15,
	},
  headerWrap: {
    marginTop: 40,
    marginBottom: 30,
    marginLeft: 20,
    paddingBottom: 20,
  },
  groupCodeWrap: (isOn:boolean) => {
		return {
			borderBottomWidth: 2,
      borderBottomColor: isOn ? '#46F66F' : '#808080',
      paddingHorizontal: 8,
      paddingBottom: 5,
    };
	},
  listWrap: {
    paddingHorizontal: 10,
  },
  saveBtn: {
    backgroundColor: '#44B6E5',
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },


});



export default InterestRegiPopup;