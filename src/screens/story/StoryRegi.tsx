import { useIsFocused, useNavigation, useFocusEffect, RouteProp  } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { findSourcePath, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import { ICON } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import { isEmptyData, imagePickerOpen } from 'utils/functions';
import CommonHeader from 'component/CommonHeader';
import { STACK } from 'constants/routes';
import Image from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { CommonTextarea } from 'component/CommonTextarea';


/* ################################################################################################################
###### Story 등록 - 유형 선택
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: StackNavigationProp<StackParamList, 'StoryRegi'>;
  route: RouteProp<StackParamList, 'StoryRegi'>;
}

export default function StoryRegi(props: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const memberBase = useUserInfo(); // 회원 기본 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoad, setIsLoad] = useState(false); // 로딩 상태 체크

  const [contents, setContents] = useState(''); // 내용

  // 이미지 데이터
  const [imageData, setImageData] = useState({
    img_file_path: '',
    file_base64: '',
  });

  // 스토리 유형 선택
  const selectedStoryType = async (type:string) => {
    navigation.navigate(STACK.COMMON, {
      screen: 'StoryEdit',
      params: {
        storyType : type,
      }
    });
  };

  // 다음 버튼
  const nextBtn = async () => {
    navigation.navigate(STACK.COMMON, {
      screen: 'StoryEdit',
      params: {
        storyBoardSeq: 0,
      }
    });
  };

  // 사진 선택
  const imgSelected = async () => {
    imagePickerOpen(function(path:any, data:any) {

      setImageData({
        img_file_path: path,
        file_base64: data,
      });

      /* let _data = {
        member_auth_detail_seq: 0,
        img_file_path: path,
        order_seq: authDetailList.length+1,
        org_order_seq: authDetailList.length+1,
        file_base64: data,
      };
    
      setAuthDetailList((prev) => {
        return [...prev, _data];
      }); */
    });
  };

  /* ##################################################################################################################################
  ################## 초기 실행 함수
  ################################################################################################################################## */
  React.useEffect(() => {
    if(isFocus) {
      
    };
  }, [isFocus]);

  return (
    <>
      <SpaceView pt={30} viewStyle={_styles.wrap}>

        <CommonHeader 
          title={'새글등록'} 
          type={'STORY_REGI'} 
          callbackFunc={nextBtn} />

        <ScrollView showsVerticalScrollIndicator={false}>

          <SpaceView pl={10} pr={10} mt={90}>

            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={ICON.story_regTmp} style={styles.iconSquareSize(30)} />
              <SpaceView ml={10}><Text style={styles.fontStyle('B', 12, '#44B6E5')}>랜덤 수식어 랜덤 닉네임</Text></SpaceView>
            </SpaceView>

            <SpaceView>
              <CommonTextarea
                value={contents}
                onChangeText={(text) => setContents(text)}
                placeholder={'20글자 이상 입력해 주세요.\n\n(주의)이용약관 또는 개인 정보 취급 방침 등\n위배되는 게시글을 등록하는 경우 제재 대상이 될 수 있으며\n상대를 배려하는 마음으로 이용해 주세요.'}
                placeholderTextColor={'#808080'}
                maxLength={3000}
                exceedCharCountColor={'#990606'}
                fontSize={12}
                fontColor={'#fff'}
                //height={storyData.storyType == 'VOTE' ? 220 : 350}
                backgroundColor={'transparent'}
                padding={0}
                paddingTop={20}
              />
            </SpaceView>

            <SpaceView mt={20} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
              <SpaceView viewStyle={{borderRadius: 5, overflow: 'hidden'}}>
                {isEmptyData(imageData.img_file_path) && (
                  <Image source={findSourcePath(imageData?.img_file_path)} style={styles.iconSquareSize(59)} />
                )}
              </SpaceView>
              <TouchableOpacity onPress={imgSelected} style={_styles.imgSetBtn}>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>사진추가</Text>
                <Image source={ICON.story_imageRegi} style={styles.iconSquareSize(14)} />
              </TouchableOpacity>
            </SpaceView>

          </SpaceView>          

          {/* <SpaceView mt={20} pl={20} pr={20}>

            <SpaceView mb={30} viewStyle={_styles.titleArea}>
              <Text style={_styles.titleText}><Text style={{color: '#7B81EC', fontFamily: 'Pretendard-Bold', fontSize: 20}}>{memberBase?.nickname}님</Text>의 이야기를{'\n'}스토리에 일상을 공유하고 소통해보세요.</Text>
            </SpaceView>

            <SpaceView>
              <LinearGradient colors={['#FFD76B', '#FFB801']} style={_styles.contentItem}>
                <TouchableOpacity onPress={() => { selectedStoryType('STORY'); }}>
                  <SpaceView viewStyle={{width: 220}}>
                    <Text style={_styles.contentTitle}>스토리</Text>
                    <Text style={_styles.contentSubTitle}>소소한 일상부터 음식, 여행 등 주제에 관계없이 자유롭게 소통해 보세요.</Text>
                  </SpaceView>
                  <Image source={ICON.talkBalloonIcon} style={_styles.contentImg} resizeMode={'cover'} />
                </TouchableOpacity>
              </LinearGradient>
              
              <LinearGradient colors={['#A9DBFF', '#7B81EC']} style={_styles.contentItem} >
                <TouchableOpacity onPress={() => { selectedStoryType('VOTE'); }}>
                  <Text style={_styles.contentTitle}>투표</Text>
                  <Text style={_styles.contentSubTitle}>왼 VS 오 어떤 것? 밸런스 게임으로{'\n'}사람들의 성향을 알아가요.</Text>
                  <Image source={ICON.voteIcon} style={_styles.contentImg} resizeMode={'cover'} />
                </TouchableOpacity>
              </LinearGradient>
              
              <LinearGradient colors={['#8E1DFF', '#000000']} style={_styles.contentItem}>
                <TouchableOpacity onPress={() => { selectedStoryType('SECRET'); }}>
                  <Text style={_styles.contentTitle}>시크릿</Text>
                  <Text style={_styles.contentSubTitle}>이야기 앞에 “비밀”이 붙으면{'\n'}재미있어 지는 법이죠!</Text>
                  <Image source={ICON.talkQuestionIcon} style={[_styles.contentImg, {width: 70, height: 70, right: -5}]} resizeMode={'cover'} />
                </TouchableOpacity>
              </LinearGradient>
            </SpaceView>

          </SpaceView> */}
        </ScrollView>

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
  },
  imgSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#44B6E5',
    borderRadius: 15,
    overflow: 'hidden',
    width: 90,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },

});