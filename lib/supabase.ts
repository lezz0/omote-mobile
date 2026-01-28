import { createClient } from '@supabase/supabase-js'
import 'react-native-url-polyfill/auto'

const SUPABASE_URL = 'https://mvbpdajkptzrtwqgwbpa.supabase.co'      // your project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12YnBkYWprcHR6cnR3cWd3YnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDYwNzIsImV4cCI6MjA4NDU4MjA3Mn0.l-sbnU-cByLjnQh64VSe65r0TeBq3_vN5ONMc6Lkg4w' // your anon public key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
