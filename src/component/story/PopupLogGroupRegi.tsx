import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, TextInput, Pressable, Image } from 'react-native';
import { findSourcePath, IMAGE, GIF_IMG, ICON } from 'utils/imageUtils';
import Carousel from 'react-native-snap-carousel';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import { commonStyle, styles, modalStyle, layoutStyle } from 'assets/styles/Styles';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { usePopup } from 'Context';
import { ScrollView } from 'react-native-gesture-handler';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { Modalize } from 'react-native-modalize';



/* ################################################################################################################
###################################################################################################################
###### 팝업 - 로그 그룹핑 등록 화면
###################################################################################################################
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
  
}

const PopupLogGroupRegi = forwardRef((props, ref) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 부모 컴포넌트 handle
  useImperativeHandle(ref, () => ({
    openModal: () => {
      popup_onOpen();
    },
    closeModal: () => {
      popup_onClose();
    },
  }));

  const { show } = usePopup();
	const [isLoading, setIsLoading] = useState(false);

  // 등급 올리기 방법 목록
  const methodList = [
    {name: '매일 로그인', icon: ICON.grade01},
    {name: '스토리 이용', icon: ICON.grade02},
    {name: '큐브 사용', icon: ICON.grade03},
    {name: '관심 수락하기', icon: ICON.grade04},
    {name: '관심 보내기', icon: ICON.grade05},
    {name: '멤버십 인증', icon: ICON.grade06},
  ];

  // 팝업 활성화
  const popup_onOpen = () => {
    setIsModalVisible(true);
  }

  // 팝업 닫기
  const popup_onClose = () => {
    setIsModalVisible(false);
  };

  const [canSwipe, setCanSwipe] = useState(true); // 스와이프 가능 여부 관리

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // 스크롤이 끝에 도달했는지 확인
    if (contentOffset.y === 0) {
      setCanSwipe(true); // 스크롤이 맨 위에 있을 때만 스와이프 가능
    } else if (contentOffset.y + layoutMeasurement.height >= contentSize.height) {
      setCanSwipe(true); // 스크롤이 맨 아래에 있을 때도 스와이프 가능
    } else {
      setCanSwipe(false); // 스크롤 중간에서는 스와이프 비활성화
    }
  };

  return (
    <>
      <Modal
        isVisible={isModalVisible}
        style={_styles.modalWrap}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        //swipeDirection="down" // 아래로 스와이프하면 닫힘
        swipeDirection={canSwipe ? "down" : null} // 스크롤 위치에 따라 스와이프 가능 여부 설정
        propagateSwipe={true} // 스와이프 동작과 스크롤 동작이 겹치지 않도록 설정
        onSwipeComplete={popup_onClose} // 스와이프가 완료되면 모달 닫힘
        onBackdropPress={popup_onClose} // 배경을 터치해도 모달 닫기
      >
        <SpaceView mt={25} mb={40} viewStyle={{alignItems: 'center'}}>
          <View style={{backgroundColor: '#808080', borderRadius: 5, width: 35, height: 7}} />
        </SpaceView>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll} // 스크롤 중 스와이프 가능 여부 확인
          scrollEventThrottle={16} // 스크롤 이벤트 빈도 설정
        >
          <SpaceView>
            <Text style={styles.fontStyle('H', 26, '#fff')}>로그 그룹핑</Text>
          </SpaceView>

          <SpaceView mt={40} pl={10} pr={10}>
            <SpaceView viewStyle={_styles.regiWrap}>
              <SpaceView>
                <TextInput
                  //value={voteData[`voteName0${i+1}`]}
                  //value={item.value}
                  //defaultValue={item?.value}
                  //onChangeText={(text) => setVoteData({...voteData, [`voteName0${i+1}`] : text})}
                  //onChangeText={(text) => voteOptionHandler(item?.idx, text)}
                  multiline={false}
                  autoCapitalize="none"
                  style={[styles.fontStyle('SB', 12, '#fff'), _styles.regiInput]}
                  //editable={(storyData.storyType == 'VOTE' && storyData.voteEndYn == 'Y') ? false : true}
                  secureTextEntry={false}
                  maxLength={30}
                  numberOfLines={1}
                  placeholder={'새로 등록할  그룹명을 입력해 주세요.'}
                  placeholderTextColor={'#606060'}
                />
                <TouchableOpacity style={_styles.regiBtn}>
                  <Image source={ICON.addWhite} style={styles.iconSquareSize(17)} />
                  <Text style={styles.fontStyle('SB', 12, '#fff')}>등록</Text>
                </TouchableOpacity>
              </SpaceView>
            </SpaceView>

            <SpaceView mt={30}>
              <SpaceView>
                {['그룹1', '그룹2', '그룹3'].map((item, index) => {
                  return (
                    <>
                      <SpaceView mb={10} viewStyle={_styles.selectItemWrap}>
                        <SpaceView viewStyle={layoutStyle.rowCenter}>
                          <Image source={isEmptyData(item?.selectedValue?.prompt_seq) ? ICON.story_promptYGreen : null} style={styles.iconSquareSize(20)} />
                          <SpaceView ml={8}><Text style={styles.fontStyle('B', 16, '#606060')}>{item}</Text></SpaceView>
                        </SpaceView>
                        <SpaceView viewStyle={layoutStyle.rowEnd}>
                          <TouchableOpacity 
                            //onPress={() => (fnPromptSelect(item))}
                            style={{marginRight: 10}}
                          >
                            <Image source={ICON.join_close} style={styles.iconSquareSize(30)} />
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Image source={ICON.pencilBlue} style={styles.iconSquareSize(30)} />
                          </TouchableOpacity>
                        </SpaceView>
                      </SpaceView>
                    </>
                  )
                })}
              </SpaceView>
            </SpaceView>
          </SpaceView>
        </ScrollView>

        <SpaceView mt={10} mb={10}>
          <SpaceView>
            <TouchableOpacity onPress={popup_onClose} style={_styles.confirmBtnWrap}>
              <Text style={styles.fontStyle('B', 12, '#fff')}>확인</Text> 
            </TouchableOpacity>
          </SpaceView>
        </SpaceView>
      </Modal>
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
    paddingHorizontal: 20,
    margin: 0,
    marginTop: 200,
    justifyContent: 'flex-start'
  },
  confirmBtnWrap: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#fff',
  },
  regiWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#BCBCBC',
    paddingBottom: 20,
  },
  regiInput: {
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 20,
    width: '100%',
    height: 30,
    paddingHorizontal: 15,
    padding: 0,
    margin: 0,
    paddingRight: 70,
  },
  regiBtn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 4,
    backgroundColor: '#46F66F',
    borderRadius: 12,
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  selectItemWrap: {
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 45,
    paddingHorizontal: 10,
  },
  keywordSelectWrap: {
    flex: 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


});


export default PopupLogGroupRegi;