import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AllCategories } from '@/components/AllCategories/AllCategories';
import CustomerPage from '@/components/CustomerPage/CustomerPage';
import { DailyDeals } from '@/components/DailyDeals/DailyDeals';
import HomeProducts from '@/components/HomeProducts/HomeProducts';
import ProductCategory from '@/components/ProductCategory/ProductCategory';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <CustomerPage>

      {/* =================================================
          HERO
      ================================================= */}

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          WELCOME TO KVK
        </Text>

        <Text style={styles.heroSubtitle}>
          Agricultural Products & Solutions
        </Text>

        <Pressable
          style={styles.shopButton}
          onPress={() =>
            router.push('/categories')
          }
        >
          <Text style={styles.shopButtonText}>
            Shop Now
          </Text>
        </Pressable>
      </View>

      {/* =================================================
          PRODUCT CATEGORIES
      ================================================= */}

      <ProductCategory />

      {/* =================================================
          POPULAR PRODUCTS
      ================================================= */}

      <HomeProducts />

      {/* =================================================
          DAILY DEALS
      ================================================= */}

      <DailyDeals />
<AllCategories />
    </CustomerPage>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,

    paddingHorizontal: 20,
    paddingVertical: 32,

    borderRadius: 16,

    backgroundColor: '#E8F5E9',

    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 25,
    fontWeight: '900',
    color: '#2E7D32',
    textAlign: 'center',
  },

  heroSubtitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#4F5F50',
    textAlign: 'center',
  },

  shopButton: {
    marginTop: 20,

    minHeight: 44,

    paddingHorizontal: 25,

    borderRadius: 9,

    backgroundColor: '#2E7D32',

    alignItems: 'center',
    justifyContent: 'center',
  },

  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});