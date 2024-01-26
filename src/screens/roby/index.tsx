import { Slider } from '@miblanchard/react-native-slider';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import {  request_reexamination, peek_member, update_setting, set_member_phone_book, update_additional, get_bm_product } from 'api/models';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { ROUTES, STACK } from 'constants/routes';
import { useLikeList } from 'hooks/useLikeList';
import { useMatches } from 'hooks/useMatches';
import { useUserInfo } from 'hooks/useUserInfo';
import { useProfileImg } from 'hooks/useProfileImg';
import { useSecondAth } from 'hooks/useSecondAth';
import React, { useRef, useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Platform, PermissionsAndroid, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch } from 'react-redux';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { iapConnection } from 'utils/initIAP';
import { usePopup } from 'Context';
import LinearGradient from 'react-native-linear-gradient';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Contacts from 'react-native-contacts';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { CommaFormat } from 'utils/functions';
import { clearPrincipal } from 'redux/reducers/authReducer';
import AuthInfoPopup from 'screens/commonpopup/AuthInfoPopup';
import AsyncStorage from '@react-native-community/async-storage';
import SocialGrade from 'component/common/SocialGrade';
import Modal from 'react-native-modal';
import { myProfile } from 'redux/reducers/authReducer';
import ProductModal from 'screens/shop/Component/ProductModal';
import { NoticePopup } from 'screens/commonpopup/NoticePopup';




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

  const [isAuthInfoVisible, setAuthInfoVisible] = useState(false); // 인증 정보 팝업
  const [isProductModalVisible, setIsProductModalVisible] = useState(false); // 상품 모달 visible

  // 인증 정보 팝업 닫기
  const authInfoPopupClose = () => {
    setAuthInfoVisible(false);
  };

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
    accResCnt: 0,
    accResSpecailCnt: 0,
    accResLiveCnt: 0,
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
            accResCnt: data?.real_time_info?.acc_res_cnt,
            accResSpecailCnt: data?.real_time_info?.acc_res_specail_cnt,
            accResLiveCnt: data?.real_time_info?.acc_res_live_cnt,
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
    }
  };

  // ####################################################################################################### 아는 사람 소개
  const insertMemberPhoneBook = async (phone_book_arr: string, friend_match_flag:string) => {

    const body = {
      phone_book_list: phone_book_arr,
      friend_match_yn : friend_match_flag
    };

    try {
      const { success, data } = await set_member_phone_book(body);
    
      if (success) {
        console.log('data :::::: ', data);
        if (data.result_code != '0000') {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        } else {
          setIsFriendMatch(isFriendMatch ? false : true);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsClickable(true);
      setIsLoading(false);
      show({
        type: 'RESPONSIVE',
        content: isFriendMatch ? '소개 제외 대상이 업데이트 되었습니다.' : '소개 제외 대상과 상호 미노출을 해제하였습니다.',
      });
    }
  };

  // 회원 정보 수정
  const updateMemberInfo = async (type: string, value: string) => {
    let body = {};
    /*
     * 01 : 내 프로필 공개
     * 02 : 아는 사람 제외
     * 03 : 푸시 알림 받기
     */

    // 01 : 내 프로필 공개, 03 : 푸시 알림 받기
    if (type == '01' || type == '03') {
      if(isClickable) {
        setIsClickable(false);
        setIsLoading(true);

        try {
          if(type == '01') {
            body = { match_yn: value, };
          } else if(type == '03') {
            body = { push_alarm_yn: value, };
          }
    
          const { success, data } = await update_setting(body);
          if (success) {
            dispatch(setPartialPrincipal({
              mbr_base : data.mbr_base
            }));
          }

        } catch {

        } finally {
          setIsClickable(true);
          setIsLoading(false);
        }
      }
    }
    // 02 : 아는 사람 제외
    else {
      if(isClickable) {
        let tmp_phone_book_arr: string[] = [];

        if (await grantedCheck()) {
          setIsClickable(false);
          setIsLoading(true);

          Contacts.getAll().then(contacts => {
            contacts.forEach(contact => {
              if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                console.log(contact.phoneNumbers[0].number); // 첫 번째 전화번호 가져오기
                tmp_phone_book_arr.push(contact.phoneNumbers[0].number);
              }
            });

            
            insertMemberPhoneBook(tmp_phone_book_arr.toString(), value);
          }).catch(error => {
            // 연락처 가져오기 실패
            console.log(error);
            setIsFriendMatch(true);
            insertMemberPhoneBook("", "Y");

            setIsClickable(true);
            setIsLoading(false);

          }).finally(item => {
          });
        } else {
          setIsFriendMatch(true);
          show({ title: '아는 사람 제외', content: '기기에서 연락처 접근이 거부된 상태입니다. \n기기의 앱 설정에서 연락처 접근 가능한 상태로 변경해주세요.'});
          insertMemberPhoneBook("", "Y");
        }
      }
    }
  };


  const grantedCheck = async () => {
    let grantedFlag = false;

    try {
      // IOS 위치 정보 수집 권한 요청
      if (Platform.OS === 'ios') {
        grantedFlag = true;
      }
      // AOS 위치 정보 수집 권한 요청
      else if (Platform.OS === 'android') {
        // Check if permission is granted
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          grantedFlag = true;
        }else{
          grantedFlag = false;
        }
      }

      return grantedFlag;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

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
    setIsVisible(false);
    navigation.navigate(STACK.COMMON, { screen: 'Profile' });
  };
  const onPressPreferneces = () => {
    setIsVisible(false);
    navigation.navigate(STACK.COMMON, { screen: ROUTES.PREFERENCE });
  };
  const onPressCustomerInquiry = () => {
    setIsVisible(false);
    navigation.navigate(STACK.COMMON, { screen: 'CustomerInquiry' });
  };
  const onPressTutorialSetting = () => {
    navigation.navigate(STACK.COMMON, { screen: 'TutorialSetting' });
  };

  // 나의 데일리 뷰 화면 이동
  const onPressMyDailyView = () => {
    //navigation.navigate(STACK.COMMON, { screen: 'MyDailyView' });
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
    setIsVisible(false);
    navigation.navigate(STACK.TAB, { 
      screen: 'Message' ,
      params: {
        headerType: 'common',
      }
    });
  };

  // 이용약관 이동
  const onPressTerms = async () => {
    setIsVisible(false);
    navigation.navigate(STACK.COMMON, { screen: 'Terms' });
  };

  // 개인처리취급방침 이동
  const onPressPrivacy = async () => {
    setIsVisible(false);
    navigation.navigate(STACK.COMMON, { screen: 'Privacy' });
  };

  // 프로필 인증 이동
  const onProfileAuth = async () => {
    setIsVisible(false);
    navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_AUTH });
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
            prodList: promotionPopup?.popup_detail,
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
          prodList: promotionPopupData?.popup_detail,
          //prodList: _tmpProducts,
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
    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <TopNavigation currentPath={''} theme />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>

        {/* ################################################################################ 상단 메뉴 버튼 영역 */}
        <LinearGradient
          colors={['#1A1E1C', '#333B41']}
          style={{
            width: '100%',
            height: 180,
          }}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }} >

          <TouchableOpacity 
            style={{position: 'absolute', top: 20, right: 20}}
            onPress={() => (
              setIsVisible(true)
            )}
            hitSlop={commonStyle.hipSlop20}
          >
            {[0,1,2].map((item, index) => (
              <View key={'menu' + index} style={{width: 25, height: 3, backgroundColor: '#FFDD00', marginBottom: 4, borderRadius: 20}}></View>
            ))}
          </TouchableOpacity>
        </LinearGradient>

        {/* ################################################################################ 회원 이미지, 닉네임, 인상 영역 */}
        <SpaceView mt={75} pr={16} pl={16} viewStyle={{ flexDirection: 'row', position: 'absolute', top: 0, left: 0, zIndex: 1, }}>
          <SpaceView>
            <TouchableOpacity onPress={onPressMyDailyView}>
              <View style={_styles.profileImageWrap}>
                <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={styles.profileImg} />
              </View>
              <View style={styles.profilePenContainer}>
                  <Image source={ICON.searchYellow} style={styles.iconSquareSize(36)} />
              </View>
            </TouchableOpacity>
          </SpaceView>

          <SpaceView ml={15} viewStyle={_styles.profileInfoContainer}>
            {isEmptyData(memberBase?.face_modifier) && ( 
              <View style={_styles.bestFaceContainer}>
                <Text style={_styles.bestFaceText}>#{memberBase?.face_modifier}</Text>
              </View>
            )}
            <SpaceView>
              <Text style={_styles.profileName}>{memberBase?.nickname}</Text>
            </SpaceView>
          </SpaceView>
        </SpaceView>

        <LinearGradient
          colors={['#3D4348', '#1A1E1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >

          <SpaceView ml={16} mr={16}>

            {/* ################################################################################ 최근소식, 우편함 버튼 영역 */}
            <SpaceView viewStyle={_styles.etcBtnArea}>
              <TouchableOpacity onPress={onPressRecent} style={[_styles.etcBtnItem, {marginRight: 10 }]} hitSlop={commonStyle.hipSlop20}>
                <Image source={ICON.mailGold} style={styles.iconSquareSize(15)} />
                <Text style={_styles.etcBtnText}>{memberBase?.new_board_cnt}{memberBase?.new_board_cnt > 99 && '+'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onPressMail} style={_styles.etcBtnItem} hitSlop={commonStyle.hipSlop20}>
                <Image source={ICON.bellYellow} style={styles.iconSquareSize(13)} />
                <Text style={_styles.etcBtnText}>{memberBase?.msg_cnt}{memberBase?.msg_cnt > 99 && '+'}</Text>
              </TouchableOpacity>
            </SpaceView>

            {/* ################################################################################ 멤버십 영역 */}
            <SpaceView mt={35} mb={35}>
              <Text style={_styles.mmbrshipTitle}>멤버십 레벨</Text>
              <View style={{flexDirection: 'row', alignItems: 'flex-end', marginTop: -20}}>
                <SpaceView mb={10} viewStyle={{width: '60%'}}>
                  <SpaceView viewStyle={{zIndex: 1}}>
                    <LinearGradient
                      colors={['#FFDD00', '#F3E270']}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={_styles.gradient(memberBase?.auth_acct_cnt / 45)}>
                    </LinearGradient>
                  </SpaceView>
                  <Slider
                    animateTransitions={true}
                    renderThumbComponent={() => null}
                    containerStyle={_styles.sliderContainerStyle}
                    trackStyle={_styles.sliderThumbStyle}
                    trackClickable={false}
                    disabled
                  />
                </SpaceView>
                <SpaceView ml={10}>
                  <Text style={_styles.mmbrshipCntText}><Text style={_styles.mmbrshipCnt}>{memberBase?.auth_acct_cnt}</Text>/45</Text>
                </SpaceView>
              </View>

              <SpaceView mt={1}>
                {memberBase?.auth_acct_cnt == 0 ? (
                  <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={_styles.mmbrshipDesc}>직업, 학업, 자산, SNS 인증 신청을 하면 매칭에 유리합니다.</Text>
                    <TouchableOpacity style={_styles.authRegiBtn} onPress={() => { onProfileAuth(); }}>
                      <Image source={ICON.userPen} style={styles.iconSquareSize(15)} />
                      <Text style={_styles.authRegiText}>인증 신청</Text>
                    </TouchableOpacity>
                  </SpaceView>
                ) : (
                  <>
                    <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                      <TouchableOpacity style={_styles.authRegiBtn} onPress={() => { setAuthInfoVisible(true); }}>
                        <Image source={ICON.certificate} style={styles.iconSquareSize(15)} />
                        <Text style={_styles.authRegiText}>인증 정보</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[_styles.authRegiBtn, {marginLeft: 5}]} onPress={() => { onProfileAuth(); }}>
                        <Image source={ICON.userPen} style={styles.iconSquareSize(15)} />
                        <Text style={_styles.authRegiText}>인증 신청</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </>
                )}
              </SpaceView>
            </SpaceView>

            {/* ################################################################################ 리스펙트 등급 영역 */}

            <SpaceView mb={5}>
              <Text style={[_styles.respectText('#D5CD9E', 20), {marginRight: 20}]}>리스펙트 등급</Text>
            </SpaceView>

            <LinearGradient
              colors={['#092032', '#344756']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={_styles.respectContainer}>

              <SpaceView>
                <SpaceView pl={15} pr={15} pb={7}  viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                  {/* <Text style={[_styles.respectText('#D5CD9E', 20), {marginRight: 20}]}>리스펙트 등급</Text> */}
                  <SocialGrade grade={memberBase?.respect_grade} sizeType={'BASE'} />
                </SpaceView>

                <View style={_styles.underline} />

                <View style={_styles.respectContents}>

                  <SpaceView ml={6} mr={6}>
                    <SpaceView mb={10}>
                      <Text style={[_styles.respectText('#E1DFD1', 14), {fontSize: 14}]}>등급 효과</Text>
                    </SpaceView>
                    
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <TouchableOpacity onPress={() => (setRespectType('MEMBER'))}>
                        <View style={_styles.greenDot(memberBase?.respect_grade == 'MEMBER')} />
                        <Text style={[_styles.respectGradeText(respectType == 'MEMBER' || respectType == 'UNKNOWN')]}>MEMBER</Text>
                      </TouchableOpacity>

                      <SpaceView mt={7} viewStyle={_styles.respectGradeUnderLine} />

                      <TouchableOpacity onPress={() => (setRespectType('SILVER'))}>
                        <View style={_styles.greenDot(memberBase?.respect_grade == 'SILVER')} />
                        <Text style={[_styles.respectGradeText(respectType == 'SILVER')]}>SILVER</Text>
                      </TouchableOpacity>

                      <SpaceView mt={7} viewStyle={_styles.respectGradeUnderLine} />

                      <TouchableOpacity onPress={() => (setRespectType('GOLD'))}>
                        <View style={_styles.greenDot(memberBase?.respect_grade == 'GOLD')} />
                        <Text style={[_styles.respectGradeText(respectType == 'GOLD')]}>GOLD</Text>
                      </TouchableOpacity>

                      <SpaceView mt={7} viewStyle={_styles.respectGradeUnderLine} />

                      <TouchableOpacity onPress={() => (setRespectType('PLATINUM'))}>
                        <View style={_styles.greenDot(memberBase?.respect_grade == 'PLATINUM')} />
                        <Text style={[_styles.respectGradeText(respectType == 'PLATINUM')]}>PLATINUM</Text>
                      </TouchableOpacity>

                      <SpaceView mt={7} viewStyle={_styles.respectGradeUnderLine} />

                      <TouchableOpacity onPress={() => (setRespectType('DIAMOND'))}>
                        <View style={_styles.greenDot(memberBase?.respect_grade == 'DIAMOND')} />
                        <Text style={[_styles.respectGradeText(respectType == 'DIAMOND')]}>DIAMOND</Text>
                      </TouchableOpacity>
                    </View>
                  </SpaceView>

                  {(respectType == 'MEMBER' || respectType == 'UNKNOWN') ? (
                    <SpaceView mt={20} viewStyle={{alignItems: 'center'}}>
                      <Text style={_styles.respectDescText}>
                        매일 리프에 방문하고 활동을 해보세요.{'\n'}
                        매주 월요일 리스펙트 등급이 실버 이상이 되면 보상이 제공 됩니다.
                      </Text>
                    </SpaceView>
                  ) : (
                    <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <View style={[_styles.respectBox]}>
                        <Image source={ICON.cardGold} style={styles.iconSquareSize(14)} />
                        <Text style={[_styles.respectText('#D5CD9E', 11), {marginLeft: 5, textAlign: 'center'}]}>
                          {respectType == 'SILVER' && '블라인드 카드 매일 1회 무료'}
                          {respectType == 'GOLD' && '블라인드 카드 매일 2회 무료'}
                          {respectType == 'PLATINUM' && '블라인드 카드 매일 3회 무료'}
                          {respectType == 'DIAMOND' && '블라인드 카드 매일 4회 무료'}
                        </Text>
                      </View>
                      <View style={[_styles.respectBox]}>
                        <Image source={ICON.moneyBill} style={styles.iconSquareSize(14)} />
                        <Text style={[_styles.respectText('#D5CD9E', 11), {marginLeft: 5, textAlign: 'center'}]}>
                          {respectType == 'SILVER' && '월요일마다 보너스 큐브 10개'}
                          {respectType == 'GOLD' && '월요일마다 보너스 큐브 20개'}
                          {respectType == 'PLATINUM' && '월요일마다 보너스 큐브 30개'}
                          {respectType == 'DIAMOND' && '월요일마다 보너스 큐브 50개'}
                        </Text>
                      </View>
                    </SpaceView>
                  )}
                </View>
              </SpaceView>
            </LinearGradient>

            <TouchableOpacity style={_styles.bannerArea} onPress={promotionPopupOpen} /* disabled={true} */>
              <SpaceView>
                <Text style={_styles.bannerTitle}>블라인드 카드에 원하는 친구가 안 나왔을 때는?{'\n'}프로필 카드를 열어보세요!</Text>
                <Text style={_styles.bannerDesc}>#인증레벨#MBTI#인상</Text>
                <View style={_styles.bannerTextLine} />
              </SpaceView>
              <SpaceView pt={10}>
                <Image source={ICON.cardBlack} style={styles.iconSquareSize(70)} />
              </SpaceView> 
            </TouchableOpacity>

            {/* ################################################################################ 인기 측정 영역 */}
            <SpaceView mt={20}>
              <Text style={_styles.popularTitle}>인기 측정</Text>
              <View style={_styles.popularContents}>
                <View style={_styles.popularBox}>
                  <View style={_styles.popularTopBox}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                      <Text style={_styles.popularTopTitle}>받은 관심</Text>
                      <Text style={_styles.popularTopTitle}>받은 인상</Text>
                    </View>
                    <SpaceView mt={10} pr={15} pl={15} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                      <Text style={_styles.popularTopDesc}>{resLikeList?.length}</Text>
                      <View style={{borderWidth: 1, borderColor: '#E1DFD1'}}></View>
                      <Text style={_styles.popularTopDesc}>{matchTrgtList?.length}</Text>
                    </SpaceView>
                  </View>
                  <View style={{width: '100%', padding: 16}}>
                    <View style={{padding: 5}}>
                      <Text style={[_styles.popularTitle, {fontSize: 14, marginBottom: 5}]}>받은 관심</Text>
                      <Text style={_styles.popularDesc}>지금까지 {memberPeekData?.accResCnt}명에게 관심을 받으셨어요.</Text>
                      <Text style={_styles.popularDesc}>지금까지 {memberPeekData?.accResSpecailCnt}명에게 찐심을 받으셨어요.</Text>
                    </View>
                    <SpaceView mb={15} mt={15} viewStyle={_styles.underline} />
                    <SpaceView viewStyle={{padding: 5}}>
                      <Text style={[_styles.popularTitle, {fontSize: 14, marginBottom: 5}]}>받은 인상</Text>
                      <Text style={_styles.popularDesc}>LIVE에서 {memberPeekData?.accResLiveCnt}명에게 호감을 받으셨어요.</Text>

                      <SpaceView pb={10}>

                        {/* ############## 대표인상 노출 */}
                        {memberPeekData?.faceLankList?.length > 0 && (
                          <SpaceView>
                            <SpaceView mt={20}>
                              <Text style={{fontFamily: 'Pretendard-Regular', color: '#FFDD00'}}>대표 인상 TOP3</Text>
                            </SpaceView>
                            <SpaceView mt={10} viewStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
                              {memberPeekData.faceLankList.map((item, index) => {
                                return item?.face_code_name && index < 3 && (
                                  <>
                                    <SpaceView key={'face' + index} mr={5} mb={7} viewStyle={[_styles.bestFaceContainer, {alignItems: 'center'}]}>
                                      <Text style={_styles.bestFaceText}>#{item?.face_code_name}</Text>
                                    </SpaceView>
                                  </>
                                )
                              })}
                            </SpaceView>
                          </SpaceView>
                        )}

                        <SpaceView viewStyle={_styles.flutingArea(memberBase?.reex_yn == 'Y' ? '#FFFFFF' : '#FFDD00')}>
                          {memberBase?.reex_yn == 'Y' ? (
                              <TouchableOpacity  onPress={() => onPressStorage()} activeOpacity={0.8}>
                                <Text style={_styles.flutingTitle('#D5CD9E')}>플러팅 참여중!</Text>
                                <Text style={_styles.flutingDesc('#32F9E4')}>보관함에서 {resLikeList?.length}명의 회원님들이 보낸 관심을 확인해보세요.</Text>
                              </TouchableOpacity>
                          ) : (
                              <TouchableOpacity 
                                disabled={memberBase?.reex_yn == 'Y'} 
                                onPress={() => profileReexPopupOpen()}
                                activeOpacity={0.8}
                              >
                                <Text style={_styles.flutingTitle('#3D4348')}>플러팅 참여하기</Text>
                                <Text style={_styles.flutingDesc('#5A707F')}>내 프로필이 이성들에게 노출됩니다.</Text>
                              </TouchableOpacity>
                          )}
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>
                  </View>
                </View>
              </View>

              {/* ################################################################################ 내 프로필 공개, 아는 사람 제외 영역 */}
              <View style={_styles.manageContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={_styles.openProfileBox}
                  onPress={() => {
                      updateMemberInfo('01', memberBase?.match_yn == 'Y' ? 'N' : 'Y');
                  }}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image source={memberBase?.match_yn == 'Y' ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5}]} />
                    <Text style={_styles.manageTitle}>내 프로필 공개</Text>
                  </View>
                  <Text style={_styles.manageDesc}>{memberBase?.match_yn == 'Y' ? '이성들에게 내 프로필이\n소개되고 있어요.' : '내 프로필이 비공개 상태에요.'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={1}
                  style={_styles.openPhoneBox}
                  onPress={() => {
                    updateMemberInfo('02', isFriendMatch ? 'N' : 'Y');
                  }}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <SpaceView mr={5}><Image source={isFriendMatch ? ICON.checkGold : ICON.checkYellow} style={styles.iconSquareSize(16)} /></SpaceView>
                    <Text style={_styles.manageTitle}>아는 사람 제외</Text>
                  </View>
                  <Text style={_styles.manageDesc}>{isFriendMatch ? '내 연락처에 저장된 사람이 소개되고 있어요.' : '내 연락처에 저장 된 사람들과 서로 비공개 상태에요.'}</Text>
                </TouchableOpacity>
              </View>
            </SpaceView>
          </SpaceView>
  

          {/************************************************************************** 햄버거 메뉴 모달 */}
          <Modal 
            isVisible={isVisible}
            style={{backgroundColor: 'rgba(9, 32, 50, 0.4)', margin: 0}}
            animationIn={'slideInDown'}
          >
            <View style={{alignItems: 'flex-end', marginTop: -260}}>
              <TouchableOpacity
                style={{marginRight: 20, marginBottom: 10}}
                onPress={() => {
                  setIsVisible(false);
                  //setModalAnimated(true);
                }}
              >
                <Image source={ICON.circleX} style={styles.iconSize40} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressPreferneces}>
                <Text style={_styles.modalText}>선호이성 설정</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onPressMangeAccount}>
                <Text style={_styles.modalText}>계정 관리</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={onPressMail}>
                <Text style={_styles.modalText}>알림 설정</Text>
              </TouchableOpacity> */}
              <TouchableOpacity onPress={onPressCustomerInquiry}>
                <Text style={_styles.modalText}>1:1 문의</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={terms_onOpen}> */}
              <TouchableOpacity onPress={onPressTerms}>
                <Text style={_styles.modalText}>이용약관</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={privacy_onOpen}> */}
              <TouchableOpacity onPress={onPressPrivacy}>
                <Text style={_styles.modalText}>개인정보취급방침 안내</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </LinearGradient>
        
      </ScrollView>

      {/********************************************************** 프로필 관리 버튼 */}
      <TouchableOpacity style={_styles.profileBtn} onPress={onPressMangeProfile}>
        <Animated.View>
          <Text style={_styles.profileBtnText}>프로필 관리</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* 인증 정보 팝업 */}
      <AuthInfoPopup isVisible={isAuthInfoVisible} closeModal={authInfoPopupClose} authList={mbrProfileAuthList} />

      {/* 상품 상세 팝업 */}
      <ProductModal
        isVisible={isProductModalVisible}
        type={'bm'}
        item={productTargetItem}
        closeModal={closeProductDetail}
      />

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
  profileImageWrap: {
    width: 140,
    height: 140,
    borderWidth: 7,
    borderColor: '#FFDD00',
    borderRadius: 80,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  profileInfoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#FFDD00',
  },
  bestFaceContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#1A1E1C',
    borderRadius: 20,
    marginBottom: 3,
  },
  bestFaceText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#D5CD9E',
  },
  mmbrshipTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#D5CD9E',
  },
  mmbrshipCntText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 24,
    color: '#D5CD9E',
    marginLeft: 10,
    marginTop: 1,
  },
  mmbrshipCnt: {
    fontSize: 42,
    fontFamily: 'Pretendard-Bold',
    color:'#FFDD00',
  },
  mmbrshipDesc: {
    fontFamily: 'Pretendard-Light',
    fontSize: 11,
    color: '#E1DFD1',
  },
  gradient: (value:any) => {
    let percent = 0;

    if(value != null && typeof value != 'undefined') {
      percent = value * 100;
    };

    return {
      position: 'absolute',
      width: percent + '%',
      height: 12,
      zIndex: 1,
      borderRadius: 50,
    };
  },
  sliderContainerStyle: {
    height: 12,
    borderRadius: 50,
    backgroundColor: '#FFF',
  },
  sliderThumbStyle: {
    height: 12,
    borderRadius: 50,
    backgroundColor: '#5E5E5E',
  },
  noticeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3E270',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Light',
    color: '#F3E270',
    marginLeft: 5,
  },
  respectContainer: {
    borderRadius: 10,
    paddingVertical: 10,
  },
  respectText: (cr:string,_fs:number) => {
    return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: _fs,
      color: cr,
    };
  },
  respectGradeText: ( isOn:boolean ) => {
    return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 12,
      color: isOn ? '#32F9E4' : '#E1DFD1',
      marginTop: 5,
    };
  },
  respectGradeUnderLine: {
    marginHorizontal: 7,
    borderColor: '#E1DFD1',
    borderRightWidth: 1,
    height: 10,
  },
  underline: {
    borderTopWidth: 1,
    borderColor: '#E1DFD1',
    opacity: 0.45,
  },
  respectContents: {
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  respectBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#D5CD9E',
    borderWidth: 1,
    width: '49%',
    height: 38,
    borderRadius: 7,
    marginTop: 20,
  },
  respectDescText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#D5CD9E',
    textAlign: 'center',
    lineHeight: 20,
  },
  greenDot: ( isOn:boolean) => {
    return {
      position: 'absolute',
      top: 0,
      left: -5,
      width: 7,
      height: 7,
      borderRadius: 50,
      backgroundColor: '#32F9E4',
      display: isOn ? 'flex' : 'none',
    };
  },
  bannerArea: {
    backgroundColor: '#E1DFD1',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  bannerTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#262626',
  },
  bannerDesc: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#8E8E8E',
    marginTop: 5,
  },
  bannerTextLine: {
    position: 'absolute',
    top: 25,
    height: 10,
    backgroundColor: '#FFDD00',
    width: width - 245,
    zIndex: -1,
  },
  popularTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    color: '#D5CD9E',
  },
  popularDesc: {
    fontFamily: 'Pretendard-Light',
    color: '#E1DFD1',
    marginBottom: 5,
    //marginLeft: 5,
  },
  popularContents: {
    marginTop: 70,
  },
  popularBox: {
    width: '100%',
    backgroundColor: '#445561',
    borderRadius: 30,
    alignItems: 'center',
  },
  popularTopBox: {
    width: '80%',
    height: 100,
    backgroundColor: '#3A4044',
    borderRadius: 50,
    marginTop: -45,
    paddingHorizontal: 60,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularTopTitle: {
    fontFamily: 'Pretendard-Light',
    color: '#D5CD9E',
  },
  popularTopDesc: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
    color: '#FFDD00',
  },
  flutingArea: (bgcr:string) => {
    return {
      marginTop: 20,
      marginBottom: -10,
      backgroundColor: bgcr,
      borderRadius: 10,
      paddingVertical: 10,
    };
  },
  flutingTitle: (cr:string) => {
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: 14,
      color: '#3D4348',
      textAlign: 'center',
    };
  },
  flutingDesc: (cr:string) => {
    return {
      fontFamily: 'Pretendard-Regular',
      fontSize: 10,
      color: cr,
      textAlign: 'center',
    };
  },
  manageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 30,
    marginBottom: 100,
  },
  manageTitle: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#D5CD9E',
  },
  manageDesc: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#E1DFD1',
    marginTop: 15,
    marginHorizontal: 0,
  },
  openProfileBox: {
    width: '47%',
    height: 100,
    borderWidth: 1,
    borderColor: '#D5CD9E',
    borderRadius: 15,
    padding: 10,
  },
  openPhoneBox: {
    width: '47%',
    height: 100,
    borderWidth: 1,
    borderColor: '#D5CD9E',
    borderRadius: 15,
    padding: 10,
  },
  profileBtn: {
    backgroundColor: '#FFDD00',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
    position: 'absolute',
    bottom: 13,
    right: 10,
  },
  profileBtnText: {
    fontFamily: 'Pretendard-Bold',
    color: '#3D4348',
  },
  modalText: {
    color: '#FFF',
    marginVertical: 15,
    marginRight: 20,
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
  },
  etcBtnArea: {
    marginLeft: 'auto',
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  etcBtnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderRadius: 10,
    width: 60,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  etcBtnText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#F3E270',
  },
  authRegiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  authRegiText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#D5CD9E',
    marginLeft: 3,
  },
});