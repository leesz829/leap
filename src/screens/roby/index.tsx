import { Slider } from '@miblanchard/react-native-slider';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import {  request_reexamination, peek_member, update_setting, set_member_phone_book, update_additional, social_reward_pass_add } from 'api/models';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { ROUTES, STACK } from 'constants/routes';
import { useLikeList } from 'hooks/useLikeList';
import { useMatches } from 'hooks/useMatches';
import { useUserInfo } from 'hooks/useUserInfo';
import { useProfileImg } from 'hooks/useProfileImg';
import { useSecondAth } from 'hooks/useSecondAth';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Platform, PermissionsAndroid, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch } from 'react-redux';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { iapConnection } from 'utils/initIAP';
import { usePopup } from 'Context';
import LinearGradient from 'react-native-linear-gradient';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { CommaFormat } from 'utils/functions';
import { clearPrincipal } from 'redux/reducers/authReducer';
import AsyncStorage from '@react-native-community/async-storage';
import SocialGrade from 'component/common/SocialGrade';
import Modal from 'react-native-modal';
import { myProfile } from 'redux/reducers/authReducer';
import ProductModal from 'screens/shop/Component/ProductModal';
import { NoticePopup } from 'screens/commonpopup/NoticePopup';
import Active from 'component/roby/Active';
import Story from 'component/roby/Story';



/* ################################################################################################################
###### 로비
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<BottomParamList, 'Roby'>;
  route: RouteProp<BottomParamList, 'Roby'>;
}

const { width, height } = Dimensions.get('window');

export const Roby = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const [currentTab, setCurrentTab] = useState('ACTIVE');



  const [isProductModalVisible, setIsProductModalVisible] = useState(false); // 상품 모달 visible

  // 프로모션 팝업
  const [promotionPopupData, setPromotionPopupData] = useState({});

  // 공지사항 팝업
  const [noticePopupVisible, setNoticePopupVisible] = useState(false);
  const [noticeList, setNoticeList] = useState([]);

  // 회원 기본 정보
  const memberBase = useUserInfo(); //hooksMember.getBase();
  const mbrProfileImgList = useProfileImg();
  const mbrProfileAuthList = useSecondAth();
  const likes = useLikeList();
  const matches = useMatches();
  
  // 회원 실시간성 데이터
  const [memberPeekData, setMemberPeekData] = useState({
    /* accResCnt: 0,
    accResSpecailCnt: 0,
    accResLiveCnt: 0, */
    realTimeData: {},
    faceLankList: [],
  });

  const [resLikeList, setResLikeList] = useState([]);
  const [matchTrgtList, setMatchTrgtList] = useState([]);
  const [reassessment, setReassessment] = useState(false);
  const [isFriendMatch, setIsFriendMatch] = useState(true); // 아는사람 노출 여부

  const [modalAnimated, setModalAnimated] = useState(false);

  const [respectType, setRespectType] = React.useState(memberBase?.respect_grade); // repsect 등급 타입

  // Modal
  const [isVisible, setIsVisible] = useState(false);

  const [productTargetItem, setProductTargetItem] = useState({});
  
  // ####################################################################################################### 실시간성 회원 데이터 조회
  const getPeekMemberInfo = async () => {
    setIsLoading(true);

    const body = {
      img_acct_cnt: memberBase?.img_acct_cnt,
      auth_acct_cnt: memberBase?.auth_acct_cnt,
    };
    try {
      const { success, data } = await peek_member(body);
      if (success) {
        if (data.result_code == '0000') {
          const auth_list = data?.mbr_second_auth_list.filter(item => item.auth_status == 'ACCEPT');
          dispatch(setPartialPrincipal({
            mbr_base : data.mbr_base,
            mbr_second_auth_list: auth_list,
          }));
          setResLikeList(data.res_like_list);
          setMatchTrgtList(data.match_trgt_list);

          setMemberPeekData({
            realTimeData: data?.real_time_info,
            faceLankList: data?.mbr_face_rank_list,
          });

          let popupList = data?.popup_bas_list;
          popupProc(popupList);

        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  


  

  // ####################################################################################################### 프로필 재심사 팝업 활성화
  const profileReexPopupOpen = async () => {
    if(memberBase?.pass_has_amt < 30) {
      show({
        title: '재화 부족',
        content: '보유 재화가 부족합니다.',
        confirmCallback: function () {},
      });
    } else {
      show({
        title: '프로필 재심사',
        content: '큐브 30개로 프로필 재심사 대기열에 등록하시겠습니까?',
        passAmt: 30,
        cancelCallback: function() {
  
        },
        confirmCallback: function () {
          profileReexProc();
        },
      });
    }
  }

  // ####################################################################################################### 프로필 재심사 실행
  const profileReexProc = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {
        const { success, data } = await request_reexamination();
        if (success) {
          dispatch(setPartialPrincipal({ mbr_base : data.mbr_base }));

          show({
            type: 'RESPONSIVE',
            content: '프로필 재심사가 시작되었습니다.',
          });
  
        } else {
          show({ content: '일시적인 오류가 발생했습니다.' });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoading(false);
      }
    }

  };

  /* #################################################################################################################################
  ##### 팝업 관련
  ################################################################################################################################# */

  // 내 선호 이성 Pop
  const ideal_modalizeRef = useRef<Modalize>(null);
  const ideal_onOpen = () => {
    ideal_modalizeRef.current?.open();
  };
  const ideal_onClose = () => {
    ideal_modalizeRef.current?.close();
  };

  const onPressEditProfile = () => {
    navigation.navigate(STACK.COMMON, { screen: 'Introduce' });
  };
  const onPressMangeProfile = () => {
    navigation.navigate(STACK.COMMON, { screen: 'Profile1' });
  };
  const onPressMangeAccount = () => {
    navigation.navigate(STACK.COMMON, { screen: 'Profile' });
  };
  const onPressPreferneces = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.PREFERENCE });
  };
  const onPressCustomerInquiry = () => {
    navigation.navigate(STACK.COMMON, { screen: 'CustomerInquiry' });
  };
  const onPressTutorialSetting = () => {
    navigation.navigate(STACK.COMMON, { screen: 'TutorialSetting' });
  };
  const onPressAlarmSetting = () => {
    navigation.navigate(STACK.COMMON, { screen: 'AlarmSetting' });
  };

  const onPressAlarmMessage = () => {
    navigation.navigate(STACK.COMMON, { screen: 'Message' });
  };

  // 나의 데일리 뷰 화면 이동
  const onPressMyDailyView = () => {
    navigation.navigate(STACK.COMMON, { 
      screen: ROUTES.MatchDetail,
      params: {
        type: 'ME',
      }
    });
  };

  // 보관함 이동
  const onPressStorage = async (loadPage:any) => {
    navigation.navigate(STACK.TAB, {
      screen: 'Storage',
    });
  };

  // 최근 소식 이동
  const onPressRecent = async () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.BOARD });
  };

  // 우편함 이동
  const onPressMail = async () => {
    navigation.navigate(STACK.TAB, { 
      screen: 'Message' ,
      params: {
        headerType: 'common',
      }
    });
  };

  // 이용약관 이동
  const onPressTerms = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'Terms' });
  };

  // 개인처리취급방침 이동
  const onPressPrivacy = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'Privacy' });
  };

  // 프로필 인증 이동
  const onProfileAuth = async () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_AUTH });
  };

  // 스토리 이동
  const onPressStory = async () => {
    navigation.navigate(STACK.TAB, { screen: 'Story' });
  };

  // 가이드 팝업 활성화
  const popupProfileGuideOpen = async () => {
    show({
      type: 'GUIDE',
      guideType: 'ROBY_PROFILE',
      guideSlideYn: 'Y',
      guideNexBtnExpoYn: 'N',
    });
  };

  // ####################################################################################################### 팝업 실행
  const popupProc = async (_popupList:any) => {

    let noticePopup:any;
    let promotionPopup;

    _popupList.map((item, index) => {
      if(item.type == 'NOTICE') {
        noticePopup = item;
      } else if(item.type == 'PROMOTION') {
        //promotionPopup = item;
        setPromotionPopupData(item);
      }
    });

    if(promotionPopup) {
      if(isEmptyData(promotionPopup?.popup_detail) && promotionPopup?.popup_detail.length > 0) {
        let endDt = await AsyncStorage.getItem('POPUP_ENDDT_PROMOTION_HOME');
        let nowDt = formatNowDate().substring(0, 8);

        if(null == endDt || endDt < nowDt) {
          show({
            type: 'PROMOTION',
            dataList: promotionPopup?.popup_detail,
            confirmCallback: async function(isNextChk) {
              if(isNextChk) {
                // 팝업 종료 일시 Storage 저장
                await AsyncStorage.setItem('POPUP_ENDDT_PROMOTION_HOME', nowDt);
                //isPopup = false;                
              }
              if(noticePopup) {
                noticePopupOpen(noticePopup?.popup_detail);
              }
            },
            etcCallback: async function(item) {
              setProductTargetItem(item);
              setIsProductModalVisible(true);
            },
          });
        };
      };
    } else {
      if(noticePopup) {
        noticePopupOpen(noticePopup?.popup_detail);
      }
    }
  };

  // ####################################################################################################### 프로모션 팝업 호출
  const promotionPopupOpen = async () => {
    if(isEmptyData(promotionPopupData?.popup_detail) && promotionPopupData?.popup_detail.length > 0) {
      let endDt = await AsyncStorage.getItem('POPUP_ENDDT_PROMOTION_HOME');
      let nowDt = formatNowDate().substring(0, 8);
      
      /* if(null == endDt || endDt < nowDt) { */
        //console.log('promotionPopupData ::::::: ' , promotionPopupData);

        // let _tmpProducts = [];
        // let _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 4000
        // , "item_name": "큐브 80", "item_code": "prod_cube_common_80", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        // _tmpProducts.push(_tmpProduct);
        // _tmpProduct = {"buy_count_max": 999999, "discount_rate": 0, "item_type_code": "PASS", "money_type_code": "INAPP", "shop_buy_price": 7500
        // , "item_name": "큐브 150", "item_code": "prod_cube_common_150", "item_contents": "이성에게 관심을 보내거나 내게 온 관심을 확인하는데 사용합니다."};
        // _tmpProducts.push(_tmpProduct);

        show({
          type: 'PROMOTION',
          dataList: promotionPopupData?.popup_detail,
          //dataList: _tmpProducts,
          confirmCallback: async function(isNextChk) {
            if(isNextChk) {
              // 팝업 종료 일시 Storage 저장
              //await AsyncStorage.setItem('POPUP_ENDDT_PROMOTION_HOME', nowDt);
              //isPopup = false;                
            }
          },
          etcCallback: async function(item) {
            setProductTargetItem(item);
            setIsProductModalVisible(true);
          },
        });
      /* }; */
    };
  };

  // ####################################################################################################### 공지사항 팝업 호출
  const noticePopupOpen = async (popupDetail:any) => {
    let nowDt = formatNowDate().substring(0, 8);
    let endDt = await AsyncStorage.getItem('POPUP_ENDDT_NOTICE');
    if(null == endDt || endDt < nowDt) {
      if(isEmptyData(popupDetail) && popupDetail.length > 0) {
        setNoticeList(popupDetail);
        setNoticePopupVisible(true);
      }
    } else {
      setNoticePopupVisible(false);
    }
  };

  // ####################################################################################################### 회원 튜토리얼 노출 정보 저장
  const saveMemberTutorialInfo = async () => {
    const body = {
      tutorial_roby_yn: 'N'
    };
    const { success, data } = await update_additional(body);
    if(success) {
      if(isEmptyData(data.mbr_base)) {
        dispatch(setPartialPrincipal({
          mbr_base : data.mbr_base
        }));
      }
    }
  };

  // ####################################################################################################### 상품상세 팝업 닫기
  const closeProductDetail = (isPayConfirm: boolean) => {
    setIsProductModalVisible(false);
  };

  // ####################################################################################################### 회원 튜토리얼 노출 정보 저장
  const procGradeRewardPass = useCallback(async (type:string) => {
    const body = {
      pointCode: type
    };
    const { success, data } = await social_reward_pass_add(body);
    if(success) {
      if(isEmptyData(data.mbr_base)) {
        dispatch(setPartialPrincipal({
          mbr_base : data.mbr_base
        }));
      };
      setMemberPeekData({
        ...memberPeekData,
        realTimeData: data?.real_time_info,
      });
    }
  }, []);

  // ####################################################################################################### 초기 실행 함수
  useEffect(() => {
    if(isFocus) {
      if(memberBase?.status == 'BLOCK') {
        show({
          title: '서비스 이용 제한 알림',
          content: '서비스 운영정책 위반으로 회원님의 계정상태가\n이용제한 상태로 전환되었습니다.\n문의사항 : cs@limeeted.com',
          confirmCallback: function() {
            dispatch(clearPrincipal());
          }
        });
      } else {
        getPeekMemberInfo();
        setIsFriendMatch(memberBase?.friend_match_yn == 'N' ? false : true);
        setRespectType(memberBase?.respect_grade);
        // 튜토리얼 팝업 노출
        /* if(!isEmptyData(memberBase?.tutorial_roby_yn) || memberBase?.tutorial_roby_yn == 'Y') {
          show({
            type: 'GUIDE',
            guideType: 'ROBY',
            guideSlideYn: 'Y',
            guideNexBtnExpoYn: 'Y',
            confirmCallback: function(isNextChk) {
              if(isNextChk) {
                saveMemberTutorialInfo();
              }
            }
          });
        }; */
      }

      // IAP 연결
      iapConnection();
    } else {
      setIsVisible(false);
    }
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      {/* <TopNavigation currentPath={''} theme /> */}

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: '#16112A' }}>

        <LinearGradient
          colors={['#706fc6', '#706fc6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }} >

          {/* ################################################################################
          ###### 상단 배경 영역 
          ################################################################################ */}
          <SpaceView viewStyle={_styles.topBgWrap}>
            <Image source={ICON.myhomeTopBg} style={{width: width, height: width/1.2}} resizeMode={'cover'} />
          </SpaceView>

          {/* ################################################################################
          ###### 컨텐츠 영역
          ################################################################################ */}

          <SpaceView viewStyle={_styles.contentWrap}>

            {/* ################################################################################ 상단 영역 */}
            <SpaceView>

              {/* 메뉴, 알림 영역 */}
              <SpaceView mt={35} ml={13} mr={13} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <TouchableOpacity 
                  onPress={() => ( onPressAlarmMessage() )}>
                  <Image source={ICON.alarm} style={styles.iconSquareSize(35)} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => ( setIsVisible(true) )}
                  hitSlop={commonStyle.hipSlop20}>
                  <Image source={ICON.menu} style={styles.iconSquareSize(35)} />
                </TouchableOpacity>
              </SpaceView>

              {/* 닉네임, 대표 사진 영역 */}
              <SpaceView mt={30} viewStyle={{alignItems: 'center'}}>
                <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                  <SocialGrade grade={memberBase?.respect_grade} sizeType={'SMALL'} />
                  {isEmptyData(memberBase?.face_modifier) && ( 
                    <SpaceView ml={8} viewStyle={_styles.bestFaceContainer}>
                      <Text style={styles.fontStyle('SB', 9, '#fff')}>#{memberBase?.face_modifier}</Text>
                    </SpaceView>
                  )}
                </SpaceView>
                <SpaceView mt={8} mb={20}>
                  <Text style={styles.fontStyle('H', 30, '#fff')}>{memberBase?.nickname}</Text>
                </SpaceView>
                <TouchableOpacity 
                  style={_styles.mstProfileImgArea}
                  onPress={() => (onPressMangeProfile())}>
                  <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.mstProfileImgStyle} />

                  <SpaceView viewStyle={_styles.profileEditBtnWrap}>
                    <Image source={ICON.editBtn} style={styles.iconSquareSize(28)} />
                  </SpaceView>
                </TouchableOpacity>
              </SpaceView>

              {/* 탭 영역 */}
              <SpaceView ml={10} mr={10} mt={45}>
                <SpaceView>
                  <Text style={styles.fontStyle('H', 36, '#fff')}>마이홈</Text>
                </SpaceView>

                {/* <SpaceView mt={20} viewStyle={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    style={{marginRight: 10}}
                    onPress={() => (setCurrentTab('ACTIVE'))}>
                    <Text style={_styles.tabText(currentTab == 'ACTIVE')}>리프활동</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => (setCurrentTab('STORY'))}>
                    <Text style={_styles.tabText(currentTab == 'STORY')}>스토리</Text>
                  </TouchableOpacity>
                </SpaceView> */}

              </SpaceView>
            </SpaceView>

          </SpaceView>

        </LinearGradient>

        {/* ################################################################################ 리프활동, 스토리 내용 영역 */}
        <SpaceView>
          {currentTab == 'ACTIVE' && 
            <Active 
              memberBase={memberBase} 
              authList={mbrProfileAuthList} 
              realTimeData={memberPeekData.realTimeData}
              fnRewardPass={procGradeRewardPass} />}
          {currentTab == 'STORY' && <Story memberBase={memberBase} />}
        </SpaceView>

        {/* ################################################################################ 메뉴 모달 영역 */}
        <Modal 
          isVisible={isVisible}
          style={{backgroundColor: 'rgba(9, 32, 50, 0.6)', margin: 0}}
          animationIn={'slideInDown'}
        >
          <SpaceView pr={10} viewStyle={{alignItems: 'flex-end', marginTop: -140}}>
            <TouchableOpacity
              style={{marginBottom: 50}}
              onPress={() => {
                setIsVisible(false);
                //setModalAnimated(true);
              }}
            >
              <Image source={ICON.closeBtn} style={styles.iconSquareSize(40)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressPreferneces} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>선호이성 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressMangeAccount} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>계정 관리</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressAlarmSetting} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>리프 설정</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressCustomerInquiry} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>1:1 문의</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressTerms} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>이용약관</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressPrivacy} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>개인정보취급방침 안내</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressRecent} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>새소식</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={onPressMangeProfile} style={_styles.menuItemWrap}>
              <Text style={styles.fontStyle('EB', 26, '#fff')}>프로필관리</Text>
            </TouchableOpacity> */}
          </SpaceView>
        </Modal>
        
      </ScrollView>

      {/********************************************************** 프로필 관리 버튼 */}
      {/* <TouchableOpacity style={_styles.profileBtn} onPress={onPressMangeProfile}>
        <Animated.View>
          <Text style={_styles.profileBtnText}>프로필 관리</Text>
        </Animated.View>
      </TouchableOpacity> */}

      {/* 상품 상세 팝업 */}
      {/* <ProductModal
        isVisible={isProductModalVisible}
        type={'bm'}
        item={productTargetItem}
        closeModal={closeProductDetail}
        isUse={true}
      /> */}

      {/* 공지사항 팝업 */}
      {/* {noticePopupVisible && (
        <NoticePopup
          popupVisible={noticePopupVisible}
          setPopupVIsible={setNoticePopupVisible}
          noticeList={noticeList}
          //etcCallbackFunc={contents.etcCallback}
        />
      )} */}
    </>
  );
};



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}
const _styles = StyleSheet.create({
  bestFaceContainer: {
    height: 20,
    paddingHorizontal: 6,
    backgroundColor: '#40E0D0',
    borderRadius: Platform.OS == 'ios' ? 8 : 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  topBgWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  contentWrap: {
    
  },
  mstProfileImgArea: {
    borderRadius: 15,
    /* borderWidth: 1,
    borderColor: '#fff', */
    shadowColor: '#fff',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.83,
    shadowRadius: 5.0,
    elevation: 40,
    overflow: 'visible',
  },
  mstProfileImgStyle: {
    width: 130,
    height: 130,
    borderRadius: 15,
  },
  tabText: (isOn:boolean) => {
    return {
      fontFamily: 'SUITE-ExtraBold',
      fontSize: 25,
      color: isOn ? '#46F66F' : '#A6B8CF',
      borderBottomColor: '#46F66F',
      borderBottomWidth: isOn ? 2 : 0,
      paddingBottom: 3,
    };
  },
  menuItemWrap: {
    marginBottom: 30,
  },
  profileEditBtnWrap: {
    position: 'absolute',
    bottom: 3,
    right: 3,
  },



});