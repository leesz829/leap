import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import ListItem from 'component/story/ListItem';
import LinearGradient from 'react-native-linear-gradient';
import { STACK, ROUTES } from 'constants/routes';
import { modalStyle, layoutStyle, commonStyle, styles } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import { useUserInfo } from 'hooks/useUserInfo';
import { ScrollView } from 'react-native-gesture-handler';



const { width, height } = Dimensions.get('window');

const Story = React.memo(({ memberBase }) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const [currentRespectType, setCurrentRespectType] = React.useState('MEMBER'); // repsect 등급 타입

  const respectGradeList = [
    {type: 'MEMBER', freeCnt: 0, cubeCnt: 0, megaCubeCnt: 0},
    {type: 'SILVER', freeCnt: 1, cubeCnt: 10, megaCubeCnt: 0},
    {type: 'GOLD', freeCnt: 2, cubeCnt: 20, megaCubeCnt: 2},
    {type: 'PLATINUM', freeCnt: 3, cubeCnt: 30, megaCubeCnt: 3},
    {type: 'DIAMOND', freeCnt: 4, cubeCnt: 50, megaCubeCnt: 5},
  ];

  // 인상수식어 memberBase?.face_modifier
  // memberPeekData
  // resLikeList
  // matchTrgtList

  return (
    <>
      <LinearGradient
        colors={['#706fc6', '#16112A']}
        style={{ paddingHorizontal: 10, paddingTop: 20}}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} >

        {/* ################################################################################ 멤버십 영역 */}
        <LinearGradient
          colors={['#411968', '#3B5FD4']}
          style={{ borderRadius: 10, paddingHorizontal: 10, paddingVertical: 10 }}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }} >

          <SpaceView>
            <SpaceView mb={10}><Text style={styles.fontStyle('EB', 18, '#fff')}>리프로운 매너 생활</Text></SpaceView>
            <Text style={styles.fontStyle('SB', 11, '#fff')}>서로를 배려하며 리프를 즐기면 자연스럽게 리스펙트 등급 UP! 보상도 UP!</Text>
          </SpaceView>

          <SpaceView mt={20} viewStyle={_styles.respectTabWrap}>
            {respectGradeList.map((item, index) => (
              <TouchableOpacity onPress={() => (setCurrentRespectType(item.type))} style={_styles.respectTabItem((memberBase.respect_grade == 'UNKNOWN' && item.type == 'MEMBER') || (memberBase.respect_grade == item.type))}>
                <Text style={[_styles.respectText(currentRespectType == item.type)]}>{item.type}</Text>

                {((memberBase.respect_grade == 'UNKNOWN' && item.type == 'MEMBER') || (memberBase.respect_grade == item.type)) && (
                  <SpaceView viewStyle={_styles.respectTabCurrentWrap}>
                    <SpaceView viewStyle={_styles.respectTabCurrentMark}><Text style={styles.fontStyle('R', 8, '#8BAAFF')}>현재 등급</Text></SpaceView>
                  </SpaceView>
                )}
              </TouchableOpacity>
            ))}
          </SpaceView>

          <SpaceView mt={20} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            {['FREE', 'CUBE', 'MEGACUBE'].map((item, index) => {
              let respectItem = respectGradeList.filter((item, index) => item.type == currentRespectType);
              let freeCnt = respectItem[0]?.freeCnt;
              let cubeCnt = respectItem[0]?.cubeCnt;
              let megaCubeCnt = respectItem[0]?.megaCubeCnt;

              return (
                <LinearGradient
                  colors={['rgba(77,190,182,0.8)', 'rgba(28,41,97,0.5)', 'rgba(41,45,54,0.8)']}
                  style={[_styles.respectItemWrap, {marginHorizontal: index == 1 ? 10 : 0}]}
                  start={{ x: 0.7, y: 0.7 }}
                  end={{ x: 0, y: 0 }} >

                  <Text style={[styles.fontStyle('SB', 11, '#fff'), {textAlign: 'center'}]}>
                    {item == 'FREE' && ( <>블라인드 카드{'\n'}매일 {freeCnt}회 무료 열람</> )}
                    {item == 'CUBE' && ( <>매주 월요일{'\n'}큐브 {cubeCnt}개 지급</> )}
                    {item == 'MEGACUBE' && ( <>매주 월요일{'\n'}메가 큐브 {megaCubeCnt}개 지급</> )}
                  </Text>

                  <SpaceView mt={10} mb={20}>
                    {item == 'FREE' && ( <Image source={ICON.respectFree} style={styles.iconSquareSize(60)} /> )}
                    {item == 'CUBE' && ( <Image source={ICON.respectCube} style={styles.iconSquareSize(60)} /> )}
                    {item == 'MEGACUBE' && ( <Image source={ICON.respectMegaCube} style={styles.iconSquareSize(60)} /> )}
                  </SpaceView>

                  <TouchableOpacity>
                    <Text style={_styles.respectItemBtn(false)}>받기</Text>
                  </TouchableOpacity>
                </LinearGradient>
              )
            })}
          </SpaceView>

          <SpaceView mt={30}>
            <SpaceView mb={5}><Text style={styles.fontStyle('EB', 15, '#fff')}>리스펙트 등급이 뭔가요?</Text></SpaceView>
            <Text style={styles.fontStyle('SB', 11, '#fff')}>리스펙트 등급은 유령 회원, 허위 프로필, 보이스 피싱을 포함하여 악성 회원과 클린
            회원을 구분해주는 리프의 클린 매칭 시스템입니다.</Text>
          </SpaceView>

          <SpaceView mt={20} viewStyle={{alignItems: 'flex-end'}}>
            <TouchableOpacity style={_styles.respectBtn}>
              <Text style={styles.fontStyle('B', 11, '#fff')}>등급 관리하기</Text>
              <Text style={styles.fontStyle('B', 11, '#fff')}>{'>'}</Text>
            </TouchableOpacity>
          </SpaceView>
        </LinearGradient>



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
  
  respectTabWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 5,
  },
  respectTabItem:(isOn:boolean) => {
    return {
      paddingHorizontal: 9,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: isOn ? 2 : 0,
      borderRadius: 9,
      borderColor: '#8BAAFF',
      backgroundColor: isOn ? 'rgba(171,232,255,0.3)' : 'transparent',
    };
  },
  respectText:(isOn:boolean) => {
    return {
      fontFamily: 'SUITE-Bold',
      fontSize: 11,
      color: isOn ? '#8BAAFF' : '#808080',
    };
  },
  respectTabCurrentWrap: {
    position: 'absolute',
    bottom: -13 ,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  respectTabCurrentMark: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    width: 45,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  respectItemWrap: {
    width: width/3.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F5E8A8',
    borderRadius: 25,
    overflow: 'hidden',
  },
  respectItemBtn:(isOn:boolean) => {
    return {
      fontFamily: 'SUITE-Bold',
      fontSize: 11,
      color: isOn ? '#fff' : '#000000',
      backgroundColor: isOn ? '#46F66F' : '#fff',
      borderRadius: 5,
      paddingVertical: 3,
    paddingHorizontal: 10,
    };
  },
  respectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 100,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  awardImgStyle: {
    width: 60,
    height: 83,
  },
  authItemWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(148,165,163,0.6)',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginHorizontal: 3,
    marginVertical: 5,
  },
  bannerWrap: {
    backgroundColor: 'rgba(53,81,72,0.5)', 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  homeVisitWrap: {
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 60,
    width: 60,
    height: 60,
    marginRight: 10,
  },
  storageBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 130,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 15,
  },
  vibeItemWrap: {
    paddingHorizontal: 10, 
    paddingVertical: 20, 
    marginTop: 30, 
    borderRadius: 10,
    width: width/2.3,
  },
  mileSlideWrap: {
    height:100,
    //flex:1,
  },
  mileSlideItem: {
    height: 100,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    //marginLeft: -25, // 좌측 마진
    //marginRight: 25, // 우측 마진
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

});


export default Story;