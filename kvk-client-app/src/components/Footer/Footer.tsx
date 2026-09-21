import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import api from '@/api/axios';

type Category = {
  id?: number | string;
  name?: string;
  category_name?: string;
};

export default function Footer() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  // =========================================================
  // FETCH CATEGORIES FROM BACKEND
  // =========================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await api.get('/categories');

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setCategories(data);
      } catch (error) {
        console.error(
          'Failed to load footer categories:',
          error
        );

        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // =========================================================
  // CATEGORY NAVIGATION
  // =========================================================

  const goToCategory = (category: string) => {
    if (!category) return;

    router.push(
      `/products-categories/${encodeURIComponent(
        category
      )}` as any
    );
  };

  // =========================================================
  // CATEGORY NAME
  // =========================================================

  const getCategoryName = (
    category: Category
  ) => {
    return (
      category.name ||
      category.category_name ||
      ''
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <View style={styles.footer}>

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <View style={styles.footerMain}>
        <View style={styles.footerContainer}>

          {/* =================================================
              ABOUT
          ================================================= */}

          <View style={styles.column}>
            <Pressable
              onPress={() => router.push('/')}
            >
              <Text style={styles.logo}>
                KVK
              </Text>
            </Pressable>

            <Text style={styles.aboutText}>
              Your trusted destination for
              agricultural products, seeds,
              crop protection solutions,
              nutrients and farming equipment.
            </Text>

            <View style={styles.contactContainer}>

              <View style={styles.contactRow}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.contactText}>
                  India
                </Text>
              </View>

              <View style={styles.contactRow}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.contactText}>
                  Customer Support
                </Text>
              </View>

              <View style={styles.contactRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.contactText}>
                  Support
                </Text>
              </View>

            </View>
          </View>

          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <View style={styles.column}>
            <Text style={styles.heading}>
              Quick Links
            </Text>

            <Pressable
              onPress={() => router.push('/')}
            >
              <Text style={styles.link}>
                Home
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/about' as any)
              }
            >
              <Text style={styles.link}>
                About Us
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/contact' as any)
              }
            >
              <Text style={styles.link}>
                Contact Us
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/brands' as any)
              }
            >
              <Text style={styles.link}>
                Our Brands
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/blogs' as any)
              }
            >
              <Text style={styles.link}>
                Blogs
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/affiliations' as any)
              }
            >
              <Text style={styles.link}>
                Affiliations
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              CUSTOMER SERVICE
          ================================================= */}

          <View style={styles.column}>
            <Text style={styles.heading}>
              Customer Service
            </Text>

            <Pressable
              onPress={() =>
                router.push('/account')
              }
            >
              <Text style={styles.link}>
                My Account
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/wishlist')
              }
            >
              <Text style={styles.link}>
                Wishlist
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/compare' as any)
              }
            >
              <Text style={styles.link}>
                Compare Products
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/cart')
              }
            >
              <Text style={styles.link}>
                Shopping Cart
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push(
                  '/trackmyorder' as any
                )
              }
            >
              <Text style={styles.link}>
                Track My Order
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push('/orders' as any)
              }
            >
              <Text style={styles.link}>
                My Orders
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              CATEGORIES — BACKEND CONNECTED
          ================================================= */}

          <View
            style={[
              styles.column,
              styles.categoryColumn,
            ]}
          >
            <Text style={styles.heading}>
              Categories
            </Text>

            {loadingCategories ? (
              <View style={styles.categoryLoading}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.loadingText}>
                  Loading categories...
                </Text>
              </View>
            ) : categories.length === 0 ? (
              <Text style={styles.emptyText}>
                No categories available
              </Text>
            ) : (
              categories.map(
                (category, index) => {
                  const name =
                    getCategoryName(category);

                  if (!name) return null;

                  return (
                    <Pressable
                      key={
                        category.id ??
                        `${name}-${index}`
                      }
                      onPress={() =>
                        goToCategory(name)
                      }
                    >
                      <Text style={styles.link}>
                        {name}
                      </Text>
                    </Pressable>
                  );
                }
              )
            )}
          </View>

        </View>
      </View>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <View style={styles.footerBottom}>
        <View
          style={
            styles.footerBottomContainer
          }
        >

          <Text style={styles.copyright}>
            © {new Date().getFullYear()} KVK.
            {' '}All rights reserved.
          </Text>

          <View style={styles.bottomLinks}>

            <Pressable
              onPress={() =>
                router.push(
                  '/privacy-policy' as any
                )
              }
            >
              <Text
                style={styles.bottomLink}
              >
                Privacy Policy
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push(
                  '/terms-conditions' as any
                )
              }
            >
              <Text
                style={styles.bottomLink}
              >
                Terms & Conditions
              </Text>
            </Pressable>

          </View>

        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#173B1A',
  },

  footerMain: {
    paddingVertical: 30,
    paddingHorizontal: 16,
  },

  footerContainer: {
    width: '100%',
  },

  column: {
    marginBottom: 28,
  },

  categoryColumn: {
    marginBottom: 0,
  },

  logo: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
  },

  aboutText: {
    fontSize: 13,
    lineHeight: 21,
    color: '#D9E5DA',
    marginBottom: 18,
  },

  contactContainer: {
    gap: 10,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactText: {
    marginLeft: 9,
    fontSize: 13,
    color: '#FFFFFF',
  },

  heading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  link: {
    fontSize: 13,
    lineHeight: 21,
    color: '#D9E5DA',
    marginBottom: 8,
  },

  categoryLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#D9E5DA',
  },

  emptyText: {
    fontSize: 12,
    color: '#D9E5DA',
  },

  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#315B35',
    backgroundColor: '#102B13',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },

  footerBottomContainer: {
    alignItems: 'center',
  },

  copyright: {
    fontSize: 12,
    lineHeight: 18,
    color: '#C7D5C9',
    textAlign: 'center',
    marginBottom: 10,
  },

  bottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  bottomLink: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});