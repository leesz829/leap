import { layoutStyle, styles } from 'assets/styles/Styles';
import { ScreenNavigationProp } from '@types';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, Platform, ScrollView, Dimensions, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { formatNowDate, isEmptyData, CommaFormat, imagePickerOpen } from 'utils/functions';
import { ICON, findSourcePath } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { usePopup } from 'Context';
import { Modalize } from 'react-native-modalize';
import { STACK, ROUTES } from 'constants/routes';



const { width, height } = Dimensions.get('window');

const ProfileComponent = React.memo(({ data, authPercent, interestCnt, interviewCnt }) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup(); // 공통 팝업
  const isFocus = useIsFocused();

  // ##################################################################################### 초기 함수
  React.useEffect(() => {
    if(isFocus) {
      
    } else {

    }
  }, [isFocus]);

  return (
    <>
      <LinearGradient
        colors={['rgba(65,25,104,0.5)', 'rgba(59,95,212,0.5)']}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0.8, y: 1 }}
        style={_styles.wrap} >

        <SpaceView>
          <Text style={styles.fontStyle('EB', 20, '#fff')}>프로필 정보</Text>
          <SpaceView mt={10}>
            <Text style={styles.fontStyle('SB', 12, '#fff')}>
              멤버십 인증을 통해 <Text style={styles.fontStyle('SB', 12, '#7AB0C8')}>상위 {authPercent}%</Text>의 인증 레벨을 획득한 <Text style={styles.fontStyle('SB', 12, '#7AB0C8')}>프리미엄</Text> 회원
            </Text>
          </SpaceView>
        </SpaceView>

        {/* ###########################################################################################################################
        ####### 내 소개 정보 정보
        ########################################################################################################################### */}
        <SpaceView mt={30}>
          <SpaceView>
            <Text style={styles.fontStyle('EB', 16, '#fff')}>내 소개 정보</Text>
          </SpaceView>
          <SpaceView mt={10}>
            <SpaceView>
              <SpaceView viewStyle={layoutStyle.rowBetween}>

                {/* 키 */}
                <ItemRender code={'HEIGHT'} name={'키(cm)'} value={data?.height} />

                {/* 체형 */}
                <ItemRender code={'BODY'} name={'체형'} value={data?.form_body_name} />
              </SpaceView>

              <SpaceView mt={10}>

                {/* 직업 */}
                <SpaceView>
                  <LinearGradient
                    colors={['rgba(203,241,255,0.3)', 'rgba(113,147,156,0.3)', 'rgba(122,132,183,0.3)']}
                    start={{ x: 0, y: 0.1 }}
                    end={{ x: 0.4, y: 1 }}
                    style={_styles.rowFullWrap}>
                    <SpaceView viewStyle={layoutStyle.rowCenter}>
                      <Image source={ICON.member_suitcase} style={styles.iconSquareSize(15)} />
                      <SpaceView ml={5}><Text style={styles.fontStyle('B', 12, '#fff')}>직업</Text></SpaceView>
                    </SpaceView>
                    <Text style={styles.fontStyle('B', 20, '#fff')}>미설정</Text>
                  </LinearGradient>
                </SpaceView>

                {/* 지역 */}
                <SpaceView mt={10}>
                  <LinearGradient
                    colors={['rgba(203,241,255,0.3)', 'rgba(113,147,156,0.3)', 'rgba(122,132,183,0.3)']}
                    start={{ x: 0, y: 0.1 }}
                    end={{ x: 0.4, y: 1 }}
                    style={_styles.rowFullWrap}>
                    <SpaceView viewStyle={layoutStyle.rowCenter}>
                      <Image source={ICON.member_suitcase} style={styles.iconSquareSize(15)} />
                      <SpaceView ml={5}><Text style={styles.fontStyle('B', 12, '#fff')}>지역</Text></SpaceView>
                    </SpaceView>
                    <Text style={styles.fontStyle('B', 20, '#fff')}>
                      {isEmptyData(data?.prefer_local1_name) ? (
                        <>
                          {data?.prefer_local1_name}{isEmptyData(data?.prefer_local2_name) && ', ' + data?.prefer_local2_name}
                        </>
                      ) : (
                        <>
                          {'미설정'}
                        </>
                      )}
                    </Text>
                  </LinearGradient>
                </SpaceView>
              </SpaceView>

              <SpaceView mt={10} viewStyle={layoutStyle.rowBetween}>

                {/* MBTI */}
                <ItemRender code={'MBTI'} name={'MBTI'} value={data?.mbti_type_name} />

                {/* 종교 */}
                <ItemRender code={'RELIGION'} name={'종교'} value={data?.religion_name} />
              </SpaceView>

              <SpaceView mt={10} viewStyle={layoutStyle.rowBetween}>

                {/* 음주 */}
                <ItemRender code={'DRINK'} name={'음주'} value={data?.drinking_name} />

                {/* 흡연 */}
                <ItemRender code={'SMOKE'} name={'흡연'} value={data?.smoking_name} />
              </SpaceView>

            </SpaceView>
          </SpaceView>
          <SpaceView mt={20} viewStyle={layoutStyle.rowEnd}>
            <TouchableOpacity 
              style={_styles.authBtn}
              onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_INTRODUCE }); }} >
              <Text style={styles.fontStyle('B', 12, '#fff')}>프로필 정보 수정</Text>
              <Text style={styles.fontStyle('B', 12, '#fff')}>{'>'}</Text>
            </TouchableOpacity>
          </SpaceView>
        </SpaceView>

        {/* ###########################################################################################################################
        ####### 추가 정보
        ########################################################################################################################### */}
        <SpaceView mt={5}>
          <SpaceView>
            <Text style={styles.fontStyle('EB', 16, '#fff')}>추가 정보</Text>
          </SpaceView>
          <SpaceView mt={10}>
            <SpaceView>
              <SpaceView viewStyle={layoutStyle.rowBetween}>

                {/* 관심사 */}
                <ItemRender code={'SMOKE'} name={'관심사'} value={interestCnt + '개'} />

                {/* 인터뷰 */}
                <ItemRender code={'SMOKE'} name={'인터뷰'} value={interviewCnt + '개'} />

              </SpaceView>
            </SpaceView>
          </SpaceView>
          <SpaceView mt={20} viewStyle={layoutStyle.rowEnd}>
            <TouchableOpacity 
              style={_styles.authBtn}
              onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_ADDINFO }); }} >
              <Text style={styles.fontStyle('B', 12, '#fff')}>추가 정보 수정</Text>
              <Text style={styles.fontStyle('B', 12, '#fff')}>{'>'}</Text>
            </TouchableOpacity>
          </SpaceView>
        </SpaceView>
      </LinearGradient>
    </>
  );
});





{/* #######################################################################################################
####### 아이템 렌더링
####################################################################################################### */}
const ItemRender = React.memo(({ code, name, value }) => {

  let iconSrc = ICON.member_body;

  if(code == 'HEIGHT') {

  } else if(code == 'BODY') {

  }


  return (
		<>
			<LinearGradient
        colors={['rgba(203,241,255,0.3)', 'rgba(113,147,156,0.3)', 'rgba(122,132,183,0.3)']}
        start={{ x: 0, y: 0.1 }}
        end={{ x: 0.4, y: 1 }}
        style={_styles.rowHalfWrap}>
        <Text style={styles.fontStyle('B', 20, '#fff')}>{isEmptyData(value) ? value : '미설정'}</Text>
        <SpaceView mt={10} viewStyle={layoutStyle.rowCenter}>
          <Image source={iconSrc} style={styles.iconSquareSize(15)} />
          <SpaceView ml={5}><Text style={styles.fontStyle('B', 12, '#fff')}>{name}</Text></SpaceView>
        </SpaceView>
      </LinearGradient>
		</>
  );
});






{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingTop: 30,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  authBtn: {
    backgroundColor: 'rgba(0,0,0,0.33)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 130,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 20,
  },
  rowHalfWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 100,
    borderWidth: 1,
    borderColor: 'rgba(168,220,255,0.3)',
    borderRadius: 10,
  },
  rowFullWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 70,
    borderWidth: 1,
    borderColor: 'rgba(168,220,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 15,
  },


});





export default ProfileComponent;