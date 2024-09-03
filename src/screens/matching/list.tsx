import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import { get_daily_match_list, profile_open, update_additional } from 'api/models';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, RefreshControl, Platform } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { Watermark } from 'component/Watermark';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { ROUTES, STACK } from 'constants/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearPrincipal } from 'redux/reducers/authReducer';
import LinearGradient from 'react-native-linear-gradient';
import { CommonText } from 'component/CommonText';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';
import SocialGrade from 'component/common/SocialGrade';
import { iapConnection } from 'utils/initIAP';
import ListItem from 'component/match/ListItem';
import { DropDown } from 'component/common/DropDown';



interface Props {
  navigation: StackNavigationProp<BottomParamList, 'MatchingList'>;
  route: RouteProp<BottomParamList, 'MatchingList'>;
}

const { width, height } = Dimensions.get('window');

/* ################################################################################################################
###################################################################################################################
###### 매칭 목록 화면
###################################################################################################################
################################################################################################################ */
export default function MatchingList(props: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const scrollRef = React.useRef();

  const { show } = usePopup(); // 공통 팝업

  const [isLoad, setIsLoad] = React.useState(false); // 로딩 여부
  const [isEmpty, setIsEmpty] = React.useState(false); // 빈 데이터 여부
  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const memberBase = useUserInfo(); // 본인 데이터

  const [matchList, setMatchList] = React.useState([]); // 매칭 목록 데이터

  const [data, setData] = React.useState({
    introSecondYn: '',
    matchList: [],
    freeOpenCnt: 0,
  })

  // 팝업 목록
  let popupList = [];
  let isPopup = true;

  // ##################################################################################### 목록 새로고침
  const handleRefresh = () => {
    console.log('refresh!!!!!!!!!!!!!!');
    getDailyMatchList(false);
  };

  // ############################################################ 데일리 매칭 목록 조회
  const getDailyMatchList = async (isPopupShow:boolean) => {

    try {
      const body = {

      }
      const { success, data } = await get_daily_match_list(body);
      
      if (success) {
        if (data.result_code == '0000') {
          setData({
            introSecondYn: data?.intro_second_yn,
            matchList: data?.match_list,
            freeOpenCnt: data?.free_open_cnt,
          });

          if(data?.match_list.length > 0) {
            setIsEmpty(false);
          } else {
            setIsEmpty(true);
          }

          /* if(data?.match_member_info == null) {
            setIsLoad(false);
            setIsEmpty(true);
          } else {
            setIsLoad(true);
          } */

          // 이벤트 팝업 노출
          /* if(data.popup_list?.length > 0) {
            popupList = data.popup_list;

            // 튜토리얼 팝업 닫혀있는 경우 호출
            if(isPopupShow) {
              popupShow();
            }
          }; */

        } else {
          setIsLoad(false);
          setIsEmpty(true);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  // ############################################################ 팝업 활성화
  const popupShow = async () => {
    if(popupList.length > 0 && isPopup) {
      let type = popupList[0].type;  // 팝업 유형
      let nowDt = formatNowDate().substring(0, 8);
      let endDt = await AsyncStorage.getItem('POPUP_ENDDT_' + type);

      if(null == endDt || endDt < nowDt) {
        show({
          type: 'EVENT',
          eventType: 'EVENT',
          dataList: popupList,
          confirmCallback: async function(isNextChk) {
            if(isNextChk) {
              // 팝업 종료 일시 Storage 저장
              await AsyncStorage.setItem('POPUP_ENDDT_' + type, nowDt);
              isPopup = false;
            }
          },
          etcCallback: async function(pop_bas_seq, sub_img_path, index) {
            navigation.navigate(STACK.COMMON, { 
              screen: 'EventDetail',
              params: {
                index: index,
                view_type: 'MATCH',
              }
            });
          },
        });
      }
    }
  };

  // ############################################################ 회원 튜토리얼 노출 정보 저장
  const saveMemberTutorialInfo = async () => {
    const body = {
      tutorial_daily_yn: 'N'
    };
    const { success, data } = await update_additional(body);
    if(success) {
      if(null != data.mbr_base && typeof data.mbr_base != 'undefined') {
        dispatch(setPartialPrincipal({
          mbr_base : data.mbr_base
        }));
      }
    }
  };

  // ############################################################ 매칭 상세 이동
  const goMatchDetail = useCallback(async (trgtMemberSeq:number) => {
    navigation.navigate(STACK.COMMON, { 
      screen: 'MatchDetail',
      params: {
        trgtMemberSeq: trgtMemberSeq,
        type: 'OPEN',
      } 
    });
  }, []);

  // ############################################################ 프로필 열람
  const profileOpen = useCallback(async (trgtMemberSeq:number) => {
    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
        setIsLoad(true);
  
        const body = {
          type: 'MATCH',
          trgt_member_seq: trgtMemberSeq,
        };
  
        const { success, data } = await profile_open(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              goMatchDetail(trgtMemberSeq);
              break;
            case EXIST:
              show({ content: '이미 보관함에 존재하는 회원입니다.', isCross: true });
              break;
            case '6010':
              show({ content: '보유 큐브가 부족합니다.', isCross: true, });
              break;
            default:
              show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true });
              break;
          }
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoad(false);
      }
    }
  }, []);

  // ################################################################ 초기 실행 함수
  React.useEffect(() => {
    if(isFocus) {
      if(memberBase?.status == 'BLOCK') {
        show({
          title: '서비스 이용 제한 알림',
          content: '서비스 운영정책 위반으로 회원님의 계정상태가\n이용제한 상태로 전환되었습니다.',
          confirmCallback: function() {
            dispatch(clearPrincipal());
          }
        });
      } else {

        //checkUserReport();
        setIsEmpty(false);
        
        let isPopupShow = true;

        // 튜토리얼 팝업 노출
        /* if(!isEmptyData(memberBase?.tutorial_daily_yn) || memberBase?.tutorial_daily_yn == 'Y') {
          isPopupShow = false;

          show({
            type: 'GUIDE',
            guideType: 'DAILY',
            guideSlideYn: 'Y',
            guideNexBtnExpoYn: 'Y',
            confirmCallback: function(isNextChk) {
              if(isNextChk) {
                saveMemberTutorialInfo();
              }
              popupShow();
            }
          });
        }; */

        // 데일리 매칭 정보 조회
        getDailyMatchList(isPopupShow);
      }

      // IAP 연결
      iapConnection();
    };
  }, [isFocus]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // 스크롤 최상단 이동
        /* scrollRef.current?.scrollTo({y: 0, animated: false});
        setIsLoad(false);
        setIsEmpty(false); */
      };
    }, []),
  );

  return (
    <>
      {/* <TopNavigation currentPath={'LEAP'} /> */}

      <LinearGradient
				colors={['#8080E2', '#44B6E5']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
        style={_styles.wrap}
			>

        <SpaceView mt={30} mb={20} ml={20} mr={20}>
          <DropDown />
        </SpaceView>

        {!isEmpty ? (
          <>
            <SpaceView pb={150}>
              <FlatList
                ref={scrollRef}
                data={data.matchList}
                renderItem={(props) => {
                  //console.log('props : ', JSON.stringify(props));
                  const { item, index } = props;
                  return (
                    <>
                      <ListItem 
                        //key={item.match_seq} 
                        item={item}
                        fnGoDetail={goMatchDetail}
                        fnProfileOpen={profileOpen}
                        freeOpenCnt={data?.freeOpenCnt}
                        respectGrade={memberBase?.respect_grade}
                        isLastItem={data.matchList.length == index}
                      />
                    </>
                  )
                }}
                //onScroll={handleScroll}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={height * 0.73 + 30}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="#ff0000" // Pull to Refresh 아이콘 색상 변경
                    //title="Loading..." // Pull to Refresh 아이콘 아래에 표시될 텍스트
                    titleColor="#ff0000" // 텍스트 색상 변경
                    colors={['#ff0000', '#00ff00', '#0000ff']} // 로딩 아이콘 색상 변경
                    progressBackgroundColor="#ffffff" >
                  </RefreshControl>
                }
              />
            </SpaceView>
          </>
        ) : (
          <>
            <SpaceView viewStyle={{width: width, height: height}}>
              <SpaceView ml={20} viewStyle={{height:height / 2, alignItems: 'center', justifyContent:'flex-start', flexDirection: 'row'}}>
                <Text style={{fontSize: 25, fontFamily: 'Pretendard-Regular', color: '#646467'}}>
                  소개하여 드릴 <Text style={{fontSize: 30, color: '#BAFAFC', fontFamily:'Pretendard-Bold'}}>이성</Text>을{"\n"}준비중이에요!
                  {'\n'}{'\n'}
                  {data.introSecondYn == 'Y' ? (
                    <>새로운 이성을 자정에{'\n'}다시 확인해 보세요!</>
                  ) : (
                    <>새로운 이성을 오후 3시에{'\n'} 다시 확인해 보세요!</>
                  )}
                </Text>
                {/* <Image source={ICON.digitalClock} style={[styles.iconSize40, {marginTop: 25, marginLeft: 5}]} /> */}
              </SpaceView>
            </SpaceView>
          </>
        )}

      </LinearGradient>
    </>
  );
};



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}
const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
  },

});