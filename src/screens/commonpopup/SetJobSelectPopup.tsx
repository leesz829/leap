import { ColorType, ScreenNavigationProp } from '@types';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Modal, TouchableOpacity, View, Image, Text, ScrollView, Dimensions, StyleSheet, FlatList } from 'react-native';
import { useUserInfo } from 'hooks/useUserInfo';
import LinearGradient from 'react-native-linear-gradient';
import { IMAGE, PROFILE_IMAGE, findSourcePath, ICON } from 'utils/imageUtils';
import { CommaFormat, isEmptyData, formatNowDate } from 'utils/functions';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { STACK, ROUTES } from 'constants/routes';
import { get_common_code_list } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';
import { CommonLoading } from 'component/CommonLoading';



/* ################################################################################################################
###################################################################################################################
###### 직업 설정 팝업 Component
###################################################################################################################
################################################################################################################ */

interface Props {
  isVisible?: boolean; // popup state
  setIsVisible?: any; // popup setState
  closeModal: () => void;
  confirmCallbackFunc?: Function | undefined; // 확인 Callback 함수
  authList?: any;
}

const { width, height } = Dimensions.get('window');

const SetJobSelectPopup = React.memo(({ isVisible, closeFunc, confirmCallbackFunc, data }) => {

  const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부

  const [step, setStep] = React.useState(0);
  const [selectValue, setSelectValue] = React.useState({
    name: '',
    code: data?.value,
    value1: data?.value1,
    value2: data?.value2,
  });


  const [codeList, setCodeList] = React.useState([]);

  const nextFn = async () => {
    getCodeList();
  };

  const prevFn = async () => {
    setStep(0);
    setSelectValue({
      ...selectValue,
      value2: '',
    })
  };


  // ############################################################ 회원 소개 정보 조회 함수
  const getCodeList = async () => {
    const body = {
      group_code: selectValue.value1,
    };

    try {
      setIsLoading(true);
      const { success, data } = await get_common_code_list(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            setCodeList(data?.code_list);
            setStep(1);
          
            break;
          default:
            break;
        }
      } else {
        
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };


  React.useEffect(() => {
    if(!isVisible) {
      setStep(0);
      setSelectValue({name: '', code: '', value1: '', value2: ''});
    } else {
      console.log('data :::: ' , data);
      setSelectValue({name: '', code: data?.value, value1: data?.value1, value2: data?.value2});
    }
	}, [isVisible]);

  // ################################################################ 초기 실행 함수

  return (
    <>
      <Modal visible={isVisible} transparent={true}>
        {isLoading && <CommonLoading />}

        <View style={modalStyle.modalBackground}>
          <View style={[modalStyle.modalStyle1]}>
            <SpaceView viewStyle={_styles.modalWrap}>
              <SpaceView mb={20}>
                <Text style={styles.fontStyle('H', 26, '#000000')}>{data?.name}</Text>
              </SpaceView>

              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <SpaceView mt={20} pl={15} pr={15} viewStyle={{height: 250, paddingVertical: 15}}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.8)', 'transparent']}
                    style={_styles.topGradient}
                  />

                  {step == 0 && (
                    <>
                      <FlatList
                        data={data?.dataList}
                        keyExtractor={item => item?.value}
                        numColumns={1}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity 
                            style={_styles.heightItemWrap(selectValue.value1 == item?.value, data?.isMinMax)} 
                            activeOpacity={0.5}
                            onPress={() => { 
                              setSelectValue({
                                ...selectValue,
                                value1: item?.value,
                              });
                            }}>
                            <Text style={[styles.fontStyle('B', 12, selectValue.value1 == item?.value ? '#fff' : '#44B6E5'), {textAlign: 'center'}]}>{item?.label}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </>
                  )}

                  {step == 1 && (
                    <>
                      <FlatList
                        data={codeList}
                        keyExtractor={item => item?.common_code}
                        numColumns={2}
                        columnWrapperStyle={{flex: 1, justifyContent: 'space-between'}}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity 
                            style={_styles.heightItemWrap(selectValue.value2 == item?.common_code, data?.isMinMax)} 
                            activeOpacity={0.5}
                            onPress={() => { 
                              setSelectValue({
                                ...selectValue,
                                name: item?.code_name,
                                value2: item?.common_code,
                              });
                            }}>
                            <Text style={[styles.fontStyle('B', 12, selectValue.value2 == item?.common_code ? '#fff' : '#44B6E5'), {textAlign: 'center'}]}>{item?.code_name}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </>
                  )}

                  <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.8)']}
                    style={_styles.bottomGradient}
                  />
                </SpaceView>

                <SpaceView mt={10} mb={15} viewStyle={{flexDirection: 'row', justifyContent: 'flex-end'}}>

                  {step == 0 && (
                    <TouchableOpacity 
                      style={_styles.confirmBtn}
                      onPress={() => {
                        nextFn();
                      }}
                    >
                      <Text style={styles.fontStyle('B', 16, '#fff')}>다음</Text>
                    </TouchableOpacity>
                  )}

                  {step == 1 && (
                    <>
                      <SpaceView>
                        <TouchableOpacity 
                          style={_styles.prevBtn}
                          onPress={() => {
                            prevFn();
                          }} 
                        >
                          <Text style={styles.fontStyle('B', 16, '#fff')}>이전</Text>
                        </TouchableOpacity>
                      </SpaceView>
                      <SpaceView ml={10}>
                        <TouchableOpacity 
                          style={_styles.confirmBtn}
                          onPress={() => {
                            confirmCallbackFunc(data?.code, selectValue.name, selectValue.code, null, selectValue.value1, selectValue.value2);
                          }}
                        >
                          <Text style={styles.fontStyle('B', 16, '#fff')}>확인</Text>
                        </TouchableOpacity>
                      </SpaceView>
                    </>
                  )}
                  
                </SpaceView>
              </ScrollView>
            </SpaceView>

            <SpaceView viewStyle={_styles.cancelWrap}>
              <TouchableOpacity onPress={() => closeFunc(data?.code)}>
                <Text style={styles.fontStyle('EB', 16, '#ffffff')}>여기 터치하고 닫기</Text>
              </TouchableOpacity>
            </SpaceView>
          </View>
        </View>
      </Modal>
    </>
  );
});




{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  modalWrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 35,
    paddingBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  prevBtn: {
    backgroundColor: '#44B6E5',
    borderRadius: 25,
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtn: {
    backgroundColor: '#46F66F',
    borderRadius: 25,
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelWrap: {
    position: 'absolute',
    bottom: -40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  heightItemWrap: (isOn:boolean) => {
		return {
			borderWidth: 1,
      borderColor: '#44B6E5',
      borderRadius: 15,
      width: '100%',
      paddingVertical: 7,
      marginBottom: 5,
      backgroundColor: isOn ? '#44B6E5' : 'transparent',
    };
	},
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10, // 그라데이션 높이를 조정하세요
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10, // 그라데이션 높이를 조정하세요
    zIndex: 1,
  },

});

export default SetJobSelectPopup;