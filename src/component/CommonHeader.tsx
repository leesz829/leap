import { useNavigation, CommonActions } from '@react-navigation/native';
import * as React from 'react';
import { useCallback } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { StackScreenProp } from '@types';
import { ICON, IMAGE } from 'utils/imageUtils';
import { Color } from 'assets/styles/Color';
import { Wallet } from './TopNavigation';
import { commonStyle, styles } from 'assets/styles/Styles';
import { usePopup } from 'Context';
import { isEmptyData } from 'utils/functions';
import SpaceView from './SpaceView';
import { STACK, ROUTES } from 'constants/routes';


export type NavigationHeaderProps = {
  title?: string;
  right?: React.ReactNode;
  containerStyle?: any;
  backIcon?: any;
  walletTextStyle?: any;
  isLogoType?: any;
  type?: string;
  mstImgPath?: any;
  nickname?: string;
  gender?: string;
  profileScore?: any;
  authLevel?: any;
  storyType?: string;
  callbackFunc: () => void;
};

/**
 * 공통 헤더
 * @param {string} title 헤더 타이틀
 */
function CommonHeader({
  title,
  right,
  containerStyle,
  backIcon,
  walletTextStyle,
  isLogoType,
  type,
  callbackFunc,
}: NavigationHeaderProps) {

  const navigation = useNavigation<StackScreenProp>();
  const { show } = usePopup();  // 공통 팝업

  const { width, height } = Dimensions.get('window');

  const goHome = useCallback(() => {
    const screen = navigation.getState().routes[navigation.getState().routes.length-1].name;
    const params = navigation.getState().routes[navigation.getState().routes.length-1].params;

    if(screen == 'ItemMatching') {
      if(isEmptyData(params) && params.type == 'PROFILE_CARD_ITEM') {
        show({ 
          content: '선택을 안하시는 경우 아이템이 소멸됩니다.\n그래도 나가시겠습니까?',
          cancelCallback: function() {},
          confirmCallback: function() {
            goMove();
          }
        });
      } else {
        goMove();
      }
    } else {
      goMove();
    }

    //return;
  }, [navigation]);

  const goMove = async () => {
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: ROUTES.LOGIN01 }],
          })
        );
  }

  return (
    <>
      <SpaceView viewStyle={{backgroundColor: '#3D4348'}}>
        {isLogoType ? (
          <>
            <View style={{ ..._styles.headerLogoContainer}}>
              <Image source={IMAGE.logoBanner} resizeMode={'cover'} style={{width: '100%', height: 43}} />
            </View>
          </>
        ) : (
          <>
            <View style={{ ..._styles.headerContainer, ...containerStyle, zIndex: 1 }}>

              {/* 뒤로가기 버튼 */}
              <TouchableOpacity
                onPress={goHome}
                style={_styles.backContainer}
                /* hitSlop={commonStyle.hipSlop20} */
              >
                <Image source={backIcon || ICON.arrowLeftBrown} style={styles.iconSquareSize(24)} resizeMode={'contain'} />
              </TouchableOpacity>

              {/* 제목 */}
              <SpaceView viewStyle={{width: width}}>
                <Text style={_styles.titleStyle}>{title}</Text>
              </SpaceView>

              <SpaceView viewStyle={_styles.btnContainer}>
                {type == 'STORY_REGI' ? (
                  <>
                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      {/* <SpaceView mr={15}>{right || <Wallet textStyle={walletTextStyle} />}</SpaceView> */}
                      <TouchableOpacity onPress={callbackFunc} hitSlop={commonStyle.hipSlop20}>
                        <Text style={_styles.regiText}>등록</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </>
                ) : (
                  <>
                    {/* 재화 표시 */}
                    {/* <View>{right || <Wallet textStyle={walletTextStyle} />}</View> */}
                  </>  
                )}

              </SpaceView>
            </View>
          </>
        )}
      </SpaceView>
    </>
  );
}

export default CommonHeader;

const _styles = StyleSheet.create({
  backContainer: {
    position: 'absolute',
    top: 0,
    left: 13,
    height: 56,
    justifyContent: 'center',
    zIndex: 1,
  },
  headerContainer: {
    height: 56,
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogoContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleStyle: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#D5CD9E',
    textAlign: 'center',
  },
  mstImgStyle: {
    width: 32,
    height: 32,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 7,
  },
  nicknameText: (storyType:string, gender:string) => {
    let clr = '#333333';
    if(storyType == 'SECRET') {
      if(gender == 'M') {
        clr = '#7986EE';
      } else {
        clr = '#FE0456';
      }
    }

    return {
      fontFamily: 'AppleSDGothicNeoEB00',
      fontSize: 14,
      color: clr,
      marginTop: -3,
    };
  },
  scoreText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 14,
    color: '#333333',
  },
  regiText: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 16,
    color: '#D5CD9E',
  },
  btnContainer: {
    position: 'absolute',
    top: 0,
    right: 13,
    height: 56,
    justifyContent: 'center',
    zIndex: 1,
  },

});