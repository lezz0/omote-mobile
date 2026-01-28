import { supabase } from '@/lib/supabase'
import { Member } from '@/types/supabase'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'

export default function HomeScreen() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch members whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMembers()
    }, [])
  )

  async function fetchMembers() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fixed filtering with null checks
  const filteredMembers = members.filter(member => {
    const name = member.name?.toLowerCase() || ''
    const phone = member.phone?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    
    return name.includes(query) || phone.includes(query)
  })

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Omote Membership</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search members..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <Text>Loading members...</Text>
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <Text style={styles.memberName}>{item.name || 'No Name'}</Text>
              <Text style={styles.memberEmail}>{item.phone || 'No Phone'}</Text>
              <View style={styles.memberDetails}>
                <Text style={styles.memberTier}>
                  {item.membership_tier?.toUpperCase() || 'BASIC'}
                </Text>
                <Text style={styles.memberPoints}>{item.points || 0} pts</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  memberCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  memberDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberTier: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  memberPoints: {
    fontSize: 12,
    color: '#666',
  },
})
