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
import MemberMark from 'component/common/MemberMark';



/* ################################################################################################################
###################################################################################################################
###### 팝업 - 리스펙트 등급 가이드 화면
###################################################################################################################
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
  
}

const PopupGradeGuide = forwardRef((props, ref) => {
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

        {/* <SpaceView mb={40} /> */}

        <ScrollView 
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll} // 스크롤 중 스와이프 가능 여부 확인
          scrollEventThrottle={16} // 스크롤 이벤트 빈도 설정
        >
          <SpaceView>
            <Text style={styles.fontStyle('H', 26, '#fff')}>리스펙트 등급 가이드</Text>
          </SpaceView>
          <SpaceView mt={40}>
            <SpaceView>
              <SpaceView><Text style={styles.fontStyle('EB', 19, '#fff')}>매주 월요일, 리프의 선물을 받아 주세요.</Text></SpaceView>
              <SpaceView mt={5}><Text style={styles.fontStyle('SB', 11, '#fff')}>서로 배려하는 마음으로 리프를 이용하면 친구를 만날 기회가 더 많아집니다.</Text></SpaceView>
            </SpaceView>
            <SpaceView mt={20} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              {['FREE', 'CUBE', 'MEGACUBE'].map((item, index) => {
                
                return (
                  <>
                    <LinearGradient
                      colors={['rgba(77,190,182,0.8)', 'rgba(28,41,97,0.5)', 'rgba(41,45,54,0.8)']}
                      style={[_styles.respectItemWrap, {marginHorizontal: index == 1 ? 10 : 0}]}
                      start={{ x: 0.7, y: 0.7 }}
                      end={{ x: 0, y: 0 }} >

                      <Text style={[styles.fontStyle('SB', 11, '#fff'), {textAlign: 'center'}]}>
                        {item == 'FREE' && ( <>블라인드 카드{'\n'}무료 열람</> )}
                        {item == 'CUBE' && ( <>매주 월요일{'\n'}큐브 지급</> )}
                        {item == 'MEGACUBE' && ( <>매주 월요일{'\n'}메가 큐브 지급</> )}
                      </Text>

                      <SpaceView mt={10}>
                        {item == 'FREE' && ( <Image source={ICON.respectFree} style={styles.iconSquareSize(60)} /> )}
                        {item == 'CUBE' && ( <Image source={ICON.respectCube} style={styles.iconSquareSize(60)} /> )}
                        {item == 'MEGACUBE' && ( <Image source={ICON.respectMegaCube} style={styles.iconSquareSize(60)} /> )}
                      </SpaceView>
                    </LinearGradient>
                  </>
                )
              })}
            </SpaceView>
          </SpaceView>
          <SpaceView mt={30}>
            <SpaceView>
              <SpaceView><Text style={styles.fontStyle('EB', 19, '#fff')}>리스펙트 등급 올리기</Text></SpaceView>
              <SpaceView mt={5}>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>
                  매주 월요일 리스펙트 등급이 갱신되며 보상이 제공됩니다.{'\n'}
                  리프를 자주 이용하다보면 자연스럽게 리스펙트 등급도 올라가게 됩니다.{'\n'}  
                  다른 회원들보다 더 많은 이용을 할수록 크게 오를 수 있습니다.
                </Text>
              </SpaceView>
            </SpaceView>
            <SpaceView viewStyle={_styles.methodWrap}>
              {methodList.map((item, index) => {

                return (
                  <>
                    <SpaceView viewStyle={_styles.methodItemWrap}>
                      <Image source={item.icon} style={styles.iconSquareSize(19)} />
                      <SpaceView ml={5}><Text style={styles.fontStyle('B', 12, '#fff')}>{item.name}</Text></SpaceView>
                    </SpaceView>
                  </>
                )
              })}
            </SpaceView>
          </SpaceView>
          <SpaceView mt={30}>
            <SpaceView>
              <SpaceView><Text style={styles.fontStyle('EB', 19, '#fff')}>폭력적/공격적 행위에 대한 페널티</Text></SpaceView>
              <SpaceView mt={5}>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>리프는 안전한 커뮤니티 환경을 제공하기 위해 회원 활동에 적극적으로 개입하는 운영 방침을 갖고 있습니다.</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mt={20}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(122,122,122,0.3)', 'rgba(45,68,90,0.3)']}
                start={{ x: 0, y: 0.1 }}
                end={{ x: 0.1, y: 0.3 }}
                style={[_styles.penaltyItemWrap]}
              >
               <Text style={styles.fontStyle('B', 30, '#fff')}>즉각적 제재</Text> 
               <SpaceView mt={14}>
                <Text style={styles.fontStyle('SB', 12, '#fff')}>보고된 신고 중 개인정보를 악용하여 다른 회원에게 피해를 준 사실이 확인되면 "영구 정지" 제재를 받을 수 있으며, 법적 분쟁이 발생하는 경우 리프는 관련 수사 기관의 요청에 적극 협조하여 범죄 근절에 동참합니다.</Text> 
               </SpaceView>
              </LinearGradient>

              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(122,122,122,0.3)', 'rgba(45,68,90,0.3)']}
                start={{ x: 0, y: 0.1 }}
                end={{ x: 0.1, y: 0.3 }}
                style={[_styles.penaltyItemWrap]}
              >
               <Text style={styles.fontStyle('B', 30, '#fff')}>점진적 제재</Text> 
               <SpaceView mt={14}>
                <Text style={styles.fontStyle('SB', 12, '#fff')}>
                  커뮤니티 활동에는 서로 다른 의견의 충돌의 발생은 자연스러운 일입니다. 따라서 간헐적으로 신고를 받는 것을 두고 공격적/폭력적 회원이라 분류할 수는 없습니다.{'\n'}{'\n'}

                  하지만 리프의 리스펙트 리포팅 시스템에 의해,{'\n'}
                  <Text style={styles.fontStyle('SB', 12, '#FF2476')}>1주일 내에 여러 건의 신고</Text>를 받게 되거나,
                  <Text style={styles.fontStyle('SB', 12, '#FF2476')}>다양한 사람들에게 신고</Text>를 받게 되거나 
                  <Text style={styles.fontStyle('SB', 12, '#FF2476')}> 누적된 신고 건수가 비정상적으로 많다면 </Text>
                  공격적/폭력적 회원으로 분류되어 리스펙트 등급에 페널티가 부과되며, 
                  누적 신고 건수가 많아 질수록 <Text style={styles.fontStyle('SB', 12, '#FF2476')}>페널티가 가중 부과</Text>됩니다.
                </Text> 
               </SpaceView>
              </LinearGradient>

              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(122,122,122,0.3)', 'rgba(45,68,90,0.3)']}
                start={{ x: 0, y: 0.1 }}
                end={{ x: 0.1, y: 0.3 }}
                style={[_styles.penaltyItemWrap]}
              >
               <Text style={styles.fontStyle('B', 30, '#fff')}>사후적 제재</Text> 
               <SpaceView mt={14}>
                <Text style={styles.fontStyle('SB', 12, '#fff')}>
                  리프는 커뮤니티 운영 목적으로 회원들의 커뮤니티 로그를 활용하여 활동 패턴을 분석하여 리스펙트 리포팅 시스템에서 걸러내지 못한 폭력적/공격적 행위에 대해 사후 제재를 할 수 있으며 확인된 사실에 근거하여 <Text style={styles.fontStyle('SB', 12, '#FF2476')}>"즉각적 제재"와 동급의 조치</Text>를 할 수 있습니다.
                </Text> 
               </SpaceView>
              </LinearGradient>
            </SpaceView>
          </SpaceView>

        </ScrollView>

        <SpaceView mt={10} mb={10}>
          <TouchableOpacity onPress={popup_onClose} style={_styles.confirmBtnWrap}>
            <Text style={styles.fontStyle('B', 12, '#fff')}>확인</Text> 
          </TouchableOpacity>
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
    marginTop: 100,
    justifyContent: 'flex-start'
  },
  respectItemWrap: {
    width: width/3.6,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F5E8A8',
    borderRadius: 25,
    overflow: 'hidden',
  },
  methodWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  methodItemWrap: {
    backgroundColor: 'rgba(128,128,128,0.6)',
    borderColor: '#C4B6AA',
    borderWidth: 1,
    borderRadius: 25,
    flexDirection: 'row',
    marginRight: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  penaltyItemWrap: {
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 40,
  },
  confirmBtnWrap: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 10,
  },


});


export default PopupGradeGuide;