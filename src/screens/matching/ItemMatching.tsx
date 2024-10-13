import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList, ColorType, ScreenNavigationProp } from '@types';
import { get_item_matched_info, regist_match_status, report_matched_user, report_check_user, report_check_user_confirm } from 'api/models';
import CommonHeader from 'component/CommonHeader';
import { CommonBtn } from 'component/CommonBtn';
import { RadioCheckBox_3 } from 'component/RadioCheckBox_3';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch } from 'react-redux'; 
import { myProfile } from 'redux/reducers/authReducer';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import ProfileAuth from 'component/ProfileAuth';
import { formatNowDate, isEmptyData} from 'utils/functions';
import InterviewRender from 'component/match/InterviewRender';
import InterestRender from 'component/match/InterestRender';
import InterestSendPopup from 'screens/commonpopup/match/InterestSendPopup';
import SincereSendPopup from 'screens/commonpopup/match/SincereSendPopup';
import MemberIntro from 'component/match/MemberIntro';
import LinearGradient from 'react-native-linear-gradient';
import ReportPopup from 'screens/commonpopup/ReportPopup';
import MemberMark from 'component/common/MemberMark';
import Tendency from 'component/match/Tendency';



const { width, height } = Dimensions.get('window');
interface Props {
  navigation: StackNavigationProp<StackParamList, 'ItemMatching'>;
  route: RouteProp<StackParamList, 'ItemMatching'>;
}

export default function ItemMatching(props: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const { show } = usePopup(); // 공통 팝업

  const [type, setType] = useState(props.route.params.type);
  const [matchSeq, setMatchSeq] = useState(props.route.params.matchSeq);
  const [memberSeqList, setMemberSeqList] = useState<[]>(props.route.params.memberSeqList);

  // 로딩 상태 체크
  const [isLoad, setIsLoad] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const [isOnShrink, setIsOnShrink] = React.useState(false); // 쉬링크 상태 변수

  const [isModHeader, setIsModHeader] = useState(false); // 헤더 변경 여부 구분

  const [isCardIndex, setIsCardIndex] = useState(0);

  // 본인 데이터
  const memberBase = useUserInfo();

  // 매칭 회원 관련 데이터
  const [data, setData] = useState<any>({
    match_member_info: {},
    profile_img_list: [],
    second_auth_list: [],
    interview_list: [],
    interest_list: [],
    report_code_list: [],
    safe_royal_pass: Number,
    use_item: {},
  });

  // 신고목록
  const [reportTypeList, setReportTypeList] = useState([
    { text: '', value: '' },
  ]);

  // 선택된 신고하기 타입
  const [checkReportType, setCheckReportType] = useState('');

  // 신고 Pop
  const report_modalizeRef = useRef<Modalize>(null);
  
  // 신고하기 팝업 활성화
  const report_onOpen = () => {
    report_modalizeRef.current?.openModal(data?.report_code_list);
    setCheckReportType('');
  };

  // 신고하기 팝업 닫기
  const report_onClose = () => {
    report_modalizeRef.current?.closeModal();
    setCheckReportType('');
  };

  // ################################################################ 관심 및 찐심 보내기 관련
  const [message, setMessage] = useState('');

  const [interestSendModalVisible, setInterestSendModalVisible] = useState(false); // 관심 보내기 모달 visible
  const [sincereSendModalVisible, setSincereSendModalVisible] = useState(false); // 찐심 보내기 모달 visible

  // 관심 보내기 모달 닫기
  const interestSendCloseModal = () => {
    setInterestSendModalVisible(false);
  };

  // 관심 보내기
  const interestSend = (message:string) => {
    insertMatchInfo('interest', 0, message);
    setInterestSendModalVisible(false);
    setMessage('');
  };

  // 찐심 보내기 모달 닫기
  const sincereSendCloseModal = () => {
    setSincereSendModalVisible(false);
  };

  // 찐심 보내기
  const sincereSend = (level:number, message:string) => {
    insertMatchInfo('sincere', level, message);
    setSincereSendModalVisible(false);
    setMessage('');
  };



  // ############################################################ 데일리 매칭 정보 조회
  const getItemMatchedInfo = async () => {
    try {
    
      /* if(profile_member_seq_list.split(',').length <= isCardIndex){
        navigation.navigate(STACK.COMMON, { screen: ROUTES.SHOP_INVENTORY });
      }

      const body = {
        match_member_seq: profile_member_seq_list.split(',')[isCardIndex].toString()
      } */

      if(type != 'DAILY_REPLAY') {
        if(memberSeqList.length <= isCardIndex){
          //navigation.navigate(STACK.COMMON, { screen: ROUTES.SHOP_INVENTORY });
          navigation.goBack();
        }
      }

      const body = {
        match_member_seq: memberSeqList[isCardIndex]
      }

      const { success, data } = await get_item_matched_info(body);
      setIsCardIndex(isCardIndex + 1);
      
      if (success) {
        if (data.result_code == '0000') {
          //setData(data);

          const auth_list = data?.second_auth_list.filter(item => item.auth_status == 'ACCEPT');
          setData({
            match_member_info: data?.match_member_info,
            profile_img_list: data?.profile_img_list,
            second_auth_list: auth_list,
            interview_list: data?.interview_list,
            interest_list: data?.interest_list,
            report_code_list: data?.report_code_list,
            safe_royal_pass: data?.safe_royal_pass,
            use_item: data?.use_item,
          });

          if(data?.match_member_info == null || data?.profile_img_list?.length == 0) {
            setIsLoad(false);
            setIsEmpty(true);
          } else {
            setIsLoad(true);
          }          
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

  /* #############################################
  ##### 거부/찐심/관심 팝업 함수
  ##### - activeType : pass(거부), sincere(찐심), interest(관심)
  ############################################# */
  const popupActive = (activeType: string) => {
    if (activeType == 'interest') {
      show({
        title: '관심있어요',
        type: 'MATCH',
        content: data?.match_member_info?.nickname + '님에게\n관심을 보냅니다.',
        passType: 'CUBE',
        passAmt: '30',
        isNoPass: memberBase?.pass_has_amt < 30 ? false : true,
        btnIcon: ICON.sendIcon,
        confirmBtnText: '관심보내기',
        memberImg: findSourcePath(data?.profile_img_list[0]?.img_file_path),
        confirmCallback: function() {
          insertMatchInfo('interest', 0, '');
        },
        cancelCallback: function() {
        },
      });

    } else if (activeType == 'sincere') {
      setSincereSendModalVisible(true);

    } else if (activeType == 'pass') {
      show({
        title: '매칭 취소',
        content: '매칭을 취소 하시겠습니까?' ,
        cancelCallback: function() {

        },
        confirmCallback: function() {
          insertMatchInfo(activeType, 0, '');
        }
      });
    
    } else if(activeType == 'zzim') {

      // 찜하기 사용시
      if(typeof data.use_item != 'undefined' && typeof data.use_item.WISH != 'undefined') {
        let endDt = data?.use_item?.WISH?.end_dt;
        if(endDt < formatNowDate()) {
          show({
            title: '찜하기 이용권 만료',
            content: '찜하기 이용권 아이템의 구독기간이 만료된 상태입니다.',
          });
        } else {
          insertMatchInfo(activeType, 0, '');
        }
      }
    }
  };

  // ############################################################ 찐심/관심/거부 저장
  const insertMatchInfo = async (activeType: string, special_level: number, message: string) => {
    let body = {
      active_type: activeType,
      res_member_seq: data.match_member_info.member_seq,
      special_level: special_level,
      message: message,
    };

    if(type == 'DAILY_REPLAY' || type == 'PROFILE_CARD_ADD') {
      body.match_seq = matchSeq;
    }

    try {
      const { success, data } = await regist_match_status(body);

      if(success) {
        if(data.result_code == '0000') {
          dispatch(myProfile());
          setIsLoad(false);

          if(type == 'DAILY_REPLAY' || type == 'PROFILE_CARD_ADD') {
            navigation.goBack();
          } else {
            getItemMatchedInfo();
          }

          if(activeType == 'interest' || activeType == 'sincere') {
            show({
              type: 'RESPONSIVE',
              content: '프로필을 보관함에 담아드렸어요.',
              isCross: true,
            });
          };
          
        } else if (data.result_code == '6010') {
          show({ content: '보유 패스가 부족합니다.', isCross: true });
          return false;
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  // ############################################################ 사용자 신고하기 - 신고사유 체크 Callback 함수
  const reportCheckCallbackFn = (value: string) => {
    setCheckReportType(value);
  };

  // ############################################################ 사용자 신고하기 - 팝업 활성화
  const popupReport = () => {
    if (!checkReportType) {
      show({ content: '신고항목을 선택해주세요.' });
      return false;
    } else {
      insertReport();
    }
  };

  // ############################################################ 사용자 신고하기 등록
  const insertReport = async () => {
    
    const body = {
      report_type_code: checkReportType,
      report_member_seq: data.match_member_info.member_seq,
    };
    
    try {
      const { success, data } = await report_matched_user(body);

      if(success) {
        if (data.result_code != '0000') {
          console.log(data.result_msg);
          return false;
        }

        show({ 
          content: '신고 처리 되었습니다.',
          confirmCallback : function() {
            navigation.goBack();
          }
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  };

  // ############################################################ 유저 제제대상 체크
  const checkUserReport = async () => {

    const body = {
      report_member_seq: data.match_member_info.member_seq
    };

    try {
      const { success, data } = await report_check_user(body);
      if(success) {
        if(data.report_cnt < 10) return false;
        
        show({ 
          title: '제제 알림'
          , content: '<이용 약관>에 근거하여 회원 제제 상태로 전환되었습니다.\n상대에 대한 배려를 당부드려요'
          , confirmCallback : reportCheckUserConfirm() });
        /*
        confirmCallback: Function | undefined;
        cancelCallback: Function | undefined;
        */
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  };

  const reportCheckUserConfirm = () => {
    const body = {
      report_member_seq: data.match_member_info.member_seq
    };
    report_check_user_confirm(body);
  }

  /* ################################################################################ 스크롤 제어 */
  const handleScroll = async (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if(yOffset > height * 0.7) {
      setIsModHeader(true);
    } else {
      setIsModHeader(false);
    }

    if(yOffset > 120) {
      setIsOnShrink(true);
    } else {
      setIsOnShrink(false);
    }

  };

  // ################################################################ 초기 실행 함수
  useEffect(() => {
    if(isFocus) {
      checkUserReport();
      setIsEmpty(false);
      // 데일리 매칭 정보 조회
      getItemMatchedInfo();
    }
  }, [isFocus]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.addListener('beforeRemove', (e) => {
        if(e.data.action.type == 'POP' && type == 'PROFILE_CARD_ITEM') {
          show({ 
            content: '선택을 안하시는 경우 아이템이 소멸됩니다.\n그래도 나가시겠습니까?',
            cancelCallback: function() {},
            confirmCallback: function() {
              goMove();
            }
          });
          e.preventDefault();
        }
      });
    }, [navigation])
  );

  const goMove = async () => {
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: 'Login01' }],
          })
        );
  }

  return (
      <> 
        {/* {type == 'DAILY_REPLAY' ? (
          <CommonHeader title={'데일리 뷰 다시보기'} />
        ) : (
          <CommonHeader title={'블라인드 카드 ' + (memberSeqList.length > 1 ? '( ' + (isCardIndex) + ' / ' + memberSeqList.length + ' )' : '')} />
        )} */}

        <SpaceView viewStyle={_styles.wrap}>
          {isOnShrink && (
            <SpaceView viewStyle={_styles.headerWrap}>
              <SpaceView viewStyle={layoutStyle.rowBetween}>
                <TouchableOpacity
                  onPress={() => { navigation.goBack(); }}
                  hitSlop={commonStyle.hipSlop20}
                >
                  <Image source={ICON.backBtnType01} style={styles.iconSquareSize(24)} resizeMode={'contain'} />
                </TouchableOpacity>

                <SpaceView><Text style={styles.fontStyle('EB', 20, '#fff')}>{data?.match_member_info?.nickname}</Text></SpaceView>

                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity style={[layoutStyle.row, {marginRight: 10}]} onPress={() => { goChatDetail(); }} hitSlop={commonStyle.hipSlop20}>
                    <Image source={ICON.homeIcon} style={styles.iconSquareSize(24)} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[layoutStyle.row]} onPress={report_onOpen} hitSlop={commonStyle.hipSlop20}>
                    <Image source={ICON.declaration} style={styles.iconSquareSize(24)} />
                  </TouchableOpacity>
                </SpaceView>
              </SpaceView>

              <SpaceView mt={10} viewStyle={layoutStyle.alignCenter}>
                <MemberMark 
                  sizeType={'S'}
                  respectGrade={data?.match_member_info?.respect_grade} 
                  bestFaceName={data?.match_member_info?.best_face_name}
                  highAuthYn={data?.match_member_info?.high_auth_yn}
                  variousAuthYn={data?.match_member_info?.various_auth_yn} />
              </SpaceView>
            </SpaceView>
          )}

          {/* ############################################################################################### 버튼 영역 */}
          {/* {data.profile_img_list.length > 0 
            && isLoad 
            && type != 'ME' 
            && (type != 'STORAGE' || (type == 'STORAGE' && ((data?.match_base?.match_status == 'LIVE_HIGH' && matchType == 'RES' ) || data?.match_base?.match_status == 'ZZIM') )) && (
              
          )} */}

          <SpaceView viewStyle={_styles.btnWrap}>              
            <TouchableOpacity 
              onPress={() => { popupActive('interest'); }}
              style={_styles.btnSubWrap(140, '#46F66F')}
            >
              <Image source={ICON.sendIcon} style={styles.iconSquareSize(20)} />
              <SpaceView><Text style={styles.fontStyle('B', 16, '#fff')}>관심있어요</Text></SpaceView>
            </TouchableOpacity>
          </SpaceView>

          <ScrollView style={{ flex: 1, marginBottom: 40 }} onScroll={handleScroll} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>

            {/* ############################################################################################### 상단 Header */}
            <SpaceView mt={35} mb={0} viewStyle={[{height: 50}]}>
              <SpaceView viewStyle={layoutStyle.rowBetween}>
                <TouchableOpacity
                  onPress={() => { navigation.goBack(); }}
                  hitSlop={commonStyle.hipSlop20}
                >
                  <Image source={ICON.backBtnType01} style={styles.iconSquareSize(35)} resizeMode={'contain'} />
                </TouchableOpacity>

                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity style={[layoutStyle.row, {marginRight: 10}]} onPress={() => { goChatDetail(); }} hitSlop={commonStyle.hipSlop20} >
                    <Image source={ICON.homeIcon} style={styles.iconSquareSize(35)} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[layoutStyle.row]} onPress={report_onOpen} hitSlop={commonStyle.hipSlop20}>
                    <Image source={ICON.declaration} style={styles.iconSquareSize(35)} />
                  </TouchableOpacity>
                </SpaceView>
              </SpaceView>

              {isOnShrink && (
                <SpaceView mt={10} viewStyle={layoutStyle.alignCenter}>
                  <MemberMark 
                    sizeType={'S'}
                    respectGrade={data?.match_member_info?.respect_grade} 
                    bestFaceName={data?.match_member_info?.best_face_name}
                    highAuthYn={data?.match_member_info?.high_auth_yn}
                    variousAuthYn={data?.match_member_info?.various_auth_yn} />
                </SpaceView>
              )}
            </SpaceView>

            {data.profile_img_list.length > 0 && isLoad ? (
              <>
                <SpaceView mb={(type == 'STORAGE' && data?.match_base?.match_status != 'LIVE_HIGH' && data?.match_base?.match_status != 'ZZIM') ? 130 : 60}>
                      
                  {/* ####################################################################################
                  ####################### 상단 영역
                  #################################################################################### */}
                  <SpaceView viewStyle={{overflow: 'hidden'}}>
                    <SpaceView>
                      <SpaceView mb={13} viewStyle={layoutStyle.alignCenter}>
                        <Text style={styles.fontStyle('H', 30, '#fff')}>{data?.match_member_info?.nickname}</Text>
                      </SpaceView>

                      <SpaceView mb={10} viewStyle={_styles.topWrap}>
                        <SpaceView viewStyle={_styles.gradeArea}>
                          <Image source={ICON.sparkler} style={styles.iconSquareSize(16)} />
                          <Text style={_styles.gradeText}>{data?.match_member_info?.respect_grade}</Text>
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>

                    {/* ############################################################## 상단 이미지 영역 */}
                    <LinearGradient
                      colors={['#46F66F', '#FFFF5D']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{borderRadius: 10, overflow: 'hidden', paddingHorizontal: 2, paddingVertical: 2}}
                    >
                      <Image source={findSourcePath(data.profile_img_list[0]?.img_file_path)} style={_styles.profileImgStyle} />
                    </LinearGradient>
                  </SpaceView>

                  {/* ############################################################################################################# 소개 영역 */}
                  <SpaceView pl={20} pr={20} mt={40} mb={40}>
                    <SpaceView>
                      <Text style={[styles.fontStyle('EB', 24, '#fff'), {textAlign: 'center'}]}>"{data?.match_member_info.comment}"</Text>
                    </SpaceView>

                    {isEmptyData(data?.match_member_info.introduce_comment) && (
                      <SpaceView mt={25} mb={30}>
                        <Text style={[styles.fontStyle('SB', 14, '#fff'), {textAlign: 'center'}]}>{data?.match_member_info.introduce_comment}</Text>
                      </SpaceView>
                    )}
                  </SpaceView>

                  {/* ############################################################################################################# 성향 영역 */}
                  <SpaceView mb={30}>
                    <Tendency 
                      addData={data?.match_member_add} 
                      isEditBtn={false}
                      isNoDataArea={false}
                    />
                  </SpaceView>

                  {/* ############################################################################################################# 프로필 인증 영역 */}
                  {data?.second_auth_list.length > 0 && (
                    <SpaceView mb={40}>
                      <ProfileAuth dataList={data?.second_auth_list} isButton={false} memberData={data?.match_member_info} />
                    </SpaceView>
                  )}

                  {/* ############################################################################################################# 2번째 이미지 영역 */}
                  <SpaceView viewStyle={_styles.profileImgWrap}>
                    <Image source={findSourcePath(data.profile_img_list[1]?.img_file_path)} style={_styles.profileImgStyle} />
                  </SpaceView>

                  {/* ############################################################################################################# 부가 소개 영역 */}
                  <SpaceView mt={30}>
                    <MemberIntro 
                      addData={data?.match_member_add}
                      faceModifier={data?.match_member_info?.face_modifier}
                      nickname={data?.match_member_info?.nickname}
                      gender={data?.match_member_info?.gender}
                      isEditBtn={false} />
                  </SpaceView>

                  {/* ############################################################################################################# 관심사 영역 */}
                  <SpaceView mt={70}>
                    <InterestRender 
                      memberData={data?.match_member_info} 
                      isEditBtn={false}
                      interestList={data?.interest_list} />
                  </SpaceView>

                  {/* ############################################################################################################# 3번째 이미지 영역 */}
                  <SpaceView mt={30} viewStyle={_styles.profileImgWrap}>
                    <Image source={findSourcePath(data.profile_img_list[2]?.img_file_path)} style={_styles.profileImgStyle} />
                  </SpaceView>

                  {/* ############################################################################################################# 인터뷰 영역 */}
                  <SpaceView mt={50}>
                    <InterviewRender 
                      nickname={data?.match_member_info?.nickname} 
                      isEdit={false}
                      dataList={data?.interview_list} />
                  </SpaceView>

                  {/* ############################################################################################################# 4,5,6번째 이미지 영역 */}
                  {/* {data.profile_img_list?.length > 3 && (
                    <>
                      <SpaceView mt={30} mb={40} viewStyle={_styles.profileImgWrap}>
                        <Image source={findSourcePath(data.profile_img_list[3]?.img_file_path)} style={_styles.profileImgStyle} />
                      </SpaceView>

                      {data.profile_img_list?.length > 4 && (
                        <SpaceView mb={40} viewStyle={_styles.profileImgWrap}>
                          <Image source={findSourcePath(data.profile_img_list[4]?.img_file_path)} style={_styles.profileImgStyle} />
                        </SpaceView>
                      )}

                      {data.profile_img_list?.length > 5 && (
                        <SpaceView mb={40} viewStyle={_styles.profileImgWrap}>
                          <Image source={findSourcePath(data.profile_img_list[5]?.img_file_path)} style={_styles.profileImgStyle} />
                        </SpaceView>
                      )}
                    </>
                  )} */}

                  <SpaceView pl={20} pr={20} mb={30}>
                    {/* ############################################################## 부스트 회원 노출 영역 */}
                    {/* {data?.match_member_info?.boost_yn === 'Y' && (
                      <View style={_styles.boostPannel}>
                        <View style={_styles.boostBadge}>
                          <Text style={_styles.boostBadgeText}>BOOST</Text>
                        </View>
                        <Text style={_styles.boostTitle}>부스터 회원을 만났습니다.</Text>
                        <Text style={_styles.boostDescription}>
                          관심이나 찐심을 보내면 소셜 평점 보너스가 부여됩니다.
                        </Text>
                      </View>
                    )} */}

                    {/* ############################################################## 신고하기 영역 */}
                    {/* {type != 'ME' && (
                      <TouchableOpacity onPress={() => { report_onOpen(); }}>
                        <View style={_styles.reportButton}>
                          <Text style={_styles.reportTextBtn}>신고 및 차단하기</Text>
                        </View>
                      </TouchableOpacity>
                    )} */}

                  </SpaceView>
                </SpaceView>
              </>
            ) : (
              <>
                {isEmpty ? (
                  <View style={[layoutStyle.justifyCenter, layoutStyle.flex1, {backgroundColor: 'white'}]}>
                    <View style={[layoutStyle.alignCenter]}>
                      <CommonText type={'h4'} textStyle={_styles.emptyText}>
                        {/* 프로필 카드 이용이 마감되었어요. */}
                        매칭 회원이 존재하지 않아요.
                      </CommonText>

                      <View style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={IMAGE.logoIcon03} style={{width: 230, height: 230}} />
                      </View>

                      <View style={{position: 'absolute', top: -50, left: 75}}><Image source={IMAGE.heartImg01} style={{width: 40, height: 40}} /></View>
                      <View style={{position: 'absolute', top: 80, right: 75}}><Image source={IMAGE.heartImg01} style={{width: 40, height: 40}} /></View>
                    </View>
                  </View>
                ) : (
                  <>
                    <SpaceView viewStyle={{width: width, height: height}}>
                      <View style={{height:height / 2, alignItems: 'center', justifyContent:'center', flexDirection: 'row'}}>
                        <Text style={{fontSize: 25, fontFamily: 'Pretendard-Regular', color: '#646467'}}>잠시만{'\n'}기다려 주세요!</Text>
                        {/* <Image source={ICON.digitalClock} style={[styles.iconSize40, {marginTop: 25, marginLeft: 5}]} /> */}
                      </View>
                    </SpaceView>
                  </>
                )}
              </>
            )}
          </ScrollView>
        </SpaceView>

        {/* ##################################################################################
                    사용자 신고하기 팝업
        ################################################################################## */}
        <ReportPopup
          ref={report_modalizeRef}
          //profileOpenFn={profileCardOpen}
          confirmFn={reportCheckCallbackFn}
        />


        

          {/* ##################################################################################
                      사용자 신고하기 팝업
          ################################################################################## */}
          {/* <Modalize
            ref={report_modalizeRef}
            adjustToContentHeight={false}
            handleStyle={modalStyle.modalHandleStyle}
            modalStyle={{borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: '#333B41'}}
            modalHeight={550}
            FooterComponent={
              <>
                <SpaceView pl={25} pr={25} pb={20} viewStyle={{backgroundColor: '#333B41'}}>
                  <SpaceView mb={10}>
                    <TouchableOpacity onPress={popupReport} style={_styles.reportBtnArea('#FFDD00', '#FFDD00')}>
                      <Text style={_styles.reportBtnText('#3D4348')}>신고 및 차단하기</Text>
                    </TouchableOpacity>
                  </SpaceView>
  
                  <SpaceView>
                    <TouchableOpacity onPress={report_onClose} style={_styles.reportBtnArea('#333B41', '#BBB18B')}>
                      <Text style={_styles.reportBtnText('#D5CD9E')}>취소</Text>
                    </TouchableOpacity>
                  </SpaceView>
                </SpaceView>
              </>
            }
          >
            <SpaceView viewStyle={{backgroundColor: '#333B41'}}>
              <SpaceView mt={25} ml={30}>
                <Text style={_styles.reportTitle}>사용자 신고 및 차단하기</Text>
              </SpaceView>
  
              <View style={[modalStyle.modalBody, {paddingBottom: 0, paddingHorizontal: 0}]}>
                <SpaceView mt={15} mb={13} viewStyle={{borderBottomWidth: 1, borderColor: '#777777', paddingBottom: 15, paddingHorizontal: 25}}>
                  <Text style={_styles.reportText}>신고사유를 알려주시면 더 좋은 리프를{'\n'}만드는데 도움이 됩니다.</Text>
                </SpaceView>
  
                <SpaceView>
                  <RadioCheckBox_3 items={data.report_code_list} callBackFunction={reportCheckCallbackFn} />
                </SpaceView>
              </View>
            </SpaceView>
          </Modalize> */}
  
  
          {/* ##################################################################################
                      관심 보내기 팝업
          ################################################################################## */}
          <InterestSendPopup
            isVisible={interestSendModalVisible}
            closeModal={interestSendCloseModal}
            confirmFunc={interestSend}
            useItem={data?.use_item}
          />
  
          {/* ##################################################################################
                      찐심 보내기 팝업
          ################################################################################## */}
          <SincereSendPopup
            isVisible={sincereSendModalVisible}
            closeModal={sincereSendCloseModal}
            confirmFunc={sincereSend}
          />
      </>
    );
  }


{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    paddingHorizontal: 10,
    backgroundColor: '#13111C',
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 80,
    backgroundColor: '#13111C',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  profileImgWrap: {
    alignItems: 'center',
  },
  profileImgStyle: {
    flex: 1,
    width: width - 25,
    height: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    minHeight: 70,
    textAlignVertical: 'center',
  },
  btnWrap: {
    position: 'absolute',
    bottom: Platform.OS == 'ios' ? 110 : 50,
    right: 10,
    zIndex: 1,
  },
  btnSubWrap: (_w:number, _bg:string) => {
    return {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: _bg,
      borderRadius: 25,
      width: _w,
      height: 40,
      paddingHorizontal: 15,
    };
  },
  gradeArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS == 'ios' ? 8 : 15,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradeText:  {
    fontFamily: 'SUITE-Bold',
    fontSize: 13,
    color: '#000000',
    marginLeft: 3,
  },
  topWrap: {
    flexDirection: 'row',
  },





});