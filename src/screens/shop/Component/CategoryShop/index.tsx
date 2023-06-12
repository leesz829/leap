import { get_bm_product, purchase_product, update_additional } from 'api/models';
import { Color } from 'assets/styles/Color';
import React, { memo, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ProductModal from '../ProductModal';
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
} from 'react-native-iap';
import { findSourcePath, ICON } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ROUTES, STACK } from 'constants/routes';
import { CommonLoading } from 'component/CommonLoading';
import AsyncStorage from '@react-native-community/async-storage';
import { ColorType } from '@types';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { useDispatch } from 'react-redux';
import { useUserInfo } from 'hooks/useUserInfo';


interface Props {
  loadingFunc: (isStatus: boolean) => void;
  itemUpdateFunc: (isStatus: boolean) => void;
}

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

export default function CategoryShop({ loadingFunc, itemUpdateFunc }) {
  const navigation = useNavigation();
  const { show } = usePopup();  // 공통 팝업
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [items, setItems] = useState([]);

  const [isPayLoading, setIsPayLoading] = useState(false);

  // 회원 기본 데이터
  const memberBase = useUserInfo();

  // ########################## 인앱 getProduct
   const passProduct = Platform.select({
    ios: [
      'prod_pass_a001'
      , 'prod_pack_a002'
      , 'prod_pass_a002'
      , 'prod_pack_a003'
      , 'prod_pass_a003'
      , 'prod_pack_a004'
      , 'prod_pass_a004'
      , 'prod_subs_b001'
      , 'prod_pack_a005'
      , 'prod_pass_a005'
      , 'prod_subs_b002'
      , 'prod_pass_a006'
      , 'prod_pass_b001'
      , 'prod_pass_b002'
      , 'prod_pass_b003'
      , 'prod_pack_a010'
      , 'prod_pass_b004'
      , 'prod_pack_a011'
      , 'prod_pass_b005'
      , 'prod_pack_a012'
      , 'prod_pass_b006'
      , 'prod_pack_a013'
      , 'prod_pass_b007'
      , 'prod_pack_a014'
      , 'prod_pass_b008'
      , 'prod_pass_b009'
      , 'prod_subs_e001'
      , 'prod_subs_e002'
      , 'prod_subs_e003'
      , 'prod_subs_b003'
      , 'prod_subs_b004'
      , 'prod_subs_b005'
      , 'prod_subs_a001'
      , 'prod_subs_a002'
      , 'prod_subs_a003'
    ],
    android: [
      'prod_pass_a001'
      , 'prod_pack_a002'
      , 'prod_pass_a002'
      , 'prod_pack_a003'
      , 'prod_pass_a003'
      , 'prod_pack_a004'
      , 'prod_pass_a004'
      , 'prod_subs_b001'
      , 'prod_pack_a005'
      , 'prod_pass_a005'
      , 'prod_subs_b002'
      , 'prod_pass_a006'
      , 'prod_pass_b001'
      , 'prod_pass_b002'
      , 'prod_pass_b003'
      , 'prod_pack_a010'
      , 'prod_pass_b004'
      , 'prod_pack_a011'
      , 'prod_pass_b005'
      , 'prod_pack_a012'
      , 'prod_pass_b006'
      , 'prod_pack_a013'
      , 'prod_pass_b007'
      , 'prod_pack_a014'
      , 'prod_pass_b008'
      , 'prod_pass_b009'
      , 'prod_subs_e001'
      , 'prod_subs_e002'
      , 'prod_subs_e003'
      , 'prod_subs_b003'
      , 'prod_subs_b004'
      , 'prod_subs_b005'
      , 'prod_subs_a001'
      , 'prod_subs_a002'
      , 'prod_subs_a003'
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


  const [productsPass, setProductsPass] = useState<Products>([]); // 패스 상품

  // ################################################################ 초기 실행 함수
  useEffect(() => {
    // 스토어 커넥션
    async function fetch() {  
      const isConnected = await initConnection();
      if (isConnected) {
        await getProducts({ skus:passProduct });
      }
    };
    fetch();
  }, []);

  // ########################################################### 카테고리 상품 페이지 로드 실행 함수
  useFocusEffect(
    React.useCallback(() => {
      async function fetch() {
        onPressCategory(categories[0]);
        await AsyncStorage.setItem('SHOP_CONNECT_DT', formatNowDate());
      };
      fetch();
      return async() => {
      };
    }, []),
  );

  // ######################################################### 카테고리 선택 함수
  const onPressCategory = async(category:any) => {
    setSelectedCategory(category);
    loadingFunc(true);

    const body = { item_type_code: category.value };
    const { success, data } = await get_bm_product(body);
    if (success) {
      let _products = data?.item_list;

      const connectDate = await AsyncStorage.getItem('SHOP_CONNECT_DT');

      _products.map((item: any) => {
        item.connect_date = connectDate;
      });

      setProductsPass(_products);

      loadingFunc(false);
    } else {
      loadingFunc(false);
    }
  };

  // ######################################################### 상품상세 팝업 활성화 함수
  const openModal = (item) => {
    setTargetItem(item);
    setModalVisible(true);


    //loadingFunc(true);
  };

  // ######################################################### 상품상세 팝업 닫기 함수
  const closeModal = (isPayConfirm: boolean) => {
    setModalVisible(false);

    if(isPayConfirm && typeof itemUpdateFunc != 'undefined') {
      itemUpdateFunc(isPayConfirm);
    }
  };

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
      if(null != data.mbr_base && typeof data.mbr_base != 'undefined') {
        dispatch(setPartialPrincipal({
          mbr_base : data.mbr_base
        }));
      }
    }
  };

  useEffect(() => {
    if(selectedCategory?.value == 'SUBSCRIPTION' || selectedCategory?.value == 'PACKAGE' || selectedCategory?.value == 'PASS') {

      // 튜토리얼 팝업 노출
      if((selectedCategory?.value == 'SUBSCRIPTION' && memberBase?.tutorial_subscription_item_yn == 'Y') ||
      (selectedCategory?.value == 'PACKAGE' && memberBase?.tutorial_package_item_yn == 'Y') ||
      (selectedCategory?.value == 'PASS' && memberBase?.tutorial_shop_yn == 'Y')) {

        let guideType = '';
        if(selectedCategory?.value == 'SUBSCRIPTION') {
          guideType = 'SHOP_SUBSCRIPTION';
        } else if(selectedCategory?.value == 'PACKAGE') {
          guideType = 'SHOP_PACKAGE';
        } else if(selectedCategory?.value == 'PASS') {
          guideType = 'SHOP_BASIC';
        }

        show({
          type: 'GUIDE',
          guideType: guideType,
          guideSlideYn: guideType == 'SHOP_BASIC' ? 'Y' : 'N',
          guideNexBtnExpoYn: 'Y',
          confirmCallback: function(isNextChk) {
            if(isNextChk) {
              saveMemberTutorialInfo(selectedCategory?.value);
            }
          }
        });
      };
    }
  }, [selectedCategory]);

  return (
    <>
      <ScrollView style={_styles.container}>
        <View style={_styles.categoriesContainer}>
          {categories?.map((item, index) => (
            <TouchableOpacity
              key={`category-${item.value}-${index}`}
              activeOpacity={0.8}
              style={_styles.categoryBorder(item.value === selectedCategory.value)}
              onPress={() => onPressCategory(item)}>

              <Text style={_styles.categoryText(item.value === selectedCategory.value)}>
                {item?.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {productsPass?.map((item, index) => (
          <RenderItem
            key={`product-${item?.item_code}-${index}`}
            item={item}
            openModal={openModal}
          />
        ))}

        {/* ##################### 상품 상세 팝업 */}
        <ProductModal
          isVisible={modalVisible}
          type={'bm'}
          item={targetItem}
          closeModal={closeModal}
        />
      </ScrollView>
    </>
  );
}

// ######################################################### 상품 RenderItem
function RenderItem({ item, openModal }) {
  const imagePath = findSourcePath(item?.file_path + item?.file_name);
  const isNew = (item.connect_date == null || item.connect_date < item.reg_dt) ? true : false;

  const buyCountCycle = item?.buy_count_cycle;
  const buyCount = item?.buy_count;
  const buyCountMax = item?.buy_count_max;

  const onPressItem = () => {
    let isChk = true;

    if(buyCountCycle != 'NONE') {
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
      <View style={{ flexDirection: 'row' }}>
        <View style={{width: 110, height: 80}}>
          <Image source={ imagePath } style={_styles.tumbs} />
          {isNew &&
            <View style={_styles.iconArea}>
              <Text style={_styles.newText}>NEW</Text>
            </View>
          }

          {item?.buy_count_cycle != 'NONE' && (
            <View style={_styles.imgBottomArea}>
              <Text style={_styles.imgBottomText}>{item?.buy_count}/{item?.buy_count_max}구매</Text>
              <View style={{backgroundColor: '#000000', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.7}} />
            </View>
          )}
        </View>

        <View style={_styles.textContainer}>
          {/* <Text style={_styles.BESTText}>BEST</Text> */}
          <Text style={{ fontSize: 13, fontWeight: 'bold', color:'#363636' }}>
            {item?.item_name}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={_styles.discountRate}>
              {item?.discount_rate && item.discount_rate != 0 ? item.discount_rate + '%':''}
            </Text>
            <Text style={_styles.price}>
              {CommaFormat(item?.shop_buy_price) + (item.money_type_code == 'PASS' ? '패스' : '원')}
            </Text>
            <Text style={_styles.originPrice}>
              {item?.discount_rate && item.discount_rate != 0 ? CommaFormat(item?.original_price) + (item.money_type_code == 'PASS' ? '패스' : '원') : ''}
            </Text>
          </View>
          <View style={_styles.boxWrapper}>
            {(item?.discount_rate && item.discount_rate != 0 ? true : false) && 
              <View style={_styles.box}><Text style={_styles.boxText}>특가할인</Text></View>
            }
            {item?.buy_count_cycle == 'MONTH' &&
              <View style={_styles.box}><Text style={_styles.boxText}>월1회구매</Text></View>
            }
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  categoriesContainer: {
    marginTop: 30,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'flex-start',
  },
  categoryBorder: (isSelected: boolean) => {
    return {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: isSelected ? Color.primary : Color.grayAAAA,
      borderRadius: 9,
      marginLeft: 4,
    };
  },
  categoryText: (isSelected: boolean) => {
    return {
      fontSize: 14,
      color: isSelected ? Color.primary : Color.grayAAAA,
    };
  },
  itemContainer: {
    width: '100%',
    borderBottomColor: Color.grayDDDD,
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  tumbs: {
    width: 110,
    height: 80,
    backgroundColor: Color.gray6666,
    borderRadius: 5,
  },
  textContainer: {
    marginLeft: 10,
    flexDirection: 'column',
  },
  BESTText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#363636',
  },
  discountRate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Color.primary,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
    color:'#363636',
  },
  originPrice: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    textDecorationLine: 'line-through',
    color:'#363636',
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
    bottom: 4,
    right: 4,
    borderRadius: 7,
    overflow: 'hidden',
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
