import React, { useEffect, useState, useRef } from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList, ColorType, ScreenNavigationProp } from '@types';
import { get_match_detail, regist_match_status, report_matched_user, report_check_user, report_check_user_confirm } from 'api/models';
import CommonHeader from 'component/CommonHeader';
import { CommonBtn } from 'component/CommonBtn';
import { RadioCheckBox_3 } from 'component/RadioCheckBox_3';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Platform } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch } from 'react-redux'; 
import { myProfile } from 'redux/reducers/authReducer';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData} from 'utils/functions';
import VisualImage from 'component/match/VisualImage';
import ProfileAuth from 'component/match/ProfileAuth';
import ProfileActive from 'component/match/ProfileActive';
import InterviewRender from 'component/match/InterviewRender';
import InterestRender from 'component/match/InterestRender';
import InterestSendPopup from 'screens/commonpopup/match/InterestSendPopup';
import SincereSendPopup from 'screens/commonpopup/match/SincereSendPopup';
import MemberIntro from 'component/match/MemberIntro';
import AuthPickRender from 'component/match/AuthPickRender';
import LinearGradient from 'react-native-linear-gradient';
import { update_match_status, resolve_match, get_matched_member_info } from 'api/models';
import { ROUTES, STACK } from 'constants/routes';
import Clipboard from '@react-native-clipboard/clipboard';


interface Props {
  navigation: StackNavigationProp<StackParamList, 'MatchDetail'>;
  route: RouteProp<StackParamList, 'MatchDetail'>;
}

const { width, height } = Dimensions.get('window');

/* ################################################################################################################
###################################################################################################################
###### 매칭 상세 화면
###################################################################################################################
################################################################################################################ */
export default function MatchDetail(props: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const { show } = usePopup(); // 공통 팝업
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const type = props.route.params.type; // 유형(OPEN:열람, ME:본인, STORAGE:보관함)
  const matchSeq = props.route.params.matchSeq; // 매칭 번호
  const trgtMemberSeq = props.route.params.trgtMemberSeq; // 대상 회원 번호
  const memberSeqList = props.route.params.memberSeqList; // 회원 번호 목록
  const matchType = props.route.params.matchType; // 매칭 유형(REQ:보낸매칭, RES:받은매칭)

  // 타이틀
  const [titleText, setTitleText] = useState('');

  // 전화번호 복사 여부
  const [isCopyHpState, setIsCopyHpState] = useState(true);

  const [isLoad, setIsLoad] = useState(false); // 로딩 여부
  const [isEmpty, setIsEmpty] = useState(false); // 빈값 여부

  const [isCardIndex, setIsCardIndex] = useState(0);
  const memberBase = useUserInfo(); // 본인 데이터

  // 매칭 회원 관련 데이터
  const [data, setData] = useState<any>({
    match_base: {},
    match_member_info: {},
    profile_img_list: [],
    second_auth_list: [],
    interview_list: [],
    interest_list: [],
    face_list: [],
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
  const report_onOpen = () => {
    report_modalizeRef.current?.open();
    setCheckReportType('');
  };

  const report_onClose = () => {
    report_modalizeRef.current?.close();
    setCheckReportType('');
  };

  // ######################################################################################## 관심 및 찐심 보내기 관련
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

  // 본인 보유 아이템 정보
  const [freeContactYN, setFreeContactYN] = useState('N');

  // ######################################################################################## 매칭 정보 조회
  const getMatchInfo = async () => {
    try {
      /* if(type != 'DAILY_REPLAY') {
        if(memberSeqList.length <= isCardIndex){
          navigation.goBack();
        }
      } */

      let matchMemberSeq = trgtMemberSeq;

      if(type == 'ME') {
        matchMemberSeq = memberBase?.member_seq;
      }

      const body = {
        type: type,
        match_member_seq: matchMemberSeq,
        match_seq: isEmptyData(matchSeq) ? matchSeq : null,
      };

      const { success, data } = await get_match_detail(body);
      setIsCardIndex(isCardIndex + 1);
      
      if (success) {
        if (data.result_code == '0000') {
          //setData(data);

          // 회원 정보 저장
          dispatch(myProfile());

          // 데이터 구성
          const auth_list = data?.second_auth_list.filter(item => item.auth_status == 'ACCEPT');
          setData({
            match_base: data?.match_base,
            match_member_info: data?.match_member_info,
            profile_img_list: data?.profile_img_list,
            second_auth_list: auth_list,
            interview_list: data?.interview_list,
            interest_list: data?.interest_list,
            face_list: data?.face_list[0].face_code_name,
            report_code_list: data?.report_code_list,
            safe_royal_pass: data?.safe_royal_pass,
            use_item: data?.use_item,
          });

          // 타이틀 설정
          let _titleText = '프로필 상세';
          if(type == 'STORAGE') {
            if(data?.match_base.match_status == 'ACCEPT') {
              _titleText = '매칭 성공';
            } else if(data?.match_base.match_status == 'LIVE_HIGH') {
              _titleText = '플러팅 고평점';
            } else {
              if(matchType == 'RES') {
                _titleText = '받은관심';
              } else {
                _titleText = '보낸관심';
              }
            }
          }

          setTitleText(_titleText);

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

  // ############################################################ 매칭 상태 변경(수락, 거절)
  const updateMatchStatus = async (status: any) => {
    show({ 
      content: status == 'ACCEPT' ? '상대방과의 매칭을 수락합니다. ' : '다음 기회로 미룰까요?' ,
      cancelCallback: function() {
        
      },
      confirmCallback: async function() {
        const body = {
          match_seq: matchSeq,
          match_status: status,
        };
        try {
          const { success, data } = await update_match_status(body);
          if(success) {
            if(data.result_code == '0000') {

              if(status == 'ACCEPT') {
                navigation.navigate(STACK.TAB, {
                  screen: 'MatchDeatil',
                  params: {
                    headerType: '',
                    loadPage: 'MATCH',
                  },
                });
              } else {
                navigation.goBack();
              }
            } else {
              show({ content: '오류입니다. 관리자에게 문의해주세요.' });
            }
          }
        } catch (error) {
          console.log(error);
        } finally {
        }
      }
    });
  };

  // ############################################################ 연락처 열기 팝업 활성화
  const hpOpenPopup = async () => {
    let tmpContent = '큐브 150개를 사용하여 현재 보고 계신 프로필의 연락처를 확인하시겠어요?';
    let subContent = '';

    if('Y' == freeContactYN){
      tmpContent = '현재 보고 계신 프로필의 연락처를 확인하시겠어요? \n';
      subContent = '연락처 프리오퍼 사용중';
    }

    show({
      title: '연락처 공개',
      content: tmpContent,
      subContent: subContent,
      passAmt: 50,
      cancelCallback: function() {},
      confirmCallback: function() {
        goHpOpen();
      },
    });
  }

  // ############################################################ 연락처 열기
  const goHpOpen = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);

      const body = {
        match_seq: data.match_base.match_seq
      };

      try {
        const { success, data } = await resolve_match(body);

        if(success) {
          if (data.result_code == '0000') {
            dispatch(myProfile());
          } else if(data.result_code == '5000') {
            show({
              title: '연락처 열람 알림',
              content: '이미 열람된 연락처 입니다.\n보관함 이동 후 다시 조회 해주세요.',
              isCross: true,
              confirmCallback: function () {
                navigation.goBack();
              },
            });
          } else {
            show({
              title: '재화 부족',
              content: '보유 재화가 부족합니다.',
              isCross: true,
              confirmCallback: function () {},
            });
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        getMatchInfo();
      }
    }
  };

  // ############################################################ 클립보드 복사
  const onCopyPress = async (value: string) => {
    try {
      await Clipboard.setString(value);
      show({ type: 'RESPONSIVE', content: '클립보드에 복사되었습니다.' });

      setIsCopyHpState(false);

      const timer = setTimeout(() => {
        setIsCopyHpState(true);
      }, 3500);
    } catch(e) {
      console.log('e ::::::: ' , e);
    };
  };

  /* #############################################
  ##### 거부/찐심/관심 팝업 함수
  ##### - activeType : pass(거부), sincere(찐심), interest(관심)
  ############################################# */
  const popupActive = (activeType: string) => {
    if (activeType == 'interest') {
      setInterestSendModalVisible(true);

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

    if(data.match_member_info?.match_dup_yn == 'Y') {
      show({ 
        content: '이미 보관함에 존재하는 회원입니다.' ,
        isCross: true,
      });
      return;
    }

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

          if(activeType == 'interest' || activeType == 'sincere') {
            show({
              type: 'RESPONSIVE',
              content: '프로필을 보관함에 담아드렸어요.',
              isCross: true,
            });
          };

          navigation.goBack();
          
        } else if (data.result_code == '6010') {
          show({ content: '보유 패스가 부족합니다.', isCross: true, });
          return false;
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true, });
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
      show({
        title: '사용자 신고하기',
        content: '해당 사용자를 신고하시겠습니까?',
        type: 'REPORT',
        cancelCallback: function() {
          report_onClose();
        },
        confirmCallback: async function() {
          insertReport();
        },
        cancelBtnText: '취소 할래요!',
        confirmBtnText: '신고할래요!',
      });
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


  // ################################################################ 초기 실행 함수
  useEffect(() => {
    if(isFocus) {
      checkUserReport();
      setIsEmpty(false);
      // 데일리 매칭 정보 조회
      getMatchInfo();
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
      : navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Login01' }] }));
  }

  return (
      <>
        <CommonHeader title={titleText} />

        {/* ############################################################################################### 버튼 영역 */}
        {data.profile_img_list.length > 0 
        && isLoad 
        && type != 'ME' 
        && (type != 'STORAGE' || (type == 'STORAGE' && ((data?.match_base?.match_status == 'LIVE_HIGH' && matchType == 'RES' ) || data?.match_base?.match_status == 'ZZIM') )) && (
          <SpaceView viewStyle={_styles.btnWrap}>
            {type != 'STORAGE' && (
              <TouchableOpacity onPress={() => { popupActive('pass'); }}>
                <Text style={_styles.btnText('REFUSE', '#656565')}>스킵</Text>
              </TouchableOpacity>
            )}

              
            <TouchableOpacity onPress={() => { popupActive('interest'); }}>
              <Text style={_styles.btnText('REQ', '#43ABAE')}>호감 보내기</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => { popupActive('zzim'); }}>
              <Text style={_styles.btnText('ZZIM', '#43ABAE')}>찜하기</Text>
            </TouchableOpacity> */}
          </SpaceView>
        )}

        {/* ############################################################################################### 보관함 상세 하단 영역 */}
        {(type == 'STORAGE' && data?.match_base?.match_status != 'LIVE_HIGH' && data?.match_base?.match_status != 'ZZIM') &&
          <SpaceView viewStyle={_styles.btnWrap}>
            <SpaceView viewStyle={_styles.matchArea}>

              <SpaceView mb={20} viewStyle={[layoutStyle.columCenter]}>
                <SpaceView viewStyle={_styles.matchTitleArea}>
                  <Text style={_styles.matchTitle}>{data?.match_base.match_status == 'ACCEPT' ? '메시지' : matchType == 'RES' ? '관심' : '좋아요'}</Text>
                </SpaceView>
                {data?.match_base?.message &&
                  <SpaceView mt={10} pl={5} pr={5}>
                    <Text style={_styles.matchMsg}>"{data?.match_base?.message}"</Text>
                  </SpaceView>
                }
              </SpaceView>

              <SpaceView mt={10} viewStyle={[layoutStyle.row, layoutStyle.justifyCenter]}>

                {/* ################################# 성공 매칭 구분 */}
                {data?.match_base.match_status == 'ACCEPT' ? (
                  <>
                    <SpaceView viewStyle={[layoutStyle.justifyCenter, layoutStyle.alignCenter, {width: '100%'}]}>
                      {(data.match_base.res_member_seq == memberBase.member_seq && data.match_base.res_phone_open_yn == 'Y') ||
                      (data.match_base.req_member_seq == memberBase.member_seq && data.match_base.req_phone_open_yn == 'Y') ? (
                        <>
                          <TouchableOpacity
                            disabled={!isCopyHpState}
                            style={_styles.matchSuccArea('#FFFFFF')}
                            onPress={() => { onCopyPress(data.match_member_info.phone_number); }}>
                            <Text style={_styles.matchSuccText('#D5CD9E')}>{data.match_member_info.phone_number}</Text>
                          </TouchableOpacity>
                          <Text style={_styles.clipboardCopyDesc}>연락처를 터치하면 클립보드에 복사되요.</Text>
                        </>
                      ) : (
                        <TouchableOpacity style={_styles.matchSuccArea('#FFDD00')} onPress={() => { hpOpenPopup(); }}>
                          <Text style={_styles.matchSuccText('#3D4348')}>연락처 확인하기</Text>
                        </TouchableOpacity>
                      )}
                    </SpaceView>
                  </>
                ) : (
                  <>
                    {matchType == 'RES' &&
                      <>
                        <SpaceView>
                          <SpaceView viewStyle={{flexDirection:'row'}}>
                            <SpaceView mr={5}>
                              <TouchableOpacity onPress={() => updateMatchStatus('REFUSE') } style={[_styles.matchResBtn, {backgroundColor: '#FFF'}]}>
                                <Text style={_styles.matchResBtnText}>거절</Text>
                              </TouchableOpacity>
                            </SpaceView>
                            <SpaceView ml={5}>
                              <TouchableOpacity onPress={() => updateMatchStatus('ACCEPT') } style={[_styles.matchResBtn, {backgroundColor: '#FFDD00'}]}>
                                <Text style={_styles.matchResBtnText}>수락</Text>
                              </TouchableOpacity>
                            </SpaceView>
                          </SpaceView>
                          <SpaceView>
                            <Text style={_styles.matchResDesc}>관심을 수락하면 서로의 연락처를 열람할 수 있어요.</Text>
                          </SpaceView>
                        </SpaceView>
                      </>
                    }

                    {matchType == 'REQ' &&
                      <SpaceView viewStyle={_styles.matchReqArea}>
                        <Text style={_styles.matchReqText}>{data?.match_base?.match_status == 'REFUSE' ? '보내주신 관심에 상대방이 정중히 거절했어요.' : '상대방의 응답을 기다리고 있어요.'}</Text>
                      </SpaceView>
                    }
                  </>
                )}
              </SpaceView>
            </SpaceView>
          </SpaceView>
        }

        <LinearGradient
          colors={['#3D4348', '#1A1E1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={_styles.wrap}
        >

          <ScrollView style={{ flex: 1, marginBottom: 40 }}>
              {data.profile_img_list.length > 0 && isLoad ? (
                <>
                  <SpaceView mb={(type == 'STORAGE' && data?.match_base?.match_status != 'LIVE_HIGH' && data?.match_base?.match_status != 'ZZIM') ? 130 : 60}>
                    
                    {/* ####################################################################################
                    ####################### 상단 영역
                    #################################################################################### */}
                    <SpaceView mb={30} viewStyle={{overflow: 'hidden'}}>

                      {/* ############################################################## 상단 이미지 영역 */}
                      <SpaceView viewStyle={_styles.profileImgWrap}>
                        <Image source={findSourcePath(data.profile_img_list[0]?.img_file_path)} style={_styles.profileImgStyle} />

                        <TouchableOpacity onPress={() => { report_onOpen(); }} style={{position: 'absolute', top: 10, right: 25}}>
                          <Image source={ICON.reportBtn} style={styles.iconSquareSize(32)} />
                        </TouchableOpacity>
                      </SpaceView>

                      <SpaceView viewStyle={_styles.infoArea}>
                        <SpaceView pb={30} viewStyle={{justifyContent: 'center', alignItems: 'center'}}>
                          {isEmptyData(data?.match_member_info.distance) && (
                            <SpaceView mb={5}><Text style={_styles.infoText(14)}>{data?.match_member_info.distance}Km</Text></SpaceView>
                          )}
                          <SpaceView mb={8}><Text style={_styles.infoText(25)}>{data?.match_member_info.nickname}, {data?.match_member_info.age}</Text></SpaceView>
                          <SpaceView pl={30} pr={30}><Text style={_styles.infoText(16)}>{data?.match_member_info.comment}</Text></SpaceView>
                        </SpaceView>
                      </SpaceView>

                      <LinearGradient
                        colors={['transparent', '#000000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={_styles.thumnailDimArea} />
                    </SpaceView>

                    {/* ############################################################################################################# 간단 소개 영역 */}
                    <SpaceView pl={15} pr={15} mb={40}>
                      <MemberIntro 
                        memberData={data?.match_member_info} 
                        isEditBtn={false}
                        faceList={data?.face_list} />
                    </SpaceView>

                    {/* ############################################################################################################# 자기 소개 영역 */}
                    {isEmptyData(data?.match_member_info.introduce_comment) && (
                      <SpaceView pl={15} pr={15} mb={40} viewStyle={_styles.commentWrap}>
                        <SpaceView mb={15} viewStyle={{flexDirection: 'row'}}>
                          <View style={{zIndex:1}}>
                            <Text style={_styles.commentTitText}>{data?.match_member_info.nickname}님 소개</Text>
                          </View>
                          <View style={_styles.commentUnderline} />
                        </SpaceView>
                        <SpaceView>
                          <Text style={_styles.commentText}>{data?.match_member_info.introduce_comment}</Text>
                        </SpaceView> 
                      </SpaceView>
                    )}

                    {/* ############################################################################################################# 프로필 인증 영역 */}
                    {data.second_auth_list.length > 0 && (
                      <SpaceView pl={15} pr={15} mb={40}>
                        <ProfileAuth data={data.second_auth_list} isButton={false} memberData={data?.match_member_info} />
                      </SpaceView>
                    )}

                    {/* <SpaceView pl={15} pr={15} mb={40}>
                    {data.second_auth_list.length > 0 ? (
                      <ProfileAuth data={data.second_auth_list} isButton={false} memberData={data?.match_member_info} />
                    ) : (
                      <SpaceView mt={10} viewStyle={_styles.authNoDataArea}>
                        <SpaceView mb={8}><Text style={_styles.authNoDataTit}>프로필 인증없이 가입한 회원입니다.</Text></SpaceView>
                        <SpaceView><Text style={_styles.authNoDataSubTit}>프로필 인증은 직업, 학업, 소득, 자산, SNS, 차량 등의 인증 항목을 의미합니다.</Text></SpaceView>
                      </SpaceView>
                    )}
                    </SpaceView> */}

                    {/* ############################################################################################################# 2번째 이미지 영역 */}
                    <SpaceView mb={40} viewStyle={_styles.profileImgWrap}>
                      <Image source={findSourcePath(data.profile_img_list[1]?.img_file_path)} style={_styles.profileImgStyle} />
                    </SpaceView>

                    {/* ############################################################################################################# 인터뷰 영역 */}
                    <SpaceView pl={15} pr={15} mb={35}>
                      <InterviewRender 
                        title={data?.match_member_info?.nickname + '에 대한 필독서'} 
                        isEdit={false}
                        dataList={data?.interview_list} />
                    </SpaceView>

                    {/* ############################################################################################################# 3번째 이미지 영역 */}
                    <SpaceView mb={40} viewStyle={_styles.profileImgWrap}>
                      <Image source={findSourcePath(data.profile_img_list[2]?.img_file_path)} style={_styles.profileImgStyle} />
                    </SpaceView>

                    {/* ############################################################################################################# 관심사 영역 */}
                    <SpaceView pl={15} pr={15} mb={40}>
                      <InterestRender 
                        memberData={data?.match_member_info} 
                        isEditBtn={false}
                        interestList={data?.interest_list} />
                    </SpaceView>

                    {/* ############################################################################################################# 4,5,6번째 이미지 영역 */}
                    {data.profile_img_list?.length > 3 && (
                      <>
                        <SpaceView mb={40} viewStyle={_styles.profileImgWrap}>
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
                    )}

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

                      {/* ############################################################## 추가 정보 영역 */}
                      {/* <AddInfo memberData={data?.match_member_info} /> */}

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
        </LinearGradient>

        

        {/* ##################################################################################
                    사용자 신고하기 팝업
        ################################################################################## */}
        <Modalize
          ref={report_modalizeRef}
          adjustToContentHeight={false}
          handleStyle={modalStyle.modalHandleStyle}
          /* modalStyle={[modalStyle.modalContainer, {borderRadius: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50}]} */
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
              {/* <CommonText fontWeight={'700'} type={'h3'}>사용자 신고 및 차단하기</CommonText> */}
              <Text style={_styles.reportTitle}>사용자 신고 및 차단하기</Text>
              {/* <TouchableOpacity onPress={report_onClose}>
                <Image source={ICON.xBtn2} style={{width: 20, height: 20}} />
              </TouchableOpacity> */}
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
        </Modalize>


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

        {/* ##################################################################################
                    인증 Pick
        ################################################################################## */}
        {/* {data?.match_member_info?.auth_acct_cnt >= 5 && (
          <AuthPickRender _authLevel={data?.match_member_info?.auth_acct_cnt} _authList={data?.second_auth_list}  />
        )} */}

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
    paddingTop: 10,
    paddingBottom: 50,
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
  infoArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingVertical: 25,
    overflow: 'hidden',
  },
  infoText: (fs:number, cr:string) => {
    return {
      fontFamily: 'Pretendard-Regular',
      fontSize: fs,
      color: isEmptyData(cr) ? cr : '#fff',
    };
  },
  thumnailDimArea: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    opacity: 0.8,
    height: height * 0.34,
    marginHorizontal: 12,
    borderRadius: 22,
    overflow: 'hidden',
  },
  commentWrap: {
    alignItems: 'center',
  },
  commentTitText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  commentText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 14,
    color: '#F3DEA6',
    textAlign: 'center',
  },
  commentUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: '#FE8C12',
  },
  boostPannel: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#f6f7fe',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  boostBadge: {
    width: 54,
    borderRadius: 7.5,
    backgroundColor: '#7986ee',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  boostBadgeText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 10,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  boostTitle: {
    fontFamily: 'Pretendard-ExtraBold',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#262626',
  },
  boostDescription: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#8e8e8e',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    minHeight: 70,
    textAlignVertical: 'center',
  },
  authNoDataArea: {
    width: '100%',
    backgroundColor: '#ffffff', 
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1, 
    borderRadius: 10, 
    borderColor: '#8E9AEB', 
    borderStyle: 'dotted',
  },
  authNoDataTit: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    color: '#7986EE',
    textAlign: 'center',
  },
  authNoDataSubTit: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 10,
    color: '#C3C3C8',
    textAlign: 'center',
  },
  btnWrap: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnText: (type:string, _fColor:string) => {
    let ph = 30;

    if(type == 'REQ') {
      ph = 55;
    } else if(type == 'ZZIM') {
      ph = 15;
    }
    
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: 20,
      color: _fColor,
      textAlign: 'center',
      borderRadius: 10,
      backgroundColor: '#fff',
      paddingHorizontal: ph,
      paddingVertical: 10,
      marginHorizontal: type == 'REQ' ? 5 : 0,
      overflow: 'hidden',
    };
  },









  reportTitle: {
    fontFamily: 'Pretendard-ExtraBold',
		fontSize: 20,
		color: '#D5CD9E',
		textAlign: 'left',
  },
  reportButton: {
    height: 43,
    borderRadius: 21.5,
    backgroundColor: '#363636',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    marginTop: 20,
  },
  reportTextBtn: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  reportText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 17,
    color: '#E1DFD1',
    textAlign: 'left',
  },
  reportBtnArea: (bg:number, bdc:number) => {
		return {
			/* width: '50%',
			height: 48, */
			backgroundColor: bg,
			alignItems: 'center',
			justifyContent: 'center',
      borderWidth: 1,
      borderColor: bdc,
      borderRadius: 5,
      paddingVertical: 13,
		}
	},
  reportBtnText: (cr:string) => {
		return {
		  fontFamily: 'Pretendard-Bold',
		  fontSize: 16,
		  color: isEmptyData(cr) ? cr : '#fff',
		};
	},


  matchArea: {
    borderRadius: 10,
    paddingVertical: 20,
    backgroundColor: 'rgba(51, 59, 65, 0.9)',
    width: '95%',
  },
  matchTitleArea: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    width: 60,
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
  },
  matchTitle: {
    textAlign: 'center',
    fontFamily: 'Pretendard-SemiBold',
    color: '#D5CD9E',
  },
  matchMsg: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#E1DFD1',
  },
  matchResBtn: {
    paddingVertical: 10,
    paddingHorizontal: 65,
    borderRadius: 10,
  },
  matchResBtnText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#3D4348',
  },
  matchReqArea: {
    borderWidth: 2,
    borderColor: '#D5CD9E',
    width: '95%',
    paddingVertical: 10,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  matchReqText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#D5CD9E',
    textAlign: 'center',
  },
  matchSuccArea: (bgcr:string) => {
		return {
		  width: '95%',
      backgroundColor: bgcr,
      paddingVertical: 10,
      borderRadius: 10,
		};
	},
  matchSuccText: (cr:string) => {
		return {
		  fontFamily: 'Pretendard-Bold',
      fontSize: 16,
      color: cr,
      textAlign: 'center',
		};
	},
  matchResDesc: {
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#FFFDEC',
  },  
  clipboardCopyDesc: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#FFFDEC',
    marginTop: 10,
  },
});