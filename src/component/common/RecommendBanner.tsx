import * as React from 'react';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList, Platform } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import { styles } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';


/* ######################################################################
#########################################################################
#### 추천 이성 배너 Component
#########################################################################
###################################################################### */
export default function RecommendBanner({ openFn }) {
  
  return (
    <>
      <SpaceView viewStyle={_styles.bannerWrap}>
        <SpaceView>
          <Text style={styles.fontStyle('EB', 19, '#fff')}>믿고 보는 추천 이성</Text>
          <SpaceView mt={10}><Text style={styles.fontStyle('SB', 9, '#fff')}>리프에서 특히나 Hot한 분들을 모아 봤는데...{'\n'}스-윽 보고 가실까요?🧐</Text></SpaceView>
        </SpaceView>
        <TouchableOpacity
          onPress={() => {
            if(isEmptyData(openFn)) {
              openFn();
            }
          }}>
          <LinearGradient
            colors={['#DF455D', '#E9109A']}
            style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 }}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }} >
            <Text style={styles.fontStyle('B', 11, '#fff')}>추천 목록 열기</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SpaceView>
    </>
  );
}


{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  bannerWrap: {
    backgroundColor: 'rgba(53,81,72,0.5)', 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },

});