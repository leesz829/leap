import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState, FC } from 'react';
import { BottomParamList, ColorType, ScreenNavigationProp, CommonCode, LabelObj, LiveMemberInfo, LiveProfileImg } from '@types';
import { get_live_members, regist_profile_evaluation, get_common_code, update_additional } from 'api/models';
import SpaceView from 'component/SpaceView';
import { CommonLoading } from 'component/CommonLoading';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, Platform, Modal, ImageBackground } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ROUTES, STACK } from 'constants/routes';
import { useProfileImg } from 'hooks/useProfileImg';
import LinearGradient from 'react-native-linear-gradient';
import { Slider } from '@miblanchard/react-native-slider';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SpeechBubble } from 'component/SpeechBubble';

/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 참여하기 선택 Component
###################################################################################################################
################################################################################################################ */

const { width, height } = Dimensions.get('window');

const Select = React.memo(({ resultCallbackFn }) => {

  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const [selectCode, setSelectCode] = useState('');

  const codeList = [
    {code: '01', name: '코인 노래방'},
    {code: '02', name: '이자카야'},
    {code: '03', name: '심야영화'}
  ]

  // 회원 기본 정보
  const memberBase = useUserInfo();

  const mbrProfileImgList = useProfileImg();

  const answerSelect = async (code:string) => {
    setSelectCode(code);
  }

  const move = async () => {
    resultCallbackFn();
  }

  useFocusEffect(
    React.useCallback(() => {
      
      return () => {

      };
    }, []),
  );

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView mt={40} viewStyle={_styles.contentWrap}>
        <SpaceView viewStyle={_styles.titleWrap}>
          <Text style={styles.fontStyle('EB', 20, '#fff')}>시나리오 이름</Text>
        </SpaceView>
        <SpaceView pl={13} pr={13}>
          <SpaceView pt={50} viewStyle={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start'}}>
            <SpaceView viewStyle={_styles.imgWrap}>
              <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.imgStyle} />
              <BlurView 
                style={_styles.blurArea}
                blurType='light'
                blurAmount={10}
              />
            </SpaceView>
            <SpaceView ml={10} mt={13}>
              <SpaceView><Text style={styles.fontStyle('H', 30, '#fff')}>Nickname</Text></SpaceView>
              <SpaceView mt={8} viewStyle={layoutStyle.rowStart}>
                <SpaceView><Text style={styles.fontStyle('SB', 9, '#8BAAFF')}>예상 친밀도</Text></SpaceView>
                <SpaceView ml={10} viewStyle={{overflow: 'hidden', width: 80}}>
                  <LinearGradient
                    colors={['#8BAAFF', '#8BAAFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={_styles.sliderActiveStyle(40 / 100)}>
                  </LinearGradient>
                  <Slider
                    animateTransitions={true}
                    renderThumbComponent={() => null}
                    containerStyle={_styles.sliderContainerStyle}
                    trackStyle={_styles.sliderThumbStyle}
                    trackClickable={false}
                    disabled
                  />
                </SpaceView>
                <SpaceView ml={5}>
                  <Text style={styles.fontStyle('R', 6, '#8BAAFF')}>40%</Text>
                </SpaceView>
              </SpaceView>
              <SpaceView mt={8} viewStyle={layoutStyle.rowStart}>
                <SpaceView><Text style={[styles.fontStyle('SB', 9, '#FFFF5D'), {textAlign: 'right'}]}>긍정 반응</Text></SpaceView>
                <SpaceView ml={18} viewStyle={layoutStyle.rowStart}>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                </SpaceView>
              </SpaceView>
            </SpaceView>
          </SpaceView>
          <SpaceView mt={30}>
            <SpaceView><Text style={styles.fontStyle('SB', 16, '#fff')}>첫번째 상황</Text></SpaceView>
            <SpaceView mt={5}><Text style={styles.fontStyle('SB', 14, '#fff')}>데이트 분위기는 첫 인사 때보다 훈훈해졌습니다. 시간은 아직 밤 9시. 헤어지기 아쉬운 시간 대에 당신은 다음 장소를 제안합니다.</Text></SpaceView>
          </SpaceView>
          <SpaceView mt={50} mb={20}>
            {codeList.map((item, index) => (
              <TouchableOpacity
                style={_styles.answerItemWrap}
                activeOpacity={0.7}
                onPress={() => {

                  if(selectCode == item.code) {
                    move();
                  } else {
                    answerSelect(item.code);
                  }
                  
                }}
              >
                <Text style={styles.fontStyle('SB', 16, '#fff')}>{item.name}</Text>
                {isEmptyData(selectCode) && selectCode == item.code && ( <SpeechBubble />)}
              </TouchableOpacity>
            ))}
          </SpaceView>
        </SpaceView>
      </SpaceView>
    </>
  );
});



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  contentWrap: {
    backgroundColor: 'rgba(52,52,52,0.5)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  titleWrap: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  imgWrap: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  imgStyle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
  },
  answerItemWrap: {
    backgroundColor: 'rgba(162,223,255,0.5)',
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  sliderActiveStyle: (value:any) => {
    let percent = 0;

    if(value != null && typeof value != 'undefined') {
      percent = value * 100;
    };

    return {
      position: 'absolute',
      width: percent + '%',
      height: 5,
      zIndex: 1,
      borderRadius: 25,
    };
  },
  sliderContainerStyle: {
    height: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(106,106,106,0.5)',
  },
  sliderThumbStyle: {
    height: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(106,106,106,0.5)',
  },
  blurArea: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		width: '100%',
		height: '100%',
		zIndex: 1,
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
	},

});


export default Select;