import { layoutStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, Platform, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Color } from 'assets/styles/Color';
import { useDispatch, useSelector } from 'react-redux';
import { isEmptyData } from 'utils/functions';
import { ICON } from 'utils/imageUtils';
import { STACK, ROUTES } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function InterviewRender({ nickname, isEdit, dataList }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  return (
    <>
      {isEmptyData(dataList) && dataList.length > 0 && (
        <SpaceView>
          <SpaceView mb={15}>
            <Text style={styles.fontStyle('EB', 20, '#fff')}>인터뷰</Text>
            <SpaceView mt={15}><Text style={styles.fontStyle('B', 12, '#CBCBCB')}>{nickname}님의 생각이 궁금하시다면 필독해주세요.</Text></SpaceView>
          </SpaceView>

          <SpaceView>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={_styles.listArea}>

              {dataList?.map((item, index) => {
                let isExp = true;

                if(!isEdit && !isEmptyData(item.answer)) {
                  isExp = false;
                }

                return isEmptyData(item.answer) && (
                  <LinearGradient
                    colors={['rgba(203,239,255,0.3)', 'rgba(113,143,156,0.3)', 'rgba(122,154,183,0.3)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.3, y: 0.2 }}
                    style={_styles.listItem}>

                    <SpaceView>
                      <Text style={styles.fontStyle('B', 14, '#fff')}>{item?.code_name}</Text>
                    </SpaceView>

                    <SpaceView mt={30} viewStyle={_styles.answerWrap}>
                      <Text style={styles.fontStyle('B', 14, '#C4B6AA')}>{item.answer}</Text>
                    </SpaceView>

                  </LinearGradient>
                )
              })}
            </ScrollView>
          </SpaceView>
        </SpaceView>
      )}
    </>
  );
}



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({

  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 27,
    color: '#FFF8CC',
  },
  mstText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
    color: '#344756',
    textAlign: 'center',
  },
  interviewListWrap: {

  },
  titText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  titUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 7,
    backgroundColor: '#FE8C12',
  },
  contentItemContainer: {
    width: '100%',
    //flexDirection: 'row',
    justifyContent: 'space-between',
    //minHeight: 60,
    borderRadius: 10,
  },
  itemActive: {
    backgroundColor: '#fff',
    borderColor: '#F7F7F7',
  },
  questionRow: {
    
  },
  questionText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#D5CD9E',
  },
  answerRow: {
    /* flexDirection: 'row',
    width: '80%',
    marginTop: 10,
    position: 'relative', */
  },
  answerText: (_cr:string,) => {
    return {
      fontFamily: 'Pretendard-Regular',
      fontSize: 20,
      color: _cr,
    };
  },
  modBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 65,
    height: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  modBtnText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#D5CD9E',
    marginLeft: 3,
  },






  listArea: {

  },
  listItem: {
    width: width - 150,
    height: 300,
    borderRadius: 10,
    marginRight: 20,
    paddingHorizontal: 13,
    paddingVertical: 27,
  },
  answerWrap: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 150,
    paddingHorizontal: 11,
    paddingVertical: 13,
  },

});
