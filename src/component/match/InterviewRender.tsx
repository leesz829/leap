import { layoutStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Color } from 'assets/styles/Color';
import { useDispatch, useSelector } from 'react-redux';
import { isEmptyData } from 'utils/functions';
import { ICON } from 'utils/imageUtils';
import { STACK, ROUTES } from 'constants/routes';

export default function InterviewRender({ title, isEdit, dataList }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  return (
    <>
      {isEmptyData(dataList) && dataList.length > 0 && (
        <SpaceView>
          <SpaceView mb={25} viewStyle={{alignItems: 'center'}}>
            <SpaceView viewStyle={{flexDirection: 'row'}}>
              <View style={{zIndex:1}}>
                <Text style={_styles.titText}>{title}</Text>
              </View>
              <View style={_styles.titUnderline} />
            </SpaceView>
          </SpaceView>

          <SpaceView viewStyle={{alignItems:'flex-start', justifyContent: 'flex-start'}}>
            {dataList.map((e, index) => {

              let isExp = true;

              if(!isEdit && !isEmptyData(e.answer)) {
                isExp = false;
              }

              return isExp && (e.common_code == 'INTER_00' || e.common_code == 'INTER_02' || e.common_code == 'INTER_04' || e.common_code == 'INTER_12' || e.common_code == 'INTER_17') && (
                <SpaceView key={'interview_' + index} mb={40} viewStyle={_styles.contentItemContainer}>
                  <SpaceView>
                    <SpaceView mb={10} viewStyle={_styles.questionRow}>
                      <Text style={_styles.questionText}>Q. {e?.code_name}</Text>
                    </SpaceView>

                    {(isEmptyData(isEdit) && isEdit) && (
                      <SpaceView viewStyle={{alignItems: 'flex-end', justifyContent: 'flex-end'}}>
                        <TouchableOpacity
                          onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_INTRODUCE }); }}
                          style={_styles.modBtn} 
                          key={index}
                        >
                          <Image source={ICON.squarePen} style={styles.iconSize16} />
                          <Text style={_styles.modBtnText}>수정</Text>
                        </TouchableOpacity>
                      </SpaceView>
                    )}

                    <SpaceView viewStyle={_styles.answerRow}>
                      <Text style={_styles.answerText}>"{isEmptyData(e?.answer) ? e?.answer : '답변을 등록해 주세요.'}"</Text>
                    </SpaceView>
                  </SpaceView>

                  {/* {(isEmptyData(isEditBtn) && isEditBtn) && (
                    <TouchableOpacity
                      onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_INTRODUCE }); }}
                      style={_styles.modBtn} 
                      key={index}
                    >
                      <Image source={ICON.squarePen} style={styles.iconSize16} />
                      <Text style={_styles.modBtnText}>수정</Text>
                    </TouchableOpacity>
                  )} */}
                </SpaceView>
              )
            })}
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
    color: '#F1B10E',
  },
  answerRow: {
    /* flexDirection: 'row',
    width: '80%',
    marginTop: 10,
    position: 'relative', */
  },
  answerText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 20,
    color: '#F3DEA6',
  },
  modBtn: {
    // position: 'absolute',
    // top: 0,
    // right: 0,
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
});
