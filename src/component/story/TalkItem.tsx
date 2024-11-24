import { layoutStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, Platform, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ICON, findSourcePath } from 'utils/imageUtils';
import { STACK, ROUTES } from 'constants/routes';


const { width, height } = Dimensions.get('window');

//export default function TalkItem({ item, profileOpenFn, goDetailFn }) {
const TalkItem = React.memo(({ item, profileOpenFn, goDetailFn }) => {
  //console.log('item ::::: ' , item);
  //console.log('story_board_seq ::::: ' , item.story_board_seq);

  const storyBoardSeq = item.story_board_seq; // 스토리 게시글 번호
  const storyType = item?.story_type; // 스토리 유형
  const imgPath = findSourcePath(item?.story_img_path);
  const voteImgPath01 = findSourcePath(item?.vote_img_path_01);
  const voteImgPath02 = findSourcePath(item?.vote_img_path_02);
  const secretYn = item?.secret_yn;

  let isNoImageLayout = (storyType == 'SECRET' || storyType == 'STORY') && !isEmptyData(imgPath) ? true : false; // 노이미지 레이아웃 여부
  let bgColor:any = []; // 배경색
  let applyMstImg = findSourcePath(item?.mst_img_path); // 적용 대표 이미지
  let applyRandomMstImg = ICON.story_manPeople01;

  if(storyType == 'SECRET') {
    bgColor = ['#8E1DFF', '#000000'];
  } else if(storyType == 'STORY') {
    bgColor = ['#FFD76B', '#FFB801'];
  } else if(storyType == 'VOTE') {
    bgColor = ['#A9DBFF', '#7B81EC'];
  }

  if(storyType == 'SECRET' || secretYn == 'Y') {
    if(item?.gender == 'M') {
      applyMstImg = ICON.storyMale;
    } else {
      applyMstImg = ICON.storyFemale;
    }
  };

  //const randomNumber = Math.floor(Math.random() * 8) + 1; // 1부터 8까지
  const randomNumber = ((item.story_board_seq - 1) % 8) + 1;
  console.log('randomNumber :::: ' , randomNumber);

  if(item?.gender == 'M') {
    if(randomNumber == 1) { applyRandomMstImg = ICON.story_manPeople01; }
    else if(randomNumber == 2) { applyRandomMstImg = ICON.story_manPeople02; }
    else if(randomNumber == 3) { applyRandomMstImg = ICON.story_manPeople03; }
    else if(randomNumber == 4) { applyRandomMstImg = ICON.story_manPeople04; }
    else if(randomNumber == 5) { applyRandomMstImg = ICON.story_manPeople05; }
    else if(randomNumber == 6) { applyRandomMstImg = ICON.story_manPeople06; }
    else if(randomNumber == 7) { applyRandomMstImg = ICON.story_manPeople07; }
    else if(randomNumber == 8) { applyRandomMstImg = ICON.story_manPeople08; }
  } else if(item?.gender == 'W') {
    if(randomNumber == 1) { applyRandomMstImg = ICON.story_womanPeople01; }
    else if(randomNumber == 2) { applyRandomMstImg = ICON.story_womanPeople02; }
    else if(randomNumber == 3) { applyRandomMstImg = ICON.story_womanPeople03; }
    else if(randomNumber == 4) { applyRandomMstImg = ICON.story_womanPeople04; }
    else if(randomNumber == 5) { applyRandomMstImg = ICON.story_womanPeople05; }
    else if(randomNumber == 6) { applyRandomMstImg = ICON.story_womanPeople06; }
    else if(randomNumber == 7) { applyRandomMstImg = ICON.story_womanPeople07; }
    else if(randomNumber == 8) { applyRandomMstImg = ICON.story_womanPeople08; }
  }



  return (
    <>
      <TouchableOpacity 
        style={_styles.itemWrap} 
        onPress={() => (goDetailFn(storyBoardSeq))}
        activeOpacity={0.9}
      >
        {/* 대표사진 영역 */}
        <SpaceView viewStyle={{flex: 0.5}}>
          <Image source={applyRandomMstImg} style={[styles.iconSquareSize(55), _styles.mstImgStyle]} />
        </SpaceView>

        <SpaceView viewStyle={{flex: 2, justifyContent: 'space-between'}}>

          {/* 닉네임, 키워드, 내용 표시 영역 */}
          <SpaceView>
            <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.fontStyle('SB', 15, '#000000')}>
                {isEmptyData(item?.nickname_modifier) ? item?.nickname_modifier + ' ' + item?.nickname_noun : item?.nickname}
              </Text>

              {isEmptyData(item?.keyword_code_name) && (
                <SpaceView viewStyle={_styles.keywordWrap}>
                  <Text style={styles.fontStyle('SB', 9, '#000000')}>{item?.keyword_code_name}</Text>
                </SpaceView>
              )}
            </SpaceView>

            <SpaceView mt={15}>
              <Text style={styles.fontStyle('SB', 12, '#000000')} numberOfLines={2}>{item?.contents}</Text>
            </SpaceView>
          </SpaceView>

          {/* 좋아요, 댓글 표시 영역 */}
          <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
            <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={ICON.story_heartBlack} style={styles.iconNoSquareSize(16, 13)} />
              <SpaceView ml={4}><Text style={styles.fontStyle('SB', 12, '#000')}>{item?.like_cnt}</Text></SpaceView>
            </SpaceView>
            <SpaceView ml={17} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={ICON.story_replyBlack} style={styles.iconSquareSize(14)} />
              <SpaceView ml={4}><Text style={styles.fontStyle('SB', 12, '#000')}>{item?.reply_cnt}</Text></SpaceView>
            </SpaceView>
          </SpaceView>
        </SpaceView>
      </TouchableOpacity>
    </>
  );
});



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  itemWrap: {
    backgroundColor: '#fff',
    minHeight: 110,
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 10,
  },
  mstImgStyle: {
    backgroundColor: '#000',
    borderRadius: 50,
    overflow: 'hidden',
  },
  keywordWrap: {
    backgroundColor: '#FFFF5D',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

});


export default TalkItem;