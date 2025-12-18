import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';
import { useCart } from '@/contexts/cart-context';
import { api, type Product, type Review, type Category } from '@/lib/api';

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { setIsVisible } = useTabBar();
  const { addToCart, cartCount } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';

  // Hide tab bar when component mounts
  useEffect(() => {
    setIsVisible(false);
    return () => {
      setIsVisible(true);
    };
  }, [setIsVisible]);

  // Fetch product and category
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProduct(id);
        setProduct(data);
        
        // Fetch category name
        if (data.categoryId) {
          try {
            const categories = await api.getCategories();
            const category = categories.find(c => c.id === data.categoryId);
            if (category) {
              setCategoryName(category.categoryName);
            }
          } catch (err) {
            console.error('Error fetching category:', err);
          }
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setLoadingReviews(true);
        const reviewsData = await api.getReviews(id);
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  const handleChatSeller = async () => {
    if (!product || isStartingChat) return;
    
    try {
      setIsStartingChat(true);
      const token = await api.getToken();
      
      if (!token) {
        Alert.alert('Login Required', 'Please log in to chat with the seller.');
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: product.shopId,
          productId: product.id,
        }),
      });

      if (response.ok) {
        router.push('/(tabs)/messages');
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.message || 'Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product?.isAvailable || isBuying) return;
    
    try {
      setIsBuying(true);
      const token = await api.getToken();
      
      if (!token) {
        Alert.alert('Login Required', 'Please log in to purchase.');
        router.push('/login');
        return;
      }

      const success = await addToCart(product.id, quantity);
      if (success) {
        router.push('/(tabs)/checkout');
      } else {
        Alert.alert('Error', 'Failed to process. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to buy now:', err);
      Alert.alert('Error', err.message || 'Failed to process. Please try again.');
    } finally {
      setIsBuying(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product?.isAvailable || isAdding) return;
    
    try {
      setIsAdding(true);
      const token = await api.getToken();
      
      if (!token) {
        Alert.alert('Login Required', 'Please log in to add items to cart.');
        router.push('/login');
        return;
      }

      const success = await addToCart(product.id, quantity);
      if (success) {
        Alert.alert('Success', 'Added to cart!', [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
        ]);
      } else {
        Alert.alert('Error', 'Failed to add to cart. Please try again.');
      }
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      Alert.alert('Error', err.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    setQuantity((prev) => {
      const newQuantity = Math.max(1, Math.min(prev + delta, product.stock));
      return newQuantity;
    });
  };

  const handleQuantityInput = (value: string) => {
    if (!product) return;
    const num = Number(value);
    if (Number.isNaN(num)) return;
    
    if (num < 1) {
      setQuantity(1);
    } else if (num > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(num);
    }
  };

  const images = product?.images || [];
  const currentImage = images[selectedImageIndex]?.image_url?.[0] || null;
  const rating = product?.rating ? Number(product.rating) : 0;
  const isVerifiedSeller = product?.shopStatus === 'approved';
  const isOutOfStock = !product?.isAvailable || (product?.stock ?? 0) <= 0;

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <ThemedText style={styles.loadingText}>Loading product...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <ThemedText style={styles.errorText}>
            {error || 'Product not found'}
          </ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart')}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <ThemedText style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Product Images */}
        <View style={styles.imageSection}>
          {currentImage ? (
            <Image source={{ uri: currentImage }} style={styles.mainImage} contentFit="cover" />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Ionicons name="image-outline" size={64} color="#CBD5E1" />
              <ThemedText style={styles.noImageText}>No image available</ThemedText>
            </View>
          )}
          
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageThumbnails}
              contentContainerStyle={styles.imageThumbnailsContent}
            >
              {images.map((img, index) => {
                const thumbnailUrl = img.image_url?.[0];
                return (
                  <TouchableOpacity
                    key={img.id}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailSelected,
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                    activeOpacity={0.7}
                  >
                    {thumbnailUrl ? (
                      <Image source={{ uri: thumbnailUrl }} style={styles.thumbnailImage} contentFit="cover" />
                    ) : (
                      <View style={styles.thumbnailPlaceholder}>
                        <Ionicons name="image-outline" size={20} color="#CBD5E1" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Category Badge */}
          {categoryName && (
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{categoryName.toUpperCase()}</ThemedText>
            </View>
          )}

          {/* Product Name */}
          <ThemedText type="title" style={styles.productName}>
            {product.productName}
          </ThemedText>

          {/* Rating and Stock */}
          <View style={styles.ratingStockRow}>
            {rating > 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#FBBF24" />
                <ThemedText style={styles.ratingText}>{rating.toFixed(1)}</ThemedText>
                {reviews.length > 0 && (
                  <ThemedText style={styles.reviewCountText}>
                    ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
                  </ThemedText>
                )}
              </View>
            )}
            <View style={styles.stockInfo}>
              <ThemedText style={styles.stockText}>
                <ThemedText style={styles.stockNumber}>{product.stock}</ThemedText> in stock
              </ThemedText>
            </View>
          </View>

          {/* Price Box */}
          <View style={styles.priceBox}>
            <ThemedText style={styles.priceText}>
              P{Number(product.price).toFixed(2)}
            </ThemedText>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <ThemedText style={styles.sectionTitle}>Product Description</ThemedText>
            <ThemedText style={styles.description}>
              {product.description || 'High-quality product from a trusted local vendor. This item is carefully selected to ensure freshness and quality. We work directly with vendors to bring you the best products at competitive prices.'}
            </ThemedText>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <ThemedText style={styles.sectionTitle}>Quantity</ThemedText>
            <View style={styles.quantityRow}>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={20} color={quantity <= 1 ? '#CBD5E1' : '#000'} />
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={String(quantity)}
                  onChangeText={handleQuantityInput}
                  keyboardType="number-pad"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={[styles.quantityButton, quantity >= product.stock && styles.quantityButtonDisabled]}
                  onPress={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color={quantity >= product.stock ? '#CBD5E1' : '#000'} />
                </TouchableOpacity>
              </View>
              <ThemedText style={styles.availableText}>{product.stock} available</ThemedText>
            </View>
          </View>

          {/* Out of Stock Warning */}
          {isOutOfStock && (
            <View style={styles.outOfStockBox}>
              <ThemedText style={styles.outOfStockText}>This product is currently unavailable.</ThemedText>
            </View>
          )}

          {/* Seller Info Card */}
          {product.shopName && (
            <View style={styles.sellerCard}>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerHeader}>
                  <Ionicons name="home-outline" size={18} color="#64748B" />
                  <ThemedText style={styles.sellerName}>{product.shopName}</ThemedText>
                </View>
                <ThemedText style={styles.sellerLocation}>Philippines</ThemedText>
              </View>
              
              <View style={styles.sellerActions}>
                <TouchableOpacity
                  style={styles.visitStoreButton}
                  onPress={() => router.push(`/(tabs)/shop/${product.shopId}`)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.visitStoreText}>Visit Store</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chatSellerButton}
                  onPress={handleChatSeller}
                  disabled={isStartingChat}
                  activeOpacity={0.7}
                >
                  {isStartingChat ? (
                    <ActivityIndicator size="small" color="#64748B" />
                  ) : (
                    <>
                      <Ionicons name="chatbubble-outline" size={16} color="#64748B" />
                      <ThemedText style={styles.chatSellerText}>Chat</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Guarantee Badges */}
          <View style={styles.badgesContainer}>
            {isVerifiedSeller && (
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <ThemedText style={styles.badgeText}>Verified Seller</ThemedText>
              </View>
            )}
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <ThemedText style={styles.badgeText}>Quality Guaranteed</ThemedText>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <ThemedText style={styles.reviewsTitle}>Customer Reviews</ThemedText>
              {reviews.length > 0 && (
                <ThemedText style={styles.reviewsSummary}>
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} • Average rating: {rating.toFixed(1)}
                </ThemedText>
              )}
            </View>

            {loadingReviews ? (
              <View style={styles.reviewsLoading}>
                <ActivityIndicator size="small" color="#10B981" />
                <ThemedText style={styles.reviewsLoadingText}>Loading reviews...</ThemedText>
              </View>
            ) : reviews.length === 0 ? (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="star-outline" size={48} color="#CBD5E1" />
                <ThemedText style={styles.noReviewsText}>
                  No reviews yet. Be the first to review this product!
                </ThemedText>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                  <View key={review.reviewId} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View>
                        <ThemedText style={styles.reviewerName}>{review.buyerName || 'Anonymous'}</ThemedText>
                        {review.buyerEmail && (
                          <ThemedText style={styles.reviewerEmail}>{review.buyerEmail}</ThemedText>
                        )}
                      </View>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={14}
                            color={i < review.rating ? '#FBBF24' : '#E2E8F0'}
                          />
                        ))}
                        <ThemedText style={styles.reviewRatingText}>{review.rating}/5</ThemedText>
                      </View>
                    </View>
                    {review.comment && (
                      <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
                    )}
                    <ThemedText style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </ThemedText>
                  </View>
                ))}

                {reviews.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllReviewsButton}
                    onPress={() => setShowAllReviews(!showAllReviews)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.viewAllReviewsText}>
                      {showAllReviews ? 'Show Less' : `View All Reviews (${reviews.length})`}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {/* Add to Cart Button */}
        <TouchableOpacity
          style={[styles.addToCartButton, isOutOfStock && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          activeOpacity={0.8}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cart" size={20} color="#fff" />
              <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Buy Now Button */}
        <TouchableOpacity
          style={[styles.buyNowButton, isOutOfStock && styles.buttonDisabled]}
          onPress={handleBuyNow}
          disabled={isOutOfStock || isBuying}
          activeOpacity={0.8}
        >
          {isBuying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.buyNowText}>
              {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  imageSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mainImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
  },
  noImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noImageText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  imageThumbnails: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  imageThumbnailsContent: {
    gap: 12,
    justifyContent: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    paddingHorizontal: 20,
    gap: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 36,
  },
  ratingStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  reviewCountText: {
    fontSize: 14,
    color: '#64748B',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 14,
    color: '#64748B',
  },
  stockNumber: {
    fontWeight: '600',
    color: '#0F172A',
  },
  priceBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    padding: 20,
  },
  priceText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#059669',
  },
  descriptionSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#64748B',
  },
  quantitySection: {
    gap: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quantityButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityInput: {
    width: 60,
    height: 44,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  availableText: {
    fontSize: 14,
    color: '#64748B',
  },
  outOfStockBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
  },
  outOfStockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#991B1B',
  },
  sellerCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  sellerInfo: {
    gap: 4,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  sellerLocation: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 26,
  },
  sellerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  visitStoreButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  visitStoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  chatSellerButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  chatSellerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#059669',
  },
  reviewsSection: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 16,
  },
  reviewsHeader: {
    gap: 4,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  reviewsSummary: {
    fontSize: 14,
    color: '#64748B',
  },
  reviewsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  reviewsLoadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  noReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  reviewerEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  viewAllReviewsButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  viewAllReviewsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 14,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 14,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
