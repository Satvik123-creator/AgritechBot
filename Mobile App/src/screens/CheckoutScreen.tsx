import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { simulatePayment } from '../utils/dummyRazorpay';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useMarketplaceStore } from '../store/useMarketplaceStore';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api/client';
import { t } from '../constants/localization';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export const CheckoutScreen = () => {
  const navigation = useNavigation<Navigation>();
  const language = useAppStore((state) => state.language);
  const { cart, getCartTotal, clearCart } = useMarketplaceStore();

  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });

  const totalAmount = getCartTotal() + (getCartTotal() * 0.05) + 50; // Total + Tax + Delivery

  const handleCheckout = async () => {
    if (!userDetails.name || !userDetails.phone || !userDetails.address || !userDetails.city || !userDetails.pincode) {
      Alert.alert('Error', t(language, 'fillRequiredFields') || 'Please fill all details');
      return;
    }
    if (!cart.length) {
      Alert.alert('Error', t(language, 'cartEmptySubtitle') || 'Cart is empty');
      return;
    }

    setLoading(true);
    try {
      // 1. Simulate Payment
      const paymentResult = await simulatePayment(totalAmount);
      
      if (paymentResult.status === 'failed') {
        Alert.alert('Payment Failed', paymentResult.message);
        setLoading(false);
        return;
      }

      // 2. Submit Order to Backend
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price || 0,
          quantity: item.quantity
        })),
        totalAmount: totalAmount,
        deliveryAddress: {
          line1: userDetails.address,
          city: userDetails.city,
          state: userDetails.state || 'N/A',
          pincode: userDetails.pincode
        },
        paymentStatus: 'paid',
        paymentId: paymentResult.paymentId
      };

      const { data } = await api.post('/api/v1/orders', orderPayload);
      
      Alert.alert('Success', 'Order placed successfully!');
      clearCart();
      navigation.replace('OrderSuccess', { orderId: data.order._id });
      
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Checkout</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        {cart.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text>{item.product.name} x{item.quantity}</Text>
            <Text>₹{item.product.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total (incl. tax & delivery):</Text>
          <Text style={styles.totalText}>₹{totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.summaryTitle}>Delivery Details</Text>
        <TextInput 
          placeholder="Full Name" 
          style={styles.input}
          value={userDetails.name}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, name: text }))} 
        />
        <TextInput 
          placeholder="Phone Number" 
          keyboardType="phone-pad" 
          style={styles.input}
          value={userDetails.phone}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, phone: text }))} 
        />
        <TextInput 
          placeholder="Address (Line 1)" 
          style={styles.input}
          value={userDetails.address}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, address: text }))} 
        />
        <TextInput 
          placeholder="City" 
          style={styles.input}
          value={userDetails.city}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, city: text }))} 
        />
         <TextInput 
          placeholder="State" 
          style={styles.input}
          value={userDetails.state}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, state: text }))} 
        />
        <TextInput 
          placeholder="Pincode" 
          keyboardType="numeric" 
          style={styles.input}
          value={userDetails.pincode}
          onChangeText={(text) => setUserDetails(prev => ({ ...prev, pincode: text }))} 
        />
      </View>

      <TouchableOpacity 
        style={styles.payBtn} 
        onPress={handleCheckout} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>Pay via Dummy Razorpay</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  summaryCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 20 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  totalText: { fontSize: 16, fontWeight: 'bold' },
  formCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  payBtn: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default CheckoutScreen;
