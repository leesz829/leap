import { get_bm_product, purchase_product, update_additional } from 'api/models';
import { Color } from 'assets/styles/Color';
import React, { memo, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { CommaFormat, formatNowDate } from 'utils/functions';
import {
  initConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  validateReceiptIos,
  clearProductsIOS,
  flushFailedPurchasesCachedAsPendingAndroid,
  finishTransaction,
} from 'react-native-iap';
import { findSourcePath, ICON } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ROUTES, STACK } from 'constants/routes';
import { ColorType } from '@types';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { useDispatch } from 'react-redux';
import { useUserInfo } from 'hooks/useUserInfo';
import { isEmptyData } from 'utils/functions';
import { commonStyle, layoutStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';


interface Props {
  loadingFunc: (isStatus: boolean) => void;
  itemUpdateFunc: (isStatus: boolean) => void;
  onPressCategoryFunc: (isStatus: boolean) => void;
  openProductModalFunc: (isStatus: boolean) => void;
  categoryList: [];
  productList: [];
  selectedCategoryData: {};
}

const { width, height } = Dimensions.get('window');

/* interface Products {
  products: Product[];
}
interface Product {
  oneTimePurchaseOfferDetails: {
    priceAmountMicros: string;
    formattedPrice: string;
    priceCurrencyCode: string;
  };
  name: string;
  productType: string;
  description: string;
  title: string;
  productId: string;
} */

export default function CategoryShop({ loadingFunc, itemUpdateFunc, onPressCategoryFunc, openProductModalFunc, categoryList, productList, selectedCategoryData }) {
  const navigation = useNavigation();
  const { show } = usePopup();  // 공통 팝업
  const dispatch = useDispatch();
  const isFocus = useIsFocused();
  const selectData = selectedCategoryData;
  // 회원 기본 데이터
  const memberBase = useUserInfo();

  // ########################## 인앱 getProduct
   const passProduct = Platform.select({
    ios: [
      'prod_pass_a001'
      , 'prod_pass_a002'
      , 'prod_pass_a003'
      , 'prod_pass_a004'
      , 'prod_pass_a005'
      , 'prod_pass_a006'
      , 'prod_pass_a101'
      , 'prod_pass_b001'
      , 'prod_pass_b002'
      , 'prod_pass_b003'
      , 'prod_pass_b004'
      , 'prod_pass_b005'
      , 'prod_pass_b006'
      , 'prod_pass_b007'
      , 'prod_pass_b008'
      , 'prod_pass_b009'
      , 'prod_pack_a002'
      , 'prod_pack_a003'
      , 'prod_pack_a004'
      , 'prod_pack_a005'
      , 'prod_pack_a010'
      , 'prod_pack_a011'
      , 'prod_pack_a012'
      , 'prod_pack_a013'
      , 'prod_pack_a014'
      , 'prod_subs_a001'
      , 'prod_subs_a002'
      , 'prod_subs_a003'
      , 'prod_subs_b001'
      , 'prod_subs_b002'
      , 'prod_subs_b003'
      , 'prod_subs_b004'
      , 'prod_subs_b005'
      , 'prod_subs_e001'
      , 'prod_subs_e002'
      , 'prod_subs_e003'
    ],
    android: [
      'prod_pass_a001'
      , 'prod_pass_a002'
      , 'prod_pass_a003'
      , 'prod_pass_a004'
      , 'prod_pass_a005'
      , 'prod_pass_a006'
      , 'prod_pass_a101'
      , 'prod_pass_b001'
      , 'prod_pass_b002'
      , 'prod_pass_b003'
      , 'prod_pass_b004'
      , 'prod_pass_b005'
      , 'prod_pass_b006'
      , 'prod_pass_b007'
      , 'prod_pass_b008'
      , 'prod_pass_b009'
      , 'prod_pack_a002'
      , 'prod_pack_a003'
      , 'prod_pack_a004'
      , 'prod_pack_a005'
      , 'prod_pack_a010'
      , 'prod_pack_a011'
      , 'prod_pack_a012'
      , 'prod_pack_a013'
      , 'prod_pack_a014'
      , 'prod_subs_a001'
      , 'prod_subs_a002'
      , 'prod_subs_a003'
      , 'prod_subs_b001'
      , 'prod_subs_b002'
      , 'prod_subs_b003'
      , 'prod_subs_b004'
      , 'prod_subs_b005'
      , 'prod_subs_e001'
      , 'prod_subs_e002'
      , 'prod_subs_e003'
    ],
  });
  

  // 구독상품
  const subsProduct = Platform.select({
    ios: ['cash_100', 'cash_200'],
    android: ['cash_100', 'cash_200'],
  });

  /* const purchaseUpdateSubscription = purchaseUpdatedListener((purchase: Purchase) => {
    console.log('purchase ::::::: ', purchase);

    if (purchase) {
      validateReceiptIos({
        receiptBody: {
          'receipt-data': purchase.transactionReceipt,
          'password': '91cb6ffa05d741628d64316192f2cd5e',
        },
        isTest: true,
      }).then(res => {
        console.log('receipt result ::::::::: ', res);
      });
    }

  });

  const purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
    console.log('error ::::::: ', error);
  }); */

  // ################################################################ 초기 실행 함수
  useEffect(() => {
    // 스토어 커넥션
    async function fetch() {

      // 연결 초기화
      const isConnected = await initConnection();
      const availablePurchases  = await getAvailablePurchases();
      //await flushFailedPurchasesCachedAsPendingAndroid();

      availablePurchases.forEach((purchase) => {
        finishTransaction({
          purchase: purchase
          , isConsumable: true
          , developerPayloadAndroid: undefined
        });
      });

      if (isConnected) {
        await getProducts({ skus:passProduct });
      }
    };

    if(isFocus) {
      fetch();
    }
  }, [isFocus]);

  // ########################################################### 카테고리 상품 페이지 로드 실행 함수
  useFocusEffect(
    React.useCallback(() => {
      async function fetch() {
        //onPressCategory(categories[0]);
        //await AsyncStorage.setItem('SHOP_CONNECT_DT', formatNowDate());
      };
      fetch();
      return async() => {
      };
    }, []),
  );

  // ############################################################################# 회원 튜토리얼 노출 정보 저장
  const saveMemberTutorialInfo = async (value:string) => {
    let body = {};

    if(value == 'SUBSCRIPTION') {
      body = { tutorial_subscription_item_yn: 'N' };
    } else if(value == 'PACKAGE') {
      body = { tutorial_package_item_yn: 'N' };
    } else if(value == 'PASS') {
      body = { tutorial_shop_yn: 'N' };
    }

    const { success, data } = await update_additional(body);
    if(success) {
      if(isEmptyData(data.mbr_base)) {
        dispatch(setPartialPrincipal({
          mbr_base : data.mbr_base
        }));
      }
    }
  };

  useEffect(() => {
    if(selectData?.value == 'SUBSCRIPTION' || selectData?.value == 'PACKAGE' || selectData?.value == 'PASS') {

      // 튜토리얼 팝업 노출
      if((selectData?.value == 'SUBSCRIPTION' && (!isEmptyData(memberBase?.tutorial_subscription_item_yn) || memberBase?.tutorial_subscription_item_yn == 'Y')) ||
        (selectData?.value == 'PACKAGE' && (!isEmptyData(memberBase?.tutorial_package_item_yn) || memberBase?.tutorial_package_item_yn == 'Y')) ||
        (selectData?.value == 'PASS' && (!isEmptyData(memberBase?.tutorial_shop_yn) || memberBase?.tutorial_shop_yn == 'Y'))) {

        let guideType = '';
        if(selectData?.value == 'SUBSCRIPTION') {
          guideType = 'SHOP_SUBSCRIPTION';
        } else if(selectData?.value == 'PACKAGE') {
          guideType = 'SHOP_PACKAGE';
        } else if(selectData?.value == 'PASS') {
          guideType = 'SHOP_BASIC';
        }

        show({
          type: 'GUIDE',
          guideType: guideType,
          guideSlideYn: guideType == 'SHOP_BASIC' ? 'Y' : 'N',
          guideNexBtnExpoYn: 'Y',
          confirmCallback: function(isNextChk) {
            if(isNextChk) {
              saveMemberTutorialInfo(selectData?.value);
            }
          }
        });
      };
    }
  }, [selectData]);

  return (
    <>
      <ScrollView style={_styles.categoryWrap} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={['#092032', '#344756']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={_styles.itemDescArea}
        >
          <SpaceView mb={10} viewStyle={_styles.tabBtnArea}>
            {categoryList?.map((item, index) => (
              <TouchableOpacity
                key={`category-${item.value}-${index}`}
                onPress={() => onPressCategoryFunc(item)}>
                <Image source={item.value === selectData.value ? item.imgActive : item.imgUnactive} style={[item.value == 'RECOMMENDER' ? _styles.starImg : _styles.itemImg]} />
              </TouchableOpacity>
            ))}
            {/* <SpaceView viewStyle={{position: 'absolute', top: -20, left: 6}}>
              <View style={_styles.balloonArea}>
                <View style={_styles.balloon}>
                  <Text style={_styles.balloonText}>N개의 추천 상품이 있어요.</Text>
                </View>
                <View style={_styles.tail} />
              </View>
            </SpaceView> */}
          </SpaceView>
          <Text style={_styles.itemDescText}>{selectData.desc}</Text>
        </LinearGradient>

        {productList?.map((item, index) => (
          <RenderItem
            key={`product-${item?.item_code}-${index}`}
            item={item}
            openModal={openProductModalFunc}
          />
        ))}

      </ScrollView>
    </>
  );
}

{/* ################################################################################################################
############### 상품 RenderItem
################################################################################################################ */}
function RenderItem({ item, openModal }) {
  const imagePath = findSourcePath(item?.file_path + item?.file_name);
  const isNew = (item.connect_date == null || item.connect_date < item.reg_dt) ? true : false;

  const buyCountCycle = item?.buy_count_cycle;
  const buyCount = item?.buy_count;
  const buyCountMax = item?.buy_count_max;

  const onPressItem = () => {
    let isChk = true;

    if(buyCountMax < 999999) {
      if(buyCount >= buyCountMax) {
        isChk = false;
      }
    }

    if(isChk) {
      openModal(item);
    }
  };

  return (
    <TouchableOpacity style={_styles.itemContainer} onPress={onPressItem}>
      <View style={_styles.itemWrap}>
        <View style={[layoutStyle.row, layoutStyle.alignCenter, layoutStyle.justifyCenter, {width: '60%'}]}>
          <SpaceView viewStyle={_styles.cubeCircleArea}>
            <Image source={ICON.cubeCyan} style={[styles.iconSquareSize(25)]} />
          </SpaceView>
          <SpaceView viewStyle={{width: '70%'}} ml={20}>
            <Text style={_styles.itemName}>{item?.item_name}</Text>
            <Text style={_styles.itemDesc}>Lorem ipsum dolor sit amet, consectetur adipisicin</Text>
          </SpaceView>
          {/* {isNew &&
            <View style={_styles.iconArea}>
              <Text style={_styles.newText}>NEW</Text>
            </View>
          } */}

          {buyCountMax < 999999 && (
            <View style={_styles.imgBottomArea}>
              <Text style={_styles.imgBottomText}>{buyCount}/{buyCountMax}구매</Text>
            </View>
          )}
        </View>

        <View style={_styles.priceArea}>
          <View>
            <Text style={_styles.price}>
              {CommaFormat(item?.shop_buy_price) + (item.money_type_code == 'INAPP' ? '원' : '')}
            </Text>

            {item.money_type_code == 'PASS' && (
              <SpaceView pt={3}><Image style={styles.iconSquareSize(20)} source={ICON.passCircle} resizeMode={'contain'} /></SpaceView>
            )}

            {item.money_type_code == 'ROYAL_PASS' && (
              <SpaceView pt={3}><Image style={styles.iconSquareSize(20)} source={ICON.royalPassCircle} resizeMode={'contain'} /></SpaceView>
            )}
          </View>

          {item?.discount_rate && item.discount_rate != 0 &&
            <SpaceView mt={2} viewStyle={[layoutStyle.row, layoutStyle.justifyCenter, layoutStyle.alignCenter]}>
              <SpaceView viewStyle={_styles.discountArea}>
                <Text style={_styles.discountRate}>{item.discount_rate + '%'}</Text>
              </SpaceView>
              <Text style={_styles.originPriceText}>{CommaFormat(item.original_price)}원</Text>
            </SpaceView>
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}


{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
  categoryWrap: {
    flexDirection: 'column',
    //height: height - 450,
    marginTop: 20,
  },
  categoryText: (isSelected: boolean) => {
    return {
      fontSize: 14,
      color: isSelected ? Color.primary : Color.grayAAAA,
    };
  },
  itemContainer: {
    //paddingVertical: 15,
    marginTop: 15,
    paddingTop: 15,
    borderTopColor: '#445561',
    borderTopWidth: 1,
    paddingHorizontal: 15,
  },
  itemWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  tumbs: {
    width: 38,
    height: 38,
  },
  itemName: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    color: '#32F9E4',
  },
  itemDesc: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    color: '#D5CD9E',
  },
  discountArea: {
    backgroundColor: '#FFF',
    paddingVertical: 1,
    borderRadius: 10,
    width: 33,
  },
  discountRate: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 10,
    color: '#32F9E4',
    textAlign: 'center',
  },
  originPriceText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Light',
    textDecorationLine: 'line-through',
    color:'#E1DFD1',
    marginLeft: 5,
  },
  priceArea: {
    borderWidth: 1,
    borderColor: '#F1D30E',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  price: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    color: '#F1D30E',
  },
  boxWrapper: {
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `flex-start`,
    marginTop: 4,
  },
  box: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: '#F2F2F2',
    borderRadius: 3,
    marginRight: 3,
  },
  boxText: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 9,
    color: '#8854D2',
  },
  iconArea: {
    position: 'absolute',
    top: 4,
    left: 5,
  },
  newText: {
    backgroundColor: '#FF7E8C',
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 11,
    color: ColorType.white,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  imgBottomArea: {
    position: 'absolute',
    top: -10,
    left: 35,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#000000',
    opacity: 0.7,
  },
  imgBottomText: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 12,
    textAlign: 'left',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 1,
  },
  cubeCircleArea: {
    borderWidth: 1,
    borderColor: '#32F9E4',
    backgroundColor: '#292F33',
    borderRadius: 50,
    width: 40,
    height: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBtnArea: {
    backgroundColor: '#292F33',
    borderRadius: 20, 
    width: '75%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  itemDescArea: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 10,
    marginHorizontal: 15,
  },
  itemDescText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#E1DFD1',
    textAlign: 'center',
    marginTop: 10,
  },

  itemImg: {
    width: 50,
    height: 50,
    marginTop: 4,
  },
  starImg: {
    width: 30,
    height: 30,
    marginTop: -5,
    marginLeft: 5,
  },
  balloonArea: {
    position: 'relative',
    alignItems: 'flex-start',
  },
  balloon: {
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: 5,
  },
  balloonText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#F1D30E',
  },
  tail: {
    position: 'absolute',
    left: '50%',
    bottom: -7,
    marginLeft: -45,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: '#FFF',
  },
});

const categories = [
  {
    label: '패스상품',
    value: 'PASS',
  },
  {
    label: '부스팅상품',
    value: 'SUBSCRIPTION',
  },
  {
    label: '패키지상품',
    value: 'PACKAGE',
  },
];
