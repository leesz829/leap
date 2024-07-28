import { Color } from 'assets/styles/Color';
import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, Platform, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE } from 'utils/imageUtils';
import { SectionGrid } from 'react-native-super-grid';
import RespectCard from '../Component/BannerPannel';
import ProductModal from '../Component/ProductModal';
import { useNavigation } from '@react-navigation/native';
import { ROUTES, STACK } from 'constants/routes';
import { get_auct_product, get_product_list, order_goods } from 'api/models';
import { CommaFormat, getRemainTime, isEmptyData } from 'utils/functions';
import { usePopup } from 'Context';
import { useDispatch } from 'react-redux';
import { myProfile } from 'redux/reducers/authReducer';
import { CommonLoading } from 'component/CommonLoading';
import SpaceView from 'component/SpaceView';
import { ScrollView } from 'react-native-gesture-handler';
import { layoutStyle, styles } from 'assets/styles/Styles';
import LinearGradient from 'react-native-linear-gradient';
import MileageInfo from 'component/shop/MileageInfo';
import { useUserInfo } from 'hooks/useUserInfo';




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


const { width, height } = Dimensions.get('window');

export default function MileageShop() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const [tab, setTab] = useState(categories[0]);
  const [data, setData] = useState(DATA);
  const me = useUserInfo();

  const [prodList, setProdList] = useState([]);

  const [brandList, setBrandList] = useState([
    /* {brand_seq: 0, brand_name: 'ALL', img_file_path: null}, */
    /* {brand_seq: 7, brand_name: '네이버', logoPath: ICON.naverLogo, data: [],},
    {brand_seq: 15, brand_name: '스타벅스', logoPath: ICON.starbucksLogo, data: [],}, */
  ]);

  const [currentBrandSeq, setCurrentBrandSeq] = useState(0);

  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);

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
          //console.log('pd?.prod_list :::::: ' , pd?.real_prod_list.length);
          setData(pd?.prod_list);

          let _prodList = [];
          let _brandList = [{brand_seq: 0, brand_name: '전체보기', img_file_path: null, prod_list: pd?.real_prod_list}];
          pd?.brand_list.forEach(e => {
            _brandList.push(e);
          });

          setBrandList(_brandList);
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

  const onPressTab = (idx:any) => {
    //setIsLoading(true);
    //setTab(value);
    //setCurrentBrandSeq(brandSeq);
    console.log('idx ::::::  ' ,idx);
    setCurrentBrandIndex(idx);

    //console.log('brand ::::: ', brandList[currentBrandIndex].prod_list.length);
  };

  // ######################################################### 주문내역 이동
  const onPressLimitShop = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Mileage_Order });
  };

  return (
    <>
      {isLoading && <CommonLoading />}

      <LinearGradient
        colors={['#390D1D', '#390D1D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.wrap}>

        {/* ################################################################################################# 상단 버튼 영역 */}
        <SpaceView mt={40} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => (navigation.goBack())}>
            <Image source={ICON.backBtnType01} style={styles.iconSquareSize(35)} />
          </TouchableOpacity>

          <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
            <Image source={ICON.shop_rpCard} style={styles.iconNoSquareSize(25, 17)} />
            <SpaceView ml={5} mb={4}><Text style={styles.fontStyle('EB', 16, '#FFFF5D')}>{CommaFormat(me?.mileage_point)}</Text></SpaceView>
          </SpaceView>
          
          <TouchableOpacity onPress={onPressLimitShop}>
            <Image source={ICON.shop_order} style={styles.iconSquareSize(35)} />
          </TouchableOpacity>
        </SpaceView>

        <SpaceView>
          {/* ################################################################################################# RP Store 정보 */}
          <SpaceView>
            <MileageInfo data={me} />
          </SpaceView>

          {/* ################################################################################################# 브랜드 영역 */}
          <SpaceView mt={30}>
            <SpaceView mb={10}>
              <Text style={styles.fontStyle('EB', 20, '#fff')}>브랜드</Text>
            </SpaceView>
            <SpaceView>
              <RenderCategory onPressTab={onPressTab} tabList={brandList} />
            </SpaceView>
          </SpaceView>
        </SpaceView>

        {/* <ListHeaderComponent onPressTab={onPressTab} tabList={brandList} /> */}

        {/* ################################################################################################# 기프티콘 영역 */}
        <SpaceView mt={20}>
          <SpaceView mb={10} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.fontStyle('EB', 20, '#fff')}>기프티콘</Text>
            <SpaceView viewStyle={{flexDirection: 'row'}}>
              <TouchableOpacity>
                <Image source={ICON.orderIcon} style={styles.iconSquareSize(24)} />
              </TouchableOpacity>
              <TouchableOpacity style={{marginLeft: 10}}>
                <Image source={ICON.settingIcon} style={styles.iconSquareSize(24)} />
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>

          <SpaceView /* mb={height-20} */ viewStyle={{height: height-500}}>
            {brandList[currentBrandIndex]?.prod_list?.length > 0 && (
              <>
                <FlatList
                  //ref={dataRef}
                  data={brandList[currentBrandIndex]?.prod_list}
                  keyExtractor={(item, index) => index.toString()}
                  //numColumns={1} // 2열로 설정
                  //contentContainerStyle={{justifyContent: 'space-between'}}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => {

                    return (
                      <RenderItem type={tab.value} item={item} index={index} callFn={purchaseCallFn} memberData={me} />
                    )
                  }}
                />
              </>
            )}
          </SpaceView>
        </SpaceView>

      </LinearGradient>




      {/* {(me?.respect_grade !== 'DIAMOND' && me?.respect_grade !== 'PLATINUM') ? 
        <SpaceView viewStyle={_styles.floatWrapper}>
          <LinearGradient
            colors={['#390D1D', '#390D1D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{borderRadius: 10,  paddingVertical: 10}}>

            <SpaceView pl={10} pr={10} viewStyle={[layoutStyle.row, layoutStyle.alignCenter, layoutStyle.justifyBetween]}>
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
              colors={['#C0C3C4', '#7D7969']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={_styles.respectLine}>
                <Image source={ICON.sparkler} style={{width: 15, height: 15}} />
                <Text style={_styles.repectGrade}>{me?.respect_grade}</Text>
            </LinearGradient>

            <SpaceView mt={8} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween]}>
              <SpaceView ml={10}>
                <Text style={_styles.respectDesc}>리스펙트 등급 <Text style={{color: '#32F9E4'}}>플래티넘</Text>부터 원하는 상품으로 교환할 수 있어요.</Text>
              </SpaceView>
            </SpaceView>

            <SpaceView pl={15} pr={15} mt={20} viewStyle={[layoutStyle.row, layoutStyle.alignEnd, layoutStyle.justifyBetween]}>
              <Image source={IMAGE.logoLeapTit} style={{width: 60, height: 25}} />
              <SpaceView>
                <Text style={_styles.rpAmtText}>
                  {CommaFormat(me?.mileage_point)}
                  <Text style={_styles.rpText}>RP</Text>
                </Text>
              </SpaceView>
            </SpaceView>
          </LinearGradient>
        </SpaceView>
      :
      
      } */}
    </>
  );
}

// ######################################################################### 카테고리 렌더링
const RenderCategory = ({ onPressTab, tabList }) => {
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
  }, [tabList]);
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
      {tabList?.map((item, index) => {

        let bgColor = '#000';
        let imgPath = ICON.shop_brandAll;

        if(item?.brand_name == '네이버') {
          bgColor = '#00C73C';
        } else if(item?.brand_name == '스타벅스') {
          bgColor = '#006F3F';
        }

        if(isEmptyData(item?.img_file_path)) {
          imgPath = findSourcePath(item?.img_file_path);
        }

        return (
          <SpaceView key={'brand_'+index} mr={5} viewStyle={[_styles.brandItemWrap, {backgroundColor: bgColor}]}>
            <TouchableOpacity 
              onPress={() => onPressTab(index)}
              style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>

              <Image source={imgPath} style={styles.iconSquareSize(30)} />
              <Text style={styles.fontStyle('SB', 10, '#fff')}>{item?.brand_name}</Text>
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
function ListHeaderComponent({ onPressTab, tabList }) {
  const me = useUserInfo();

  return (
    <SpaceView>
      <SpaceView>
        <SpaceView mt={5}>
          {/* <RespectCard /> */}
          <MileageInfo data={me} />
        </SpaceView>
      </SpaceView>
      <SpaceView viewStyle={_styles.categoriesContainer}>
        <SpaceView mb={10} pr={15} pl={15}>
          <Text style={_styles.allBrandText}>ALL BRAND</Text>
        </SpaceView>
        <SpaceView pr={15} pl={15}>
          <RenderCategory onPressTab={onPressTab} tabList={tabList} />
        </SpaceView>
        <SpaceView mt={20} pb={5} viewStyle={{borderBottomColor: '#D5CD9E', borderBottomWidth: 1, paddingHorizontal: 15}}>
          <Text style={[_styles.allBrandText]}>GIFTICON</Text>
        </SpaceView>
      </SpaceView>
    </SpaceView>
  );
}

// ######################################################################### 상품 아이템 렌더링
const RenderItem = ({ type, item, index, callFn, memberData }) => {
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

  return (
    <>
      {/* boutique : 경매 상품 목록,  gifticon : 기프티콘 재고 상품 목록 */}
      {type == 'boutique' ? (
        <SpaceView viewStyle={_styles.renderItem02}>
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
        </SpaceView>

      ) : (
        <>
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[_styles.renderItemStyle]} 
            onPress={() => onPressItem(item)}
            disabled={memberData?.respect_grade != 'PLATINUM' && memberData?.respect_grade != 'DIAMOND'}
          >
            <SpaceView viewStyle={_styles.prodImgWrap}>
              <Image source={imagePath} style={styles.iconSquareSize(84)} resizeMode={'cover'} />
            </SpaceView>

            <SpaceView viewStyle={_styles.prodContentWrap}>
              <SpaceView>
                <Text style={styles.fontStyle('EB', 14, '#fff')}>{item?.prod_name}</Text>
              </SpaceView>
              <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between'}}>
                <SpaceView>
                  {item.prod_cnt > 0 ? (
                    <Text style={styles.fontStyle('SB', 10, '#fff')}>{item.prod_cnt}개 남음 ({item.buy_cnt}/{item.base_buy_sanction_cnt}구매가능)</Text>
                  ) : (
                    <Text style={styles.fontStyle('SB', 10, '#FF2476')}>품절</Text>
                  )}
                </SpaceView>
                <SpaceView viewStyle={_styles.rpPriceWrap}>
                  <Text style={styles.fontStyle('EB', 12, '#FFFF5D')}>{type === 'gifticon' ? CommaFormat(item?.buy_price) : CommaFormat(item?.now_buy_price)} RP</Text>
                </SpaceView>
              </SpaceView>
            </SpaceView>

            {/* <View style={{ flexDirection: 'column' }}>

              <SpaceView viewStyle={_styles.thumbArea}>
                <View style={_styles.rpArea}>
                  <Text style={_styles.priceText(11)}>{type === 'gifticon' ? CommaFormat(item?.buy_price) : CommaFormat(item?.now_buy_price)} RP</Text>
                </View>
                <Image style={_styles.thumb} source={imagePath} resizeMode={'cover'} />
              </SpaceView>

              <SpaceView mt={3} viewStyle={{ paddingHorizontal: 3 }}>
                <Text style={_styles.productName(type)}>{item?.prod_name}</Text>

                <SpaceView>
                  <View style={_styles.textContainer}>
                      {item.prod_cnt > 0 ? (
                        <Text style={_styles.hintText}>{item.prod_cnt}개 남음 ({item.buy_cnt}/{item.base_buy_sanction_cnt}구매가능)</Text>
                      ) : (
                        <Text style={_styles.soldOutText}>품절</Text>
                      )}
                      
                      <Text style={_styles.priceText(12)}></Text>
                    </View>
                </SpaceView>
              </SpaceView>

              <Text style={_styles.remainText}>{remainTime}</Text>
            </View> */}
          </TouchableOpacity>
        </>
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
  wrap: {
    minHeight: height,
    paddingHorizontal: 10,
  },





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
    fontFamily: 'SUITE-Bold',
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
    //paddingHorizontal: 15,
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
  renderItemStyle: {
    //width: (Dimensions.get('window').width - 54),
    width: '100%',
    height: 95,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    flexDirection: 'row',
  },
  renderItem02: {
    /* flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5, */

    //position: 'relative',
    //flexWrap: 'wrap',
    //padding: 25,
    backgroundColor: 'white',
    width: Dimensions.get('window').width,
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
    width: (Dimensions.get('window').width - 45) / 2,
    height: (Dimensions.get('window').width - 45) / 2,
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandAllLogoText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#fff',
  },







floatWrapper: {
  width: '100%',
  backgroundColor: '#390D1D',
  paddingHorizontal: 15,
  paddingTop: 20,
},
rpStoreBtn: {
  backgroundColor: '#FFF',
  borderRadius: 50,
  paddingHorizontal: 12,
  paddingVertical: 2,
},
respectLine: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: 30,
  marginTop: 10,
},
repectGrade: {
  fontFamily: 'SUITE-Bold',
  color: '#000000',
  marginRight: 10,
  marginLeft: 2,
},
respectTitle: {
  fontFamily: 'Pretendard-SemiBold',
  fontSize: 10,
  color: '#333B41',
},
respectDesc: {
  fontFamily: 'Pretendard-Light',
  fontSize: 10,
  color: '#D5CD9E',
},
rpAvailable: {
  fontFamily: 'Pretendard-SemiBold',
  fontSize: 10,
  color: '#333B41',
  marginTop: 5,
},
rpText: {
  fontFamily: 'Pretendard-SemiBold',
  fontSize: 17,
  color: '#32F9E4',
},
rpAmtText: {
  fontFamily: 'Pretendard-Medium',
  fontSize: 32,
  color: '#32F9E4',
},
gradeTitle: {
  fontFamily: 'Pretendard-Light',
  fontSize: 10,
  color: '#32F9E4',
  textAlign: 'right',
},
gradient: (value:any) => {
  let percent = 0;

  if(value != null && typeof value != 'undefined') {
    percent = value * 100;
  };

  return {
    position: 'absolute',
    width: percent + '%',
    height: 12,
    zIndex: 1,
    borderRadius: 20,
  };
},
sliderContainerStyle: {
  height: 12,
  borderRadius: 50,
  backgroundColor: '#FFF',
},
sliderThumbStyle: {
  height: 12,
  borderRadius: 50,
  backgroundColor: '#FFF',
},
rpDescText: {
  fontFamily: 'Pretendard-Light',
  fontSize: 10,
  color: '#D5CD9E',
},


  brandItemWrap: {
    width: 100,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  prodImgWrap: {
    backgroundColor: '#CDE8E3',
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodContentWrap: {
    backgroundColor: '#383838',
    flex: 0.7,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  rpPriceWrap: {
    backgroundColor: '#44B6E5',
    borderRadius: 17,
    paddingHorizontal: 8,
    paddingVertical: 5,
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
