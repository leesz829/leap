import { styles, layoutStyle, modalStyle, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import React, { useRef } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ICON, findSourcePath, IMAGE } from 'utils/imageUtils';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import {
  RouteProp,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Modalize } from 'react-native-modalize';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SecondAuthPopup } from 'screens/commonpopup/SecondAuthPopup';
import axios from 'axios';
import * as properties from 'utils/properties';
import { usePopup } from 'Context';
import { get_profile_secondary_authentication, regist_second_auth } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';


/* ################################################################################################################
###################################################################################################################
###### 프로필 2차 인증 정보
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Signup01'>;
  route: RouteProp<StackParamList, 'Signup01'>;
}

export const Signup01 = (props: Props) => {
  console.log('## Signup01 memberSeq ::: ', props.route.params.memberSeq);
  console.log('## Signup01 gender ::: ', props.route.params.gender);

  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const { show } = usePopup();  // 공통 팝업
  const { width, height } = Dimensions.get('window');

  // ############################################################################# 프로필 2차 인증 데이터
  const [secondData, setSecondData] = React.useState({
    jobData: {common_code: 'JOB', code_name: '직업'},
    eduData: {common_code: 'EDU', code_name: '학업'},
    incomeData: {common_code: 'INCOME', code_name: '소득'},
    assetData: {common_code: 'ASSET',code_name: '자산'},
    snsData: {common_code: 'SNS', code_name: 'SNS'},
    vehicleData: {common_code: 'VEHICLE', code_name: '차량'},
  });

  // 이미지 파일
  const [filePathData, setFilePathData] = React.useState({
    filePath01 : ''
    , filePath02 : ''
    , filePath03 : ''
  });

  // 직업 Pop
  const job_modalizeRef = useRef<Modalize>(null);
  const job_onOpen = () => {
    getMemberSecondDetail('JOB');
  };
  const job_onClose = () => {
    job_modalizeRef.current?.close();
  };

  // 학위 Pop
  const edu_modalizeRef = useRef<Modalize>(null);
  const edu_onOpen = () => {
    getMemberSecondDetail('EDU');
  };
  const edu_onClose = () => {
    edu_modalizeRef.current?.close();
  };

  // 소득 Pop
  const income_modalizeRef = useRef<Modalize>(null);
  const income_onOpen = () => {
    getMemberSecondDetail('INCOME');
  };
  const income_onClose = () => {
    income_modalizeRef.current?.close();
  };

  // 자산 Pop
  const asset_modalizeRef = useRef<Modalize>(null);
  const asset_onOpen = () => {
    getMemberSecondDetail('ASSET');
  };
  const asset_onClose = () => {
    asset_modalizeRef.current?.close();
  };

  // SNS Pop
  const sns_modalizeRef = useRef<Modalize>(null);
  const sns_onOpen = () => {
    getMemberSecondDetail('SNS');
  };
  const sns_onClose = () => {
    sns_modalizeRef.current?.close();
  };

  // 차량 Pop
  const vehicle_modalizeRef = useRef<Modalize>(null);
  const vehicle_onOpen = () => {
    getMemberSecondDetail('VEHICLE');
  };
  const vehicle_onClose = () => {
    vehicle_modalizeRef.current?.close();
  };

  // ############################################################################# 2차인증 상세 정보 조회
  const getMemberSecondDetail = async(type: string) => {
    setFilePathData({
      filePath01: ''
      , filePath02: ''
      , filePath03: ''
    });

    const body = {
      member_seq: props.route.params.memberSeq
      , second_auth_code: type
    };
    try {
      const { success, data } = await get_profile_secondary_authentication(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:

            let filePath01 = '';
            let filePath02 = '';
            let filePath03 = '';
            data.auth_detail_list.map(({img_file_path, order_seq} : {img_file_path: any; order_seq: any;}) => {
              if(order_seq == 1) {
                filePath01 = img_file_path;
              } else if(order_seq == 2) {
                filePath02 = img_file_path;
              } else if(order_seq == 3) {
                filePath03 = img_file_path;
              }
            });

            setFilePathData({
              filePath01: filePath01
              , filePath02: filePath02
              , filePath03: filePath03
            });

            if(type === 'JOB') { job_modalizeRef.current?.open();
            } else if(type === 'EDU') { edu_modalizeRef.current?.open(); 
            } else if(type === 'INCOME') { income_modalizeRef.current?.open(); 
            } else if(type === 'ASSET') { asset_modalizeRef.current?.open(); 
            } else if(type === 'SNS') { sns_modalizeRef.current?.open(); 
            } else if(type === 'VEHICLE') { vehicle_modalizeRef.current?.open(); 
            }

            break;
          default:
            show({
              content: '오류입니다. 관리자에게 문의해주세요.' ,
              confirmCallback: function() {}
            });
            break;
        }
       
      } else {
        show({
          content: '오류입니다. 관리자에게 문의해주세요.' ,
          confirmCallback: function() {}
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  }

  // ############################################################################# 2차인증 저장 함수
  const saveSecondAuth = async(type: string, file_list: any) => {
    const body = {
      member_seq: props.route.params.memberSeq,
      file_list: file_list
    };
    try {
      const { success, data } = await regist_second_auth(body);

      if (success) {
        if (data.result_code == '0000') {
          //dispatch(setPartialPrincipal({mbr_ideal_type : data.mbr_second_auth_list}));
          show({
            content: '심사 요청 되었습니다.' ,
            confirmCallback: function() {
              if(type == 'JOB') { job_onClose(); }
              else if(type == 'EDU') { edu_onClose(); }
              else if(type == 'INCOME') { income_onClose(); }
              else if(type == 'ASSET') { asset_onClose(); }
              else if(type == 'SNS') { sns_onClose(); }
              else if(type == 'VEHICLE') { vehicle_onClose(); }
            }
          });          
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }

  }

  // ############################################################################# 최초 실행
  React.useEffect(() => {
    //getMemberProfileSecondAuth();
  }, [isFocus]);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const showImage = () => {
    const options = {
      noData: true,
      mediaType: 'photo' as const,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets) {
        const imageArray = response.assets[0].uri;
        console.warn(imageArray);
      }
    });

    /*launchCamera({mediaType:'photo'}, response => {
			console.warn(response);
		});*/
  };

  return (
    <>
      <CommonHeader title={'프로필 2차 인증'} />
      <ScrollView contentContainerStyle={[styles.scrollContainerAll]}>
        <SpaceView mb={35} viewStyle={[commonStyle.paddingHorizontal20]}>
          <SpaceView mb={15}>
            <Image source={IMAGE.signImg} style={styles.signImg} resizeMode="contain" />
          </SpaceView>
          <CommonText type={'h3'} fontWeight={'200'}>
            아래 버튼을 선택 후{'\n'}인증 뱃지를 등록 할 수 있습니다.
          </CommonText>
        </SpaceView>

        {/* <SpaceView mb={24}>
          <CommonText>
            아래 버튼 선택 후 인증 뱃지를 등록할 수 있습니다.{'\n'}
            뱃지를 추가하여 자신을 어필해보세요.
          </CommonText>
        </SpaceView> */}

        <SpaceView mb={24} viewStyle={commonStyle.paddingHorizontal20}>
          <SpaceView mb={16}>
            <View style={styles.halfContainer}>
              {/* ############################################################## 직업인증 */}
              <AuthItemRender data={secondData.jobData} pressFn={job_onOpen} />

              {/* ############################################################## 학위인증 */}
              <AuthItemRender data={secondData.eduData} pressFn={edu_onOpen} />
            </View>
          </SpaceView>

          <SpaceView mb={16}>
            <View style={styles.halfContainer}>
              {/* ############################################################## 소득인증 */}
              <AuthItemRender data={secondData.incomeData} pressFn={income_onOpen} />

              {/* ############################################################## 자산인증 */}
              <AuthItemRender data={secondData.assetData} pressFn={asset_onOpen} />
            </View>
          </SpaceView>

          <SpaceView>
            <View style={styles.halfContainer}>
              {/* ############################################################## SNS인증 */}
              <AuthItemRender data={secondData.snsData} pressFn={sns_onOpen} />

              {/* ############################################################## 차량인증 */}
              <AuthItemRender data={secondData.vehicleData} pressFn={vehicle_onOpen} />
            </View>
          </SpaceView>
        </SpaceView>

        <SpaceView>
          <CommonBtn
            value={'다음 (2/4)'}
            type={'primary'}
            height={60}
            borderRadius={1}
            onPress={() => {
              navigation.navigate('Signup02', {
                memberSeq: props.route.params.memberSeq,
                gender: props.route.params.gender,
              });
            }}
          />
        </SpaceView>
      </ScrollView>

      {/* ###############################################
								직업 인증 팝업
			############################################### */}
      <Modalize
        ref={job_modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={modalStyle.modalContainer}
        modalHeight={height - 130}
      >
        <SecondAuthPopup
          modalHeight={height - 130}
          type={'JOB'}
          onCloseFn={job_onClose}
          saveFn={saveSecondAuth}
          filePath01={filePathData.filePath01}
          filePath02={filePathData.filePath02}
          filePath03={filePathData.filePath03}
        />
      </Modalize>

      {/* ###############################################
								학위 인증 팝업
			############################################### */}
      <Modalize
        ref={edu_modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={modalStyle.modalContainer}
        modalHeight={height - 130}
      >
        <SecondAuthPopup
          modalHeight={height - 130}
          type={'EDU'}
          onCloseFn={edu_onClose}
          saveFn={saveSecondAuth}
          filePath01={filePathData.filePath01}
          filePath02={filePathData.filePath02}
          filePath03={filePathData.filePath03}
        />
      </Modalize>

      {/* ###############################################
								소득 인증 팝업
			############################################### */}
      <Modalize
        ref={income_modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={modalStyle.modalContainer}
        modalHeight={height - 130}
      >
        <SecondAuthPopup
          modalHeight={height - 130}
          type={'INCOME'}
          onCloseFn={income_onClose}
          saveFn={saveSecondAuth}
          filePath01={filePathData.filePath01}
          filePath02={filePathData.filePath02}
          filePath03={filePathData.filePath03}
        />
      </Modalize>

      {/* ###############################################
								자산 인증 팝업
			############################################### */}
      <Modalize
        ref={asset_modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={modalStyle.modalContainer}
        modalHeight={height - 130}
      >
        <SecondAuthPopup
          modalHeight={height - 130}
          type={'ASSET'}
          onCloseFn={asset_onClose}
          saveFn={saveSecondAuth}
          filePath01={filePathData.filePath01}
          filePath02={filePathData.filePath02}
          filePath03={filePathData.filePath03}
        />
      </Modalize>

      {/* ###############################################
								SNS 인증 팝업
			############################################### */}
      <Modalize
        ref={sns_modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={modalStyle.modalContainer}
        modalHeight={height - 130}
      >
        <SecondAuthPopup
          modalHeight={height - 130}
          type={'SNS'}
          onCloseFn={sns_onClose}
          saveFn={saveSecondAuth}
          filePath01={filePathData.filePath01}
          filePath02={filePathData.filePath02}
          filePath03={filePathData.filePath03}
        />
      </Modalize>

      {/* ###############################################
								차량 인증 팝업
			############################################### */}
      <Modalize
        ref={vehicle_modalizeRef}
        adjustToContentHeight={false}
        handleStyle={modalStyle.modalHandleStyle}
        modalStyle={modalStyle.modalContainer}
        modalHeight={height - 130}
      >
        <SecondAuthPopup
          modalHeight={height - 130}
          type={'VEHICLE'}
          onCloseFn={vehicle_onClose}
          saveFn={saveSecondAuth}
          filePath01={filePathData.filePath01}
          filePath02={filePathData.filePath02}
          filePath03={filePathData.filePath03}
        />
      </Modalize>
    </>
  );
};


{/* #######################################################################################################
								인증 아이템 렌더링
####################################################################################################### */}
const AuthItemRender = (dataObj: any) => {
  const data = dataObj.data;

  let imgSrc:any = '';
  let authDesc = '';

  if(data.common_code == 'JOB') {
    imgSrc = ICON.jobNew;
    authDesc = '내 커리어를 확인할 수 있는 명함 또는 증명서를 올려주세요';
  } else if(data.common_code == 'EDU') {
    imgSrc = ICON.degreeNew;
    authDesc = '대학교/대학원의 재학증명서/졸업증명를 올려주세요.';
  } else if(data.common_code == 'INCOME') {
    imgSrc = ICON.incomeNew;
    authDesc = '내 소득 자료를 올려주세요.';
  } else if(data.common_code == 'ASSET') {
    imgSrc = ICON.assetNew;
    authDesc = '은행에서 발급해주는 잔고 증명서를 올려주세요.';
  } else if(data.common_code == 'SNS') { 
    imgSrc = ICON.snsNew;
    authDesc = '내 인스타 ID가 보이는 스크린샷을 올려주세요.';
  } else if(data.common_code == 'VEHICLE') {
    imgSrc = ICON.vehicleNew;
    authDesc = '차량 등록등 또는 자동차보험가입 증빙 자료를 올려주세요.';
  }

  return (
    <TouchableOpacity style={styles.halfItemLeft} onPress={dataObj.pressFn} >
      <View style={styles.badgeBox}>
        <SpaceView mb={16}>
          <Image source={imgSrc} style={styles.iconSize60} />
        </SpaceView>

        <SpaceView>
          <View style={[layoutStyle.row, layoutStyle.alignCenter]}>
            <CommonText type={'h4'} fontWeight={'700'}>{data.code_name}</CommonText>
            <Image source={ICON.arrRight} style={styles.arrowIcon} />
          </View>
        </SpaceView>

        <CommonText
          color={ColorType.gray6666}
          type={'h6'}
          lineHeight={15} >
          {authDesc}
        </CommonText>
      </View>
    </TouchableOpacity>
  );
};






const _styles = StyleSheet.create({
  levelArea: {
    position: 'absolute',
    top: 20,
    right: 20
  },
  statusArea: {
    position: 'absolute',
    top: 50,
    right: 20
  },
  levelAreaLevelName: {
    fontSize: 14,
    marginRight: 8
  },
  levelAreaLevelValue: {
    fontSize: 20
  },
});