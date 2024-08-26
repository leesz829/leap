import { useNavigation, CommonActions } from '@react-navigation/native';
import * as React from 'react';
import { useCallback } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { StackScreenProp } from '@types';
import { ICON, IMAGE } from 'utils/imageUtils';
import { Color } from 'assets/styles/Color';
import { Wallet } from './TopNavigation';
import { commonStyle, layoutStyle, styles } from 'assets/styles/Styles';
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
  profileScore?: any;
  authLevel?: any;
  storyType?: string;
  nicknameModifier?: string;
  nicknameNoun?: string;
  editBtnIcon?: any;
  callbackFunc: () => void;
  isOnShrink?: boolean;
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
  mstImgPath,
  nickname,
  nicknameModifier,
  nicknameNoun,
  editBtnIcon,
  callbackFunc,
  isOnShrink,
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
            routes: [{ name: ROUTES.LOGIN }],
          })
        );
  }

  return (
    <>
      <SpaceView>
        {isLogoType ? (
          <>
            <View style={{ ..._styles.headerLogoContainer}}>
              {/* <Image source={IMAGE.logoBanner} resizeMode={'cover'} style={{width: '100%', height: 43}} /> */}
            </View>
          </>
        ) : (
          <>
            <SpaceView viewStyle={{..._styles.headerContainer(isOnShrink), ...containerStyle, zIndex: 1}}>

              {/* 뒤로가기 버튼 */}
              <TouchableOpacity
                onPress={goHome}
                style={_styles.backContainer}
                hitSlop={commonStyle.hipSlop20}
              >
                <Image source={backIcon || ICON.backBtnType01} style={styles.iconSquareSize(isOnShrink ? 24 : 35)} resizeMode={'contain'} />
              </TouchableOpacity>

              {/* 제목 */}
              <SpaceView viewStyle={{width: width}}>

                {type == 'STORY_DETAIL' ? (
                  <>
                    <SpaceView ml={45} viewStyle={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start'}}>
                      <SpaceView viewStyle={_styles.mstImgWrap}>
                        <Image source={mstImgPath} style={styles.iconSquareSize(35)} />
                      </SpaceView>
                      <SpaceView ml={10}><Text style={styles.fontStyle('B', 12, '#fff')}>{nicknameModifier}{'\n'}{nicknameNoun}</Text></SpaceView>
                    </SpaceView>
                  </>
                ) : (
                  <>
                    <SpaceView viewStyle={{alignItems: 'center', justifyContent: 'center'}}>
                      <Text style={styles.fontStyle('H', isOnShrink ? 20 : 26, '#fff')}>{title}</Text>
                    </SpaceView>
                  </>
                )}
              </SpaceView>

              <SpaceView viewStyle={_styles.btnContainer}>
                {type == 'STORY_REGI' ? (
                  <>
                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      <TouchableOpacity onPress={callbackFunc} hitSlop={commonStyle.hipSlop20}>
                        <Text style={styles.fontStyle('B', 16, '#46F66F')}>다음</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </>
                ) : type == 'MATCH_DETAIL' ? (
                  <>
                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      <TouchableOpacity style={[layoutStyle.row]} onPress={callbackFunc} hitSlop={commonStyle.hipSlop20}>
                        <Image source={ICON.declaration} style={styles.iconSquareSize(35)} />
                      </TouchableOpacity>
                    </SpaceView>
                  </>  
                ) : type == 'CHAT_DETAIL' ? (
                  <>
                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      <TouchableOpacity style={[layoutStyle.row]} onPress={callbackFunc} hitSlop={commonStyle.hipSlop20}>
                        <View style={_styles.dot} />
                        <View style={[_styles.dot, {marginHorizontal: 2}]} />
                        <View style={_styles.dot} />
                      </TouchableOpacity>
                    </SpaceView>
                  </> 
                ) : type == 'STORY_DETAIL' ? (
                  <>
                    <TouchableOpacity onPress={callbackFunc} hitSlop={commonStyle.hipSlop20}>
                      <Image source={editBtnIcon} style={styles.iconSquareSize(35)} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* 재화 표시 */}
                    {/* <View>{right || <Wallet textStyle={walletTextStyle} />}</View> */}
                  </>
                )}

              </SpaceView>
            </SpaceView>
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
    top: 10,
    left: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  headerContainer: (_isOnShrink: boolean) => {
		return {
			height: _isOnShrink ? 42 : 56,
      paddingRight: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    };
	},
  headerFixedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#000',
    zIndex: 1,
    justifyContent: 'center',
  },
  headerLogoContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mstImgArea: {
    borderColor: '#D5CD9E',
    borderWidth: 1,
    borderRadius: 50,
  },
  mstImgStyle: {
    width: 32,
    height: 32,
    borderRadius: 50,
    overflow: 'hidden',
  },
  btnContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 56,
    justifyContent: 'center',
    zIndex: 1,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 50,
    backgroundColor: '#D5CD9E',
  },
  mstImgWrap: {
    borderRadius: 60,
    overflow: 'hidden',
  },

});