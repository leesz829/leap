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
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Platform, Modal } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch } from 'react-redux'; 
import { myProfile } from 'redux/reducers/authReducer';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData} from 'utils/functions';
import ProfileAuth from 'component/match/ProfileAuth';
import InterviewRender from 'component/match/InterviewRender';
import InterestRender from 'component/match/InterestRender';
import InterestSendPopup from 'screens/commonpopup/match/InterestSendPopup';
import SincereSendPopup from 'screens/commonpopup/match/SincereSendPopup';
import MemberIntro from 'component/match/MemberIntro';
import Tendency from 'component/match/Tendency';
import AuthPickRender from 'component/match/AuthPickRender';
import LinearGradient from 'react-native-linear-gradient';
import { update_match_status, resolve_match, get_matched_member_info, chat_room_info } from 'api/models';
import { ROUTES, STACK } from 'constants/routes';
import Clipboard from '@react-native-clipboard/clipboard';
import { SUCCESS } from 'constants/reusltcode';
import ReportPopup from 'screens/commonpopup/ReportPopup';
import MemberMark from 'component/common/MemberMark';





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

  const [isOnShrink, setIsOnShrink] = React.useState(false); // 쉬링크 상태 변수

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
    match_member_add: {},
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

  const [isModHeader, setIsModHeader] = useState(false); // 헤더 변경 여부 구분

  // ######################################################################################## 관심 및 찐심 보내기 관련
  const [message, setMessage] = useState('');

  const [interestSendModalVisible, setInterestSendModalVisible] = useState(false); // 관심 보내기 모달 visible
  const [sincereSendModalVisible, setSincereSendModalVisible] = useState(false); // 찐심 보내기 모달 visible

  // 관심 보내기 모달 닫기
  const interestSendCloseModal = () => {
    setInterestSendModalVisible(false);
  };

  // 관심 보내기
  const interestSend = (type:string, message:string) => {
    insertMatchInfo(type, 0, message);
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

  // 채팅 데이터
  const [chatData, setChatData] = useState([]);


  // ######################################################################################## 연락처 열람 관련
  const [phoneOpenModalVisible, setPhoneOpenModalVisible] = useState(false); // 연락처 열람 모달 visible
  const [phoneOpenCubeType, setPhoneOpenCubeType] = useState('CUBE'); // 연락처 열람 재화 유형

  // 연락처 열람 모달 닫기
  const phoneOpenCloseModal = () => {
    setPhoneOpenModalVisible(false);
  };

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
            match_member_add: data?.match_member_add,
            profile_img_list: data?.profile_img_list,
            second_auth_list: auth_list,
            interview_list: data?.interview_list,
            interest_list: data?.interest_list,
            face_list: data?.face_list[0]?.face_code_name,
            report_code_list: data?.report_code_list,
            safe_royal_pass: data?.safe_royal_pass,
            use_item: data?.use_item,
          });

          // 타이틀 설정
          let _titleText = '프로필 카드';
          if(type == 'STORAGE') {
            if(data?.match_base.match_status == 'ACCEPT') {
              _titleText = '매칭 성공';
            } else if(data?.match_base.match_status == 'ZZIM') {
              _titleText = '찜하기';
            } else {
              if(matchType == 'RES') {
                _titleText = '받은관심';
              } else if(matchType == 'REQ') {
                _titleText = '보낸관심';
              }
            }
          };

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

    setPhoneOpenModalVisible(true);

    return;

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
        match_seq: data?.match_base.match_seq
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
        setPhoneOpenModalVisible(false);
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

      //setInterestSendModalVisible(true);
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

    if(activeType == 'sincere') {
      special_level = 1;
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
          show({ content: '보유 큐브가 부족합니다.', isCross: true, });
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
      getMatchInfo();
      // 채팅 정보 조회
      chatRoomInfo();
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

  // ############################################################################# 채팅방 목록 조회
  const chatRoomInfo = async () => {
    try { 

      const body = {
        member_seq: memberBase?.member_seq,
        trgt_member_seq: trgtMemberSeq,
      };

      const { success, data } = await chat_room_info(body);

      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            setChatData(data?.chat_room_info);
            break;
          default:
            show({ content: '오류입니다. 관리자에게 문의해주세요.' });
            break;
        }
      } else {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  };

  // ############################################################ 채팅방 이동
  const goChatDetail = async () => {
    const chatInfoData = chatData ? chatData : data.match_member_info;

    console.log('mega :::: ' , memberBase?.royal_pass_has_amt);

    if(data.match_member_info?.chat_open_cnt > 0) {
      navigation.navigate(STACK.COMMON, { 
        screen: 'ChatDetail',
        params: {
          match_seq: chatInfoData?.match_seq,
          chat_room_seq: chatInfoData?.chat_room_seq,
          chat_room_id: chatInfoData?.chat_room_id,
          chat_member_seq: chatInfoData?.chat_member_seq,
          chat_type: 'OPEN',
          sch_member_seq: chatInfoData?.res_member_seq == memberBase?.member_seq ? chatInfoData?.req_member_seq : chatInfoData?.res_member_seq,
        } 
      });
    } else {
      show({
        title: 'DM 보내기',
        type: 'MATCH',
        content: data.match_member_info?.nickname + '님과의\n1:1 채팅방을 개설합니다.',
        passType: 'MEGA_CUBE',
        passAmt: '3',
        isNoPass: memberBase?.royal_pass_has_amt < 3 ? false : true,
        btnIcon: ICON.navStory,
        confirmBtnText: '1:1 채팅',
        memberImg: findSourcePath(data.profile_img_list[0]?.img_file_path),
        confirmCallback: function() {
          navigation.navigate(STACK.COMMON, { 
            screen: 'ChatDetail',
            params: {
              match_seq: chatInfoData?.match_seq,
              chat_room_seq: chatInfoData?.chat_room_seq,
              chat_room_id: chatInfoData?.chat_room_id,
              chat_member_seq: chatInfoData?.chat_member_seq,
              chat_type: 'OPEN',
              sch_member_seq: chatInfoData?.res_member_seq == memberBase?.member_seq ? chatInfoData?.req_member_seq : chatInfoData?.res_member_seq,
            } 
          });
        },
        cancelCallback: function() {
        },
      });
    }
  }

  return (
  <>
    <SpaceView viewStyle={_styles.wrap}>

      {/* ############################################################################################### 상단 Header */}
      {/* {isModHeader ? (
        <CommonHeader 
          //title={titleText} 
          //title={data?.match_member_info.nickname}
          type={'MATCH_DETAIL'} 
          callbackFunc={report_onOpen} 
          mstImgPath={findSourcePath(data.profile_img_list[0]?.img_file_path)}
          nickname={data?.match_member_info.nickname} />
      ) : (
        <CommonHeader 
          //title={titleText} 
          //title={data?.match_member_info.nickname}
          type={'MATCH_DETAIL'} 
          callbackFunc={report_onOpen}
          nickname={data?.match_member_info.nickname} />
      )} */}

      {isOnShrink && (
        <SpaceView viewStyle={_styles.headerWrap}>
          <SpaceView viewStyle={layoutStyle.rowBetween}>
            <TouchableOpacity
              onPress={() => { navigation.goBack(); }}
              style={_styles.backContainer}
              hitSlop={commonStyle.hipSlop20}
            >
              <Image source={ICON.backBtnType01} style={styles.iconSquareSize(24)} resizeMode={'contain'} />
            </TouchableOpacity>

            <SpaceView><Text style={styles.fontStyle('EB', 20, '#fff')}>{data?.match_member_info?.nickname}</Text></SpaceView>

            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={[layoutStyle.row, {marginRight: 10}]} /* onPress={report_onOpen} */ hitSlop={commonStyle.hipSlop20}>
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
      {data.profile_img_list.length > 0 
        && isLoad 
        && type != 'ME' 
        && (type != 'STORAGE' || (type == 'STORAGE' && ((data?.match_base?.match_status == 'LIVE_HIGH' && matchType == 'RES' ) || data?.match_base?.match_status == 'ZZIM') )) && (

        <SpaceView viewStyle={_styles.btnWrap}>
          {/* {type != 'STORAGE' && (
            <TouchableOpacity onPress={() => { popupActive('pass'); }}>
              <Text style={_styles.btnText('REFUSE', '#3D4348')}>스킵</Text>
            </TouchableOpacity>
          )} */}
            
          <TouchableOpacity
            onPress={() => { popupActive('interest'); }}
            style={_styles.btnSubWrap(140, '#46F66F')}
          >
            <Image source={ICON.sendIcon} style={styles.iconSquareSize(20)} />
            <SpaceView><Text style={styles.fontStyle('B', 16, '#fff')}>관심있어요</Text></SpaceView>

            {/* {isEmptyData(data?.use_item) && isEmptyData(data?.use_item?.FREE_LIKE) && data?.use_item?.FREE_LIKE?.use_yn == 'Y' && (
              <SpaceView viewStyle={_styles.sendEtc}>
                <Image source={ICON.cubeYCyan} style={styles.iconSquareSize(12)} />
                <Text style={_styles.sendText}>FREE</Text>
              </SpaceView>
            )} */}
          </TouchableOpacity>

          {/* {type != 'STORAGE' && data?.match_member_info?.zzim_yn == 'Y' && (
            <TouchableOpacity onPress={() => { popupActive('zzim'); }}>
              <Text style={_styles.btnText('ZZIM', '#3D4348')}>찜하기</Text>
            </TouchableOpacity>
          )} */}
        </SpaceView>
      )}

      {/* ############################################################################################### 보관함 상세 하단 영역 */}
      {type == 'STORAGE' &&
        <>
          {(matchType == 'RES' && data?.match_base?.match_status == 'PROGRESS') && (
            <SpaceView viewStyle={_styles.btnWrap}> 
              <TouchableOpacity 
                onPress={() => updateMatchStatus('ACCEPT') }
                style={_styles.btnSubWrap(130, '#46F66F')}>
                <Image source={ICON.sendIcon} style={styles.iconSquareSize(20)} />
                <Text style={styles.fontStyle('B', 16, '#fff')}>관심수락</Text>
              </TouchableOpacity>
            </SpaceView>
          )}

          {(data?.match_base?.match_status == 'ACCEPT') && (
            <>
              {(data.match_base.res_member_seq == memberBase.member_seq && data.match_base.res_phone_open_yn == 'Y') ||
                (data.match_base.req_member_seq == memberBase.member_seq && data.match_base.req_phone_open_yn == 'Y') ? (
                <>
                  <SpaceView viewStyle={_styles.btnWrap}> 
                    <TouchableOpacity 
                      onPress={() => { onCopyPress(data.match_member_info.phone_number); }}
                      style={_styles.btnSubWrap02}>
                      <Text style={[styles.fontStyle('B', 16, '#44B6E5'), {textAlign: 'center'}]}>클립보드 복사하기</Text>
                    </TouchableOpacity>
                    <SpaceView viewStyle={{position: 'absolute', top: -28, right: 0, alignItems: 'flex-end'}}>
                      <LinearGradient
                        colors={['#8BC1FF', '#416DFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={_styles.phoneMaskingMsgWrap}
                      >
                        <Text style={styles.fontStyle('SB', 10, '#fff')}>🛡️개인정보 보호를 위해 전화번호는 마스킹 처리하였어요.</Text>
                      </LinearGradient>
                      <View style={_styles.triangle} />
                    </SpaceView>
                  </SpaceView>
                </>
              ) : (
                <SpaceView viewStyle={_styles.btnWrap}> 
                  <TouchableOpacity 
                    onPress={() => { hpOpenPopup(); }}
                    style={_styles.btnSubWrap(165, '#FFFF5D')}>
                    <Image source={ICON.phoneIcon} style={styles.iconSquareSize(20)} />
                    <Text style={styles.fontStyle('B', 16, '#44B6E5')}>연락처 잠금해제</Text>
                  </TouchableOpacity>
                </SpaceView>
              )}
            </>
          )}

          {/* {(matchType == 'RES' && data?.match_base?.match_status == 'PROGRESS') && (
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
          )} */}
        </>
      }

      <ScrollView style={{ flex: 1, marginBottom: 40 }} onScroll={handleScroll} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>

        {/* ############################################################################################### 상단 Header */}
        <SpaceView mt={35} mb={0} viewStyle={[{height: 50}]}>
          <SpaceView viewStyle={layoutStyle.rowBetween}>
            <TouchableOpacity
              onPress={() => { navigation.goBack(); }}
              style={_styles.backContainer}
              hitSlop={commonStyle.hipSlop20}
            >
              <Image source={ICON.backBtnType01} style={styles.iconSquareSize(35)} resizeMode={'contain'} />
            </TouchableOpacity>

            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity style={[layoutStyle.row, {marginRight: 10}]} hitSlop={commonStyle.hipSlop20}>
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

        {/* {props.route.params?.type == 'OPEN' && props.route.params?.matchType == 'STORY' &&
          <>
            <TouchableOpacity onPress={() => { goChatDetail(); }}>
              <SpaceView mr={15} viewStyle={layoutStyle.alignEnd}>
                <SpaceView viewStyle={{paddingVertical: 5, backgroundColor: '#FFF6BE', width: 150, marginLeft: 10, borderRadius: 10, marginBottom: 10}}>
                  <Text style={{textAlign: 'center'}}>채팅 신청 임시 버튼</Text>
                </SpaceView>
              </SpaceView>
            </TouchableOpacity>
          </>
        } */}

        {/* <TouchableOpacity onPress={() => { goChatDetail(); }}>
          <SpaceView mr={15} viewStyle={layoutStyle.alignEnd}>
            <SpaceView viewStyle={{paddingVertical: 5, backgroundColor: '#FFF6BE', width: 150, marginLeft: 10, borderRadius: 10, marginBottom: 10}}>
              <Text style={{textAlign: 'center'}}>채팅 신청 임시 버튼</Text>
            </SpaceView>
          </SpaceView>
        </TouchableOpacity> */}

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

                {/* <SpaceView viewStyle={_styles.infoArea}>
                  <SpaceView pb={30} viewStyle={{justifyContent: 'center', alignItems: 'center'}}>
                    {isEmptyData(data?.match_member_info.distance) && (
                      <SpaceView mb={5}><Text style={_styles.infoText(14)}>{data?.match_member_info.distance}Km</Text></SpaceView>
                    )}
                    <SpaceView mb={8}><Text style={_styles.infoText(25)}>{data?.match_member_info.nickname}, {data?.match_member_info.age}</Text></SpaceView>
                    <SpaceView pl={30} pr={30}><Text style={_styles.infoText(16)}>{data?.match_member_info.comment}</Text></SpaceView>
                  </SpaceView>
                </SpaceView> */}

                {/* <LinearGradient
                  colors={['transparent', '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={_styles.thumnailDimArea} /> */}

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
    {/* <SincereSendPopup
      isVisible={sincereSendModalVisible}
      closeModal={sincereSendCloseModal}
      confirmFunc={sincereSend}
    /> */}

    {/* ##################################################################################
                인증 Pick
    ################################################################################## */}
    {/* {data?.match_member_info?.auth_acct_cnt >= 5 && (
      <AuthPickRender _authLevel={data?.match_member_info?.auth_acct_cnt} _authList={data?.second_auth_list}  />
    )} */}

    {/* setPhoneOpenCubeType */}

    <Modal visible={phoneOpenModalVisible} transparent={true}>
      <SpaceView viewStyle={modalStyle.modalBackground}>
        <SpaceView viewStyle={[modalStyle.modalStyle1]}>
          <SpaceView viewStyle={_styles.openModalWrap}>
            <SpaceView>
              <Text style={styles.fontStyle('H', 26, '#000000')}>재화 선택</Text>
              <SpaceView mt={5}><Text style={styles.fontStyle('B', 13, '#000000')}>연락처 잠금해제에 사용하실 재화를 선택해 주세요.</Text></SpaceView>
            </SpaceView>
            <SpaceView mt={10} viewStyle={layoutStyle.rowBetween}>
              <TouchableOpacity 
                style={{width:'48%'}}
                activeOpacity={0.8}
                onPress={() => {
                  setPhoneOpenCubeType('CUBE');
                }}>
                <LinearGradient
                  colors={phoneOpenCubeType == 'CUBE' ? ['#44B6E5', '#1084B4'] : ['#fff', '#fff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={_styles.phoneOpenItemWrap(phoneOpenCubeType == 'CUBE')}
                >
                  <Image source={ICON.cube}  style={styles.iconSquareSize(45)} />
                  <SpaceView mt={10}><Text style={styles.fontStyle('B', 14, phoneOpenCubeType == 'CUBE' ? '#fff' : '#000000')}>200개</Text></SpaceView>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{width:'48%'}}
                activeOpacity={0.8}
                onPress={() => {
                  setPhoneOpenCubeType('MEGA');
                }}>
                <LinearGradient
                  colors={phoneOpenCubeType == 'MEGA' ? ['#44B6E5', '#1084B4'] : ['#fff', '#fff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={_styles.phoneOpenItemWrap(phoneOpenCubeType == 'MEGA')}
                >
                  <Image source={ICON.megaCube}  style={styles.iconSquareSize(45)} />
                  <SpaceView mt={10}><Text style={styles.fontStyle('B', 14, phoneOpenCubeType == 'MEGA' ? '#fff' : '#000000')}>8개</Text></SpaceView>
                </LinearGradient>
              </TouchableOpacity>
            </SpaceView>
            <SpaceView mt={45}>
              <Text style={styles.fontStyle('EB', 16, '#707070')}>폭력적/공격적 행위로부터 안전한 리프</Text>
              <SpaceView mt={5}>
                <Text style={styles.fontStyle('SB', 10, '#707070')}>개인정보를 악용하여 다른 회원에게 피해를 준 사실이 확인되면 "영구 정지" 제재를 받을 수 있습니다. 또 한, 그로인한 법적 분쟁이 발생하는 경우 리프는 관련 수사 기관의 요청에 적극 협조하여 범죄 근절에 동참합니다.</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mt={30} viewStyle={layoutStyle.alignEnd}>
              <TouchableOpacity 
                style={_styles.phoneOpenConfirm}
                disabled={phoneOpenCubeType == 'MEGA'}
                onPress={() => {
                  goHpOpen();
                }}>
                <Text style={styles.fontStyle('B', 16, '#fff')}>확인</Text>
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>
          <SpaceView viewStyle={_styles.cancelWrap}>
            <TouchableOpacity onPress={phoneOpenCloseModal}>
              <Text style={styles.fontStyle('EB', 16, '#ffffff')}>여기 터치하고 닫기</Text>
            </TouchableOpacity>
          </SpaceView>
        </SpaceView>
      </SpaceView>
    </Modal>

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
    //paddingTop: 30,
    paddingHorizontal: 10,
    backgroundColor: '#13111C',
  },
  profileImgWrap: {
    alignItems: 'center',
  },
  profileImgStyle: {
    width: width - 25,
    height: height * 0.7,
    borderRadius: 10,
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
  btnSubWrap02: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFF5D',
    borderRadius: 25,
    width: 155,
    height: 40,
    paddingHorizontal: 15,
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
  backContainer: {
    /* position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    zIndex: 1, */
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














  openModalWrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cancelWrap: {
    position: 'absolute',
    bottom: -40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  phoneOpenConfirm: {
    backgroundColor: '#46F66F',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  phoneOpenItemWrap: (isOn:boolean) => {
    return {
      width: '100%', 
      borderWidth: 1, 
      borderColor: '#44B6E5', 
      borderRadius: 11, 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: 100,
    };
  },

  phoneMaskingMsgWrap: {
    borderRadius: 13,
    width: 250,
    paddingVertical: 5,
    alignItems: 'center',    
  },
  triangle: {
    marginTop: -1,
    marginRight: 15,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#416DFF',
    transform: [{ rotate: '180deg' }],
  },



});