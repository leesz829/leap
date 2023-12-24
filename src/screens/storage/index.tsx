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
import { ICON, IMAGE, findSourcePath } from 'utils/imageUtils';
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
  const [isLoading, setIsLoading] = useState(true);

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

  const [profileOpenMessage, setProfileOpenMessage] = React.useState('');


  /* ################################################
   ######## Storage Data 구성
   ######## - resLikeList : 내가 받은 관심 목록
   ######## - reqLikeList : 내가 받은 관심 목록
   ######## - matchTrgtList : 내가 받은 관심 목록
   #################################################*/
  const [dataStorage, setDataStorage] = React.useState<any>({
    resList: [],
    reqList: [],
    successList: [],
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
    },
    {
      type: 'REQ',
      title: '보낸 관심',
      data: [],
      isNew: false,
    },
    {
      type: 'MATCH',
      title: '성공 매칭',
      data: [],
      isNew: false,
    },
  ]);

  // ################################################################################# 보관함 정보 조회
  const getStorageData = async (isReal:boolean) => {
    setIsLoading(true);

    try {
      const body = {
        newYn: 'Y',
      };

      const { success, data } = await get_member_storage(body);
      if(success) {
        if (data.result_code != '0000') {
          console.log(data.result_msg);
          return false;
        } else {

          // ##### 회원 기본 정보 갱신
          dispatch(setPartialPrincipal({ mbr_base : data.mbr_base }));

          // ##### 보관함 데이터 구성
          let tabsData = [];

          let resListData = [];
          let reqListData = [];
          let successListData = [];
          let zzimListData = [];
          let zzimItemUseYn = data?.zzim_item_use_yn;

          /* resListData = dataUtils.getStorageListData(data?.res_list);
          reqListData = dataUtils.getStorageListData(data?.req_list);
          successListData = dataUtils.getStorageListData(data?.success_list); */

          resListData = data?.res_list;
          reqListData = data?.req_list;
          successListData = data?.success_list;

          if(isEmptyData(data?.zzim_list)) {
            zzimListData = data?.zzim_list;
          }

          // tabs 데이터 구성
          tabsData = [
            {
              type: 'RES',
              title: '받은 관심',
              data: resListData,
              isNew: data?.res_new_yn == 'Y' ? true : false,
            },
            {
              type: 'REQ',
              title: '보낸 관심',
              data: reqListData,
              isNew: false,
            },
            {
              type: 'MATCH',
              title: '성공 매칭',
              data: successListData,
              isNew: data?.succes_new_yn == 'Y' ? true : false,
            },
          ];

          if(zzimItemUseYn == 'Y') {
            tabsData.push({
              type: 'ZZIM',
              title: '찜하기',
              data: zzimListData,
              isNew: false,
            });
          };

          setDataStorage({
            ...dataStorage,
            resList: resListData,
            reqList: reqListData,
            successList: successListData,
            zzimItemUseYn: data?.zzim_item_use_yn,
          });

          setTabs(tabsData);

          /* if(!isReal) {
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
          } */
          
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

      show({ title: '프로필 열람 실패', content: msg });
      return;
    };
    
    // 찐심인 경우 열람통과
    if (special_interest_yn == 'N' && profile_open_yn == 'N') {
      setProfileOpenMessage(message);

      show({
        title: '블라인드 카드 열람',
        content: '큐브 15개로 블라인드 카드를 열람하시겠습니까?' ,
        passAmt: 15,
        cancelCallback: function() {},
        confirmCallback: function() {
          goProfileOpen(match_seq, trgt_member_seq, match_type, message);
        }
      });

    } else {
      navigation.navigate(STACK.COMMON, { 
        screen: 'MatchDetail',
        params: {
          matchSeq: match_seq,
          trgtMemberSeq: trgt_member_seq,
          type: 'STORAGE',
          matchType: match_type,
          message: message,
        }
      });

      navigation.setParams({ loadPage: type });
    }
  };

  // ################################################################################# 프로필 열람 이동
  const goProfileOpen = async (match_seq:any, trgt_member_seq:any, match_type:any, message:string) => {
    let req_profile_open_yn = '';
    let res_profile_open_yn = '';

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      if(match_type == 'REQ') {
        req_profile_open_yn = 'Y';
      } else if(match_type == 'RES') {
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
            navigation.navigate(STACK.COMMON, { 
              screen: 'MatchDetail', 
              params: {
                matchSeq: match_seq,
                trgtMemberSeq: trgt_member_seq,
                type: 'STORAGE',
                matchType: match_type,
                message: message
              }
            });
  
            navigation.setParams({ loadPage: type });

          } else if (data.result_code == '6010') {
            show({ content: '보유 큐브가 부족합니다.', isCross: true });
          } else {
            show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true });
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

  /* ################################################################################ 보관함 아이템 렌더링 */
  const StorageRenderItem = React.memo(({ item, index }) => {
    //const _type = item?.type; // 유형
    const _matchType = item?.match_type; // 매칭 유형
    const _matchStatus = item?.match_status; // 매칭 상태
    const _trgtMemberSeq = item?.trgt_member_seq; // 
    const _imgFilePath = findSourcePath(item?.img_file_path);
    const _comment = item?.comment;
    const _nickname = item?.nickname;
    const _age = item?.age;
    const _faceModifier = item?.face_modifier; // 인상 수식어
    const _socialGrade = item?.social_grade;
    const _profileOpenYn = item?.profile_open_yn;

    const _authList = item?.auth_list;
    const _imgList = item?.img_list;

    let isShow = true;  // 노출 여부
    let profileOpenYn = item?.profile_open_yn; // 프로필 열람 여부
    let isBlur = false;

    let bgColor = '#F1D30E';
    let matchStatusKor = '라이크';

    if(_matchStatus == 'REFUSE') {
      bgColor = '#333B41';
    } else {
      if((_matchStatus == 'PROGRESS' ||  _matchStatus == 'ACCEPT') && item?.special_interest_yn == 'Y') {
        bgColor = '#E95B36';
        matchStatusKor = '슈퍼 라이크';
      } else if(_matchStatus == 'LIVE_HIGH') {
        bgColor = '#D5CD9E';
        matchStatusKor = '플러팅';
      } else if(_matchStatus == 'ZZIM') {
        bgColor = '#32F9E4';
        matchStatusKor = '찜';
      };
    }

    // 대상 회원 번호, 프로필 열람 여부 설정
    /* if(_type == 'RES' || matchType == 'LIVE_RES') {
      profile_open_yn = item?.res_profile_open_yn;

      if(item?.res_profile_open_yn == 'N') {
        isBlur = true;
      };

    } else if(_type == 'REQ' || matchType == 'LIVE_REQ') {
      profile_open_yn = 'Y';

    } else if(type == 'MATCH' || type == 'ZZIM') {
      profile_open_yn = 'Y';
    }; */


    /* 상세 이동 함수 */
    const goDetailFn = () => {
      popupProfileOpen(
        item?.match_seq,
        _trgtMemberSeq,
        'STORAGE',
        _profileOpenYn,
        item?.member_status,
        _matchType,
        item?.special_interest_yn,
        item?.message,
        item?.nickname,
      );
    };

    return (
      <>
        {isShow && 
          <SpaceView>
            {/* ############################################################################# 찐심 UI 구분 */}
            {item?.special_interest_yn == 'Y' ? (
              <>
                <TouchableOpacity
                  style={{marginBottom: 20}}
                  activeOpacity={0.7}
                  onPress={goDetailFn}
                >
                  <SpaceView>
                    <SpaceView viewStyle={_styles.listArea}>
                      <SpaceView viewStyle={[_styles.listHeader, {backgroundColor: bgColor}]}>
                        <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                          <Image source={ICON.sparkler} style={styles.iconSquareSize(16)} />
                          <Text style={_styles.listHeaderText}>{_socialGrade}</Text>
                        </SpaceView>

                        <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                          <Text style={_styles.listHeaderDdayText}>
                            {item.keep_end_day > 0 ? item.keep_end_day + '일 남음' : '오늘까지'}
                            {_matchStatus == 'REFUSE' && '(매칭거절)'}
                          </Text>
                        </SpaceView>
                      </SpaceView>

                      <SpaceView viewStyle={_styles.listBody}>
                        <SpaceView>
                          <SpaceView viewStyle={{width: '100%', flexDirection: 'row', justifyContent: 'space-between', borderRadius: 5, overflow: 'hidden'}}>
                            <Image source={findSourcePath(_imgList[0]?.img_file_path)} style={{width: '33%', height: 193}} />
                            <Image source={findSourcePath(_imgList[1]?.img_file_path)} style={{width: '33%', height: 193}} />
                            <Image source={findSourcePath(_imgList[2]?.img_file_path)} style={{width: '33%', height: 193}} />
                          </SpaceView>

                          <LinearGradient
                            colors={['rgba(31, 36, 39, 0.9)', 'rgba(36, 36, 36, 0.1)']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 0 }}
                            style={{position: 'absolute', top: 0, right: 0, height: '100%', width: '67%', paddingRight: 5}}
                          >
                            {isEmptyData(_faceModifier) && (
                              <SpaceView viewStyle={[_styles.faceArea, {marginLeft: 'auto'}]}>
                                <Text style={[_styles.faceText, {textAlign: 'center'}]}>#{_faceModifier}</Text>
                              </SpaceView>
                            )}
                            <SpaceView mt={5} ml={10}><Text style={[_styles.memberInfo, {textAlign: 'right'}]}>{_nickname}, {_age}</Text></SpaceView>
                            <SpaceView ml={10} mt={5}><Text style={[_styles.comment, {textAlign: 'right'}]} numberOfLines={2}>{_comment}</Text></SpaceView>
                            {/* <Text style={[_styles.comment, {textAlign: 'right', marginBottom: 5}]}>{item?.introduce_comment}두줄소개</Text> */}
                          </LinearGradient>
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>
                </TouchableOpacity>

                {/* <ScrollView
                  style={{position: 'absolute', top: 150, right: 10, overflow: 'hidden', height: 100}}
                  showsHorizontalScrollIndicator={false}
                >
                  <SpaceView>
                    {_authList.map((i, n) => {
                      const isLast = _authList.length == (n+1) ? true : false;
                      return (
                        <SpaceView key={_trgtMemberSeq + n} mb={5} viewStyle={_styles.authArea}>
                          <Image source={ICON.authEdu} style={styles.iconSize16} />
                          <Text style={_styles.authText}>{i.slogan_name}</Text>
                        </SpaceView>
                      )
                    })}
                  </SpaceView>
                </ScrollView> */}

                <ScrollView
                  style={{position: 'absolute', bottom: -40, left: 10, right: 10, overflow: 'hidden', height: 100}}
                  showsHorizontalScrollIndicator={false}
                  horizontal={true}
                >
                  <SpaceView viewStyle={{flexDirection: 'row'}}>
                    {_authList.map((i, n) => {
                      const isLast = _authList.length == (n+1) ? true : false;
                      return (
                        <SpaceView key={_trgtMemberSeq + n} mr={isLast ? 10 : 5} viewStyle={_styles.authArea}>
                          <Image source={ICON.authEdu} style={styles.iconSize16} />
                          <Text style={_styles.authText}>{i.slogan_name}</Text>
                        </SpaceView>
                      )
                    })}
                  </SpaceView>
                </ScrollView>
              </>
            ) : (
              <>
                <SpaceView mb={20}>
                  <SpaceView viewStyle={_styles.listArea}>
                    
                    <SpaceView viewStyle={[_styles.listHeader, {backgroundColor: bgColor}]}>
                      <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                        <Image source={ICON.sparkler} style={styles.iconSquareSize(16)} />
                        <Text style={_styles.listHeaderText}>{_socialGrade}</Text>

                        {isEmptyData(item?.live_face) && (
                          <SpaceView ml={15}>
                            <Text style={_styles.listHeaderLiveFaceText}><Text style={{fontFamily: 'Pretendard-Bold'}}>|</Text>  "{item?.live_face}"</Text>
                          </SpaceView>
                        )}
                      </SpaceView>
                      <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                        <Text style={_styles.listHeaderDdayText}>
                          {item.keep_end_day > 0 ? item.keep_end_day + '일 남음' : '오늘까지'}
                          {_matchStatus == 'REFUSE' && '(매칭거절)'}
                        </Text>
                      </SpaceView>
                    </SpaceView>

                    <SpaceView viewStyle={_styles.listBody}>

                      {/* 대표 이미지 */}
                      <TouchableOpacity onPress={goDetailFn}>
                        <Image source={_imgFilePath} style={_styles.renderItemContainer} />

                        {/* 열람 여부 표시 */}
                        {profileOpenYn == 'N' && (
                          <SpaceView viewStyle={_styles.openYnMark}>
                            <Image source={ICON.yBlue} style={styles.iconSquareSize(18)} />
                          </SpaceView>
                        )}
                      </TouchableOpacity>
                    
                      <SpaceView viewStyle={{flex :1, flexWrap: 'nowrap'}}>

                        {/* 인상, 인증 정보 노출 */}
                        {(isEmptyData(_faceModifier) || _authList.length > 0) && (
                          <ScrollView
                            style={{marginLeft: 10, marginTop: 5,}}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                          >
                            <SpaceView viewStyle={[layoutStyle.row]}>

                              {isEmptyData(_faceModifier) && (
                                <SpaceView mr={5} viewStyle={_styles.faceArea}><Text style={_styles.faceText}>#{_faceModifier}</Text></SpaceView>
                              )}

                              {_authList.map((i, n) => {
                                const isLast = _authList.length == (n+1) ? true : false;
                                return (
                                  <SpaceView key={_trgtMemberSeq + n} mr={isLast ? 90 : 5} viewStyle={_styles.authArea}>
                                    <Image source={ICON.authEdu} style={styles.iconSize16} />
                                    <Text style={_styles.authText}>{i.slogan_name}</Text>
                                  </SpaceView>
                                )
                              })}
                            </SpaceView>
                          </ScrollView>
                        )}

                        {/* 닉네임, 나이, 소개 정보 */}
                        <TouchableOpacity onPress={goDetailFn}>
                          <SpaceView ml={10}><Text style={_styles.memberInfo}>{_nickname}, {_age}</Text></SpaceView>
                          <SpaceView ml={10}><Text style={_styles.comment} numberOfLines={2}>{_comment}</Text></SpaceView>
                        </TouchableOpacity>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>
                </SpaceView>
              </>
            )}
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
        {!isLoading && (
          <>
            {/* ############################################################################################################
            ###### 탭 영역
            ############################################################################################################ */}
            <SpaceView mb={10}>
              <SpaceView viewStyle={layoutStyle.alignCenter}>
                <SpaceView viewStyle={_styles.tabArea}>
                  {tabs.map((item, index) => (
                    <>
                      <SpaceView key={index} viewStyle={{paddingHorizontal: 5}}>
                        <TouchableOpacity onPress={() => { onPressDot(index); }}>
                            <Text style={_styles.tabText(currentIndex == index)}>{item.title}</Text>
                        </TouchableOpacity>
                      </SpaceView>
                    </>
                  ))}
                </SpaceView>
              </SpaceView>
            </SpaceView>

            {/* ############################################################################################################
            ###### 컨텐츠 영역
            ############################################################################################################ */}
            <SpaceView viewStyle={{flex: 1}} mb={180} mt={40}>
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
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                      const type = tabs[currentIndex].type;

                      return (
                        <View key={index}>
                          <StorageRenderItem item={item} index={index} />
                        </View>
                      )
                    }}
                  />
              }
            </SpaceView>
          </>
        )}
      </LinearGradient>
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
    //width: '60%',
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
    paddingHorizontal: 5,
  },
  listHeaderText: {
    fontFamily: 'MinSans-Bold',
    color: '#000000',
  },
  listHeaderDdayText: {
    fontFamily: 'Pretendard-Bold',
    color: '#000000',
  },
  listHeaderLiveFaceText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    color: '#000000',
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
    alignItems: 'center',
    justifyContent: 'center',
    height: 25,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 25,
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
  },
  comment: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#D5CD9E',
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
  openYnMark: {
    position: 'absolute',
    top: 0,
    left: 0,
  },


});