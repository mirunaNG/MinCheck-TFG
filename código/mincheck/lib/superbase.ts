import { createClient } from '@supabase/supabase-js'

const supabaseUrl='https://ftokchuthdyzjjuectuk.supabase.co'
const supabaseKey='sb_publishable_LOIsdlfVm5U_Vo3nxU7tMw_S_u4Cu_H'

export const supabase = createClient(supabaseUrl, supabaseKey)