import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface OrderCardProps {
  order: {
    id: string;
    customer_name: string;
    table_number: string;
    total_amount: number;
    order_time: string;
  };
  onPress: () => void;
  formatTime: (dateString: string) => string;
}

export default function OrderCard({ order, onPress, formatTime }: OrderCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customer_name}</Text>
          <View style={styles.tableInfo}>
            <Ionicons name="restaurant-outline" size={16} color="#666" />
            <Text style={styles.tableNumber}>Table {order.table_number}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.time}>{formatTime(order.order_time)}</Text>
        </View>
        <Text style={styles.total}>${order.total_amount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableNumber: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
