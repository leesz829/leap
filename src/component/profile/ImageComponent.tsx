import { layoutStyle, styles, modalStyle } from 'assets/styles/Styles';
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



const { width, height } = Dimensions.get('window');

const ImageComponent = React.memo(({ dataList, addFn, modifyFn, deleteFn }) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup(); // 공통 팝업
  const isFocus = useIsFocused();

  const [currentImgIdx, setCurrentImgIdx] = React.useState(0); // 현재 이미지 인덱스

  // ############################################################################# 사진 선택
  const imgSelected = (idx:number, isNew:boolean) => {
    setCurrentImgIdx(idx);
  };
  
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
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.7 }}
        style={_styles.imgWrap} >

        <SpaceView mt={30}>
          <Text style={styles.fontStyle('EB', 20, '#fff')}>프로필 사진</Text>
          <SpaceView mt={10}><Text style={styles.fontStyle('SB', 12, '#fff')}>리프의 프로필은 다양한 느낌의 사진을 올릴 때 더 근사하게 꾸밀 수 있습니다. 내 프로필을 열람하는 친구를 위해 같은 느낌의 사진은 피해 주세요. (필수 사진 3장) </Text></SpaceView>
        </SpaceView>

        <SpaceView mt={30}>
          {[0,1,2,3,4,5].map((i, index) => {
            const dataArr = dataList.filter((itm, idx) => itm.del_yn == 'N' && currentImgIdx === (itm.order_seq-1));
            const data = dataArr[0];

            return index == currentImgIdx && (
              <>
                <MasterImageArea index={currentImgIdx} imgData={data} imgAddFn={addFn} imgModifyFn={modifyFn} />
              </>
            )
          })}
        </SpaceView>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <SpaceView pt={13} viewStyle={_styles.listWrap}>
            {[0,1,2,3,4,5].map((item, index) => {
              const dataArr = dataList.filter((itm, idx) => itm.del_yn == 'N' && index === (itm.order_seq-1));
              const data = dataArr[0];

              const imgUrl = findSourcePath(data?.img_file_path); // 이미지 경로
              const imgDelYn = data?.del_yn; // 이미지 삭제 여부
              const imgStatus = data?.status; // 이미지 상태

              const isDel = (index > 2 && isEmptyData(imgUrl) && imgDelYn == 'N');

              return (
                <>
                  <SpaceView key={'img_' + index}>
                    <LinearGradient
                      colors={index == currentImgIdx ? ['#46F66F', '#FFFF5D'] : ['transparent', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{borderRadius: 10, overflow: 'hidden', paddingHorizontal: 2, paddingVertical: 2, marginRight: 10}}
                    >
                      <TouchableOpacity 
                        onPress={() => { imgSelected(index, !isEmptyData(data)); }}
                        activeOpacity={0.9}
                      >
                        {isEmptyData(imgUrl) && imgDelYn == 'N' ? (
                          <>
                            <SpaceView viewStyle={_styles.subImgWrap}>
                              <Image
                                resizeMode="cover"
                                resizeMethod="scale"
                                style={styles.iconSquareSize(81)}
                                key={imgUrl}
                                source={imgUrl}
                              />
                            </SpaceView>
                          </>
                        ) : (
                          <>
                            <SpaceView viewStyle={_styles.subImgNoData}>
                              {/* <Image source={ICON.userAdd} style={styles.iconSquareSize(22)} /> */}
                            </SpaceView>
                          </>
                        )}
                      </TouchableOpacity>
                    </LinearGradient>

                    {/* 삭제 버튼 */}
                    {isDel && (
                      <TouchableOpacity
                       style={_styles.closeBtnWrap}
                       onPress={() => { deleteFn(data); }}>
                        <Image source={ICON.closeBtnWhite} style={styles.iconSquareSize(16)} />
                      </TouchableOpacity>
                    )}
                  </SpaceView>
                </>
              )
            })}
          </SpaceView>
        </ScrollView>

        
        {/* <SpaceView>
          <SpaceView>
            <SpaceView ml={3}><Text style={_styles.subImgTitle}>필수</Text></SpaceView>
            <SpaceView><ProfileImageItem index={0} imgData={profileData.profile_img_list.length > 0 ? profileData.profile_img_list[0] : null} imgSelectedFn={imgSelected} /></SpaceView>
            <SpaceView><ProfileImageItem index={1} imgData={profileData.profile_img_list.length > 1 ? profileData.profile_img_list[1] : null} imgSelectedFn={imgSelected} /></SpaceView>
            <SpaceView><ProfileImageItem index={2} imgData={profileData.profile_img_list.length > 2 ? profileData.profile_img_list[2] : null} imgSelectedFn={imgSelected} /></SpaceView>
          </SpaceView>
          <SpaceView>
            <SpaceView ml={3}><Text style={_styles.subImgTitle}>선택</Text></SpaceView>
            <SpaceView><ProfileImageItem index={3} imgData={profileData.profile_img_list.length > 3 ? profileData.profile_img_list[3] : null} imgSelectedFn={imgSelected} /></SpaceView>
            <SpaceView><ProfileImageItem index={4} imgData={profileData.profile_img_list.length > 4 ? profileData.profile_img_list[4] : null} imgSelectedFn={imgSelected} /></SpaceView>
            <SpaceView><ProfileImageItem index={5} imgData={profileData.profile_img_list.length > 5 ? profileData.profile_img_list[5] : null} imgSelectedFn={imgSelected} /></SpaceView>
          </SpaceView>
        </SpaceView> */}

      </LinearGradient>
    </>
  );
});

/* ########################################################################################## 대표사진 영역 렌더링 */
function MasterImageArea({ index, imgData, imgAddFn, imgModifyFn }) {
  const imgUrl = findSourcePath(imgData?.img_file_path); // 이미지 경로
  const imgDelYn = imgData?.del_yn; // 이미지 삭제 여부
  const imgStatus = imgData?.status; // 이미지 상태

  return (
    <>
      <LinearGradient
        colors={['#46F66F', '#FFFF5D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{borderRadius: 10, overflow: 'hidden', paddingHorizontal: 2, paddingVertical: 2}}
      >
        {isEmptyData(imgUrl) && imgDelYn == 'N' ? (
          <>
            <SpaceView>

              {/* 이미지 */}
              <SpaceView viewStyle={_styles.mstImgWrap}>
                <Image source={imgUrl} style={styles.iconNoSquareSize(width-20, height-310)} resizeMode="cover" />
              </SpaceView>

              {/* 대표사진, 필수사진 표시 */}
              {index < 3 && (
                <>
                  <SpaceView viewStyle={_styles.leftMarkWrap}>
                    {index == 0 && (
                      <SpaceView mr={5} viewStyle={_styles.mstMarkWrap}>
                        <Text style={styles.fontStyle('SB', 13, '#fff')}>대표사진</Text>
                      </SpaceView>
                    )}
                    <SpaceView>
                      <SpaceView viewStyle={_styles.mstMarkWrap}>
                        <Text style={styles.fontStyle('SB', 13, '#fff')}>필수사진</Text>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>
                </>
              )}

              {/* 상태 표시 */}
              <SpaceView viewStyle={_styles.imgStatusArea}>
                <Text style={_styles.imgStatusText(imgStatus)}>{imgStatus == 'PROGRESS' ? '심사중' : imgStatus == 'ACCEPT' ? '심사완료' : '반려'}</Text>
              </SpaceView>

              {/* 수정 버튼 */}
              <TouchableOpacity 
                style={_styles.modBtn}
                onPress={() => { 
                  //mngModalFn(imgData, index+1, imgUrl);
                  imgModifyFn(imgData, index+1);
                }} >
                <Image source={ICON.story_imageRegi} style={styles.iconSquareSize(15)} />
                <SpaceView ml={3}><Text style={styles.fontStyle('B', 12, '#fff')}>수정하기</Text></SpaceView>
              </TouchableOpacity>

              {/* 딤 처리 */}
              <LinearGradient
                colors={['#ffffff', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.8 }}
                style={_styles.imgDimArea} />
            </SpaceView>
          </>
        ) : (
          <SpaceView viewStyle={_styles.imgEmptyArea}>
            {/* <TouchableOpacity
              onPress={() => {
                imagePickerOpen(function(path:any, data:any) {
                  let _data = {
                    member_img_seq: 0,
                    img_file_path: path,
                    order_seq: dataList.length+1,
                    org_order_seq: dataList.length+1,
                    del_yn: 'N',
                    status: 'PROGRESS',
                    return_reason: '',
                    file_base64: data,
                  };
            
                  setDetaList((prev) => {
                    return [...prev, _data];
                  });
          
                  setCurrentImgIdx(0);
                });
              }}
            >
              <SpaceView mb={10} viewStyle={{alignItems: 'center'}}><Image source={ICON.userAdd} style={styles.iconSquareSize(64)} /></SpaceView>
              <SpaceView mb={60}><Text style={_styles.imgEmptyText}>대표사진은 얼굴이 뚜렷하게{'\n'}나온 셀카를 권장드려요.</Text></SpaceView>
              <SpaceView mb={20}><Text style={_styles.imgEmptyText}>다양한 분위기의 내 모습이 담긴{'\n'}사진을 추천드려요.</Text></SpaceView>
              <SpaceView mb={50}><Text style={_styles.imgEmptyText}>선택 사진을 올리고 더 근사한{'\n'}프로필을 꾸며 보세요.</Text></SpaceView>
            </TouchableOpacity> */}

            {/* 등록하기 버튼 */}
            <TouchableOpacity 
              style={_styles.modBtn}
              onPress={() => { 
                //mngModalFn(imgData, index+1, imgUrl);

                //imgAddFn

                imgAddFn(index+1);

              }}>
              <Image source={ICON.story_imageRegi} style={styles.iconSquareSize(15)} />
              <SpaceView ml={3}><Text style={styles.fontStyle('B', 12, '#fff')}>등록하기</Text></SpaceView>
            </TouchableOpacity>
          </SpaceView>
        )}
      </LinearGradient>
    </>
  );
};





{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  imgWrap: {
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingBottom: 10,
    overflow: 'hidden',
  },
  mstImgWrap: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  mstImgStyle: {
    width: width - 20,
    height: 500,
  },
  mstMarkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 25,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  leftMarkWrap: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    flexDirection: 'row',
  },
  imgStatusArea: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 25,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  imgStatusText: (status: string) => {
    let cr = '#D5CD9E';
    if(status == 'REFUSE') {
      cr = '#FF4D29';
    } else if(status == 'ACCEPT') {
      cr = '#46F66F';
    }
    return {
      fontFamily: 'SUITE-SemiBold',
      fontSize: 13,
      color: cr,
    };
  },
  modBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#44B6E5',
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  imgDimArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 130,
    opacity: 0.5,
    borderRadius: 20,
  },
  imgEmptyArea: {
    width: '100%',
    height: height-310,
    borderRadius: 10,
    backgroundColor: '#828282',
  },
  imgEmptyText: {
    fontFamily: 'SUITE-Regular',
    fontSize: 12,
    color: '#D5CD9E',
    textAlign: 'center',
  },
  subImgWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 10,
  },
  subImgNoData: {
    width: 81,
    height: 81,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#808080',
  },
  subImgStyle: {
    width: 83,
    height: 83,
    borderRadius: 5,
  },
  listWrap: {
    flexDirection: 'row',
  },
  closeBtnWrap: {
    position: 'absolute',
    top: -3,
    right: 7,
  },


  
});





export default ImageComponent;