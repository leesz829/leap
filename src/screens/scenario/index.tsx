import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList, BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import { request_reexamination, peek_member, update_setting, set_member_phone_book, update_additional, get_bm_product } from 'api/models';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { ROUTES, STACK } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { useProfileImg } from 'hooks/useProfileImg';
import React, { useRef, useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Platform, PermissionsAndroid, Animated, ImageBackground } from 'react-native';
import { useDispatch } from 'react-redux';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { usePopup } from 'Context';
import LinearGradient from 'react-native-linear-gradient';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import CommonHeader from 'component/CommonHeader';
import { Slider } from '@miblanchard/react-native-slider';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SpeechBubble } from 'component/SpeechBubble';
import Select from 'component/scenario/Select';
import Result from 'component/scenario/Result';



/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 - 선택
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Scenario'>;
  route: RouteProp<StackParamList, 'Scenario'>;
}

const { width, height } = Dimensions.get('window');

export const Scenario = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const [selectCode, setSelectCode] = useState('');

  const [pageGubun, setPageGubun] = useState('SELECT');

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
    setPageGubun('RESULT');
  }


  // ####################################################################################################### 초기 실행 함수
  useEffect(() => {
    if(isFocus) {
      setSelectCode('');
      setPageGubun('SELECT');
    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}> 
        <ImageBackground
            source={ICON.scenario_bgImg}
            style={_styles.bgWrap}
        >
          <CommonHeader title={'커플 시나리오'} /* callbackFunc={nextBtn} */ />

          <SpaceView>
            {pageGubun == 'SELECT' && <Select resultCallbackFn={move} />}
            {pageGubun == 'RESULT' && <Result resultCallbackFn={move} />}
          </SpaceView>

        </ImageBackground>
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
  },
  bgWrap: {
    height: height,
    paddingTop: 30,
    paddingHorizontal: 10,
  },
});