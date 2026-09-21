import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ASSET_BASE_URL } from '@/api/axios';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

type DailyDealProduct = {
  id: number | string;
  title?: string;
  name?: string;
  images?: string[];
  image?: string;
  category_name?: string;
  brand?: string;
  stock?: number | string;
  orgprice?: number | string;
  price?: number | string;
  daily_deal_price?: number | string;
  rating?: number | string;
  [key: string]: any;
};

type Props = {
  ddproduct?: DailyDealProduct | null;
  onToast?: (message: string) => void;
};

const getImageUrl = (url?: string | null) => {
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${ASSET_BASE_URL}${
    url.startsWith('/') ? '' : '/'
  }${url}`;
};

const formatRupees = (value: any) =>
  Number(value || 0).toLocaleString('en-IN');

export const DailyDealsCard = ({
  ddproduct,
  onToast,
}: Props) => {
  const router = useRouter();

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const [imgError, setImgError] = useState(false);

  if (!ddproduct) {
    return null;
  }

  const {
    id,
    title,
    name,
    images,
    image,
    category_name,
    brand,
    stock,
    orgprice,
    price,
    daily_deal_price,
    rating,
  } = ddproduct;

  const displayName =
    title ||
    name ||
    'Untitled product';

  const inStock = Number(stock) > 0;

  const finalPrice =
    daily_deal_price || price || 0;

  const discountPercent = useMemo(() => {
    const original = Number(orgprice);
    const current = Number(finalPrice);

    if (
      !original ||
      !current ||
      original <= current
    ) {
      return null;
    }

    return Math.round(
      ((original - current) / original) * 100
    );
  }, [orgprice, finalPrice]);

  const imageSource =
    images?.[0] ||
    image ||
    null;

  const imageSrc = getImageUrl(imageSource);

const openProduct = () => {
  const category =
    category_name || 'unknown';

  router.push({
    pathname: '/products-categories/[categoryName]/[productId]',
    params: {
      categoryName: String(category),
      productId: String(ddproduct.id),
    },
  });
};

  const handleAddToCart = () => {
    if (!inStock) return;

    addToCart({
      ...ddproduct,
      quantity: 1,
    });

    onToast?.(
      `${displayName} added to cart!`
    );
  };

  const handleAddToWishlist = () => {
    addToWishlist({
      ...ddproduct,
      quantity: 1,
    });

    onToast?.(
      `${displayName} added to wishlist!`
    );
  };

  const ratingNumber = Math.min(
    5,
    Math.max(
      0,
      Number(rating || 3)
    )
  );

  return (
    <View style={styles.card}>

      {/* IMAGE */}
      <Pressable
        style={styles.imageContainer}
        onPress={openProduct}
      >
        {discountPercent !== null && (
          <View style={styles.dealRibbon}>
            <Text style={styles.dealRibbonText}>
              -{discountPercent}%
            </Text>
          </View>
        )}

        {imageSrc && !imgError ? (
          <Image
            source={{ uri: imageSrc }}
            style={styles.productImage}
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={styles.noImage}>
            <Ionicons
              name="image-outline"
              size={32}
              color="#AAAAAA"
            />

            <Text style={styles.noImageText}>
              No image
            </Text>
          </View>
        )}

        {/* QUICK PREVIEW */}
        <View style={styles.previewButton}>
          <Ionicons
            name="eye-outline"
            size={18}
            color="#333333"
          />
        </View>

        {/* WISHLIST */}
        <Pressable
          style={styles.wishlistButton}
          onPress={handleAddToWishlist}
        >
          <Ionicons
            name="heart-outline"
            size={21}
            color="#333333"
          />
        </Pressable>
      </Pressable>

      {/* DETAILS */}
      <View style={styles.content}>

        {/* CATEGORY */}
        {category_name ? (
          <Text
            style={styles.category}
            numberOfLines={1}
          >
            {category_name}
          </Text>
        ) : null}

        {/* PRODUCT NAME */}
        <Pressable onPress={openProduct}>
          <Text
            style={styles.productName}
            numberOfLines={2}
          >
            {displayName}
          </Text>
        </Pressable>

        {/* BRAND */}
        {brand ? (
          <Text
            style={styles.brand}
            numberOfLines={1}
          >
            {brand}
          </Text>
        ) : null}

        {/* STOCK */}
        <View style={styles.stockRow}>
          <View
            style={[
              styles.stockDot,
              !inStock && styles.stockDotOut,
            ]}
          />

          <Text
            style={[
              styles.stockText,
              !inStock && styles.stockTextOut,
            ]}
            numberOfLines={1}
          >
            {inStock
              ? `In stock (${stock})`
              : 'Out of stock'}
          </Text>
        </View>

        {/* RATINGS */}
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <Ionicons
                key={star}
                name={
                  star <= ratingNumber
                    ? 'star'
                    : 'star-outline'
                }
                size={14}
                color={
                  star <= ratingNumber
                    ? '#F5A623'
                    : '#CCCCCC'
                }
                style={styles.star}
              />
            )
          )}
        </View>

        {/* PRICE */}
        <View style={styles.priceRow}>
          {orgprice ? (
            <Text style={styles.originalPrice}>
              ₹{formatRupees(orgprice)}
            </Text>
          ) : null}

          <Text style={styles.discountPrice}>
            ₹{formatRupees(finalPrice)}
          </Text>
        </View>

        {/* ADD TO CART */}
        <Pressable
          style={[
            styles.addToCartButton,
            !inStock &&
              styles.addToCartDisabled,
          ]}
          disabled={!inStock}
          onPress={handleAddToCart}
        >
          <Ionicons
            name="cart-outline"
            size={17}
            color="#FFFFFF"
          />

          <Text style={styles.addToCartText}>
            {inStock
              ? 'Add to cart'
              : 'Out of stock'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginRight: 12,
  },

  imageContainer: {
    height: 175,
    backgroundColor: '#F8F9F8',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productImage: {
    width: '88%',
    height: '88%',
  },

  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  noImageText: {
    marginTop: 5,
    color: '#AAAAAA',
    fontSize: 11,
  },

  dealRibbon: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 3,
    backgroundColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },

  dealRibbonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  previewButton: {
    position: 'absolute',
    right: 48,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  wishlistButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  content: {
    padding: 12,
  },

  category: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 5,
  },

  productName: {
    color: '#222222',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    minHeight: 40,
  },

  brand: {
    color: '#666666',
    fontSize: 12,
    marginTop: 5,
  },

  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 6,
  },

  stockDotOut: {
    backgroundColor: '#D32F2F',
  },

  stockText: {
    color: '#4A4A4A',
    fontSize: 11,
  },

  stockTextOut: {
    color: '#D32F2F',
  },

  ratingRow: {
    flexDirection: 'row',
    marginTop: 7,
  },

  star: {
    marginRight: 2,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  originalPrice: {
    color: '#999999',
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 7,
  },

  discountPrice: {
    color: '#1B5E20',
    fontSize: 17,
    fontWeight: '800',
  },

  addToCartButton: {
    height: 40,
    marginTop: 10,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  addToCartDisabled: {
    backgroundColor: '#AAAAAA',
  },

  addToCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});