import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MenuItemPicker from './MenuItemPicker';

interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

interface OrderFormModalProps {
  visible: boolean;
  onClose: () => void;
}

// Singapore standard rates
const SERVICE_CHARGE_RATE = 0.10; // 10%
const GST_RATE = 0.09; // 9%

export default function OrderFormModal({ visible, onClose }: OrderFormModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showMenuPicker, setShowMenuPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateServiceCharge = () => {
    return calculateSubtotal() * SERVICE_CHARGE_RATE;
  };

  const calculateGST = () => {
    const subtotalWithService = calculateSubtotal() + calculateServiceCharge();
    return subtotalWithService * GST_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceCharge() + calculateGST();
  };

  const handleAddItems = (items: Array<{ item: any; quantity: number }>) => {
    const newItems = items.map(({ item, quantity }) => ({
      menu_item_id: item.id,
      name: item.name,
      quantity: quantity,
      unit_price: item.base_price
    }));
    
    setOrderItems([...orderItems, ...newItems]);
    setShowMenuPicker(false);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }
    if (!tableNumber.trim()) {
      Alert.alert('Error', 'Please enter table number');
      return;
    }
    if (orderItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    setIsSubmitting(true);

    try {
      const subtotal = calculateSubtotal();
      const serviceCharge = calculateServiceCharge();
      const gst = calculateGST();
      const total = calculateTotal();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerName,
          table_number: tableNumber,
          subtotal: subtotal,
          service_charge: serviceCharge,
          gst: gst,
          total_amount: total,
          order_time: new Date().toISOString(),
          status: 'active',
          outlet: 'Main'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const items = orderItems.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items);

      if (itemsError) throw itemsError;

      Alert.alert('Success', 'Order sent to kitchen!');
      setCustomerName('');
      setTableNumber('');
      setOrderItems([]);
      onClose();

    } catch (error: any) {
      console.error('Error creating order:', error);
      Alert.alert('Error', error.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Order</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Customer Name"
              value={customerName}
              onChangeText={setCustomerName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Table Number"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="default"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowMenuPicker(true)}
              >
                <Ionicons name="add-circle" size={24} color="#007AFF" />
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>

            {orderItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} x ${item.unit_price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemTotal}>
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                    <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {orderItems.length === 0 && (
              <Text style={styles.emptyText}>No items added yet</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {/* Breakdown */}
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Subtotal:</Text>
              <Text style={styles.breakdownValue}>${calculateSubtotal().toFixed(2)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Service Charge (10%):</Text>
              <Text style={styles.breakdownValue}>${calculateServiceCharge().toFixed(2)}</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>GST (9%):</Text>
              <Text style={styles.breakdownValue}>${calculateGST().toFixed(2)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.doneButton, isSubmitting && styles.doneButtonDisabled]}
            onPress={handleSubmitOrder}
            disabled={isSubmitting}
          >
            <Text style={styles.doneButtonText}>
              {isSubmitting ? 'Submitting...' : 'Send to Kitchen'}
            </Text>
          </TouchableOpacity>
        </View>

        <MenuItemPicker
          visible={showMenuPicker}
          onClose={() => setShowMenuPicker(false)}
          onSelectItems={handleAddItems}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  breakdownContainer: {
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    backgroundColor: '#ccc',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
