import { Slider } from '@miblanchard/react-native-slider';
import { RouteProp, useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList, BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import { request_reexamination, peek_member, update_setting, set_member_phone_book, update_additional, get_bm_product } from 'api/models';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { ROUTES, STACK } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import React, { useRef, useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Platform, PermissionsAndroid, Animated } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useDispatch } from 'react-redux';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { iapConnection } from 'utils/initIAP';
import { usePopup } from 'Context';
import LinearGradient from 'react-native-linear-gradient';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { CommaFormat } from 'utils/functions';
import { clearPrincipal } from 'redux/reducers/authReducer';
import { List } from 'component/match/List';
import { DropDown } from 'component/common/DropDown';
import { Vibe } from 'component/vibe/Vibe';



/* ################################################################################################################
###### 컨텐츠
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Contents'>;
  route: RouteProp<StackParamList, 'Contents'>;
}

const { width, height } = Dimensions.get('window');

export const Contents = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  // 회원 기본 정보
  const memberBase = useUserInfo();

  const [selectedMenuValue, setSelectedMenuValue] = useState('BLIND'); // 선택한 메뉴 값

  // 드롭다운 콜백 함수
  const dropdownCallbackFn = React.useCallback(async (value: string) => {
    console.log('value ::::: ' , value);
    setSelectedMenuValue(value);

  }, []);


  // ####################################################################################################### 초기 실행 함수
  useEffect(() => {
    if(isFocus) {

      if(memberBase?.status == 'BLOCK') {
        show({
          title: '서비스 이용 제한 알림',
          content: '서비스 운영정책 위반으로 회원님의 계정상태가\n이용제한 상태로 전환되었습니다.\n문의사항 : cs@limeeted.com',
          confirmCallback: function() {
            dispatch(clearPrincipal());
          }
        });
      } else {

      }

      // IAP 연결
      iapConnection();
    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      {/* 상단 드롭다운 메뉴 */}
      <SpaceView mt={40} ml={20} mr={20} viewStyle={_styles.dropDownWrap}>
        <DropDown callBackFunction={dropdownCallbackFn} />
      </SpaceView>

      {/* 컨텐츠 내용 */}
      <SpaceView>

        {selectedMenuValue == 'BLIND' && <List />}
        {selectedMenuValue == 'VIBE' && <Vibe />}

        {/* <Vibe /> */}
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
  dropDownWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});