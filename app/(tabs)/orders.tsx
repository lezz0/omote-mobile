// 

import CreateOrder from '@/components/orders/CreateOrder';
import ViewOrders from '@/components/orders/ViewOrders';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrdersTab() {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'view'>('create');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Sub-tabs */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {/* Sub-tab Navigation */}
      <View style={styles.subTabBar}>
        <TouchableOpacity 
          onPress={() => setActiveSubTab('create')}
          style={[
            styles.subTab, 
            activeSubTab === 'create' && styles.activeSubTab
          ]}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={activeSubTab === 'create' ? '#007AFF' : '#666'} 
          />
          <Text style={[
            styles.subTabText,
            activeSubTab === 'create' && styles.activeSubTabText
          ]}>
            Create Order
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setActiveSubTab('view')}
          style={[
            styles.subTab, 
            activeSubTab === 'view' && styles.activeSubTab
          ]}
        >
          <Ionicons 
            name="list-outline" 
            size={20} 
            color={activeSubTab === 'view' ? '#007AFF' : '#666'} 
          />
          <Text style={[
            styles.subTabText,
            activeSubTab === 'view' && styles.activeSubTabText
          ]}>
            View Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {activeSubTab === 'create' ? <CreateOrder /> : <ViewOrders />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeSubTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  subTabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeSubTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
