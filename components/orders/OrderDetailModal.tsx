import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Order {
  id: string;
  customer_name: string;
  table_number: string;
  total_amount: number;
  subtotal?: number;
  service_charge?: number;
  gst?: number;
  order_time: string;
  status: string;
  member_id?: string;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    menu_items: {
      name: string;
    };
  }>;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
  membership_tier: string;
}

interface OrderDetailModalProps {
  visible: boolean;
  order: Order;
  onClose: () => void;
}

export default function OrderDetailModal({ visible, order, onClose }: OrderDetailModalProps) {
  const [showMemberInput, setShowMemberInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNonMemberOptions, setShowNonMemberOptions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculatePointsEarned = () => {
    return Math.floor(order.total_amount);
  };

  const handleMemberLookup = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('phone', phoneNumber.trim())
        .single();

      if (error || !data) {
        Alert.alert('Member Not Found', 'No member found with this phone number.');
        setIsProcessing(false);
        return;
      }

      setMember(data);
      setShowMemberInput(false);
    } catch (error) {
      console.error('Error looking up member:', error);
      Alert.alert('Error', 'Failed to look up member');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteMemberOrder = async () => {
    if (!member) return;

    setIsProcessing(true);

    try {
      const pointsEarned = calculatePointsEarned();
      const newTotalPoints = member.points + pointsEarned;

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          member_id: member.id,
          status: 'completed',
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      const { error: memberError } = await supabase
        .from('members')
        .update({
          points: newTotalPoints,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id);

      if (memberError) throw memberError;

      Alert.alert(
        'Order Completed!',
        `${pointsEarned} points added to ${member.name}'s account!\nNew balance: ${newTotalPoints} points`,
        [{ text: 'OK', onPress: () => onClose() }]
      );
    } catch (error: any) {
      console.error('Error completing order:', error);
      Alert.alert('Error', error.message || 'Failed to complete order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteNonMemberOrder = async () => {
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);

      if (error) throw error;

      Alert.alert('Order Completed!', 'Order marked as complete', [
        { text: 'OK', onPress: () => onClose() },
      ]);
    } catch (error: any) {
      console.error('Error completing order:', error);
      Alert.alert('Error', error.message || 'Failed to complete order');
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{order.customer_name}</Text>
                <Text style={styles.cardSubtitle}>Table {order.table_number}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{formatTime(order.order_time)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.order_items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemLeft}>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{item.quantity}x</Text>
                  </View>
                  <Text style={styles.itemName}>{item.menu_items.name}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.breakdownContainer}>
              {order.subtotal !== undefined && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Subtotal:</Text>
                  <Text style={styles.breakdownValue}>${order.subtotal.toFixed(2)}</Text>
                </View>
              )}
              {order.service_charge !== undefined && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Service Charge:</Text>
                  <Text style={styles.breakdownValue}>${order.service_charge.toFixed(2)}</Text>
                </View>
              )}
              {order.gst !== undefined && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>GST:</Text>
                  <Text style={styles.breakdownValue}>${order.gst.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>${order.total_amount.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {member && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Member Information</Text>
              <View style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Ionicons name="person-circle" size={50} color="#007AFF" />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                    <View style={styles.tierBadge}>
                      <Text style={styles.tierText}>{member.membership_tier.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.pointsContainer}>
                  <View style={styles.pointsRow}>
                    <Text style={styles.pointsLabel}>Current Points:</Text>
                    <Text style={styles.pointsValue}>{member.points}</Text>
                  </View>
                  <View style={styles.pointsRow}>
                    <Text style={styles.pointsLabel}>Points Earned:</Text>
                    <Text style={styles.pointsEarned}>+{calculatePointsEarned()}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.pointsRow}>
                    <Text style={styles.pointsTotalLabel}>New Balance:</Text>
                    <Text style={styles.pointsTotalValue}>
                      {member.points + calculatePointsEarned()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {!member && !showMemberInput && !showNonMemberOptions && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.memberButton]}
                onPress={() => setShowMemberInput(true)}
              >
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Member</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.nonMemberButton]}
                onPress={() => setShowNonMemberOptions(true)}
              >
                <Ionicons name="person-outline" size={20} color="#007AFF" />
                <Text style={[styles.actionButtonText, styles.nonMemberButtonText]}>
                  Non-Member
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showMemberInput && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Enter Member Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoFocus
              />
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setShowMemberInput(false);
                    setPhoneNumber('');
                  }}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={handleMemberLookup}
                  disabled={isProcessing}
                >
                  <Text style={styles.actionButtonText}>
                    {isProcessing ? 'Looking up...' : 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {showNonMemberOptions && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Customer is not a member</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => setShowNonMemberOptions(false)}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.signupButton]}
                  onPress={() => Alert.alert('Sign Up', 'Sign up flow coming soon!')}
                >
                  <Text style={styles.actionButtonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.skipButton]}
                  onPress={handleCompleteNonMemberOrder}
                  disabled={isProcessing}
                >
                  <Text style={styles.actionButtonText}>
                    {isProcessing ? 'Processing...' : 'Skip'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {member && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteMemberOrder}
              disabled={isProcessing}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.completeButtonText}>
                {isProcessing ? 'Processing...' : 'Complete Order & Add Points'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { flex: 1 },
  card: { backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#000' },
  cardSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  statusBadge: { backgroundColor: '#34C759', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#666' },
  section: { margin: 16, marginTop: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#000' },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  quantityBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, minWidth: 40, alignItems: 'center' },
  quantityText: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
  itemName: { fontSize: 16, color: '#000', flex: 1 },
  itemPrice: { fontSize: 16, fontWeight: '600', color: '#000' },
  breakdownContainer: { backgroundColor: '#f8f8f8', padding: 16, borderRadius: 8 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  breakdownLabel: { fontSize: 14, color: '#666' },
  breakdownValue: { fontSize: 14, color: '#666', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#000' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#007AFF' },
  memberCard: { backgroundColor: '#f8f8f8', padding: 16, borderRadius: 12 },
  memberHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 18, fontWeight: '700', color: '#000' },
  memberPhone: { fontSize: 14, color: '#666', marginTop: 4 },
  tierBadge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
  tierText: { fontSize: 12, fontWeight: '700', color: '#000' },
  pointsContainer: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  pointsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  pointsLabel: { fontSize: 14, color: '#666' },
  pointsValue: { fontSize: 16, fontWeight: '600', color: '#000' },
  pointsEarned: { fontSize: 16, fontWeight: '700', color: '#34C759' },
  pointsTotalLabel: { fontSize: 16, fontWeight: '700', color: '#000' },
  pointsTotalValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  memberButton: { backgroundColor: '#007AFF' },
  nonMemberButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#007AFF' },
  nonMemberButtonText: { color: '#007AFF' },
  inputContainer: { gap: 12 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#000' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  cancelButton: { backgroundColor: '#8E8E93' },
  cancelButtonText: { color: '#fff' },
  confirmButton: { backgroundColor: '#007AFF' },
  signupButton: { backgroundColor: '#FF9500' },
  skipButton: { backgroundColor: '#34C759' },
  completeButton: { flexDirection: 'row', backgroundColor: '#34C759', padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8 },
  completeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
