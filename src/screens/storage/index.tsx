import { ColorType, BottomParamList, ScreenNavigationProp } from '@types';
import { commonStyle, styles, layoutStyle, modalStyle } from 'assets/styles/Styles';
import { CommonSwich } from 'component/CommonSwich';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { Wallet } from 'component/TopNavigation';
import * as React from 'react';
import {
  //Image,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  ImageBackground,
  FlatList,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { useState, useRef } from 'react';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RouteProp,
  useNavigation,
  useIsFocused,
  CommonActions,
  useFocusEffect,
} from '@react-navigation/native';
import * as dataUtils from 'utils/data';
import { useDispatch } from 'react-redux';
import { get_member_storage, update_match, match_check_all } from 'api/models';
import { useMemberseq } from 'hooks/useMemberseq';
import { usePopup } from 'Context';
import { STACK } from 'constants/routes';
import CommonHeader from 'component/CommonHeader';
import { myProfile } from 'redux/reducers/authReducer';
import Carousel from 'react-native-snap-carousel';
import ToggleSwitch from 'toggle-switch-react-native';
import { Color } from 'assets/styles/Color';
import { isEmptyData } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { BlurView } from "@react-native-community/blur";
import { setPartialPrincipal } from 'redux/reducers/authReducer';
//import Modal from 'react-native-modal';
import Image from 'react-native-fast-image';
import AuthLevel from 'component/common/AuthLevel';
import ProfileGrade from 'component/common/ProfileGrade';




/* ################################################################################################################
###### 보관함
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<BottomParamList, 'Storage'>;
  route: RouteProp<BottomParamList, 'Storage'>;
}

const { width, height } = Dimensions.get('window');

export const Storage = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocusStorage = useIsFocused();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const { show } = usePopup();  // 공통 팝업

  const memberSeq = useMemberseq(); // 회원번호

  const tabScrollRef = useRef();

  const { route } = props;
  const params = route.params;
  const pageIndex = 0;
  const loadPage = params?.loadPage || 'RES';
  const dataRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [btnStatus, setBtnStatus] = useState(true);
  const [btnStatus1, setBtnStatus1] = useState(true);
  const [btnStatus2, setBtnStatus2] = useState(true);

  const [isSpecialVisible, setIsSpecialVisible] = React.useState(false);
  const [isLiveResVisible, setIsLiveResVisible] = React.useState(true);
  const [isLiveReqVisible, setIsLiveReqVisible] = React.useState(true);

  const [isProfileOpenVisible, setIsProfileOpenVisible] = React.useState(false);
  const [profileOpenMessage, setProfileOpenMessage] = React.useState('');

  // 프로필 열기 데이터
  const [profileOpenData, setProfileOpenData] = React.useState({
    match_seq: 0,
    nickname: '',
    message: '',
    trgt_member_seq: 0,
    type: '',
    match_type: '',
  });


  /* ################################################
   ######## Storage Data 구성
   ######## - resLikeList : 내가 받은 관심 목록
   ######## - reqLikeList : 내가 받은 관심 목록
   ######## - matchTrgtList : 내가 받은 관심 목록
   #################################################*/
  const [dataStorage, setDataStorage] = React.useState<any>({
    resLikeList: [],
    reqLikeList: [],
    matchTrgtList: [],
    zzimTrgtList: [],
    liveHighList: [],
    resSpecialCnt: 0,
    reqSpecialCnt: 0,
    matchSpecialCnt: 0,
    zzimItemUseYn: 'N',
  });

  // 탭 목록
  const [tabs, setTabs] = React.useState([
    {
      type: 'RES',
      title: '받은 관심',
      data: [],
      isNew: false,
      isSpecialExists: false,
    },
    {
      type: 'REQ',
      title: '보낸 관심',
      data: [],
      isNew: false,
      isSpecialExists: false,
    },
    {
      type: 'MATCH',
      title: '성공 매칭',
      data: [],
      isNew: false,
      isSpecialExists: false,
    },
    {
      type: 'ZZIM',
      title: '찜 목록',
      data: [],
      isNew: false,
      isSpecialExists: false,
    },
    {
      type: 'LIVE',
      title: 'LIVE',
      data: [],
      isNew: false,
      isSpecialExists: false,
    },
  ]);

  // ################################################################################# 보관함 정보 조회
  const getStorageData = async (isReal:boolean) => {
    setIsLoading(true);

    try {
      const { success, data } = await get_member_storage();
      if(success) {
        if (data.result_code != '0000') {
          console.log(data.result_msg);
          return false;
        } else {

          // ##### 회원 기본 정보 갱신
          dispatch(setPartialPrincipal({ mbr_base : data.mbr_base }));

          // ##### 보관함 데이터 구성
          let tabsData = [];

          let resLikeListData = [];
          let reqLikeListData = [];
          let matchTrgtListData = [];
          let zzimTrgtListData = [];
          let liveHighListData = [];
          let zzimItemUseYn = data.zzim_item_use_yn;

          let resSpecialCnt = 0;
          let reqSpecialCnt = 0;
          let matchSpecialCnt = 0;

          resLikeListData = dataUtils.getStorageListData(
            data.res_like_list
          );

          reqLikeListData = dataUtils.getStorageListData(
            data.req_like_list
          );

          matchTrgtListData = dataUtils.getStorageListData(
            data.match_trgt_list
          );

          if(typeof data.zzim_trgt_list != 'undefined') {
            zzimTrgtListData = dataUtils.getStorageListData(
              data.zzim_trgt_list
            );
          };

          liveHighListData = dataUtils.getStorageListData(
            data.live_high_list
          );

          resLikeListData.map(({ special_interest_yn }: { special_interest_yn: any }) => {
            if(special_interest_yn == 'Y') { resSpecialCnt = resSpecialCnt+1; }
          });

          reqLikeListData.map(({ special_interest_yn }: { special_interest_yn: any }) => {
            if(special_interest_yn == 'Y') { reqSpecialCnt = reqSpecialCnt+1; }
          });

          matchTrgtListData.map(({ special_interest_yn }: { special_interest_yn: any }) => {
            if(special_interest_yn == 'Y') { matchSpecialCnt = matchSpecialCnt+1; }
          });

        
          liveHighListData.map((item, index) => (
            item.match_type == 'LIVE_RES' ? resLikeListData.push(item) : ''
          ));

          liveHighListData.map((item, index) => (
            item.match_type == 'LIVE_REQ' ? reqLikeListData.push(item) : ''
          ));

          zzimTrgtListData.map((item, index) => (
            item.match_type == 'ZZIM' ? reqLikeListData.push(item) : ''
          ));

          // tabs 데이터 구성
          tabsData = [
            {
              type: 'RES',
              title: '받은 관심',
              data: resLikeListData,
              isNew: data.res_new_yn == 'Y' ? true : false,
              isSpecialExists: resSpecialCnt > 0 ? true : false,
            },
            {
              type: 'REQ',
              title: '보낸 관심',
              data: reqLikeListData,
              isNew: false,
              isSpecialExists: reqSpecialCnt > 0 ? true : false,
            },
            {
              type: 'MATCH',
              title: '성공 매칭',
              data: matchTrgtListData,
              isNew: data.succes_new_yn == 'Y' ? true : false,
              isSpecialExists: matchSpecialCnt > 0 ? true : false,
            },
          ];

          // if(zzimItemUseYn == 'Y') {
          //   tabsData.push({
          //     type: 'ZZIM',
          //     title: '찜 목록',
          //     data: zzimTrgtListData,
          //     isNew: false,
          //   });
          // };

          // if(liveHighListData.length > 0) {
          //   tabsData.push({
          //     type: 'LIVE',
          //     title: 'LIVE',
          //     data: liveHighListData,
          //     isNew: data.live_res_new_yn == 'Y' ? true : false,
          //   });
          // };


          let tmpResSpecialCnt = 0;
          let tmpReqSpecialCnt = 0;
          let tmpMatchSpecialCnt = 0;

          if(data?.res_like_list.length > 0) {
            data?.res_like_list.map(({ special_interest_yn } : { special_interest_yn: any }) => {
                if (special_interest_yn == 'Y') {
                  tmpResSpecialCnt++;
                }
              }
            );
          };

          if(data?.req_like_list.length > 0) {
            data?.req_like_list.map(({ special_interest_yn }: { special_interest_yn: any }) => {
                if (special_interest_yn == 'Y') {
                  tmpReqSpecialCnt++;
                }
              }
            );
          };

          if(data?.match_trgt_list.length > 0) {
            data?.match_trgt_list.map(({ special_interest_yn }: { special_interest_yn: any }) => {
                if (special_interest_yn == 'Y') {
                  tmpMatchSpecialCnt++;
                }
              }
            );
          };

          setDataStorage({
            ...dataStorage,
            resLikeList: resLikeListData,
            reqLikeList: reqLikeListData,
            matchTrgtList: matchTrgtListData,
            zzimTrgtList: zzimTrgtListData,
            liveHighList: liveHighListData,
            resSpecialCnt: tmpResSpecialCnt,
            reqSpecialCnt: tmpReqSpecialCnt,
            matchSpecialCnt: tmpMatchSpecialCnt,
            zzimItemUseYn: zzimItemUseYn,
          });

          setTabs(tabsData);

          if(!isReal) {
            if(loadPage == 'ZZIM' || loadPage == 'LIVE') {
              if((loadPage == 'ZZIM' && zzimItemUseYn != 'Y') || (loadPage == 'LIVE' && data.live_high_list.length == 0)) {
                onPressDot(0);
              } else {
                if(loadPage == 'ZZIM') {
                  onPressDot(3);
                } else if(loadPage == 'LIVE') {
                  if(zzimItemUseYn != 'Y') {
                    onPressDot(3);
                  } else {
                    onPressDot(4);
                  }
                }
              }
            } else if(loadPage == 'REQ') {
              onPressDot(1);
            } else {
              tabs.map((item: any, index) => {
                if(item.type == loadPage) {
                  onPressDot(index);
                }
              });
            };
  
            navigation.setParams({ loadPage: 'RES' });
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ################################################################################# 프로필 열람 팝업 활성화
  const popupProfileOpen = async (
    match_seq: any,
    trgt_member_seq: any,
    type: any,
    profile_open_yn: any,
    member_status: any,
    match_type: any,
    special_interest_yn: any,
    message: any,
    nickname: any,
  ) => {
    
    if(member_status != 'ACTIVE') {
      let msg = '최근에 휴면 또는 탈퇴를 하신 회원이에요.';
      
      if(member_status == 'APPROVAL') {
        msg = '해당 회원은 가입심사 대기중 회원이에요.';
      } else if(member_status == 'BLOCK' || member_status == 'RESTRICT') {
        msg = '해당 회원은 계정이 정지된 회원이에요.';
      }

      show({
        title: '프로필 열람 실패',
        content: msg,
      });

      return;
    };
    
    // 찐심인 경우 열람통과
    if (special_interest_yn == 'N' && profile_open_yn == 'N') {
      setProfileOpenMessage(message);
      setIsProfileOpenVisible(true);

      setProfileOpenData({
        ...profileOpenData,
        match_seq: match_seq,
        nickname: nickname,
        message: message,
        trgt_member_seq: trgt_member_seq,
        type: type,
        match_type: match_type,
      });

    } else {
      navigation.navigate(STACK.COMMON, { screen: 'MatchDetail', params: {
        matchSeq: match_seq,
        trgtMemberSeq: trgt_member_seq,
        type: type,
        matchType: match_type,
        message: message,
      } });

      navigation.setParams({ loadPage: type });
    }
  };

  // ################################################################################# 프로필 열람 이동
  const goProfileOpen = async (match_seq:any, trgt_member_seq:any, type:any, match_type:any, message:string) => {
    let req_profile_open_yn = '';
    let res_profile_open_yn = '';

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      if (type == 'REQ' || match_type == 'LIVE_REQ') {
        req_profile_open_yn = 'Y';
      } else if (type == 'RES' || match_type == 'LIVE_RES') {
        res_profile_open_yn = 'Y';
      }
  
      const body = {
        match_seq: match_seq,
        req_profile_open_yn: req_profile_open_yn,
        res_profile_open_yn: res_profile_open_yn,
      };
  
      try {
        const { success, data } = await update_match(body);

        if(success) {
          if (data.result_code == '0000') {
            
            dispatch(myProfile());
            setIsProfileOpenVisible(false);
            navigation.navigate(STACK.COMMON, { 
              screen: 'MatchDetail', 
              params: {
                matchSeq: match_seq,
                trgtMemberSeq: trgt_member_seq,
                type: type,
                matchType: match_type,
                message: message
              }
            });
  
            navigation.setParams({ loadPage: type });

          } else if (data.result_code == '6010') {
            setIsProfileOpenVisible(false);
            show({ 
              content: '보유 큐브가 부족합니다.',
              isCross: true,
              confirmCallback: function () {},
            });
          } else {
            console.log(data.result_msg);
            show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true, });
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoading(false);
      }
    }
  };

  // 라이브 탭 활성
  const onLiveTab = (type:string) => {
    if(type == 'RES') {
      setIsLiveResVisible(isLiveResVisible ? false : true);
    } else if(type == 'REQ') {
      setIsLiveReqVisible(isLiveReqVisible ? false : true);
    }
  };

  // ######################################################################################## 모두 확인 처리
  const allCheck = async (type:string) => {
    const body = {
      type: type
    };

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {
        const { success, data } = await match_check_all(body);
        if(success) {
          if (data.result_code == '0000') {
            getStorageData(true);
          } else {
            console.log(data.result_msg);
            show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        //setIsLoading(false);
      }
    }
  };

  // ######################################################################################## 초기 실행 함수
  React.useEffect(() => {
    if(isFocusStorage) {
      getStorageData(isEmptyData(params?.loadPage) ? false : true);
    }
  }, [isFocusStorage]);

  useFocusEffect(
    React.useCallback(() => {

      return () => {
        if(isEmptyData(props.route.params?.loadPage)) {
          //navigation.setParams({ headerType: '', loadPage: 'RES' });
          //setCurrentIndex(0);
        };
      };
    }, []),
  );

  // #######################################################################################################
  const onPressDot = async (index:any, type:any) => {
    if(isEmptyData(dataRef?.current)) {
      setCurrentIndex(index);
      //dataRef?.current?.snapToItem(index);
      //dataRef?.current?.scrollToIndex({index:2});
    };
  };

  // 이미지 스크롤 처리
  /* const handleScroll = async (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    let contentOffset = event.nativeEvent.contentOffset;
    let index = Math.floor(contentOffset.x / (width-10));
    setCurrentIndex(index);
  }; */

  React.useEffect(() => {

  }, []);


  /* ################################################################################ 보관함 아이템 렌더링 */
  const StorageRenderItem = React.memo(({ item, index, type }) => {
    const matchType = item?.match_type; // 매칭 유형
    const matchStatus = item?.match_status; // 매칭 상태

    let isShow = true;  // 노출 여부
    let trgt_member_seq = '';
    let profile_open_yn = 'N';
    let isBlur = false;

    let bgColor = '#F1D30E';
    let matchStatusKor = '라이크';
    if(item?.match_status == 'PROGRESS' ||  item?.match_status == 'ACCEPT' && item?.special_interest_yn == 'Y') {
      bgColor = '#E95B36';
      matchStatusKor = '슈퍼 라이크';
    }else if(item?.match_status == 'LIVE_HIGH') {
      bgColor = '#D5CD9E';
      matchStatusKor = '플러팅';
    }else if(item?.match_status == 'ZZIM') {
      bgColor = '#32F9E4';
      matchStatusKor = '찜';
    };

    // 노출 여부 설정
    if(type == 'REQ' || type == 'RES' || type == 'MATCH') {
      if(isSpecialVisible && item?.special_interest_yn == 'N') {
        isShow = false;
      }
    } else if(type == 'LIVE') {
      if((matchType == 'LIVE_RES' && !isLiveResVisible) || (matchType == 'LIVE_REQ' && !isLiveReqVisible)) {
        isShow = false;
      }
    }

    // 대상 회원 번호, 프로필 열람 여부 설정
    if(type == 'RES' || matchType == 'LIVE_RES') {
      trgt_member_seq = item?.req_member_seq;
      profile_open_yn = item?.res_profile_open_yn;

      if(item?.res_profile_open_yn == 'N') {
        isBlur = true;
      };

    } else if(type == 'REQ' || matchType == 'LIVE_REQ') {
      trgt_member_seq = item?.res_member_seq;
      profile_open_yn = 'Y';

    } else if(type == 'MATCH' || type == 'ZZIM') {
      if (item?.req_member_seq != memberSeq) {
        trgt_member_seq = item?.req_member_seq;
      } else {
        trgt_member_seq = item?.res_member_seq;
      };
      profile_open_yn = 'Y';
    };

    return (
      <>
        {isShow && 
          <SpaceView>
            {item?.special_interest_yn == 'Y' ?
              <>
                <TouchableOpacity
                  style={{marginBottom: 20}}
                  disabled={matchStatus == 'REFUSE'}
                  onPress={() => {
                    popupProfileOpen(
                      item?.match_seq,
                      trgt_member_seq,
                      type,
                      profile_open_yn,
                      item?.member_status,
                      matchType,
                      item?.special_interest_yn,
                      item?.message,
                      item?.nickname,
                    );
                }}>
                  <SpaceView>
                    <SpaceView viewStyle={_styles.listArea}>
                      <SpaceView viewStyle={[_styles.listHeader, {backgroundColor: bgColor}]}>
                        <Text style={_styles.listHeaderText}>{matchStatusKor}</Text>
                        <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                          <Image source={ICON.sparkler} style={styles.iconSize22} />
                          <Text style={[_styles.listHeaderText, {color: '#000'}]}>SILVER</Text>
                        </SpaceView>
                      </SpaceView>

                      <SpaceView viewStyle={_styles.listBody}>
                        <SpaceView>
                          <SpaceView viewStyle={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderRadius: 5, overflow: 'hidden'}}>
                            <Image source={item?.img_path} style={{width: '33%', height: height * 0.2}} />
                            <Image source={item?.img_path} style={{width: '33%', height: height * 0.2}} />
                            <Image source={item?.img_path} style={{width: '33%', height: height * 0.2}} />
                          </SpaceView>

                          <LinearGradient
                            colors={['rgba(31, 36, 39, 0.9)', 'rgba(36, 36, 36, 0.1)']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={{position: 'absolute', top: 0, right: 0, height: '100%', width: '55%', paddingRight: 5}}
                          >
                            <SpaceView mb={10} viewStyle={[_styles.faceArea,{width: '60%', marginLeft: 'auto'}]}>
                              <Text style={[_styles.faceText, {textAlign: 'center'}]}>#웃는게 예뻐요.</Text>
                            </SpaceView>
                            <Text style={[_styles.memberInfo, {textAlign: 'right'}]}>{item?.nickname}, {item?.age}</Text>
                            <Text style={[_styles.comment, {textAlign: 'right', marginTop: 5}]}>{item?.comment}한줄소개</Text>
                            <Text style={[_styles.comment, {textAlign: 'right', marginBottom: 5}]}>{item?.introduce_comment}두줄소개</Text>
                          </LinearGradient>
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>
                </TouchableOpacity>

                <ScrollView
                  style={{position: 'absolute', top: 150, right: 10, overflow: 'hidden', height: 60}}
                  showsHorizontalScrollIndicator={false}
                >
                  <SpaceView>
                    <SpaceView mb={5} viewStyle={_styles.authArea}>
                      <Image source={ICON.authEdu} style={styles.iconSize16} />
                      <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                    </SpaceView>
                    <SpaceView mb={5} viewStyle={_styles.authArea}>
                      <Image source={ICON.authJob} style={styles.iconSize16} />
                      <Text style={_styles.authText}>중견기업 대표</Text>
                    </SpaceView>
                    <SpaceView mb={5} viewStyle={_styles.authArea}>
                      <Image source={ICON.authAsset} style={styles.iconSize16} />
                      <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                    </SpaceView>
                    <SpaceView mb={5} viewStyle={_styles.authArea}>
                      <Image source={ICON.authJob} style={styles.iconSize16} />
                      <Text style={_styles.authText}>중견기업 대표</Text>
                    </SpaceView>
                  </SpaceView>
                </ScrollView>
              </>
              :
              <>
                <TouchableOpacity
                  style={{marginBottom: 20}}
                  disabled={matchStatus == 'REFUSE'}
                  onPress={() => {
                    popupProfileOpen(
                      item?.match_seq,
                      trgt_member_seq,
                      type,
                      profile_open_yn,
                      item?.member_status,
                      matchType,
                      item?.special_interest_yn,
                      item?.message,
                      item?.nickname,
                    );
                  }}>
                  <SpaceView>
                    <SpaceView viewStyle={_styles.listArea}>
                      <SpaceView viewStyle={[_styles.listHeader, {backgroundColor: bgColor}]}>
                        <Text style={_styles.listHeaderText}>{matchStatusKor}</Text>
                        <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                          <Image source={ICON.sparkler} style={styles.iconSize22} />
                          <Text style={[_styles.listHeaderText, {color: '#000'}]}>SILVER</Text>
                        </SpaceView>
                      </SpaceView>

                      <SpaceView viewStyle={_styles.listBody}>
                        <Image source={item?.img_path} style={_styles.renderItemContainer} />
                        <SpaceView mt={25}>
                          <Text style={_styles.memberInfo}>{item?.nickname}, {item?.age}</Text>
                          <Text style={_styles.comment}>{item?.comment}한줄소개</Text>
                          <Text style={_styles.comment}>{item?.introduce_comment}두줄소개</Text>
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>
                </TouchableOpacity>

                <ScrollView
                  style={{position: 'absolute', top: 40, left: 105}}
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                >
                  <SpaceView viewStyle={[layoutStyle.row]}>
                    <SpaceView viewStyle={_styles.faceArea}>
                      <Text style={_styles.faceText}>#웃는게 예뻐요.</Text>
                    </SpaceView>
                    <SpaceView ml={10} viewStyle={_styles.authArea}>
                      <Image source={ICON.authEdu} style={styles.iconSize16} />
                      <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                    </SpaceView>
                    <SpaceView ml={10} viewStyle={_styles.authArea}>
                      <Image source={ICON.authEdu} style={styles.iconSize16} />
                      <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                    </SpaceView>
                    <SpaceView ml={10} viewStyle={_styles.authArea}>
                    <Image source={ICON.authAsset} style={styles.iconSize16} />
                      <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                    </SpaceView>
                  </SpaceView>
                </ScrollView>
              </>
            }
          </SpaceView>
        }
      </>
    );
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    // 새로고침을 시작할 때 호출되는 함수
    //setIsRefreshing(true);

    // 여기에서 데이터를 새로고침하거나 API 호출을 수행하세요.
    // 새로운 데이터를 가져온 후 setData로 업데이트합니다.

    // 데이터를 업데이트한 후 새로고침 상태를 false로 설정합니다.
    //setIsRefreshing(false);
  };

  return (
    <>
      {isLoading && <CommonLoading />}

      {props.route.params?.headerType == 'common' ? (
        <CommonHeader title={'보관함'} />
      ) : (
        <TopNavigation currentPath={''} />
      )}

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.wrap}
      >
        <SpaceView mt={10}>
          <SpaceView viewStyle={layoutStyle.alignCenter}>
            <SpaceView viewStyle={_styles.tabArea}>
              {tabs.map((item, index) => (
                <>
                  <SpaceView key={index}>
                    <TouchableOpacity onPress={() => { onPressDot(index); }}>
                        <Text style={_styles.tabText(currentIndex == index)}>{item.title}</Text>
                    </TouchableOpacity>
                  </SpaceView>
                </>
              ))}
            </SpaceView>
          </SpaceView>
        </SpaceView>

        <SpaceView viewStyle={{flex: 1, height: height}} mb={200} mt={40}>
          {!tabs[currentIndex].data.length ?
              <SpaceView viewStyle={_styles.noData}>
                <Text ref={dataRef} style={_styles.noDataText}>
                  {tabs[currentIndex].title}이 없습니다.   
                </Text>
              </SpaceView>
              :
              <FlatList
              ref={dataRef}
              data={tabs[currentIndex].data}
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const type = tabs[currentIndex].type;

                return (
                  <View key={index}>
                    <StorageRenderItem item={item} index={index} type={type} />
                  </View>
                )
              }}
            />
          }


        </SpaceView>
      </LinearGradient>


      {/* ####################################################################################################
      ##################################### 프로필 열람 팝업
      #################################################################################################### */}
      <Modal visible={isProfileOpenVisible} transparent={true}>
        <SpaceView viewStyle={modalStyle.modalBackground}>
          <LinearGradient 
            colors={['#3D4348', '#1A1E1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={modalStyle.modalStyle1}>
              <SpaceView viewStyle={[layoutStyle.alignCenter, modalStyle.modalHeader, {borderColor: '#EDEDED'}]}>
                <CommonText fontWeight={'700'} type={'h5'} color={'#D5CD9E'}>프로필 열람</CommonText>
              </SpaceView>

              <SpaceView viewStyle={[modalStyle.modalBody]}>
                {isEmptyData(profileOpenData.message) && (
                  <SpaceView mt={-5} mb={10} viewStyle={_styles.openPopupMessageArea}>
                    <Text style={_styles.openPopupMessageTit}>{profileOpenData.nickname}님의 메시지</Text>

                    <ScrollView style={{maxHeight: 100}} showsVerticalScrollIndicator={false}>
                      <Text style={_styles.openPopupMessageText}>"{profileOpenData.message}"</Text>
                    </ScrollView>
                  </SpaceView>
                )}

                <SpaceView mt={7} viewStyle={_styles.openPopupDescArea}>
                  <Text style={_styles.openPopupDescText}>상대방의 프로필을 열람 하시겠습니까?</Text>

                </SpaceView>
              </SpaceView>

              <View style={modalStyle.modalBtnContainer}>
                <TouchableOpacity
                  style={[modalStyle.modalBtn, {backgroundColor: '#FFF', borderBottomLeftRadius: 20}]}
                  onPress={() => { setIsProfileOpenVisible(false); }}>
                  <CommonText textStyle={{fontSize: 16}} fontWeight={'600'} color={'#445561'}>취소하기</CommonText>
                </TouchableOpacity>

                <View style={modalStyle.modalBtnline} />

                <TouchableOpacity
                  style={[modalStyle.modalBtn, {backgroundColor: '#FFDD00', borderBottomRightRadius: 20}]}
                  onPress={() => { goProfileOpen(profileOpenData.match_seq, profileOpenData.trgt_member_seq, profileOpenData.type, profileOpenData.match_type, profileOpenData.message); }}>
                  <CommonText textStyle={{fontSize: 16}} fontWeight={'600'} color={'#445561'}>확인하기</CommonText>
                  <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={styles.iconSquareSize(25)} source={ICON.polygonGreen} resizeMode={'contain'} />
                    <Text style={_styles.openPopupDescIcon}>15</Text>
                  </SpaceView>
                </TouchableOpacity>
              </View>
          </LinearGradient>
        </SpaceView>
      </Modal>
    </>
  );
};



{/* ######################################################################################################
################################################ Style 영역 ##############################################
###################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    padding: 10,
  },
  tabArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#292F33',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '60%',
  },
  tabText: (isOn: boolean) => {
		return {
			fontFamily: 'MinSans-Bold',
			color: isOn ? '#FFDD00' : '#445561',
		};
	},
  listArea: {
    backgroundColor: '#1A1E1C',
    borderRadius: 5,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1D30E',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  listHeaderText: {
    fontFamily: 'MinSans-Bold',
    color: '#FFF6BE',
  },
  listBody: {
    flexDirection: 'row',
    padding: 10,
  },
  renderItemContainer: {
    width: (width - 54) / 4,
    height: (width - 54) / 4,
    borderRadius: 100,
    backgroundColor: '#FFDD00',
    borderWidth: 2,
    borderColor: '#FFDD00',
    overflow: 'hidden',
  },
  faceArea: {
    backgroundColor: '#FFF8CC',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  faceText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#4A4846',
  },
  authArea: {
    backgroundColor: 'rgba(112, 112, 112, 0.6)',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    //justifyContent: 'center',
    alignItems: 'center',
  },
  authText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#FFF',
    marginLeft: 5,
  },
  memberInfo: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    color: '#FFDD00',
    marginTop: 5,
    marginLeft: 10,
  },
  comment: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#D5CD9E',
    marginLeft: 10,
  },
  noData: {
    paddingHorizontal: 20,
    height: height - 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#445561',
  },
  openPopupMessageArea: {
    width: '100%',
    backgroundColor: '#445561',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  openPopupMessageTit: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#D5CD9E',
    marginBottom: 10,
  },
  openPopupMessageText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#D5CD9E',
  },
  openPopupDescArea: {
    alignItems: 'center',
  },
  openPopupDescText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#D5CD9E',
  },
  openPopupDescIcon: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    color: '#32F9E4',
    marginLeft: 3,
  },
});