import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, TextInput, Pressable, Image, Platform } from 'react-native';
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
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';



/* ################################################################################################################
###################################################################################################################
###### 팝업 - 리스펙트 등급 가이드 화면
###################################################################################################################
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
  modalRef: undefined
  closeFn: () => void
  onChangeFn: () => void
}

const PopupAiIntro = forwardRef((props:Props, ref) => {

  // 등급 올리기 방법 목록
  const methodList = [
    {name: '매일 로그인', icon: ICON.grade01},
    {name: '스토리 이용', icon: ICON.grade02},
    {name: '큐브 사용', icon: ICON.grade03},
    {name: '관심 수락하기', icon: ICON.grade04},
    {name: '관심 보내기', icon: ICON.grade05},
    {name: '멤버십 인증', icon: ICON.grade06},
  ];

  // 팝업 닫기
  const popup_onClose = () => {
    props.closeFn();
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
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={props.modalRef}
          index={0}
          onChange={props.onChangeFn}
          //snapPoints={snapPoints}
          maxDynamicContentSize={Platform.OS == 'android' ? height-150 : height-200}
          enablePanDownToClose={true}
          handleIndicatorStyle={{
            backgroundColor: '#808080', // 핸들러 색상 변경
            width: 37, // 핸들러 너비 변경
            height: 7, // 핸들러 높이 변경
            borderRadius: 5, // 둥글게 처리
          }}
          handleStyle={{
            backgroundColor: '#1B1633', // 핸들러 배경 변경
            borderTopLeftRadius: 30, // 모달 상단 모서리 둥글게
            borderTopRightRadius: 30,
            overflow: 'hidden',
            paddingTop: 20
          }}
          backgroundStyle={{backgroundColor: '#1B1633'}}
          //handleComponent={null}
        >
          <SpaceView mt={30} mb={20} viewStyle={{paddingHorizontal: 23}}>
            <Text style={styles.fontStyle('H', 26, '#fff')}>AI 소개글</Text>
          </SpaceView>

          <BottomSheetScrollView 
            contentContainerStyle={{ paddingHorizontal: 23/* , height: props.modalHeight */ }}  
            showsVerticalScrollIndicator={false}
          >
            <SpaceView mt={20}>
              <SpaceView>
                <Text style={styles.fontStyle('SB', 14, '#fff')}>스토리: "김리미"의 경로</Text>
              </SpaceView>

              <SpaceView mt={25}>
                <Text style={styles.fontStyle('SB', 14, '#fff')}>"김리미"은 2018년 1월, 중견기업에서 사원으로 경력을 시작했습니다. 그 시점에서 그는 직장에서의 초기 적응과 기초적인 업무 숙련도를 쌓아가며, 자신의 아이디어와 창의성을 발휘하고자 했습니다. 이 시기의 그는 높은 에너지를 바탕으로 활발히 활동하며, 새로운 기회를 모색하고 사람들과의 네트워크를 확장하는 데 주력했습니다. 업무에 대한 접근 방식은 실용적이면서도 창의적이었으며, 팀 내에서 주도적인 역할을 자주 맡았고, 주변 동료들과의 협력을 통해 업무를 효율적으로 수행했습니다.{'\n'}{'\n'}
                  시간이 흐르면서 "김리미"의 능력과 경력은 더욱 두드러지기 시작했습니다. 2020년 1월에는 대기업으로 이직하게 되었고, 여전히 사원급이었지만, 이곳에서도 그의 외향적이고 창의적인 성향이 빛을 발했습니다. 그는 대기업의 복잡한 환경 속에서 실질적이고 미래 지향적인 해결책을 제시하며, 변화에 유연하게 대응하는 능력을 입증했습니다. 특히, 대기업의 다양한 부서와의 협업에서 주도적인 역할을 하며, 뛰어난 문제 해결 능력과 논리적인 접근 방식으로 팀의 목표를 달성하는 데 기여했습니다. 이 시기에는 다양한 사람들과의 상호작용을 통해 자신의 아이디어를 더욱 발전시키고, 조직 내에서의 입지를 다졌습니다.{'\n'}{'\n'}
                  그리고 2023년 1월, 그는 다시 중견기업으로 돌아와 임원급으로 승진하게 됩니다. 이제는 리더로서 팀을 이끌며, 창의적이고 혁신적인 전략을 구상하여 조직의 비전을 실현하는 데 중요한 역할을 맡게 되었습니다. 그의 직무에서는 사람들과의 효과적인 소통, 전략적인 문제 해결, 그리고 즉흥적인 결정이 중요했으며, "김리미"은 이를 훌륭히 수행하였습니다. 그가 이끄는 팀은 성공적으로 목표를 달성하며, 그의 리더십과 창의적인 접근 방식 덕분에 조직 내에서의 평가와 신뢰가 더욱 강화되었습니다.{'\n'}{'\n'}
                  자산 면에서도 "김리미"의 성장은 주목할 만합니다. 2018년 1월에는 연소득 3,000만원을 기록했으나, 그의 꾸준한 노력과 능력 개발 덕분에 2020년 1월에는 연소득 5,000만원을 달성했습니다. 이 시기에 그는 직업적인 성장과 함께 자산 관리와 투자에도 신경을 쓰며, 재정적인 목표를 설정하고 달성하기 위한 전략을 세웠습니다.{'\n'}{'\n'}
                  2023년에는 연소득 1억원을 기록하며 억대 소득의 자산가로 자리매김했습니다. 이 시점에서 "김리미"은 성공적인 경영과 전략적인 자산 관리의 결실을 맺었으며, 그의 경력과 자산 축적 모두에서 뛰어난 성과를 이루었습니다. 이는 그의 외향적이고 창의적인 성향, 논리적이고 객관적인 접근, 그리고 유연한 문제 해결 능력이 모두 결합된 결과입니다.{'\n'}{'\n'}
                  "김리미"의 경로는 끊임없는 자기 개발과 성장을 통한 성공적인 직업적 여정과 재정적 성취의 사례를 보여줍니다. 그의 에너지가 넘치는 사회적 상호작용과 미래 지향적인 사고, 그리고 합리적인 판단은 그의 모든 성과를 이루는 데 중요한 역할을 했습니다.
                </Text>
              </SpaceView>
            </SpaceView>
          </BottomSheetScrollView>

          <SpaceView mt={10} mb={10} viewStyle={{paddingHorizontal: 23}}>
            <SpaceView>
              <TouchableOpacity onPress={popup_onClose} style={{marginBottom: 10}}>
                <LinearGradient
                  colors={['#44B6E5', '#1CDE95']}
                  start={{ x: 0, y: 0.1 }}
                  end={{ x: 0.1, y: 0.3 }}
                  style={[_styles.createBtnWrap]}
                >
                  <Image source={ICON.sendIcon} style={styles.iconSquareSize(20)} />
                  <SpaceView ml={5}>
                    <Text style={styles.fontStyle('EB', 17, '#fff')}>AI 소개글 생성</Text>
                  </SpaceView>
                  <SpaceView ml={5} viewStyle={[layoutStyle.rowBetween, {backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 25, paddingHorizontal: 5, paddingVertical: 3,}]}>
                    <Image source={ICON.cube} style={styles.iconSquareSize(13)} />
                    <SpaceView ml={5}><Text style={styles.fontStyle('R', 8, '#fff')}>20개</Text></SpaceView>
                  </SpaceView>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={popup_onClose} style={_styles.confirmBtnWrap}>
                <Text style={styles.fontStyle('B', 12, '#fff')}>닫기</Text> 
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>

        </BottomSheetModal>
      </BottomSheetModalProvider>
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
  createBtnWrap: {
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  confirmBtnWrap: {
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: '#808080',
    height: 40,
    justifyContent: 'center',
  },


});


export default PopupAiIntro;