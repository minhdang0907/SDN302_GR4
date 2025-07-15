const mongoose = require('mongoose');
const User = require('./models/user'); // Đường dẫn chính xác đến model

async function debugLogin() {
  try {
    // COPY CHÍNH XÁC connection string từ server.js của bạn
    await mongoose.connect('mongodb://127.0.0.1:27017/ProjectGr4'); // Thay tên DB
    
    console.log('🔗 Connected to:', mongoose.connection.db.databaseName);
    
    const email = 'admin@gmail.com';
    console.log(`🔍 Searching for: ${email}`);
    
    // Test chính xác như controller
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Không tìm thấy user - GIỐNG CONTROLLER');
      
      // Kiểm tra tất cả users
      const allUsers = await User.find({});
      console.log(`📊 Total users: ${allUsers.length}`);
      
      if (allUsers.length > 0) {
        console.log('📋 All users in DB:');
        allUsers.forEach(u => {
          console.log(`   - Email: "${u.email}" | Name: ${u.full_name}`);
          console.log(`     Email length: ${u.email.length} chars`);
          console.log(`     Email === test: ${u.email === email}`);
        });
      }
      
    } else {
      console.log('✅ Tìm thấy user - CONTROLLER SHOULD WORK');
      console.log(`   Name: ${user.full_name}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

debugLogin();
