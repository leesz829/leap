import { ColorType } from '@types';
import { Color } from 'assets/styles/Color';
import { layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { isEmptyData } from 'utils/functions';
import { ICON, IMAGE } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { CommonBtn } from 'component/CommonBtn';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { get_common_code_list, use_item } from 'api/models';
import { usePopup } from 'Context'
import { ROUTES, STACK } from 'constants/routes';
import { SUCCESS } from 'constants/reusltcode';


/* ################################################################################################################
###################################################################################################################
###### 기본 팝업 UI Component
###################################################################################################################
################################################################################################################ */

interface Props {
  popupVisible?: boolean; // popup state
  setPopupVIsible?: any; // popup setState
  isConfirm?: boolean; // confirm 여부
  title?: string; // 팝업 제목
  text?: string; // 팝업 문구
  subText?: string;
  confirmCallbackFunc?: Function | undefined; // 확인 Callback 함수
  cancelCallbackFunc?: Function | undefined;
  confirmBtnText?: string;
  cancelBtnText?: string;
  btnExpYn?: string;
  passType?: string;
  passAmt?: string;
  type?: string;
  item?: any;
}

export const ProfileDrawingPopup = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
	const isFocus = useIsFocused();
	const [isLoading, setIsLoading] = React.useState(false);
  const [seletedIdx, setSeletedIdx] = React.useState(null);
  const { show } = usePopup(); // 공통 팝업
  const [selectedData, setSelectedData] = React.useState(String);

	// data 목록
	const [pdDataList, setPdDataList] = React.useState([]);

  let cate_common_code = props?.item?.cate_common_code;

	// ############################################################ mbti 코드 목록 조회 함수
	const getCommonCodeList = async (value: string) => {
		const body = {
			group_code: cate_common_code == 'IMPRESSION' ? 'FACE_TYPE' : 'MBTI_TYPE',
		};
		try {
			setIsLoading(true);
			const { success, data } = await get_common_code_list(body);

			if(success) {
				switch (data.result_code) {
					case '0000':
						let dataList = new Array();
						data.code_list?.map(({group_code, common_code, code_name,}: {group_code: any; common_code: any; code_name: any;}) => {
							let dataMap = { label: code_name, value: common_code };
              if(cate_common_code == 'IMPRESSION' && common_code == 'FACE_TYPE_SKIP') {
                return;
              }
							dataList.push(dataMap);
						});

            setPdDataList(dataList);

						break;
					default:
						show({content: '오류입니다. 관리자에게 문의해주세요.' });
						break;
				}
			} else {
				show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

  // ########################################################################################## 아이템 사용
  const useItem = async (item) => {
    setIsLoading(true);

    const body = {
      item_category_code: item.item_category_code,
      cate_group_code: item.cate_group_code == 'IMPRESSION' ? 'FACE_TYPE' : item.cate_group_code,
      cate_common_code: item.cate_common_code,
      inventory_seq: item.inventory_seq,
      mbti_type: selectedData,
      face_type: selectedData,
    };

    try {
      const { success, data } = await use_item(body);
      if(success) {
        switch (data.result_code) {
        case SUCCESS:
            // 조회된 매칭 노출 회원
            let memberSeqList = [];
            data.profile_member_seq_list.map((item, index) => {
              memberSeqList.push(item.member_seq);
            });

            navigation.navigate(STACK.COMMON, {
              screen: 'ItemMatching',
              params : {
                type: 'PROFILE_CARD_ITEM',
                memberSeqList: memberSeqList,
              }
            });

          break;
          case '3001':
            show({
              content: '소개해드릴 회원을 찾는 중이에요. 다음에 다시 사용해주세요.' ,
              confirmCallback: function() {}
            });
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
      console.warn(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressConfirm = () => {
    if(props.confirmCallbackFunc == null && typeof props.confirmCallbackFunc != 'undefined') {
      
    } else {
      // 선택 된 데이터 없을 시 유효성 체크
      if(isEmptyData(selectedData)) {
        useItem(props.item);
        props.confirmCallbackFunc && props.confirmCallbackFunc();
        props.setPopupVIsible(false);
      }
    }
  };

  const onPressCancel = () => {
    props.cancelCallbackFunc && props.cancelCallbackFunc();
    props.setPopupVIsible(false);
  };

  React.useEffect(() => {
    setPdDataList([]);
    setSelectedData('');
		getCommonCodeList();
	}, [props]);

  return (
    <>
      <Modal visible={props.popupVisible} transparent={true}>
        <View style={modalStyle.modalBackground}>
          <View style={[modalStyle.modalStyle1, {overflow: 'hidden'}]}>
            <LinearGradient
              colors={['#3D4348', '#1A1E1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <SpaceView pt={15} pb={10} pl={12} viewStyle={[layoutStyle.alignStart]}>
                <Text style={_styles.titleText}>{cate_common_code == 'IMPRESSION' ? '인상 선택' : 'MBTI 선택'}</Text>
                <Text style={_styles.descText}>소개받고 싶은 이성의 {cate_common_code == 'IMPRESSION' ? '인상을' : 'MBTI를'} 선택해 주세요.</Text>
              </SpaceView>
             
              {/* ########################################################### 내용 영역 */}
              <SpaceView pl={5} pr={5} viewStyle={[_styles.contentArea, layoutStyle.row, {flexWrap: 'wrap', justifyContent: cate_common_code == 'IMPRESSION' ?  'flex-start' : 'center'}]}>
                {pdDataList.map((i, index) => {
                  return (
                    <TouchableOpacity 
                      style={[_styles.dataBox(seletedIdx == index ? true : false, cate_common_code, isEmptyData(selectedData))]}
                      key={index}
                      onPress={() => {
                        setSeletedIdx(index);
                        setSelectedData(i?.value);
                      }}
                    >
                      <SpaceView>
                        <Text style={_styles.dataText(seletedIdx == index ? true : false, isEmptyData(selectedData))}>{cate_common_code == 'IMPRESSION' && '#'}{i?.label}</Text>
                      </SpaceView>
                    </TouchableOpacity>
                  )
                })}
              </SpaceView>
              
              <SpaceView mt={10} mb={15} viewStyle={_styles.btnContainer}>
                <TouchableOpacity onPress={onPressCancel}>
                  <Text style={_styles.btnStyle('#ffffff')}>취소하기</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onPressConfirm}>
                  <Text style={_styles.btnStyle(isEmptyData(selectedData) ? '#FFDD00' : '#D6D3D3')}>확인하기</Text>
                </TouchableOpacity>
              </SpaceView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
};





{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    color: '#FFDD00',
  },
  descText: {
    fontFamily: 'Pretendard-Regular',
    color: '#F3E270',
    marginTop: 5,
  },
  msgText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    color: '#D5CD9E',
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
  },
  openPopupDescIcon: (passType: string) => {
    return {
      fontFamily: 'Pretendard-ExtraBold',
      fontSize: 16,
      color: '#32F9E4',
      marginLeft: 3,
    };
  },
  modalAuctBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 50,
    marginBottom: 40,
  },
  btnStyle: (bgcr: string) => {
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: 15,
      color: '#3D4348',
      backgroundColor: isEmptyData(bgcr) ? bgcr : '#FFFFFF',
      borderRadius: 15,
      paddingVertical: 8,
      width: 110,
      textAlign: 'center',
      marginHorizontal: 3,
      overflow: 'hidden',
    };
  },
  contentArea: {
    marginVertical: 13,
  },
  dataBox: (isActive: boolean, type: string, isSelectedData: boolean) => {
		return {
      borderColor: isActive && isSelectedData ? '#FFDD00' : '#D5CD9E',
      borderWidth: 1,
      borderRadius: type == 'MBTI' ? 10 : 50,
      width: type == 'MBTI' ? 70 : 'auto',
      paddingHorizontal: type == 'IMPRESSION' && 5,
      height: 35,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 4,
      backgroundColor: isActive && isSelectedData ? '#FFDD00' : 'transparent',
		};
	},
  dataText: (active: boolean, isSelectedData: boolean) => {
		return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 18,
      color: active && isSelectedData  ? '#FFF' : '#D5CD9E',
    };
  }
});