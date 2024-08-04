import { useIsFocused, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { ScreenNavigationProp, StackParamList } from '@types';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { get_story_board_list, profile_open, get_story_active } from 'api/models';
import { findSourcePath, IMAGE, GIF_IMG, findSourcePathLocal } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import Image from 'react-native-fast-image';
import { ICON } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import { ColorType } from '@types';
import { isEmptyData } from 'utils/functions';
import { STACK } from 'constants/routes';
import MasonryList from '@react-native-seoul/masonry-list';
import { CommonLoading } from 'component/CommonLoading';
import LinearGradient from 'react-native-linear-gradient';
import ActiveRender from 'component/story/ActiveRender';
import Talk from 'component/story/Talk';



/* ################################################################################################################
###### Story
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Story'>;
  route: RouteProp<StackParamList, 'Story'>;
}

const { width, height } = Dimensions.get('window');

export const Story = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const memberBase = useUserInfo(); // 본인 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크

  const [isTopBtn, setIsTopBtn] = useState(false);
  const [currentTab, setCurrentTab] = useState('TALK');

  const [isEmpty, setIsEmpty] = useState(false); 
  //const [storyList, setStoryList] = useState<any>([]); // 스토리 목록
  const [storyList, setStoryList] = React.useState<any>([]);
  const [pageNum, setPageNum] = useState(1); // 페이지 번호
  const [isListFinally, setIsListFinally] = useState(false); // 목록 마지막 여부

  const [activeData, setActiveData] = React.useState({
    alarmData: [],
    storyData: [],
  });

  // 스토리 유형 선택
  const goStoryEdit = async (type:string) => {
    navigation.navigate(STACK.COMMON, {
    screen: 'StoryRegi',
      params: {
        storyType : 'STORY',
      }
    });
  };

  // 스토리 알림 이동
  const goStoryActive = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'StoryActive', });
  };

  // 스토리 상세 이동
  const goStoryDetail = async (storyBoardSeq:number) => {
    navigation.navigate(STACK.COMMON, {
      screen: 'StoryDetail',
      params: {
        storyBoardSeq: storyBoardSeq,
      }
    });
  };

  // 채팅방 이동
  const goChatRoom = async () => {navigation.navigate(STACK.COMMON, { screen: 'Chat' })};

  // ##################################################################################### 탭 관련
  const [currentIndex, setCurrentIndex] = useState(0);
  const dataRef = useRef(null);

  // 탭 목록
  const [tabs, setTabs] = React.useState([
    {
      type: 'STORY',
      title: '스토리',
      data: [],
      isNew: false,
    },
    {
      type: 'ALARM',
      title: '알림',
      data: [],
      isNew: false,
    },
    {
      type: 'BOARD',
      title: '내가쓴글',
      data: [],
      isNew: false,
    },
  ]);

  // ############################################################################# 스토리 활동 정보 조회
  const getStoryActive = async () => {
    try {
      setIsLoading(true);

      const body = {
        
      };

      const { success, data } = await get_story_active(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            setActiveData({
              alarmData: data?.alarm_data,
              storyData: data?.story_data,
            });
          
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
      setIsLoading(false);
    }
  };

  /* ##################################################################################################################################
  ################## 초기 실행 함수
  ################################################################################################################################## */
  React.useEffect(() => {
    if(isFocus) {
      //getStoryActive();
    } else {
      //setStoryList([]);
    }
  }, [isFocus]);


  function CustomRefreshControl({ refreshing, onRefresh }) {
    console.log('refreshing ::::::: ' , refreshing);
    console.log('onRefresh ::::::: ' , onRefresh);

    return (
      <>
        <View style={{ position: 'absolute', top: 0, height: 100, backgroundColor: '#fff' }}>
          {refreshing ? (
            <Text>Pull to Refresh</Text>
          ) : (
            <Text>Pull to Refresh</Text>
          )}
        </View>
      </>
      
    );
  }

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}>

        <SpaceView mt={40}>
          <Text style={styles.fontStyle('H', 38, '#fff')}>스토리</Text>
        </SpaceView>

        {/* ############################################################################################################
        ################################################################################################################
        ###### 탭 영역
        ################################################################################################################
        ############################################################################################################ */}
        <SpaceView mt={25} mb={25} viewStyle={_styles.tabWrap}>

          <SpaceView viewStyle={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => (setCurrentTab('TALK'))}>
              <Text style={_styles.tabText(currentTab == 'TALK')}>리프Talk</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => (setCurrentTab('STORY'))}>
              <Text style={_styles.tabText(currentTab == 'STORY')}>FEED</Text>
            </TouchableOpacity> */}
          </SpaceView>

        </SpaceView>
        
        {/* <TouchableOpacity 
          style={{paddingVertical: 5, backgroundColor: '#FFF6BE', width: 150, marginLeft: 10, borderRadius: 10, marginBottom: 10}}
          onPress={() => { goChatRoom(); }}
        >
          <Text style={{textAlign: 'center'}}>채팅방 입장 임시 버튼</Text>
        </TouchableOpacity> */}


        {/* ############################################################################################################
        ################################################################################################################
        ###### 컨텐츠 영역
        ################################################################################################################
        ############################################################################################################ */}

        <SpaceView>
          {currentTab == 'TALK' && <Talk isRefresh={props.route.params?.isRefresh} />}

        </SpaceView>











        {/* <SpaceView mt={500}></SpaceView> */}


        <SpaceView viewStyle={{height: height-200}}>

          {/* ############################################################################################################
          ###### 알림
          ############################################################################################################ */}
          {/* {currentIndex == 1 && (
            <>
              <SpaceView>
                <ActiveRender dataList={activeData.alarmData} type={'ALARM'} selectCallbackFn={getStoryActive} />
              </SpaceView>
            </>
          )} */}

          {/* ############################################################################################################
          ###### 내가쓴글
          ############################################################################################################ */}
          {/* {currentIndex == 2 && (
            <>
              <SpaceView>
                <ActiveRender dataList={activeData.storyData} type={'BOARD'} selectCallbackFn={getStoryActive} />
              </SpaceView>
            </>
          )} */}
        </SpaceView>

      </SpaceView>

      {/* ###################################################################################################### 맨위 이동 버튼 */}
      {(storyList.length > 0 && isTopBtn) && (currentIndex == 0) && (
        <SpaceView viewStyle={_styles.topBtnArea}>
          <TouchableOpacity onPress={() => { scrollToTop(); }}>
            <Text style={_styles.topBtnText}>맨위로</Text>
          </TouchableOpacity>
        </SpaceView>
      )}

      {/* ##################################################################### 하단 버튼 */}
      <SpaceView viewStyle={_styles.btnArea}>
        <TouchableOpacity 
          onPress={() => { goStoryEdit(); }}
          style={_styles.btnRegi}>
          <Image source={ICON.story_write} style={styles.iconNoSquareSize(23, 19)} />
          <SpaceView><Text style={styles.fontStyle('B', 16, '#fff')}>새글등록</Text></SpaceView>
        </TouchableOpacity>
      </SpaceView>
    </>
  );
};





{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  
  wrap: {
    minHeight: height,
    backgroundColor: '#000',
    paddingHorizontal: 10,
  },
  tabArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#292F33',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
  },
  tabText: (isOn: boolean) => {
		return {
			fontFamily: 'SUITE-Bold',
			color: isOn ? '#FFDD00' : '#445561',
      width: 60,
      textAlign: 'center',
      paddingVertical: 3,
		};
	},
  contentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 5,
    paddingBottom: 50,
    paddingHorizontal: 5,
    width: width,
    height: height-120,
  },
  itemArea02: (width:number, height:number) => {
    return {
      width: width,
      height: height,
      borderRadius: 10,
      overflow: 'hidden',
      marginHorizontal: 3,
    };
  },
  itemArea: (size:number) => {
    return {
      width: size,
      height: size,
      borderRadius: 10,
      overflow: 'hidden',
    };
  },
  btnArea: {
    position: 'absolute',
    bottom: 13,
    right: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  btnRegi: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#46F66F',
    borderRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 18,
    width: 140,
    height: 40,
  },
  profileArea: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  typeArea: (type:string) => {
    let bgColor = '#FF9900';

    if(type == 'VOTE') {
      bgColor = '#7B81EC';
    } else if(type == 'SECRET') {
      bgColor = '#B873FF';
    }

    return {
      position: 'absolute',
      top: 10,
      left: 10,
      //backgroundColor: 'rgba(0,0,0,0.5)',
      backgroundColor: '#FFDD00',
      borderRadius: 15,
      paddingVertical: 2,
      width: 45,
      zIndex: 1,
    };
  },
  typeText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  mstImgStyle: (size:number, bdRadius:number) => {
    return {
      width: size,
      height: size,
      borderRadius: bdRadius,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#FFDD00',
    };
  },
  secretIconStyle: (sizeType:string) => {
    let size = 230;

    if(sizeType == 'MEDIUM') {
      size = 160;
    } else if(sizeType == 'SMALL') {
      size = 120;
    }

    return {
      width: size,
      height: size,
      overflow: 'hidden',
    };
  },
  contentsText: (_color:string) => {
    return {
      fontFamily: 'Pretendard-Light',
      fontSize: 12,
      color: _color,
    };
  },
  activeText: (_color:string) => {
    return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 12,
      color: _color,
      backgroundColor: '#FFDD00',
    };
  },
  profileText: {
    backgroundColor: '#FFDD00',
    borderTopRightRadius: 5,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    color: '#fff',
    paddingHorizontal: 3,
  },
  nicknameText: (_color:string, _fontSize:number, _sizeType:string) => {
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: _fontSize,
      color: _color,
      width: _sizeType == 'LARGE' ? '100%' : width - 260,
    };
  },
  noImageArea: (gender:string, storyType:string, _height:number) => {
    return {
      width: '100%',
      height: _height,
      //backgroundColor: gender == 'M' ? '#D5DAFC' : '#FEEFF2',
      alignItems: storyType == 'SECRET' ? 'flex-start' : 'center',
      justifyContent: storyType == 'SECRET' ? 'flex-end' : 'center',
    };
  },
  topBtnArea: {
    position: 'absolute',
    top: 125,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  topBtnText: {
    textAlign: 'center',
    backgroundColor: '#1A1E1C',
    width: 85,
    paddingVertical: 2,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#D5CD9E',
    borderRadius: 10,
    overflow: 'hidden',
  },
  dimsArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.6,
    height: 80,
  },
  noData: {
    paddingHorizontal: 20,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 180,
  },
  noDataText: {
    fontFamily: 'Pretendard-Medium',
    color: '#555555',
    fontSize: 15,
  },
  multiImageArea: {
    position: 'absolute',
    top: 13,
    right: 13,
    zIndex: 1,
  },
  




  tabWrap: {
    zIndex:10, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  

});