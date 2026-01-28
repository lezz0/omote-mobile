import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  base_price: number;
}

interface MenuItemPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectItems: (items: Array<{ item: MenuItem; quantity: number }>) => void;
}

interface SelectedItemWithQuantity {
  item: MenuItem;
  quantity: number;
}

export default function MenuItemPicker({ visible, onClose, onSelectItems }: MenuItemPickerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItemWithQuantity>>(new Map());

  useEffect(() => {
    if (visible) {
      fetchMenuItems();
      setSelectedItems(new Map()); // Reset selections when modal opens
    }
  }, [visible]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (item: MenuItem) => {
    const newSelected = new Map(selectedItems);
    
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.set(item.id, { item, quantity: 1 });
    }
    
    setSelectedItems(newSelected);
  };

  const handleUpdateQuantity = (itemId: string, change: number) => {
    const newSelected = new Map(selectedItems);
    const current = newSelected.get(itemId);
    
    if (current) {
      const newQuantity = Math.max(1, current.quantity + change);
      newSelected.set(itemId, { ...current, quantity: newQuantity });
      setSelectedItems(newSelected);
    }
  };

  const handleAddAllItems = () => {
    if (selectedItems.size === 0) {
      Alert.alert('Error', 'Please select at least one item');
      return;
    }

    // Convert Map to array and pass all items at once
    const itemsArray = Array.from(selectedItems.values()).map(selectedItem => ({
      item: selectedItem.item,
      quantity: selectedItem.quantity
    }));

    onSelectItems(itemsArray);
    
    // Reset and close
    setSelectedItems(new Map());
    onClose();
  };

  const handleClose = () => {
    setSelectedItems(new Map());
    onClose();
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const renderMenuItem = (item: MenuItem) => {
    const selectedItem = selectedItems.get(item.id);
    const isSelected = !!selectedItem;

    return (
      <View key={item.id} style={styles.menuItemWrapper}>
        <TouchableOpacity
          style={[styles.menuItem, isSelected && styles.menuItemSelected]}
          onPress={() => handleToggleItem(item)}
        >
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.base_price.toFixed(2)}</Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, -1)}
            >
              <Ionicons name="remove-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{selectedItem.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.id, 1)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const selectedCount = selectedItems.size;
  const totalItems = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.quantity, 
    0
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Menu Items</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Selection Summary */}
        {selectedCount > 0 && (
          <View style={styles.summaryBar}>
            <Text style={styles.summaryText}>
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected ({totalItems} total)
            </Text>
          </View>
        )}

        {/* Menu Items List */}
        <FlatList
          data={Object.keys(groupedItems)}
          keyExtractor={(category) => category}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item: category }) => (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {groupedItems[category].map(renderMenuItem)}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Loading menu items...' : 'No menu items available'}
              </Text>
            </View>
          }
        />

        {/* Footer with Add Button */}
        {selectedCount > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddAllItems}>
              <Text style={styles.addButtonText}>
                Add {totalItems} item{totalItems !== 1 ? 's' : ''} to Order
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  summaryBar: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  menuItemWrapper: {
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  menuItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    gap: 16,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
