import { useIsFocused, useNavigation, useFocusEffect, RouteProp  } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { findSourcePath, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { useDispatch } from 'react-redux';
import { ICON } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import { isEmptyData, imagePickerOpen } from 'utils/functions';
import CommonHeader from 'component/CommonHeader';
import { STACK } from 'constants/routes';
import Image from 'react-native-fast-image';
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

  const { params } = props.route;

  const memberBase = useUserInfo(); // 회원 기본 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoad, setIsLoad] = useState(false); // 로딩 상태 체크

  const [contents, setContents] = useState(params?.contents); // 내용

  // 이미지 데이터
  const [imageList, setImageList] = useState<any>(params.imgList);

  // 다음 버튼
  const nextBtn = async () => {
    if(!isEmptyData(contents) || contents.length < 20) {
      console.log('asdsadas');
      show({ content: '최소 20글자 이상 입력해 주세요.' });
      return false;
    }

    navigation.navigate(STACK.COMMON, {
      screen: 'StoryEdit',
      params: {
        storyBoardSeq: isEmptyData(params.storyBoardSeq) ? params.storyBoardSeq : 0,
        imgList: imageList,
        contents: contents,
      }
    });
   };

  // 사진 선택
  const imgSelected = async () => {
    imagePickerOpen(function(path:any, data:any) {

      if(isEmptyData(data)) {
        let imgData = {};
        imgData.story_board_img_seq = 0;
        imgData.img_file_path = path;
        imgData.file_base64 = data;
        setImageList([imgData]);
      }
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

        <CommonHeader title={isEmptyData(params.storyBoardSeq) ? '새글수정' : '새글등록'}  type={'STORY_REGI'} callbackFunc={nextBtn} />

        <ScrollView showsVerticalScrollIndicator={false}>

          <SpaceView pl={10} pr={10} mt={90}>
            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={ICON.story_regTmp} style={styles.iconSquareSize(35)} />
              <SpaceView ml={10}>
                <Text style={styles.fontStyle('B', 12, '#44B6E5')}>
                  {isEmptyData(params.nicknameModifier) ? params.nicknameModifier : '랜덤 수식어'}
                  {'\n'}
                  {isEmptyData(params.nicknameModifier) ? params.nicknameNoun : '랜덤 닉네임'}</Text>
              </SpaceView>
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
              <SpaceView viewStyle={layoutStyle.rowStart}>
                {imageList?.map((item, index) => {
                  return (
                    <SpaceView key={'img_' + index} mr={10} viewStyle={_styles.imgItemWrap} >
                      <Image source={findSourcePath(item?.img_file_path)} style={styles.iconSquareSize(59)} />
                    </SpaceView>
                  )
                })}
              </SpaceView>
              <TouchableOpacity onPress={imgSelected} style={_styles.imgSetBtn}>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>{imageList?.length > 0 ? '사진변경' : '사진추가'}</Text>
                <Image source={ICON.story_imageRegi} style={styles.iconSquareSize(14)} />
              </TouchableOpacity>
            </SpaceView>

          </SpaceView>
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
    paddingTop: 30,
    paddingHorizontal: 10,
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
  imgItemWrap: {
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },


});