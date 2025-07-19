require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Test Supabase connection
const supabase = require('./config/supabase');

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('✓ Supabase connected successfully');
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
}

// Test connection on startup
testConnection();

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
