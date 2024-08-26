import { ColorType, BottomParamList, ScreenNavigationProp } from '@types';
import { commonStyle, styles, layoutStyle, modalStyle } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { Wallet } from 'component/TopNavigation';
import * as React from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet, Dimensions, Text, FlatList, Platform } from 'react-native';
import { ICON, IMAGE, findSourcePath } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { useState, useRef } from 'react';
import axios from 'axios';
import { useUserInfo } from 'hooks/useUserInfo';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useIsFocused, CommonActions, useFocusEffect } from '@react-navigation/native';
import * as dataUtils from 'utils/data';
import { useDispatch } from 'react-redux';
import { get_member_storage, update_match, match_check_all } from 'api/models';
import { usePopup } from 'Context';
import { STACK } from 'constants/routes';
import CommonHeader from 'component/CommonHeader';
import { myProfile } from 'redux/reducers/authReducer';
import Carousel from 'react-native-snap-carousel';
import ToggleSwitch from 'toggle-switch-react-native';
import { isEmptyData } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { BlurView } from "@react-native-community/blur";
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import Image from 'react-native-fast-image';
import ListItem from 'component/storage/ListItem';
import RecommendBanner from 'component/common/RecommendBanner';




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

  const memberBase = useUserInfo(); // 회원 기본정보

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
      interestList: [],
      specialList: [],
      isNew: false,
    },
    {
      type: 'REQ',
      title: '보낸 관심',
      data: [],
      interestList: [],
      specialList: [],
      isNew: false,
    },
    {
      type: 'MATCH',
      title: '성공 매칭',
      data: [],
      interestList: [],
      specialList: [],
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

          let resIntList = [];
          let resSpeList = [];
          let reqIntList = [];
          let reqSpeList = [];
          let succIntList = [];
          let succSpeList = [];
          
          /* resListData = dataUtils.getStorageListData(data?.res_list);
          reqListData = dataUtils.getStorageListData(data?.req_list);
          successListData = dataUtils.getStorageListData(data?.success_list); */

          resListData = data?.res_list;
          reqListData = data?.req_list;
          successListData = data?.success_list;

          if(isEmptyData(data?.zzim_list)) {
            zzimListData = data?.zzim_list;
          }

          // 목록 데이터 구성

          // 받은관심
          resListData.map((item: any, index) => {
            if(item.special_interest_yn == 'Y') {
              resSpeList.push(item);
            } else {
              resIntList.push(item);
            }
          });

          // 보낸관심
          reqListData.map((item: any, index) => {
            if(item.special_interest_yn == 'Y') {
              reqSpeList.push(item);
            } else {
              reqIntList.push(item);
            }
          });

          // 성공매칭
          successListData.map((item: any, index) => {
            if(item.special_interest_yn == 'Y') {
              succSpeList.push(item);
            } else {
              succIntList.push(item);
            }
          });

          // tabs 데이터 구성
          tabsData = [
            {
              type: 'RES',
              title: '받은 관심',
              data: resListData,
              interestList: resIntList,
              specialList: resSpeList,
              isNew: data?.res_new_yn == 'Y' ? true : false,
            },
            {
              type: 'REQ',
              title: '보낸 관심',
              data: reqListData,
              interestList: reqIntList,
              specialList: reqSpeList,
              isNew: false,
            },
            {
              type: 'MATCH',
              title: '성공 매칭',
              data: successListData,
              interestList: succIntList,
              specialList: succSpeList,
              isNew: data?.succes_new_yn == 'Y' ? true : false,
            },
          ];

          if(zzimItemUseYn == 'Y') {
            tabsData.push({
              type: 'ZZIM',
              title: '찜하기',
              data: zzimListData,
              interestList: [],
              specialList: [],
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
    img_file_path: any,
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

      console.log('img_file_path :::::: ' , img_file_path);

      show({
        title: '프로필 열람',
        content: nickname + '님의\n프로필을 열어 보시겠어요?' ,
        type: 'MATCH',
        passType: 'CUBE',
        passAmt: '15',
        isNoPass: memberBase?.pass_has_amt < 15 ? false : true,
        memberImg: img_file_path,
        confirmBtnText: '잠금해제',
        btnIcon: ICON.lockIcon,
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
    setCurrentIndex(index);

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

      {/* {props.route.params?.headerType == 'common' ? (
        <CommonHeader title={'보관함'} />
      ) : (
        <TopNavigation currentPath={''} />
      )} */}

      <LinearGradient
        colors={['#111931', '#111931']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.wrap}
      >
        
        <SpaceView mt={30}>
          <Text style={styles.fontStyle('H', 28, '#fff')}>보관함</Text>
        </SpaceView>

        {!isLoading && (
          <>
            {/* ############################################################################################################
            ###### 탭 영역
            ############################################################################################################ */}
            <SpaceView mt={15} mb={10}>
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

            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={{width: '100%', height: height-200}}
            >
              {tabs[currentIndex].data.length > 0 ? (
                <SpaceView mb={100}>

                  {/* ############################################################################################################
                  ###### 관심 영역
                  ############################################################################################################ */}
                  {tabs[currentIndex].specialList.length > 0 && (
                    <SpaceView mt={15}>
                      <SpaceView mb={10} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={styles.fontStyle('EB', 20, '#fff')}>관심</Text>
                        <TouchableOpacity style={_styles.specialAddBtn}>
                          <Text style={styles.fontStyle('SB', 12, '#46F66F')}>99개 보기</Text>
                        </TouchableOpacity>
                      </SpaceView>

                      <SpaceView>
                        <Carousel
                          data={tabs[currentIndex].specialList}
                          sliderWidth={Math.round(width)} 
                          itemWidth={Math.round(width-50)}
                          snapToInterval={Math.round(width-50)}
                          horizontal={true}
                          useScrollView={true}
                          inactiveSlideScale={1}
                          inactiveSlideOpacity={1}
                          inactiveSlideShift={1}
                          firstItem={tabs[currentIndex].specialList.length}
                          loop={false}
                          autoplay={false}
                          animationOptions={{
                            duration: 500, // 애니메이션 지속 시간 (밀리초)
                            easing: 'linear', // 사용할 이징 함수 ('linear', 'easeIn', 'easeOut', 'easeInOut' 등)
                            useNativeDriver: true // 네이티브 드라이버 사용 여부
                          }}
                          //style={_styles.authWrapper}
                          containerCustomStyle={{ marginLeft: -23 }}
                          pagingEnabled
                          renderItem={({ item, index }) => {
                            return (
                              <SpaceView key={index} mr={10}>
                                <ListItem type={'SPECIAL'} item={item} index={index} profileOpenFn={popupProfileOpen} />
                              </SpaceView>
                            )
                          }}
                        />
                      </SpaceView>
                    </SpaceView>
                  )}

                  {/* ############################################################################################################
                  ###### 호감 영역
                  ############################################################################################################ */}
                  <SpaceView viewStyle={{flex: 1}} /* mb={100} */ mt={20}>
                    <SpaceView mb={10} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text style={styles.fontStyle('EB', 20, '#fff')}>호감</Text>

                      <SpaceView viewStyle={{flexDirection: 'row'}}>
                        {/* <TouchableOpacity>
                          <Image source={ICON.orderIcon} style={styles.iconSquareSize(23)} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginLeft: 10}}>
                          <Image source={ICON.settingIcon} style={styles.iconSquareSize(23)} />
                        </TouchableOpacity> */}
                      </SpaceView>
                    </SpaceView>

                    {!tabs[currentIndex].interestList.length ?
                        <SpaceView viewStyle={_styles.noData}>
                          <Text ref={dataRef} style={styles.fontStyle('SB', 16, '#445561')}>
                            {tabs[currentIndex].title}{tabs[currentIndex].type == 'ZZIM' ? '가' : '이'} 없습니다.   
                          </Text>
                        </SpaceView>
                        :
                        <FlatList
                          ref={dataRef}
                          data={tabs[currentIndex].interestList}
                          keyExtractor={(item, index) => index.toString()}
                          showsHorizontalScrollIndicator={false}
                          showsVerticalScrollIndicator={false}
                          renderItem={({ item, index }) => {
                            const type = tabs[currentIndex].type;

                            return (
                              <View key={index}>
                                <ListItem type={'BASE'} item={item} index={index} profileOpenFn={popupProfileOpen} />
                              </View>
                            )
                          }}
                        />
                    }
                  </SpaceView>
                </SpaceView>
              ) : (
                <SpaceView>
                  <SpaceView viewStyle={_styles.noEmptyWrap}>
                    <Image source={memberBase?.gender == 'M' ? ICON.storageEmptyMale : ICON.storageEmptyFemale} style={styles.iconSquareSize(220)} />

                    <LinearGradient 
                      colors={['rgba(17,25,49,0.0)', 'rgba(17,25,49,1)']} 
                      start={{ x: 0, y: 0 }} 
                      end={{ x: 0, y: 1 }} style={_styles.noEmptyTextBlur} />
                    <SpaceView viewStyle={_styles.noEmptyTextWrap}>
                      <Text style={[styles.fontStyle('EB', 20, '#fff'), {textAlign: 'center'}]}>보관 중인 프로필 카드가 없습니다.{'\n'}새로운 친구를 찾아 볼까요?</Text>
                    </SpaceView>
                  </SpaceView>

                  <SpaceView mt={15}>
                    <RecommendBanner />
                  </SpaceView>
                </SpaceView>
              )}
            </ScrollView>
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
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingVertical: 5,
    //width: '60%',
  },
  tabText: (isOn: boolean) => {
		return {
			fontFamily: 'SUITE-ExtraBold',
      fontSize: 14,
			color: isOn ? '#46F66F' : '#A6B8CF',
      backgroundColor: isOn ? '#fff' : 'transparent',
      borderRadius: 25,
      paddingHorizontal: 14,
      paddingVertical: 6,
		};
	},  
  noData: {
    paddingHorizontal: 20,
    height: height - 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialAddBtn: {
    backgroundColor: '#383838',
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  noEmptyWrap: {
    height: height/2.5,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  noEmptyTextWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  noEmptyTextBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '35%',
  },


});