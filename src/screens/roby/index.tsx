import { Slider } from '@miblanchard/react-native-slider';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import {  request_reexamination, peek_member, update_setting, set_member_phone_book, update_additional } from 'api/models';
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
import { findSourcePath, ICON, IMAGE } from 'utils/imageUtils';
import { usePopup } from 'Context';
import LinearGradient from 'react-native-linear-gradient';
import { Rating, AirbnbRating } from 'react-native-ratings';
import Contacts from 'react-native-contacts';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { CommaFormat } from 'utils/functions';
import { clearPrincipal } from 'redux/reducers/authReducer';
import { NoticePopup } from 'screens/commonpopup/NoticePopup';
import AuthInfoPopup from 'screens/commonpopup/AuthInfoPopup';
import AsyncStorage from '@react-native-community/async-storage';
import ProfileGrade from 'component/common/ProfileGrade';
import Modal from 'react-native-modal';
import { myProfile } from 'redux/reducers/authReducer';



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

  // 공통 팝업
  const { show } = usePopup();

  // 로딩 여부
  const [isLoading, setIsLoading] = useState(false);

  // 클릭 여부
  const [isClickable, setIsClickable] = useState(true);

  // 인증 정보 팝업
  const [isAuthInfoVisible, setAuthInfoVisible] = useState(false);

  // 인증 정보 팝업 닫기
  const authInfoPopupClose = () => {
    setAuthInfoVisible(false);
  };

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

  // Modal
  const [isVisible, setIsVisible] = useState(false);
  
  // ###### 실시간성 회원 데이터 조회
  const getPeekMemberInfo = async () => {
    const body = {
      img_acct_cnt: memberBase?.img_acct_cnt,
      auth_acct_cnt: memberBase?.auth_acct_cnt,
    };
    try {
      const { success, data } = await peek_member(body);
      if (success) {
        if (data.result_code == '0000') {
          dispatch(setPartialPrincipal({
            mbr_base : data.mbr_base
          }));
          setResLikeList(data.res_like_list);
          setMatchTrgtList(data.match_trgt_list);

          setMemberPeekData({
            accResCnt: data?.real_time_info?.acc_res_cnt,
            accResSpecailCnt: data?.real_time_info?.acc_res_specail_cnt,
            accResLiveCnt: data?.real_time_info?.acc_res_live_cnt,
            faceLankList: data?.mbr_face_rank_list,
          })

          // 공지사항 팝업 노출
          let nowDt = formatNowDate().substring(0, 8);
          let endDt = await AsyncStorage.getItem('POPUP_ENDDT_NOTICE');

          if(null == endDt || endDt < nowDt) {
            if(data.popup_bas_list?.length > 0 && isEmptyData(data.popup_bas_list[0]?.popup_detail) && data.popup_bas_list[0]?.popup_detail.length > 0) {
              setNoticeList(data.popup_bas_list[0]?.popup_detail);
              setNoticePopupVisible(true);
            }
          } else {
            setNoticePopupVisible(false);
          }

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

  // ###### 아는 사람 소개
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

    }
    // 02 : 아는 사람 제외
    else {
      let tmp_phone_book_arr: string[] = [];

      if (await grantedCheck()) {
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
        });
      } else {
        setIsFriendMatch(true);
        show({ title: '아는 사람 제외', content: '기기에서 연락처 접근이 거부된 상태입니다. \n기기의 앱 설정에서 연락처 접근 가능한 상태로 변경해주세요.'});
        insertMemberPhoneBook("", "Y");
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

  // ############################################################ 프로필 재심사 팝업 활성화
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
        content: '프로필 재심사 대기열에 등록하시겠습니까?\n패스 x30',
        cancelCallback: function() {
  
        },
        confirmCallback: function () {
          profileReexProc();
        },
      });
    }
  }

  // ############################################################ 프로필 재심사 실행
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

  // ####################################################### 팝업 관련 #######################################################

  const [profileReAprPopup, setProfileReAprPopup] = useState(false); // 프로필 재심사 팝업
  const [useReportPopup, setUseReportPopup] = useState(false); // 사용자 신고하기 팝업

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
    navigation.navigate(STACK.COMMON, {
      screen: 'Storage',
      params: {
        headerType: 'common',
        loadPage: loadPage,
      },
    });
  };

  // 최근 소식 이동
  const onPressRecent = async () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.BOARD });
  };

  // 우편함 이동
  const onPressMail = async () => {
    setIsVisible(false);
    navigation.navigate(STACK.TAB, { screen: 'Message' });
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

  const popupGradeGuideOpen = async () => {
    show({
      type: 'GUIDE',
      guideType: 'ROBY_GRADE',
      guideSlideYn: 'Y',
      guideNexBtnExpoYn: 'N',
    });
  }

  // ####################################################################################### 회원 튜토리얼 노출 정보 저장
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

  // ######################################################################################## 초기 실행 함수
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

          <View style={_styles.profileInfoContainer}>
            <View style={_styles.bestFaceContainer}>
              <Text style={_styles.bestFaceText}>#{memberBase?.best_face}</Text>
            </View>
            <Text style={_styles.profileName}>{memberBase?.nickname}</Text>
          </View>
        </SpaceView>

        <LinearGradient
          colors={['#3D4348', '#1A1E1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >

          <SpaceView ml={16} mr={16}>

            {/* ################################################################################ 최근소식, 우편함 버튼 영역 */}
            <SpaceView viewStyle={_styles.etcBtnArea}>
              <TouchableOpacity onPress={onPressRecent} style={[_styles.etcBtnItem, {marginRight: 10}]}>
                <Image source={ICON.mailGold} style={styles.iconSquareSize(14)} />
                <Text style={_styles.etcBtnText}>+{memberBase?.new_board_cnt}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onPressMail} style={_styles.etcBtnItem}>
                <Image source={ICON.bellYellow} style={styles.iconSquareSize(12)} />
                <Text style={_styles.etcBtnText}>+{memberBase?.msg_cnt}</Text>
              </TouchableOpacity>
            </SpaceView>

            {/* ################################################################################ 멤버십 영역 */}
            <SpaceView mt={75} mb={35}>
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
            <LinearGradient
              colors={['#092032', '#344756']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={_styles.respectContainer}>

              <SpaceView>
                <SpaceView pl={15} pr={15} pt={16} pb={16}  viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[_styles.respectText('#D5CD9E', 20), {marginRight: 20}]}>리스펙트 등급</Text>
                  <ProfileGrade grade={memberBase?.respect_grade} type={'BIG'} />
                </SpaceView>

                <View style={_styles.underline} />

                <View style={_styles.respectContents}>

                  <SpaceView ml={6} mr={6}>
                    <SpaceView mb={10}>
                      <Text style={[_styles.respectText('#E1DFD1', 14), {fontSize: 14}]}>등급 효과</Text>
                    </SpaceView>
                    
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View>
                        <View style={_styles.greenDot(memberBase?.respect_grade == 'SILVER')} />
                        <Text style={_styles.respectGradeText(memberBase?.respect_grade == 'SILVER')}>SILVER</Text>
                      </View>

                      <SpaceView mt={7} viewStyle={[{marginHorizontal: 7, borderColor: '#E1DFD1', borderRightWidth: 2, height: 13 }]} />

                      <View>
                        <View style={_styles.greenDot(memberBase?.respect_grade == 'GOLD')} />
                        <Text style={_styles.respectGradeText(memberBase?.respect_grade == 'GOLD')}>GOLD</Text>
                      </View>

                      <SpaceView mt={7} viewStyle={[{marginHorizontal: 7, borderColor: '#E1DFD1', borderRightWidth: 2, height: 13 }]} />

                      <View>
                      <View style={_styles.greenDot(memberBase?.respect_grade == 'VIP')} />
                        <Text style={_styles.respectGradeText(memberBase?.respect_grade == 'VIP')}>VIP</Text>
                      </View>

                      <SpaceView mt={7} viewStyle={[{marginHorizontal: 7, borderColor: '#E1DFD1', borderRightWidth: 2, height: 13 }]} />

                      <View>
                      <View style={_styles.greenDot(memberBase?.respect_grade == 'VVIP')} />
                        <Text style={_styles.respectGradeText(memberBase?.respect_grade == 'VVIP')}>VVIP</Text>
                      </View>
                    </View>
                  </SpaceView>

                  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={[_styles.respectBox]}>
                      <Image source={ICON.cardGold} style={styles.iconSquareSize(14)} />
                      <Text style={[_styles.respectText('#D5CD9E', 11), {marginLeft: 5, textAlign: 'center'}]}>
                        블라인드 카드 매일 2회 무료
                      </Text>
                    </View>
                    <View style={[_styles.respectBox]}>
                      <Image source={ICON.moneyBill} style={styles.iconSquareSize(14)} />
                      <Text style={[_styles.respectText('#D5CD9E', 11), {marginLeft: 5, textAlign: 'center'}]}>월요일마다 보너스 코인 15개</Text>
                    </View>
                  </View>
                </View>
              </SpaceView>
            </LinearGradient>

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
                    </SpaceView>
                  </View>
                </View>
              </View>

              {/* ################################################################################ 내 프로필 공개, 아는 사람 제외 영역 */}
              <View style={_styles.manageContainer}>
                <TouchableOpacity
                  style={_styles.openProfileBox}
                  onPress={() => {
                      updateMemberInfo('01', memberBase?.match_yn == 'Y' ? 'N' : 'Y');
                  }}
                >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image source={memberBase?.match_yn == 'Y' ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5}]} />
                    <Text style={_styles.manageTitle}>내 프로필 공개</Text>
                  </View>
                  <Text style={_styles.manageDesc}>이성들에게 내 프로필이 소개되고 있어요.</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={_styles.openPhoneBox}
                  onPress={() => {
                    updateMemberInfo('02', isFriendMatch ? 'N' : 'Y');
                  }}  
                >
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <SpaceView mr={5}><Image source={isFriendMatch ? ICON.checkGold : ICON.checkYellow} style={styles.iconSquareSize(16)} /></SpaceView>
                    <Text style={_styles.manageTitle}>아는 사람 제외</Text>
                  </View>
                  <Text style={_styles.manageDesc}>내 연락처에 저장된 사람이 소개되고 있어요.</Text>
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
            <View style={{alignItems: 'flex-end', marginTop: -220}}>
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
      <TouchableOpacity 
          style={_styles.profileBtn}
          onPress={onPressMangeProfile}>
        <Animated.View>
          <Text style={_styles.profileBtnText}>프로필 관리</Text>
        </Animated.View>
      </TouchableOpacity>


      <AuthInfoPopup isVisible={isAuthInfoVisible} closeModal={authInfoPopupClose} authList={mbrProfileAuthList} />
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
    justifyContent: 'center',
    marginLeft: 15,
  },
  profileName: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
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
    marginBottom: 5,
  },
  bestFaceText: {
    fontFamily: 'Pretendard-SemiBold',
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
  respectGradeText: ( isOn:boolean) => {
    return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 14,
      color: isOn ? '#32F9E4' : '#E1DFD1',
      marginTop: 5,
    };
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
  popularTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    color: '#D5CD9E',
  },
  popularDesc: {
    fontFamily: 'Pretendard-Light',
    color: '#E1DFD1',
    marginBottom: 5,
    marginLeft: 5,
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
  manageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 30,
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
    marginHorizontal: 10,
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 50,
    position: 'absolute',
    bottom: 13,
    right: 15,
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
    position: 'absolute',
    top: 15,
    right: 0,
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
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 5,
  },
  authRegiText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#D5CD9E',
    marginLeft: 3,
  },



});