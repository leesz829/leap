import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';
import { STACK, ROUTES } from 'constants/routes';
import { modalStyle, layoutStyle, commonStyle, styles } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import { useUserInfo } from 'hooks/useUserInfo';


const { width, height } = Dimensions.get('window');

export default function InterestRender({ memberData, isEditBtn, interestList }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  const memberBase = useUserInfo();

  return (
    <>
      {(interestList.length > 0) ? (

        <SpaceView>
          <SpaceView mb={10}>
            <SpaceView mb={5}>
              <SpaceView mb={8}><Text style={styles.fontStyle('EB', 20, '#fff')}>{memberData?.nickname}님의 관심사</Text></SpaceView>
              <SpaceView><Text style={styles.fontStyle('B', 14, '#fff')}>함께 공유할 수 있는 관심사가 있으신가요?</Text></SpaceView>
            </SpaceView>
          </SpaceView>

          {/* {(isEmptyData(isEditBtn) && isEditBtn) && (
            <TouchableOpacity 
              onPress={() => { navigation.navigate(STACK.COMMON, { screen: ROUTES.PROFILE_INTEREST }); }} 
              style={_styles.modBtn}>
              <Image source={ICON.squarePen} style={styles.iconSize16} />
              <Text style={_styles.modBtnText}>수정</Text>
            </TouchableOpacity>
          )} */}

          <SpaceView>
            {interestList.length > 0 &&
              <SpaceView viewStyle={_styles.interestWrap}>
                <SpaceView mt={8} viewStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {interestList.map((item, index) => {
                    const isOn = item.dup_chk == 0 ? false : true;
                    return (
                      <View key={index} style={_styles.interestItem(isOn)}>
                        <Text style={styles.fontStyle('B', 14, '#fff')}>{item.code_name}</Text>
                      </View>
                    );
                  })}
                </SpaceView>
              </SpaceView>
            }
          </SpaceView>
        </SpaceView>
      ) : (
        <>

        </>
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
  introWrap: {
    minHeight: 150,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  interestWrap: {
    
  },
  interestItem: (isOn) => {
    return {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isOn ? '#FF3838' : '#434635',
      backgroundColor: '#434635',
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 5,
      marginBottom: 8,
      overflow: 'hidden',
    };
  },
  modBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
});