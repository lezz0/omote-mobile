// import { supabase } from '@/lib/supabase'
// import { useState } from 'react'
// import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

// export default function AddMemberScreen() {
//   const [name, setName] = useState('')
//   const [phone, setPhone] = useState('')
//   const [tier, setTier] = useState<'basic' | 'premium' | 'vip'>('basic')
//   const [loading, setLoading] = useState(false)

//   async function handleAddMember() {
//     if (!name || !phone) {
//       Alert.alert('Error', 'Please fill in all fields')
//       return
//     }

//     setLoading(true)
//     try {
//       const { error } = await supabase
//         .from('members')
//         .insert([
//           {
//             name,
//             phone,
//             membership_tier: tier,
//             membership_status: 'active',
//             points: 0,
//           },
//         ])

//       if (error) throw error

//       Alert.alert('Success', 'Member added successfully!')
//       setName('')
//       setPhone('')
//       setTier('basic')
//   //   } catch (error) {
//   //     Alert.alert('Error', 'Failed to add member')
//   //     console.error(error)
//   //   } finally {
//   //     setLoading(false)
//   //   }
//   // }
//       } catch (error: any) {
//       console.error(error)
//       Alert.alert('Error', error.message ?? 'Failed to add member')
//     } finally {
//       setLoading(false)
//     }


//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Add New Member</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Name"
//         value={name}
//         onChangeText={setName}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Phone number"
//         value={phone}
//         onChangeText={setPhone}
//         keyboardType="phone-pad"
//       />

//       <Text style={styles.label}>Membership Tier</Text>
//       <View style={styles.tierButtons}>
//         {['basic', 'premium', 'vip'].map((t) => (
//           <TouchableOpacity
//             key={t}
//             style={[
//               styles.tierButton,
//               tier === t && styles.tierButtonActive,
//             ]}
//             onPress={() => setTier(t as 'basic' | 'premium' | 'vip')}
//           >
//             <Text
//               style={[
//                 styles.tierButtonText,
//                 tier === t && styles.tierButtonTextActive,
//               ]}
//             >
//               {t.toUpperCase()}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleAddMember}
//         disabled={loading}
//       >
//         <Text style={styles.submitButtonText}>
//           {loading ? 'Adding...' : 'Add Member'}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 30,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     fontSize: 16,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   tierButtons: {
//     flexDirection: 'row',
//     gap: 10,
//     marginBottom: 30,
//   },
//   tierButton: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     alignItems: 'center',
//   },
//   tierButtonActive: {
//     backgroundColor: '#007AFF',
//     borderColor: '#007AFF',
//   },
//   tierButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#666',
//   },
//   tierButtonTextActive: {
//     color: '#fff',
//   },
//   submitButton: {
//     backgroundColor: '#007AFF',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// })


import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function AddMemberScreen() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [tier, setTier] = useState<'basic' | 'premium' | 'vip'>('basic')
  const [loading, setLoading] = useState(false)

  async function handleAddMember() {
    if (!name || !phone) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('members')
        .insert([
          {
            name,
            phone,
            membership_tier: tier,
            membership_status: 'active',
            points: 0,
          },
        ])

      if (error) throw error

      Alert.alert('Success', 'Member added successfully!')
      setName('')
      setPhone('')
      setTier('basic')
    } catch (error: any) {
      console.error(error)
      Alert.alert('Error', error?.message ?? 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Member</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Membership Tier</Text>
      <View style={styles.tierButtons}>
        {['basic', 'premium', 'vip'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tierButton,
              tier === t && styles.tierButtonActive,
            ]}
            onPress={() => setTier(t as 'basic' | 'premium' | 'vip')}
          >
            <Text
              style={[
                styles.tierButtonText,
                tier === t && styles.tierButtonTextActive,
              ]}
            >
              {t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleAddMember}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Adding...' : 'Add Member'}
        </Text>
      </TouchableOpacity>
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
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tierButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  tierButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  tierButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tierButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tierButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})