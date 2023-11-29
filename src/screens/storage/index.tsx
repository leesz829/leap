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
    tgt_member_seq: 0,
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

          if(zzimItemUseYn == 'Y') {
            tabsData.push({
              type: 'ZZIM',
              title: '찜 목록',
              data: zzimTrgtListData,
              isNew: false,
            });
          };

          if(liveHighListData.length > 0) {
            tabsData.push({
              type: 'LIVE',
              title: 'LIVE',
              data: liveHighListData,
              isNew: data.live_res_new_yn == 'Y' ? true : false,
            });
          };


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
    tgt_member_seq: any,
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
        tgt_member_seq: tgt_member_seq,
        type: type,
        match_type: match_type,
      });

    } else {
      navigation.navigate(STACK.COMMON, { screen: 'StorageProfile', params: {
        matchSeq: match_seq,
        tgtMemberSeq: tgt_member_seq,
        type: type,
        matchType: match_type,
      } });

      navigation.setParams({ loadPage: type });
    }
  };

  // ################################################################################# 프로필 열람 이동
  const goProfileOpen = async (match_seq:any, tgt_member_seq:any, type:any, match_type:any) => {
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
              screen: 'StorageProfile', 
              params: {
                matchSeq: match_seq,
                tgtMemberSeq: tgt_member_seq,
                type: type,
                matchType: match_type
              }
            });
  
            navigation.setParams({ loadPage: type });
  
          } else if (data.result_code == '6010') {
            show({ content: '보유 패스가 부족합니다.', isCross: true, });
            return false;
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
    if(currentIndex == 0 || currentIndex == 1) {
      tabScrollRef?.current?.scrollTo({x:0, animated:true});
    } else if(currentIndex > 2) {
      tabScrollRef?.current?.scrollToEnd({animated: true});
    }
  }, [currentIndex]);


  /* ################################################################################ 보관함 아이템 렌더링 */
  const StorageRenderItem = React.memo(({ item, index, type, tabColor }) => {
    const matchType = item.match_type; // 매칭 유형
    const matchStatus = item.match_status; // 매칭 상태

    let isShow = true;  // 노출 여부
    let tgt_member_seq = '';
    let profile_open_yn = 'N';
    let isBlur = false;

    // 노출 여부 설정
    if(type == 'REQ' || type == 'RES' || type == 'MATCH') {
      if(isSpecialVisible && item.special_interest_yn == 'N') {
        isShow = false;
      }
    } else if(type == 'LIVE') {
      if((matchType == 'LIVE_RES' && !isLiveResVisible) || (matchType == 'LIVE_REQ' && !isLiveReqVisible)) {
        isShow = false;
      }
    }

    // 대상 회원 번호, 프로필 열람 여부 설정
    if(type == 'RES' || matchType == 'LIVE_RES') {
      tgt_member_seq = item.req_member_seq;
      profile_open_yn = item.res_profile_open_yn;

      if(item.res_profile_open_yn == 'N') {
        isBlur = true;
      };

    } else if(type == 'REQ' || matchType == 'LIVE_REQ') {
      tgt_member_seq = item.res_member_seq;
      profile_open_yn = 'Y';

    } else if(type == 'MATCH' || type == 'ZZIM') {
      if (item.req_member_seq != memberSeq) {
        tgt_member_seq = item.req_member_seq;
      } else {
        tgt_member_seq = item.res_member_seq;
      };
      profile_open_yn = 'Y';
    };

    return (
      <>
        {isShow && 

          <TouchableOpacity
            disabled={matchStatus == 'REFUSE'}
            onPress={() => {
              popupProfileOpen(
                item.match_seq,
                tgt_member_seq,
                type,
                profile_open_yn,
                item.member_status,
                matchType,
                item.special_interest_yn,
                item.message,
                item.nickname,
              );
            }}>
            <SpaceView mt={40}>
              <SpaceView viewStyle={_styles.listArea}>
                <SpaceView viewStyle={_styles.listHeader}>
                  <Text style={_styles.listHeaderText}>라이크</Text>
                  <SpaceView viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                    <Image source={ICON.sparkler} style={styles.iconSize22} />
                    <Text style={[_styles.listHeaderText, {color: '#000'}]}>SILVER</Text>
                  </SpaceView>
                </SpaceView>
                <SpaceView viewStyle={_styles.listBody}>
                  <Image source={item.img_path} style={_styles.renderItemContainer} />
                  <SpaceView>
                    <ScrollView horizontal={true} contentContainerStyle={[layoutStyle.row, layoutStyle.alignStart]}>
                      <SpaceView ml={10} viewStyle={_styles.faceArea}>
                        <Text style={_styles.faceText}>#웃는게 예뻐요.</Text>
                      </SpaceView>
                      <SpaceView ml={10} viewStyle={_styles.authArea}>
                        <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                      </SpaceView>
                      <SpaceView ml={10} viewStyle={_styles.authArea}>
                        <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                      </SpaceView>
                      <SpaceView ml={10} viewStyle={_styles.authArea}>
                        <Text style={_styles.authText}>T.H.E 상위 대학 석사</Text>
                      </SpaceView>
                    </ScrollView>
                    <Text style={_styles.memberInfo}>{item.nickname}, {item.age}</Text>
                    <Text style={_styles.comment}>{item.comment}</Text>
                    <Text style={_styles.comment}>{item.introduce_comment}</Text>
                  </SpaceView>
                </SpaceView>
              </SpaceView>
            </SpaceView>
          </TouchableOpacity>
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
        <ScrollView>
          <SpaceView mt={10}>
            <SpaceView viewStyle={layoutStyle.alignCenter}>
              <SpaceView viewStyle={_styles.tabArea}>
                <TouchableOpacity onPress={() => (setCurrentIndex(0))}>
                  <Text style={_styles.tabText(currentIndex == 0)}>받은관심</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => (setCurrentIndex(1))}>
                  <Text style={_styles.tabText(currentIndex == 1)}>보낸관심</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => (setCurrentIndex(2))}>
                  <Text style={_styles.tabText(currentIndex == 2)}>매칭성공</Text>
                </TouchableOpacity>  
              </SpaceView>
            </SpaceView>
            
            <Carousel
              ref={dataRef}
              data={tabs}
              firstItem={currentIndex}
              //onSnapToItem={setCurrentIndex}
              onBeforeSnapToItem={setCurrentIndex}
              //activeAnimationType={'spring'}
              sliderWidth={width}
              itemWidth={width}
              pagingEnabled
              renderItem={({item, index}) => {
                const type = item.type;

                return (
                  <>
                    {(tabs[currentIndex]?.type == type && !isLoading) &&
                      <View key={'storage_' + index}>
                        {item.data.length == 0 ? (
                          <SpaceView viewStyle={_styles.noData}>
                            <Text style={_styles.noDataText}>{item.title}이 없습니다.</Text>
                          </SpaceView>
                        ) : (
                          <>
                            {(isSpecialVisible && !item.isSpecialExists && item.type != 'ZZIM' && item.type != 'LIVE') ? (
                              <SpaceView viewStyle={_styles.noData}>
                                <Text style={_styles.noDataText}>찐심이 없습니다.</Text>
                              </SpaceView>
                            ) : (
                              <>
                                  <FlatList
                                    data={item.data}
                                    keyExtractor={(item, index) => index.toString()}
                                    removeClippedSubviews={true}
                                    getItemLayout={(data, index) => (
                                      {
                                          length: (width - 54) / 2,
                                          offset: ((width - 54) / 2) * index,
                                          index
                                      }
                                    )}
                                    renderItem={({ item: innerItem, index: innerIndex }) => {
                                      return (
                                        <View key={index}>
                                          <StorageRenderItem item={innerItem} index={innerIndex} type={type} />
                                        </View>
                                      )
                                    }}
                                  />
                              </>
                            )}
                          </>
                        )}
                      </View>
                    }
                  </>
                )
              }}
            />
          </SpaceView>
        </ScrollView>
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
    width: '50%',
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
    width: '95%',
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
    backgroundColor: '#878787',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  authText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#FFF',
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
    color: '#FFDD00',
  },
});