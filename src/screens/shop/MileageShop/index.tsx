import { Color } from 'assets/styles/Color';
import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { findSourcePath, ICON } from 'utils/imageUtils';
import { SectionGrid } from 'react-native-super-grid';
import RespectCard from '../Component/BannerPannel';
import ProductModal from '../Component/ProductModal';
import { useNavigation } from '@react-navigation/native';
import { ROUTES, STACK } from 'constants/routes';
import { get_auct_product, get_product_list, order_goods } from 'api/models';
import { CommaFormat, getRemainTime } from 'utils/functions';
import { usePopup } from 'Context';
import { useDispatch } from 'react-redux';
import { myProfile } from 'redux/reducers/authReducer';
import { CommonLoading } from 'component/CommonLoading';
import SpaceView from 'component/SpaceView';
import { ScrollView } from 'react-native-gesture-handler';
import { layoutStyle, styles } from 'assets/styles/Styles';
import LinearGradient from 'react-native-linear-gradient';


const DATA = [
  {
    title: '01/08 ~ 01/15 (7일 후 열림)',
    data: ['PizzaPizza', 'BurgerBurger', 'RisottoRisotto'],
  },
  {
    title: '01/08 ~ 01/15 (7일 후 열림)',
    data: ['French Fries', 'Onion Rings', 'Fried Shrimps'],
  },
  {
    title: '01/08 ~ 01/15 (7일 후 열림)',
    data: ['Water', 'Coke', 'Beer'],
  },
  {
    title: '01/08 ~ 01/15 (7일 후 열림)',
    data: ['Cheese Cake', 'Ice Cream'],
  },
];


export default function MileageShop() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [tab, setTab] = useState(categories[0]);
  const [data, setData] = useState(DATA);

  const [brandList, setBrandList] = useState([
    {brand_seq: 0, brand_name: 'ALL', logoPath: null, data: [],},
    {brand_seq: 7, brand_name: '네이버', logoPath: ICON.naverLogo, data: [],},
    {brand_seq: 15, brand_name: '스타벅스', logoPath: ICON.starbucksLogo, data: [],},
  ]);

  const [currentTab, setCurrentTab] = useState(brandList[0]);

  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  
  let timer:any;
  
  let tmpLeftSecondsArr: { left_seconds: number; prod_seq: number }[] = [];

  const [leftSecondsArr, setLeftSecondsArr] = useState<any>({
    left_seconds: 0
    , prod_seq: 0
  });
  
  const fnAuctTimeCount = async () => {
    tmpLeftSecondsArr.filter((e, i) => {
      e.left_seconds = e.left_seconds - 1;
    })
    
    
    setLeftSecondsArr(tmpLeftSecondsArr);

    /*
    

    console.log('leftSecondsArr ::: ' , leftSecondsArr);
    */
    /*
    data.filter((e, i) => {
      e.data.filter((o, j) => {
        o.left_seconds = o.left_seconds - 1;
      })
    })
    */
    
    // console.log('data :::: ', data[1].data[0].left_seconds);

    // setDeleteList((prev) => prev.filter((i) => i !== item));
    /*
    setData((prev) => 
      prev.filter((e, i) => {
        e.data.filter((o, j) => {
          console.log('o :::::::: ' , o)
          o.left_seconds = o.left_seconds - countSecond++;
        })
      })
    );
    */
    
    // console.log('fnAuctTimeCount data ::: ' , data.data);

    // console.log(countSecond++, data);
/*
    setData((prev) => data.filter((e, i) => {
      console.log('e :::::::: ' , e)
        
    }));
*/


  }
  

  async function fetch() {
    setIsLoading(true);

    try {
      if(tab.value === 'boutique') {

        // 경매 상품 목록 조회
        const { success: sa, data: ad } = await get_auct_product();
        if (sa) {
          if(ad?.prod_list.length > 0) {
            setData(ad?.prod_list);

            ad?.prod_list.forEach(e => {
              tmpLeftSecondsArr.push({'left_seconds': e.data[0].left_seconds, 'prod_seq':e.data[0].prod_seq });
            });
          };
        };
  
      } else {
  
        // 재고 상품 목록 조회
        const { success: sp, data: pd } = await get_product_list();
        if (sp) {
          setData(pd?.prod_list);

        };
      };

    } catch {
    
    } finally {
      setIsLoading(false);
    };
  };

  async function purchaseCallFn() {
    dispatch(myProfile());
    fetch();
  };

  useEffect(() => { 
    fetch();

    // timer = setInterval(fnAuctTimeCount, 1000);
    // return () => clearInterval(timer);
  }, [tab]);

  const onPressTab = (value) => {
    //setIsLoading(true);
    //setTab(value);
    console.log('value ::::: ' , value);
    setCurrentTab(value);
  };

  // ######################################################### 주문내역 이동
  const onPressLimitShop = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Mileage_Order });
  };

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={ _styles.header}>
        <SpaceView viewStyle={_styles.headerTitleArea}>
          <Text style={_styles.headerTitle}>RP Store</Text>
        </SpaceView>
        <SpaceView viewStyle={[layoutStyle.row]}>
          <TouchableOpacity style={_styles.orderHistBtn} onPress={onPressLimitShop}>
            <Text style={_styles.orderHistText}>주문내역</Text>
          </TouchableOpacity>
          <TouchableOpacity style={_styles.exitBtn} onPress={() => (navigation.goBack())}>
            <Text style={_styles.exitText}>나가기</Text>
          </TouchableOpacity>
        </SpaceView>
      </SpaceView>

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.root}>

        <ListHeaderComponent onPressTab={onPressTab} tab={brandList} />

        <SectionGrid
          itemDimension={tab.value == 'gifticon' ? (Dimensions.get('window').width -75) / 2 : Dimensions.get('window').width - 37}
          sections={data}
          fixed={true}
          stickySectionHeadersEnabled={false}
          // 상시판매 프로세스 적용으로 인해 삭제
          // renderSectionHeader={renderSectionHeader}
          renderItem={(props) => {
            //console.log('props : ', JSON.stringify(props));
            const { item, index, rowIndex } = props;
            //console.log('item ::::: ' , item);
            return (
              <>
                {(!isLoading && (currentTab.brand_seq == 0 || currentTab.brand_seq == item?.brand_seq)) && (
                  <RenderItem type={tab.value} item={item} callFn={purchaseCallFn} />
                )}
              </>
            )
          }}
        />
      </LinearGradient>
    </>
  );
}

// ######################################################################### 카테고리 렌더링
const RenderCategory = ({ onPressTab, tab }) => {
  const [prodData, setProdData] = useState();

  async function fetch() {

    try {
      // 재고 상품 목록 조회
      const { success, data } = await get_product_list();

      if (success) {
        setProdData(data.prod_list);
      };


    } catch {
    
    } finally {
    
    };
  };

  useEffect(() => { 
    //fetch();

    // timer = setInterval(fnAuctTimeCount, 1000);
    // return () => clearInterval(timer);
  }, [tab]);
  // return categories?.map((item, index) => (
  //   <TouchableOpacity
  //     key={index}
  //     activeOpacity={0.8}
  //     style={_styles.categoryBorder(item.value === tab.value)}
  //     onPress={() => onPressTab(item)}>

  //     <Text style={_styles.categoryText(item.value === tab.value)}>
  //       {item?.label}
  //     </Text>
  //   </TouchableOpacity>
  // ));

  return (
    <ScrollView
      horizontal={true}
      showsVerticalScrollIndicator={false}
    >
      {/* {prodData?.map((item, index) => (
        console.log('itemL:::::::', item.data)
      ))} */}


      {tab?.map((item, index) => {
        return (
          <SpaceView key={'brand_'+index} mr={10}>
            <TouchableOpacity onPress={() => onPressTab(item)}>
              {/* <Text>{item?.brand_name}</Text> */}

              {item?.brand_seq == 0 ? (
                <Text style={_styles.brandAllLogo}>ALL</Text>
              ) : (
                <Image source={item?.logoPath} style={styles.iconSquareSize(75)} />
              )}
            </TouchableOpacity>
          </SpaceView>
        );
      })}


    </ScrollView>

  
    // <ScrollView 
    //   horizontal={true}
    //   showsVerticalScrollIndicator={false}
    // >
    //   <TouchableOpacity style={[_styles.brandLogoArea, {backgroundColor: '#D5CD9E'}]}>
    //     <Text style={{fontFamily:'Pretendard-SemiBold', fontSize: 12, color: '#FFF'}}>ALL</Text>
    //   </TouchableOpacity>
    //   <TouchableOpacity style={_styles.brandLogoArea}>
    //     <Image source={ICON.naverLogo} style={styles.iconSize60} resizeMode='cover' />
    //   </TouchableOpacity>
    //   <TouchableOpacity style={_styles.brandLogoArea}>
    //     <Image source={ICON.starbucksLogo} style={styles.iconSize60} resizeMode='cover' />
    //   </TouchableOpacity>
    //   <TouchableOpacity style={_styles.brandLogoArea}>
    //     <Image source={ICON.baskinLogo} style={styles.iconSize60} resizeMode='cover' />
    //   </TouchableOpacity>
    //   <TouchableOpacity style={_styles.brandLogoArea}>
    //     <Image source={ICON.daisoLogo} style={styles.iconSize60} resizeMode='cover' />
    //   </TouchableOpacity>
    //   <TouchableOpacity style={_styles.brandLogoArea}>
    //     <Image source={ICON.paiksLogo} style={styles.iconSize60} resizeMode='cover' />
    //   </TouchableOpacity>
    // </ScrollView>
  );
};

// ######################################################################### List Header 렌더링
function ListHeaderComponent({ onPressTab, tab }) {
  return (
    <SpaceView>
      <SpaceView>
        <SpaceView viewStyle={{ marginTop: 90, paddingHorizontal: 20}}>
          <RespectCard />
        </SpaceView>
      </SpaceView>
      <SpaceView viewStyle={_styles.categoriesContainer}>
        <SpaceView mb={10}>
          <Text style={_styles.allBrandText}>ALL BRAND</Text>
        </SpaceView>
        <RenderCategory onPressTab={onPressTab} tab={tab} />
        <SpaceView mt={20} viewStyle={{borderBottomColor: '#D5CD9E', borderBottomWidth: 1}}>
          <Text style={[_styles.allBrandText, {marginBottom: 5}]}>GIFTICON</Text>
        </SpaceView>
      </SpaceView>
    </SpaceView>
  );
}

// ######################################################################### 상품 아이템 렌더링
const RenderItem = ({ item, type, callFn }) => {  
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [targetItem, setTargetItem] = useState(null);

  const { show } = usePopup();  // 공통 팝업

  // 상품 이미지 경로
  const imagePath = findSourcePath(item?.file_path + item?.file_name);

  const onPressItem = (item) => {
    // ==================== 재고상품 주문 팝업
    if (type === 'gifticon') {
      if(item.prod_cnt < 1){
        return false;
      }
      setTargetItem(item);
      setModalVisible(true);
    } else {
      navigation.navigate(STACK.COMMON, {
        screen: ROUTES.Auction_Detail,
        params: {
          prod_seq: item?.prod_seq, 
          modify_seq: item?.modify_seq 
        },
      });
    }
  };
  // const closeModal = () => setModalVisible(false);
  const closeModal = (isPayConfirm: boolean) => {
    setModalVisible(false);

    if(isPayConfirm) {
      callFn();
    }
  };

  const remainTime = getRemainTime(
    item?.sell_yn === 'Y' ? item?.buy_end_dt : item?.buy_start_dt,
    item?.sell_yn === 'Y'
  );

  // ######################################## 재고상품 구매하기 함수
  const productPurchase = async (item:any) => {
    try {
      show({
        title: '상품 구매',
        content: '상품을 구매하시겠습니까?' ,
        cancelCallback: function() {
          closeModal(false);
        },
        confirmCallback: async function() {
          const body = {
            prod_seq: item.prod_seq,
            modify_seq: item.modify_seq,
            buy_price: item.buy_price,
            mobile_os: Platform.OS,
          }
          const { success, data } = await order_goods(body);
          
          closeModal(false);

          if (success) {
            if(data.result_code == '0000') {
              show({
                content: '구매에 성공하였습니다.' ,
                confirmCallback: function() {
                  closeModal(false);
                  navigation.navigate(STACK.TAB, { screen: 'Shop' });
                }
              });
            } else {
              show({
                content: data.result_msg ,
                confirmCallback: function() { closeModal(false); }
              });
            }
          } else {
            show({
              content: '오류입니다. 관리자에게 문의해주세요.' ,
              confirmCallback: function() { closeModal(false); }
            });
          }
        }
      });
    } catch (err: any) {
      console.warn(err.code, err.message);
      //setErrMsg(JSON.stringify(err));
    }
  }

  console.log('item?.prod_name :::::::: ' , item?.prod_name);

  return (
    <>
      {/* boutique : 경매 상품 목록,  gifticon : 기프티콘 재고 상품 목록 */}
      {type == 'boutique' ? (
        <View style={_styles.renderItem02}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => 
            console.log('item ::: ' , item)
            // onPressItem(item)
          }>
            <View style={{ flexDirection: 'row' }}>
              
              <SpaceView viewStyle={_styles.thumbArea}>
                <Image style={_styles.thumb02} source={imagePath} resizeMode={'cover'} />
              </SpaceView>

              <SpaceView viewStyle={_styles.textArea}>
                <SpaceView mt={17}>
                  <Text style={_styles.boutiqueStatus('')}>준비중</Text>
                  
                  <Text style={_styles.brandName}>{item?.brand_name}</Text>
                  <Text style={_styles.productName(type)}>{item?.prod_name}</Text>
                </SpaceView>

                <SpaceView mb={10}>
                  <View style={[_styles.textContainer]}>
                    <View>
                      <Text style={_styles.hintText}>즉시구매가</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                      <Text style={_styles.priceText(13)}>{CommaFormat(item?.now_buy_price)}</Text>
                      <Image source={ICON.crown} style={_styles.crown} />
                    </View>
                  </View>
                  
                  <View style={_styles.textContainer}>
                    <View>
                      <Text style={_styles.bidText('#8855D3')}>입찰가<Text style={_styles.bidSubText('#8855D3')}>(입찰중)</Text></Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={_styles.priceText(13)}>{CommaFormat(item?.now_bid_price)}</Text>
                      <Image source={ICON.crown} style={_styles.crown} />
                    </View>
                  </View>
                </SpaceView>
              </SpaceView>

              <Text style={_styles.remainText}>{remainTime}</Text>
            </View>        
          </TouchableOpacity>
        </View>

      ) : (

        <TouchableOpacity activeOpacity={0.8} style={_styles.renderItem} onPress={() => onPressItem(item)}>
          <View style={{ flexDirection: 'column' }}>

            <SpaceView viewStyle={_styles.thumbArea}>
              <View style={_styles.rpArea}>
                <Text style={_styles.priceText(11)}>{type === 'gifticon' ? CommaFormat(item?.buy_price) : CommaFormat(item?.now_buy_price)} RP</Text>
              </View>
              <Image style={_styles.logoArea} source={ICON.naverLogo} />
              <Image style={_styles.thumb} source={imagePath} resizeMode={'cover'} />
            </SpaceView>

            <View style={{ paddingHorizontal: 3 }}>
              {/* <Text style={_styles.brandName}>{item?.brand_name}</Text> */}
              <Text style={_styles.productName(type)}>{item?.prod_name}</Text>

              <SpaceView>

                <View style={_styles.textContainer}>
                    {
                      item.prod_cnt > 0 ?
                        <Text style={_styles.hintText}>{item.prod_cnt}개 남음 ({item.buy_cnt}/{item.base_buy_sanction_cnt}구매가능)</Text> :
                        <Text style={_styles.soldOutText}>품절</Text>
                    }
                    
                    {/* <Text style={styles.hintText}>6/2 열림</Text> */}
                    <Text style={_styles.priceText(12)}></Text>
                  </View>
              </SpaceView>
            </View>

            <Text style={_styles.remainText}>{remainTime}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ####################### 상품 팝업 */}
      <ProductModal
        isVisible={modalVisible}
        type={type}
        item={targetItem}
        closeModal={closeModal}
        // productPurchase={productPurchase}
      />
    </>
  );
};

const renderSectionHeader = (props) => {
  const { section } = props;
  const sample = section.data[0];

  if (!Array.isArray(sample) ||
      sample.length === 0) {
    return null;
  } else {
    return (
      <View style={{ marginTop: 30, paddingHorizontal: 16 }}>
        <Text>{section.title}</Text>
      </View>
    );
  }
};



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#3D4348',
  },
  headerTitleArea: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 30,
  },
  headerTitle: {
    fontFamily: 'MinSans-Bold',
    fontSize: 20,
    color: '#F1D30E',
  },
  orderHistBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
  },
  orderHistText: {
    fontFamily: 'Pretendard-Bold',
    color: '#F1D30E',
  },
  exitBtn: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    marginLeft: 10,
  },
  exitText: {
    fontFamily: 'Pretendard-Bold',
    color: '#F1D30E',
  },
  root: { 
    flex: 1, 
    backgroundColor: 'white', 
    paddingHorizontal: 0,
  },
  categoriesContainer: {
    marginTop: 15,
    marginBottom: 10,
    //flexDirection: `row`,
    //alignItems: `center`,
    //justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  allBrandText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#D5CD9E',
  },
  categoryBorder: (isSelected: boolean) => {
    return {
      width: 80,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: isSelected ? Color.primary : '#ECECEC',
      borderRadius: 9,
      marginRight: 8,
    };
  },
  categoryText: (isSelected: boolean) => {
    return {
      fontFamily: 'Pretendard-Medium',
      fontSize: 14,
      color: isSelected ? Color.primary : '#A5A5A5',
      textAlign: 'center',
    };
  },
  renderItem: {
    width: (Dimensions.get('window').width - 75) / 2,
    flex: 1,
    flexWrap: 'wrap',
  },
  renderItem02: {
    position: 'relative',
    //flexWrap: 'wrap',
    //padding: 25,
    backgroundColor: 'white',
    width: Dimensions.get('window').width - 37,
    height: (Dimensions.get('window').width) / 2.6,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15
  },
  thumbArea: {
    
  },
  brandLogoArea: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    width: 60,
    height: 60,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textArea: {
    width: (Dimensions.get('window').width) / 2.5,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  rpArea: {
    position: 'absolute',
    bottom: 7,
    right: 7,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  logoArea: {
    position: 'absolute',
    top: 7,
    left: 7,
    width: 15,
    height: 15,
    zIndex: 10,
  },
  thumb: {
    width: (Dimensions.get('window').width - 75) / 2,
    height: (Dimensions.get('window').width - 75) / 2,
    borderRadius: 5,
    backgroundColor: '#445561',
    borderWidth: 1,
    borderColor: '#445561',
  },
  thumb02: {
    width: (Dimensions.get('window').width) / 2,
    height: (Dimensions.get('window').width) / 2.6,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  brandName: {
    fontSize: 10,
    fontFamily: 'Pretendard-Light',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#D5CD9E',
    marginTop: 5,
  },
  productName: (type: string) => {
    return {
      fontSize: type == 'boutique' ? 14 : 13,
      fontFamily: 'Pretendard-Light',
      letterSpacing: 0,
      textAlign: 'left',
      color: '#D5CD9E',
      marginTop: 2,
    };
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  priceText: (fontSize:number) => {
    return {
      fontFamily: 'Pretendard-Medium',
      fontSize: fontSize,
      letterSpacing: 0,
      textAlign: 'left',
      color: '#32F9E4',
    };
  },
  hintText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    letterSpacing: 0,
    textAlign: 'left',
    //color: '#d3d3d3',
    color: '#E1DFD1',
  },
  soldOutText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#FF0060',
  },
  remainText: {
    position: 'absolute',
    top: 5,
    right: 5,
    color: Color.gray8888,
    fontSize: 9,
  },
  crown: {
    width: 12.7,
    height: 8.43,
    marginTop: 5,
    marginLeft: 4,
  },
  boutiqueStatus: (type:string) => {
    /*
      낙찰 : SOLD
      , 60분 후 낙찰 (일, 시간) : MIN
      , 60초후낙찰 : SCND
    */
   let backgroundColor = (type=='SOLD'?'#69C9E6':'#000000');
   let fontColor = (type=='SCND'?'#FFC100':'#fff');
   
   return {
     fontFamily: 'Pretendard-Medium',
     fontSize: 10,
     color: fontColor,
     //backgroundColor: backgroundColor,
     backgroundColor: '#69C9E6',
     borderRadius: 7,
     width: 45,
     textAlign: 'center',
     paddingVertical: 1,
     overflow: 'hidden',
   };
  },
  bidText: (color:string) => {
    return {
      fontFamily: 'Pretendard-Medium',
      fontSize: 10,
      color: color,
    };
  },
  bidSubText: (color:string) => {
    return {
      fontFamily: 'Pretendard-Medium',
      fontSize: 8,
      color: color,
    };
  },
  brandAllLogo: {
    width: 75,
    height: 75,
    backgroundColor: '#D5CD9E',
    borderRadius: 50,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#fff',
  },

});

const categories = [
  {
    label: '기프티콘',
    value: 'gifticon',
  },
  {
    label: '부티크',
    value: 'boutique',
  },
];
