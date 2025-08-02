const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedUsers() {
  const users = [
    {
      username: 'admin',
      password: 'password',
      role: 'admin',
    },
    {
      username: 'operator',
      password: 'password',
      role: 'operator',
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ ...user, password: hashedPassword }]);

    if (error) {
      console.error('Error seeding user:', error);
    } else {
      console.log('User seeded:', data);
    }
  }
}

seedUsers();
