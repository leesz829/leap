import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Color } from 'assets/styles/Color';
import { ColorType } from '@types';
import React, { memo, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  PanResponder,
} from 'react-native';
import Modal from 'react-native-modal';
import { findSourcePath, ICON } from 'utils/imageUtils';
import ViewPager from '../ViewPager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommaFormat, isEmptyData } from 'utils/functions';
import {
  initConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  validateReceiptIos,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  endConnection,
  clearProductsIOS,
  flushFailedPurchasesCachedAsPendingAndroid,
} from 'react-native-iap';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { useNavigation } from '@react-navigation/native';
import { usePopup } from 'Context';
import { CommonLoading } from 'component/CommonLoading';
import { purchase_product, order_goods } from 'api/models';
import { ROUTES, STACK } from 'constants/routes';
import { ScrollView } from 'react-native-gesture-handler';
import { useUserInfo } from 'hooks/useUserInfo';
import { CommonBtn } from 'component/CommonBtn';
import LinearGradient from 'react-native-linear-gradient';


interface Props {
  isVisible: boolean;
  type: string; /* bm: bm상품, gifticon: 재고상품, boutique: 경매상품 */
  closeModal: (isPayConfirm:boolean) => void;
  item: any;
}

export default function ProductModal({ isVisible, type, closeModal, item }: Props) {
  const { width, height } = Dimensions.get('window');
  const navigation = useNavigation();
  const { show } = usePopup(); // 공통 팝업
  const { bottom } = useSafeAreaInsets();
  const [isPayLoading, setIsPayLoading] = useState(false);
  const [comfirmModalVisible, setComfirmModalVisible] = useState(false);

  // 회원 기본 정보
  const memberBase = useUserInfo();

  //추후 데이터 배열로 변환시 변경필요
  const images = [findSourcePath(item?.file_path + item?.file_name)];

  // 브랜드명
  const brand_name = item?.brand_name != null ? item?.brand_name : '리프';

  // 상품명
  const prod_name = type == 'bm' ? item?.item_name : item?.prod_name;

  // 판매금액
  const buy_price = type == 'bm' ? item?.shop_buy_price : item?.buy_price;

  // 상품상세
  const prod_content = type == 'bm' ? item?.item_contents : item?.prod_content;

  // 아이템 코드(BM상품)
  const item_code = item?.item_code;

  // 상품번호(재고상품)
  const prod_seq = item?.prod_seq;

  // 재화 구분 코드
  const money_type_code = item?.money_type_code;

  // ######################################################### 상품 구매하기 함수
  const purchaseBtn = async () => {

    show({ content: '준비중 입니다.', isCross: true });
    return;

    if(!isPayLoading) {
      setIsPayLoading(true);
      
      try {
        if(type == 'bm'){

          // 재화 유형 구분 : 인앱상품
          if(money_type_code == 'INAPP') {
            if(Platform.OS == 'android') {
              purchaseAosProc();
            } else if(Platform.OS == 'ios') {
              purchaseIosProc();
            }
          
          // 재화 유형 구분 : 패스상품(임시처리::추후수정)
          } else if(money_type_code == 'PASS' || money_type_code == 'ROYAL_PASS') {
            passPurchase();
          }
        } else {
          buyProdsProc();
        }
      } catch (err: any) {
        console.warn(err.code, err.message);
      }
    }
  };

  // ######################################################### 재고 상품 구매하기 함수
  const buyProdsProc = async () => {
    try {
      const { success, data } = await order_goods({
        prod_seq : item.prod_seq
        , modify_seq : item.modify_seq
        , buy_price : item.buy_price
        , mobile_os : Platform.OS
      });

      let msg = '';

      if (success) {
        if(data.result_code != '0000') {
          msg = data.result_msg;
        } else {
          msg = '구매에 성공하였습니다.';
        }
      } else {
        msg = '기프티콘 발급 통신 오류입니다. 잠시 후 다시 시도해주세요.';
      }

      if(Platform.OS == 'android') {
        show({
          content: msg,
          confirmCallback: function () {
            setComfirmModalVisible(false);
            closeModal(true);
          },
        });
      } else {
        Alert.alert('알림', msg,
        [{ 
          text: '확인',
          onPress: () => {
            setComfirmModalVisible(false);
            closeModal(true);
          }
        }]);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setIsPayLoading(false);
    }
  };

  // ######################################################### 패스 구매 결제
  const passPurchase = async () => {
    if(money_type_code == 'PASS') {
      if(memberBase.pass_has_amt < buy_price) {
        closeModal(false);
        setIsPayLoading(false);
        setComfirmModalVisible(false);

        if(Platform.OS == 'android') {
          show({ content: '큐브가 부족합니다.' });
        } else {
          Alert.alert('알림', '큐브가 부족합니다.', [{ text: '확인' }]);
        }
        
        return;
      };
    } else if(money_type_code == 'ROYAL_PASS') {
      if(memberBase.royal_pass_has_amt < buy_price) {
        closeModal(false);
        setIsPayLoading(false);
        setComfirmModalVisible(false);

        if(Platform.OS == 'android') {
          show({ content: '메가큐브가 부족합니다.' });
        } else {
          Alert.alert('알림', '메가큐브가 부족합니다.', [{ text: '확인' }]);
        }
        
        return;
      };
    };

    const dataParam = {
      device_gubun: Platform.OS,
      buy_price: buy_price,
      item_name: prod_name,
      item_code: item_code,
      result_msg: '성공',
      result_code: '0000',
    };

    purchaseResultSend(dataParam);
  };

  // ######################################################### AOS 결제 처리
  const purchaseAosProc = async () => {

    try {
      const result = await requestPurchase({
        skus: [item_code]
      });

      let dataParam = {};

      console.log('result ::::: ', result);

      if(isEmptyData(result) && result.length > 0 && isEmptyData(result[0].transactionReceipt)) {
        const receiptDataJson = JSON.parse(result[0].transactionReceipt);

        dataParam = {
          device_gubun: Platform.OS,
          buy_price: buy_price,
          item_name: prod_name,
          item_code: item_code,
          result_msg: '성공',
          result_code: '0000',
          acknowledged: receiptDataJson?.acknowledged,
          package_name: receiptDataJson?.packageName,
          product_id: receiptDataJson?.productId,
          purchase_state: receiptDataJson?.purchaseState,
          purchase_time: receiptDataJson?.purchaseTime,
          purchase_token: receiptDataJson?.purchaseToken,
          quantity: receiptDataJson?.quantity,
          transaction_id: '',
        };
      } else {
        dataParam = {
          device_gubun: Platform.OS,
          buy_price: buy_price,
          item_name: prod_name,
          item_code: item_code,
          result_msg: '성공',
          result_code: '0000',
          transaction_id: '',
        };
      };

      purchaseResultSend(dataParam);

      await finishTransaction({
        purchase: result[0]
        , isConsumable: true
        , developerPayloadAndroid: undefined
      });

    } catch (err: any) {
      setIsPayLoading(false);
      console.warn(err.code, err.message);
    } finally {
      console.log('finally!!!!!');
    }
  };

  // ######################################################### IOS 결제 처리
  const purchaseIosProc = async () => {
    try {
      const result = await requestPurchase({
        sku: item_code,
        andDangerouslyFinishTransactionAutomaticallyIOS: false,
      });
  
      let purchaseUpdateSubscription = purchaseUpdatedListener(async(purchase: Purchase) => {
        try {
    
          if (purchase) {
            validateReceiptIos({
              receiptBody: {
                'receipt-data': purchase.transactionReceipt,
                'password': '91cb6ffa05d741628d64316192f2cd5e',
              },
              isTest: false,
            }).then(res => {
              purchaseUpdateSubscription.remove();
    
              const dataParam = {
                device_gubun: Platform.OS,
                buy_price: buy_price,
                item_name: prod_name,
                item_code: item_code,
                result_msg: '성공',
                result_code: '0000',
                acknowledged: 0,
                package_name: res?.receipt?.bundle_id,
                product_id: res?.receipt?.in_app[0].product_id,
                purchase_state: 0,
                purchase_time: '20230429000000',
                purchase_token: '',
                quantity: res?.receipt?.in_app[0].quantity,
                transaction_id: res?.receipt?.in_app[0].transaction_id,
              };
    
              purchaseResultSend(dataParam);
            });
          };
          
        } catch (error) {
          purchaseUpdateSubscription.remove();
          Alert.alert('알림', '구매에 실패하였습니다.');
          setIsPayLoading(false);
          setComfirmModalVisible(false);
          closeModal(false);
        } finally {
          await finishTransaction({
            purchase: purchase,
            isConsumable: true,
          }).then();
        }
      });
      
    } catch (error) {
      setIsPayLoading(false);
    }
  
    let purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      purchaseErrorSubscription.remove();
      Alert.alert('알림', '구매에 실패하였습니다.');
      setIsPayLoading(false);
      setComfirmModalVisible(false);
      closeModal(false);
    });

  };

  // ######################################################### 인앱상품 구매 결과 API 전송
  const purchaseResultSend = async (dataParam:any) => {
    const body = dataParam;

    const { success, data } = await purchase_product(body);

    if (success) {
      if(data?.result_code == '0000') {
        setIsPayLoading(false);
        setComfirmModalVisible(false);
        closeModal(true);
        //navigation.navigate(STACK.TAB, { screen: 'Shop' });

        if(Platform.OS == 'android') {
          show({ content: '구매에 성공하였습니다.\n구매한 상품은 선물함에서 획득 가능합니다.' });
        } else {
          Alert.alert('알림', '구매에 성공하였습니다.\n구매한 상품은 선물함에서 획득 가능합니다.', [{ text: '확인' }]);
        }
      } else {
        closeModal(false);
        setIsPayLoading(false);
        setComfirmModalVisible(false);

        if(Platform.OS == 'android') {
          show({ content: '구매에 실패하였습니다.' });
        } else {
          Alert.alert('알림', '구매에 실패하였습니다.', [{ text: '확인' }]);
        }
      }
    } else {
      closeModal(false);
      setIsPayLoading(false);
      setComfirmModalVisible(false);

      if(Platform.OS == 'android') {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      } else {
        Alert.alert('알림', '오류입니다. 관리자에게 문의해주세요.', [{ text: '확인' }]);
      }

    }
  };

  const toggleModal = async () => {
    closeModal(false);
  };

  // 터치 컨트롤 함수
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 50 && gestureState.dy > gestureState.dx) {
          toggleModal();
          // 아래로 스와이프 동작이면 스크롤을 막음
          //scrollViewRef.current.setNativeProps({ scrollEnabled: false });
        } else {
          // 위로 스와이프 동작이면 스크롤을 허용
          //scrollViewRef.current.setNativeProps({ scrollEnabled: true });
        }
      },
      onPanResponderRelease: () => {
        //scrollViewRef.current.setNativeProps({ scrollEnabled: true });
      },
    })
  ).current;

  return (
    <>
      {type == 'bm' ?
        ////////////////////////////// BM상품 팝업창
        <Modal 
          isVisible={isVisible} 
          style={modalStyleProduct.modal}
          //onSwipeComplete={toggleModal}
          //onBackdropPress={toggleModal} // 모달 외부 터치 시 모달 닫기
          //swipeDirection="down" // 아래 방향으로 스와이프
          //propagateSwipe={true}
          onRequestClose={() => { closeModal(false); }}>

          <View style={[modalStyleProduct.root, {minHeight: '45%'}]}>
            <View style={modalStyleProduct.infoContainer}>
              <SpaceView>
                <Text style={modalStyleProduct.title}>상품구매</Text>
                <SpaceView mt={30} viewStyle={[layoutStyle.row, layoutStyle.justifyCenter, layoutStyle.alignCenter]}>
                  <Image source={ICON.polygonGreen} style={styles.iconSize40} />
                  <Text style={[modalStyleProduct.giftName, {marginTop: 0}]}>{prod_name}</Text>
                </SpaceView>
                <Text style={modalStyleProduct.giftDesc}>{item?.item_contents}</Text>
              </SpaceView>

              <View style={modalStyleProduct.infoContents}>
                <ScrollView nestedScrollEnabled={true} contentContainerStyle={{ flexGrow: 1 }} style={{maxHeight: height - 625}}>
                  <View>
                    <Text style={modalStyleProduct.brandContentText}>{prod_content}</Text>
                  </View>
                </ScrollView>
              </View>
              
              <SpaceView mb={bottom+10} viewStyle={modalStyleProduct.bottomContainer}>
                <View style={modalStyleProduct.rowBetween}>
                  <TouchableOpacity 
                    style={modalStyleProduct.puchageButton} 
                    onPress={() => {

                      show({
                        title: '상품 구매',
                        content: '상품을 구매하시겠습니까?',
                        cancelBtnText: '취소할래요!',
                        confirmBtnText: '구매하기',
                        cancelCallback: function() {
                  
                        },
                        confirmCallback: function () {
                          purchaseBtn();
                        },
                      });

                      //setComfirmModalVisible(true);
                    }}
                  >
                    <Text style={modalStyleProduct.puchageText}>{CommaFormat(item?.shop_buy_price != null ? item?.shop_buy_price : item?.buy_price)}</Text>
                    {item?.discount_rate > 0 &&
                      <Text style={modalStyleProduct.originalPriceText}>{item?.original_price}</Text>
                    }
                    <Text style={modalStyleProduct.puchageText}>구매하기</Text>
                  </TouchableOpacity>
                </View>

                <CommonBtn
                  value={'취소'}
                  type={'reNewGoBack'}
                  borderRadius={5}
                  onPress={toggleModal}
                />
              </SpaceView>
            </View>
          </View>

          {/* ###################### 구매하기 Confirm 팝업 */}
          <Modal isVisible={comfirmModalVisible} transparent={true} style={modalStyleProduct.modal}>
              {isPayLoading && <CommonLoading />}
              <View style={modalStyle.modalBackground}>
              <View style={[modalStyle.modalStyle1, {backgroundColor: '#3D4348'}]}>

                <SpaceView viewStyle={[layoutStyle.alignCenter, modalStyle.modalHeader]}>
                  <CommonText fontWeight={'700'} type={'h5'} color={'#D5CD9E'}>
                    상품 구매
                  </CommonText>
                </SpaceView>

                <SpaceView viewStyle={[layoutStyle.alignCenter, modalStyle.modalBody]}>
                  <CommonText type={'h5'} textStyle={layoutStyle.textCenter} color={'#D5CD9E'}>
                    상품을 구매하시겠습니까?
                  </CommonText>
                </SpaceView>

                <View style={modalStyle.modalBtnContainer}>
                  <TouchableOpacity
                    style={[modalStyle.modalBtn, {backgroundColor: '#FFF', borderBottomLeftRadius: 5}]}
                    onPress={() => setComfirmModalVisible(false)}>
                    <CommonText type={'h5'} fontWeight={'500'} color={'#3D4348'}>취소할래요!</CommonText>
                  </TouchableOpacity>

                  <View style={modalStyle.modalBtnline} />

                    <TouchableOpacity 
                      style={[modalStyle.modalBtn, {backgroundColor: '#FFDD00', borderBottomRightRadius: 5}]}
                      onPress={() => purchaseBtn()}>
                      <CommonText type={'h5'} fontWeight={'500'} color={'#3D4348'}>
                        구매하기
                      </CommonText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

        </Modal>
      :
        ///////////////////////////  기프티콘 상품 교환 팝업창
        <Modal isVisible={isVisible} onRequestClose={() => { closeModal(); }}>
          <LinearGradient
            colors={['#3D4348', '#1A1E1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={modalStyleProduct.container}
          >
            <View style={modalStyleProduct.titleBox}>
              <Text style={modalStyleProduct.titleText}>기프티콘 교환</Text>
            </View>
            
            <View style={modalStyleProduct.contentBody}>
              <SpaceView viewStyle={modalStyleProduct.giftDescArea}>
                  <Text style={modalStyleProduct.prodDesc}>{item?.prod_content}</Text>
                  <Text style={modalStyleProduct.rpAmtText}>{item?.buy_price}RP로 기프티콘 교환합니다.</Text>
              </SpaceView>
            </View>

            <View style={modalStyleProduct.bottomBox}>
              <TouchableOpacity 
                style={[modalStyleProduct.allButton, {backgroundColor: '#FFF', marginRight: 5}]} 
                onPress={toggleModal}>

                <Text style={modalStyleProduct.allButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={modalStyleProduct.allButton}
                onPress={() => purchaseBtn()}>
                <Text style={[modalStyleProduct.allButtonText]}>확인</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      }
    </>
  );
}



{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const modalStyleProduct = StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
    justifyContent: 'flex-end',
  },
  root: {
    // flex: 1,
    width: '100%',
    backgroundColor: '#333B41',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 27,
  },
  closeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 7,
  },
  close: {
    width: 19.5,
    height: 19.5,
  },
  pagerView: {
    // flex: 1,
    width: Dimensions.get('window').width - 150,
    height: 169,
    marginTop: 28,
  },
  itemImages: {
    width: Dimensions.get('window').width - 150,
    height: 169,
    borderRadius: 10,
  },
  dot: {
    width: 9,
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    width: 9,
    height: 5,
    borderRadius: 2.5,
  },
  infoContainer: {
    flex: 1,
    marginTop: 13,
  },
  brandText: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#7986ee',
  },
  brandContentText: {
    color: '#363636',
  },
  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 30,
    color: '#F3E270',
    textAlign: 'center',
    marginTop: 10,
  },
  giftName: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 24,
    color: '#32F9E4',
    textAlign: 'center',
    marginTop: 40,
  },
  giftDesc: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#E1DFD1',
    textAlign: 'center',
    marginTop: 10,
  },
  rowBetween: {
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  inventory: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#d3d3d3',
  },
  price: {
    fontFamily: 'AppleSDGothicNeoH00',
    fontSize: 25,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#212121',
  },
  crown: {
    width: 17.67,
    height: 11.73,
    marginLeft: 5
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginTop: 30,
  },
  likeButton: {
    width: (Dimensions.get('window').width - 60) * 0.2,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ebebeb',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  likeImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  puchageButton: {
    //width: (Dimensions.get('window').width - 60) * 0.8,
    width: '100%',
    height: 56,
    borderRadius: 5,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  puchageText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 21,
    color: '#FFDD00',
  },
  originalPriceText: {
    textDecorationLine: 'line-through',
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#D5CD9E',
    marginTop: 10,
    marginLeft: 5,
    marginRight: 'auto',
  },
  infoContents: {
    marginTop: 10,
    paddingTop: 10,
  },

  container: {
    width: '100%',
    borderRadius: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    color: '#FFDD00',
  },
  contentBody: {
    flexDirection: 'column',
    alignItems: `center`,
  },
  giftDescArea: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  bottomBox: {
    width: '100%',
    flexDirection: `row`,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: 15,
  },
  allButton: {
    borderRadius: 50,
    paddingVertical: 4,
    paddingHorizontal: 30,
    backgroundColor: '#FFDD00',
    marginBottom: 20,
  },
  allButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#3D4348',
  },
  rpAmtText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#FFDD00',
    marginBottom: 2,
  },
  prodDesc: {
    fontFamily: 'Pretendard-Light',
    fontSize: 14,
    color: '#D5CD9E',
    marginBottom: 15,
  },
});

