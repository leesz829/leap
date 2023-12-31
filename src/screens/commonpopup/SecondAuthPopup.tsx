import React, { useRef } from 'react';
import type { FC, useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, ScrollView, Text, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Modalize } from 'react-native-modalize';
import CommonHeader from 'component/CommonHeader';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import { ICON } from 'utils/imageUtils';
import { CommonInput } from 'component/CommonInput';
import SpaceView from 'component/SpaceView';
import { CommonBtn } from 'component/CommonBtn';
import { ColorType } from '@types';
import { ImagePicker } from 'component/ImagePicker';
import { save_profile_second_auth, get_member_second_detail } from 'api/models';
import { usePopup } from 'Context';
import { useDispatch } from 'react-redux';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { useSecondAth } from 'hooks/useSecondAth';
import { CommonTextarea } from 'component/CommonTextarea';



/* ################################################################################################################
###################################################################################################################
###### 2차 인증 팝업
###### 1. type
###### - JOB : 직업
###### - EDU : 학위
###### - INCOME : 소득
###### - ASSET : 자산
###### - SNS : SNS
###### - VEHICLE : 차량
###################################################################################################################
################################################################################################################ */

interface Props {
  modalHeight: number
  type: string;
  onCloseFn: () => void;
  saveFn: (
      type: string,
      list: any,
      comment: string,
  ) => void;
  filePath01?: string
  filePath02?: string
  filePath03?: string
  auth_status?: string
  auth_comment?: string
  return_reason?: string
  isShopComment?: boolean
}

export const SecondAuthPopup = (props: Props) => {
  const dispatch = useDispatch();
  const { show } = usePopup();  // 공통 팝업
  const isFocus = useIsFocused();

  const mbrSecondAuthList = useSecondAth();  // 회원 2차 인증 정보

  // 클릭 여부
  const [isClickable, setIsClickable] = React.useState(true);
  
  const type = props.type;
  let title = '';
  let itemNm = '';
  let placeholderTxt = '';
  let etcTxt01 = '';
  let etcTxt02 = '';
  let etcTxt02_02 = '';
  let etcTxt03 = '';

  const fileInfo = { uri: '', fileName: '', fileSize: 0, type: '', base64: '' };
  const [fileDataList, setFileDataList] = React.useState([]);
  const [item, setItem] = React.useState(props.itemTxt);

  const [authFile_01, setAuthFile_01] = React.useState('');
  const [authFile_02, setAuthFile_02] = React.useState('');
  const [authFile_03, setAuthFile_03] = React.useState('');

  const [authComment, setAuthComment] = React.useState<any>(props.auth_comment);


  if (type == 'JOB') {
    title = '직업';
    itemNm = '직업';
    placeholderTxt = '직업을 입력해주세요. (예 : 삼성전자 마케팅)';
    etcTxt01 = '심사에 요구되는 증빙자료를 올려주세요.';
    etcTxt02 = '재직증명서, 사원증, 명함, 공무원증(급수포함), 사업자등록증, 재무제표, 기타 입증자료';
    etcTxt03 = '아래 기준에 기초하여 인증 레벨이 부여됩니다.';
  } else if (type == 'EDU') {
    title = '학업';
    itemNm = '교육기관';
    placeholderTxt = '출신 교육기관을 입력해주세요. (예 : 서울대 컴퓨터 공학과)';
    etcTxt01 = '심사에 요구되는 증빙자료를 올려주세요.';
    etcTxt02 = '졸업 증명서, 재학 증명서, 학위 증명서';
    etcTxt03 = 'THE(세계 대학 순위)에서 최근에 발표한 세계대학 순위에 기초하여 학력 레벨이 부여됩니다.';
  } else if (type == 'INCOME') {
    title = '소득';
    etcTxt01 = '심사에 요구되는 증빙자료를 올려주세요.';
    etcTxt02 = 'ex) 소득금액증명원, 근로소득원천징수증, 부가가치세증명원, 기타 소득입증자료, 근로계약서 등';
    etcTxt03 = '근로소득자  : 원천징수영수증 또는 법인 직인이 날인된 연봉계약서';
  } else if (type == 'ASSET') {
    title = '자산';
    etcTxt01 = '심사에 요구되는 증빙자료를 올려주세요.';
    etcTxt02 = '은행 직인이 찍힌 잔고 증명서 및 확인 가능한 부동산 관련 서류 또는 그 외에 확인 가능한 자산 입증 서류';
    etcTxt03 = '현금 또는 부동산 자산 중 1가지를 선택하여 증빙 자료를 올려주세요. 단, 2가지 모두 충족하시는 경우 한 단계 높은 레벨이 부여됩니다.(최대 7레벨)';
  } else if (type == 'SNS') {
    title = 'SNS';
    itemNm = '인스타ID';
    placeholderTxt = '인스타그램 ID를 입력해주세요.';
    etcTxt01 = '심사에 요구되는 증빙자료를 올려주세요.';
    etcTxt02 = '대중적 SNS인 인스타그램, 페이스북, 틱톡 등에서 메시지 수신이 가능한 계정이 노출된 스크린샷';
    etcTxt02_02 = '유튜브, 트위치 등은 별도 문의 부탁드립니다.(cs@limeeted.com 또는 가입 후 ‘고객문의’)';
    etcTxt03 = '가장 높은 팔로워 수를 보유한 SNS 매체를 기준으로 레벨이 부여됩니다.';
  } else if (type == 'VEHICLE') {
    title = '차량';
    itemNm = '모델명';
    placeholderTxt = '소유중인 차량 모델을 입력해주세요. (예 : 제네시스 G80)';
    etcTxt01 = '심사에 요구되는 증빙자료를 올려주세요.';
    etcTxt02 = '자동차 등록증, 최근 자동차 보험 납부 기록';
    etcTxt03 = '증빙 자료로 제출한 자동차의 출고가에 따라 레벨이 부여됩니다.';
  }

  // ################################################################ 인증 파일 콜백 함수
  const fileCallBackFn01 = (
    uri: any,
    base64: string
  ) => {
    let dupChk = false;
    let data = {file_uri: uri, file_base64: base64, order_seq: 1, auth_code: type};
    fileDataList.map(({order_seq} : {order_seq: any;}) => {
      if(order_seq == 1) { dupChk = true };
    })
    if(!dupChk) {
      setFileDataList([...fileDataList, data]);
    } else {
      setFileDataList((prev) =>
        prev.map((item: any) =>
          item.order_seq === 1 ? { ...item, uri: data.file_uri, file_base64: data.file_base64 } : item
        )
      );
    }
  };

  const fileCallBackFn02 = (
    uri: any,
    base64: string
  ) => {
    let dupChk = false;
    let data = {file_uri: uri, file_base64: base64, order_seq: 2, auth_code: type};
    fileDataList.map(({order_seq} : {order_seq: any;}) => {
      if(order_seq == 2) { dupChk = true };
    })
    if(!dupChk) {
      setFileDataList([...fileDataList, data]);
    } else {
      setFileDataList((prev) =>
        prev.map((item: any) =>
          item.order_seq === 2 ? { ...item, file_uri: data.file_uri, file_base64: data.file_base64 } : item
        )
      );
    }
  };

  const fileCallBackFn03 = (
    uri: any,
    base64: string
  ) => {
    let dupChk = false;
    let data = {file_uri: uri, file_base64: base64, order_seq: 3, auth_code: type};
    fileDataList.map(({order_seq} : {order_seq: any;}) => {
      if(order_seq == 3) { dupChk = true };
    })
    if(!dupChk) {
      setFileDataList([...fileDataList, data]);
    } else {
      setFileDataList((prev) =>
        prev.map((item: any) =>
          item.order_seq === 3 ? { ...item, file_uri: data.file_uri, file_base64: data.file_base64 } : item
        )
      );
    }
  };

  // ################################################################ 2차 인증 저장 함수
  const saveSecondAuth = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);

      try {
        props.saveFn(props.type, fileDataList, type, authComment);
      } catch (error) {
        console.log(error);
      } finally {
        
      }
    }

    /* const body = {
      file_list: fileDataList
    };
    try {
      const { success, data } = await save_profile_second_auth(body);

      if (success) {
        if (data.result_code == '0000') {
          //dispatch(setPartialPrincipal({mbr_ideal_type : data.mbr_second_auth_list}));
          show({
            content: '심사 요청 되었습니다.' ,
            confirmCallback: function() {
              props.onCloseFn();
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
      
    } */
  };

  // ################################################################ 회원 2차인증 상세 목록 조회
  const getMemberSecondDetail = async () => {
    const body = {
      second_auth_code: type
    };
    try {
      const { success, data } = await get_member_second_detail(body);
      if(success) {
        if(data.result_code == '0000') {
          data.auth_detail_list.map(({img_file_path, order_seq} : {img_file_path: any; order_seq: any;}) => {
              if(order_seq == 1) {
                setAuthFile_01(img_file_path);
              } else if(order_seq == 2) {
                setAuthFile_02(img_file_path);
              } else if(order_seq == 3) {
                setAuthFile_03(img_file_path);
              }
          });

        } else {
          show({
            content: '오류입니다. 관리자에게 문의해주세요.' ,
            confirmCallback: function() {}
          });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }
  }

  
  // 첫 렌더링 때 fetchNews() 한 번 실행
  React.useEffect(() => {
    //getMemberSecondDetail();
  }, [isFocus]);


  return (
    <>

      {/* ######################### header */}
      <View style={[modalStyle.modalHeaderContainer]}>
        <CommonText fontWeight={'700'} type={'h3'}>
          {title}인증
        </CommonText>
        <TouchableOpacity onPress={props.onCloseFn} hitSlop={commonStyle.hipSlop20}>
          <Image source={ICON.xBtn2} style={styles.iconSize18} />
        </TouchableOpacity>
      </View>

      {/* ######################### body */}
      <ScrollView style={{height: props.modalHeight - 132}}>
        <SpaceView viewStyle={[commonStyle.paddingHorizontal20]}>
          <SpaceView mb={24}>
            <SpaceView mb={16} viewStyle={layoutStyle.row}>
              <Image source={ICON.confirmation} style={[styles.iconSize20, {marginTop: 3}]} />
              <CommonText 
                color={ColorType.blue697A}
                fontWeight={'700'}
                textStyle={{marginLeft: 5, textAlignVertical: 'center'}}>증명방법 !</CommonText>
            </SpaceView>

            <SpaceView mb={12}>
              <View style={styles.dotTextContainer}>
                <View style={styles.dot} />
                <CommonText
                  color={'#6E6E6E'} 
                  fontWeight={'500'}
                  lineHeight={17}
                  type={'h5'}
                  textStyle={{marginTop: 4}}>{etcTxt01}</CommonText>
              </View>
            </SpaceView>
            
            {etcTxt02 != '' ? (
              <SpaceView>
                <View style={styles.dotTextContainer}>
                  <View style={styles.dot} />
                  <CommonText 
                    color={'#6E6E6E'} 
                    fontWeight={'500'}
                    lineHeight={17}
                    type={'h5'}
                    textStyle={{marginTop: 4}}>{etcTxt02}</CommonText>
                </View>
              </SpaceView>
            ) : null}

            {etcTxt02_02 != '' ? (
              <SpaceView mt={12}>
                <View style={styles.dotTextContainer}>
                  <View style={styles.dot} />
                  <CommonText 
                    color={'#6E6E6E'} 
                    fontWeight={'500'}
                    lineHeight={17}
                    type={'h5'}
                    textStyle={{marginTop: 4}}>{etcTxt02_02}</CommonText>
                </View>
              </SpaceView>
            ) : null}
          </SpaceView>

          {/* <SpaceView mb={24}>
            <CommonBtn value={'등록 및 수정'} height={48} type={'white'} icon={ICON.plus} />
          </SpaceView> */}

          <SpaceView mb={30} viewStyle={[layoutStyle.alignCenter]}>
            <View style={[layoutStyle.row]}>
              <View>
                <ImagePicker
                  isAuth={true}
                  plusBtnType={'02'}
                  callbackFn={fileCallBackFn01}
                  uriParam={(props.auth_status == 'PROGRESS') && props.filePath01}
                  auth_status={props.auth_status}
                />
              </View>
              <View style={[commonStyle.mr10, commonStyle.ml10]}>
                <ImagePicker
                  isAuth={true}
                  plusBtnType={'02'}
                  callbackFn={fileCallBackFn02}
                  uriParam={(props.auth_status == 'PROGRESS') && props.filePath02}
                  auth_status={props.auth_status}
                />
              </View>
              <View>
                <ImagePicker
                  isAuth={true}
                  plusBtnType={'02'}
                  callbackFn={fileCallBackFn03}
                  uriParam={(props.auth_status == 'PROGRESS') && props.filePath03}
                  auth_status={props.auth_status}
                />
              </View>
            </View>
          </SpaceView>

          {/* ####################################################### 인증 코멘트 입력 영역 */}
          {props.isShopComment &&
            <SpaceView mb={30} viewStyle={_styles.commentArea}>
              <CommonTextarea
                  label={''} 
                  value={authComment}
                  onChangeText={(authComment) => setAuthComment(authComment)}
                  placeholder={'상대방에게 보여지는 나의 인증 코멘트를 작성해 주세요!\n※ 심사 후에는 인증 레벨과 인증 코멘트만 공개 됩니다.'}
                  placeholderTextColor={'#989898'}
                  maxLength={50}
                  height={90}
                  borderRadius={15}
                  fontSize={13}
                  fontColor={'#989898'}
                  lineCount={3}
                  backgroundColor={'transparent'}
              />
            </SpaceView>
          }

          {/* ####################################################### 반려 사유 안내 영역 */}
          {props.auth_status == 'REFUSE' && props.return_reason != '' && typeof props.return_reason != 'undefined' &&
            <SpaceView mb={24}>
              <SpaceView mb={16} viewStyle={layoutStyle.row}>
                <Image source={ICON.confirmation} style={[styles.iconSize20, {marginTop: 3}]} />
                <CommonText 
                  color={ColorType.blue697A}
                  fontWeight={'700'}
                  textStyle={{marginLeft: 5, textAlignVertical: 'center'}}>반려 사유 안내</CommonText>
              </SpaceView>

              <SpaceView mb={12} viewStyle={_styles.refuseArea}>
                <Text style={_styles.returnReasonText}>{props.return_reason}</Text>
              </SpaceView>
            </SpaceView>
          }

          <SpaceView mb={24}>
            <SpaceView mb={16} viewStyle={layoutStyle.row}>
              <Image source={ICON.confirmation} style={[styles.iconSize20, {marginTop: 3}]} />
              <CommonText 
                color={ColorType.blue697A}
                fontWeight={'700'}
                textStyle={{marginLeft: 5, textAlignVertical: 'center'}}>{title} 인증 심사 기준</CommonText>
            </SpaceView>

            <SpaceView mb={12}>
              <View style={styles.dotTextContainer}>
                <View style={styles.dot} />
                <CommonText
                  color={'#6E6E6E'} 
                  fontWeight={'500'}
                  lineHeight={17}
                  type={'h5'}
                  textStyle={{marginTop: 4}}>{etcTxt03}</CommonText>
              </View>
            </SpaceView>
            
            <SpaceView mb={15}>
              {type == 'JOB' && (
                <>
                  <SpaceView mb={12}>
                    <View style={styles.dotTextContainer}>
                      <View style={styles.dot} />
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>직업 심사 기준</CommonText>
                    </View>
                  </SpaceView>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>사기업</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>중소기업, 중견기업, 대기업</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>공무원</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>국내 모든 공무 직종</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>전문직</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>의료인, 법조인, 약사, 수의사, 회계, 세무, 무역, 부동산, 각종 기술사 등</Text>
                  </View>
                  <SpaceView mb={12} mt={20}>
                    <View style={styles.dotTextContainer}>
                      <View style={styles.dot} />
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>세부 기준</CommonText>
                    </View>
                  </SpaceView>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>사기업</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>사원급, 과장급, 임원급, 대표</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>공무원</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>공무원 급수에 따라 차등하여 레벨 부여</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>전문직</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>운영 내규에 따라 차등하여 레벨 부여</Text>
                  </View>

                  <SpaceView mb={12} mt={13}>
                    <View style={styles.dotTextContainer}>
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>※ 개인사업자는 내규에 따라 별도 심사 가능</CommonText>
                    </View>
                  </SpaceView>
                </>
              )}

              {type == 'EDU' && (
                <>
                  <SpaceView mb={12}>
                    <View style={styles.dotTextContainer}>
                      <View style={styles.dot} />
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>학력 심사 기준</CommonText>
                    </View>
                  </SpaceView>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 5</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 80점 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 4</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 70점 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 3</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 50~70점</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 2</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 30~50점</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 1</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 30점 미만</Text>
                  </View>
                  <SpaceView mb={12} mt={20}>
                    <View style={styles.dotTextContainer}>
                      <View style={styles.dot} />
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>세부 기준</CommonText>
                    </View>
                  </SpaceView>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>일반</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>학사 -  석사 - 박사에 따라 차등하여 레벨 가산</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>특수</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>의대, 법대, 약대, 교대, 사범대, 예체능 등 별도 레벨 가산</Text>
                  </View>

                  <SpaceView mb={12} mt={13}>
                    <View style={styles.dotTextContainer}>
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>※ THE 기준 외 국내외 대학은 내규에 따라 별도 심사 가능</CommonText>
                    </View>
                  </SpaceView>
                </>
              )}

              {type == 'INCOME' && (
                <>
                  <SpaceView mb={12}>
                    <View style={styles.dotTextContainer}>
                      <View style={styles.dot} />
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>법인 및 개인사업자 : 소득금액증명원, 부가가치세증명원</CommonText>
                    </View>
                  </SpaceView>

                  <SpaceView mb={12}>
                    <View style={styles.dotTextContainer}>
                      <View style={styles.dot} />
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>소득 심사 기준(단위: 만원)</CommonText>
                    </View>
                  </SpaceView>
                  <View style={[_styles.rowStyle, _styles.rowHeader]}>
                    <Text style={[_styles.rowTextLeft, {color: '#fff'}]}>구분</Text>
                    <Text style={[_styles.rowTextRight, {color: '#fff'}]}>연소득</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 1</Text>
                    <Text style={_styles.rowTextRight}>3,000</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 2</Text>
                    <Text style={_styles.rowTextRight}>5,000</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 3</Text>
                    <Text style={_styles.rowTextRight}>7,000</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 4</Text>
                    <Text style={_styles.rowTextRight}>10,000</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 5</Text>
                    <Text style={_styles.rowTextRight}>20,000</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 6</Text>
                    <Text style={_styles.rowTextRight}>50,000</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 7</Text>
                    <Text style={_styles.rowTextRight}>100,000</Text>
                  </View>
                </>
              )}

              {type == 'ASSET' && (
                <>
                  <SpaceView mb={12}>
                    <View style={styles.dotTextContainer}>
                      <View style={styles.dot} />
                      <CommonText
                        color={'#6E6E6E'} 
                        fontWeight={'500'}
                        lineHeight={17}
                        type={'h5'}
                        textStyle={{marginTop: 4}}>자산 심사 기준(단위: 억원)</CommonText>
                    </View>
                  </SpaceView>
                  <View style={[_styles.rowStyle, _styles.rowHeader]}>
                    <Text style={[_styles.rowTextLeft, {color: '#fff'}]}>구분</Text>
                    <Text style={[_styles.rowTextCenter, {color: '#fff'}]}>현금</Text>
                    <Text style={[_styles.rowTextRight, {color: '#fff'}]}>부동산</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 1</Text>
                    <Text style={_styles.rowTextCenter}>1</Text>
                    <Text style={_styles.rowTextRight}>5</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 2</Text>
                    <Text style={_styles.rowTextCenter}>3</Text>
                    <Text style={_styles.rowTextRight}>10</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 3</Text>
                    <Text style={_styles.rowTextCenter}>5</Text>
                    <Text style={_styles.rowTextRight}>20</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 4</Text>
                    <Text style={_styles.rowTextCenter}>10</Text>
                    <Text style={_styles.rowTextRight}>30</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 5</Text>
                    <Text style={_styles.rowTextCenter}>30</Text>
                    <Text style={_styles.rowTextRight}>50</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 6</Text>
                    <Text style={_styles.rowTextCenter}>50</Text>
                    <Text style={_styles.rowTextRight}>100</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextLeft}>LV 7</Text>
                    <Text style={_styles.rowTextCenter}>100</Text>
                    <Text style={_styles.rowTextRight}>200</Text>
                  </View>
                </>
              )}

              {type == 'SNS' && (
                <>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 1</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>500명 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 2</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>1,000명 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 3</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>2.500명 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 4</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>5,000명 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 5</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>1만명 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 6</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>5만명 이상</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('40%')}>LV 7</Text>
                    <Text style={_styles.rowTextHalfRight('60%')}>10만명 이상</Text>
                  </View>
                </>
              )}

              {type == 'VEHICLE' && (
                <>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('20%')}>LV 1</Text>
                    <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 2,000만원 이상의 차량</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('20%')}>LV 2</Text>
                    <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 4,000만원 이상의 차량</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('20%')}>LV 3</Text>
                    <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 7,000만원 이상의 고급 차량</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('20%')}>LV 4</Text>
                    <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 1억~2억원의 상당의 럭셔리카</Text>
                  </View>
                  <View style={_styles.rowStyle}>
                    <Text style={_styles.rowTextHalfLeft('20%')}>LV 5</Text>
                    <Text style={_styles.rowTextHalfRight('80%')}>슈퍼카 및 하이엔드급 럭셔리 차량</Text>
                  </View>
                </>
              )}

            </SpaceView>
          </SpaceView>
        </SpaceView>

      </ScrollView>

      {/* ######################### footer */}
      <View>
        <CommonBtn
          value={'심사 요청'}
          type={'primary'}
          borderRadius={1}
          onPress={() => {
            saveSecondAuth();
          }}
        />
      </View>
    </>
  );
};


{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  rowHeader: {
    backgroundColor: '#7986EE',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 0,
    paddingHorizontal: 20,
  },
  rowStyle: {
    width: '100%',
    borderStyle: 'solid',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#DEDEDE',
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  rowTextLeft: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 15,
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#4B4B4B',
    width: '33%',
  },
  rowTextCenter: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 15,
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#4B4B4B',
    width: '33%',
  },
  rowTextRight: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 15,
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: 'right',
    color: '#4B4B4B',
    width: '33%',
  },
  ItemRowTextLeft: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 27,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#7b7b7b',
    width: '33%',
  },
  rowTextHalfLeft: (width:string) => {
    return {
      fontFamily: 'AppleSDGothicNeoM00',
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0,
      textAlign: 'left',
      color: '#4B4B4B',
      width: width,
      paddingVertical: 5,
    };
  },
  rowTextHalfRight: (width:string) => {
    return {
      fontFamily: 'AppleSDGothicNeoM00',
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0,
      textAlign: 'left',
      color: '#4B4B4B',
      width: width,
      paddingVertical: 5,
    };
  },

  refuseArea: {
    backgroundColor: '#F4F4F4',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minHeight: 100,
  },
  returnReasonText: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 13,
    color: '#989898',
    lineHeight: 17,
  },
  commentArea: {
    backgroundColor: '#F4F4F4',
    borderRadius: 5,
    overflow: 'hidden',
  },

})