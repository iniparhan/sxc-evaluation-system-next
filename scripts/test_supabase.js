import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'  // 👈 INI WAJIB

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl) // debug sementara

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .limit(1)

  console.log('DATA:', data)
  console.log('ERROR:', error)
}

testConnection()