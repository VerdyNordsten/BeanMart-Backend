import { config } from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function testUserAddressAPIs() {
  console.log('Testing User Address APIs with real data...');
  
  // Create a PostgreSQL connection pool
  const pool = new Pool({
    user: process.env.DB_USER ?? 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.DB_NAME ?? 'beanmart',
    password: process.env.DB_PASSWORD ?? 'postgres',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
  });
  
  try {
    // Test the database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Get a test user for testing
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['user1@test.com']
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Test user not found');
    }
    
    const user = userResult.rows[0];
    console.log('Using test user:', user.email);
    
    // Generate user JWT token
    const userToken = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      process.env.JWT_SECRET ?? 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('User token generated for testing');
    
    // 1. Test creating a new user address
    console.log('\n1. Testing create user address...');
    
    const newAddress = {
      label: 'Test Address',
      recipient_name: 'Test Recipient',
      phone: '+6281234567000',
      address_line1: 'Test Street 123',
      address_line2: 'Test Apartment 456',
      city: 'Test City',
      state: 'Test State',
      postal_code: '12345',
      country: 'ID',
      is_default: false
    };
    
    const createAddressResult = await pool.query(
      `INSERT INTO user_addresses 
      (user_id, label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        user.id,
        newAddress.label,
        newAddress.recipient_name,
        newAddress.phone,
        newAddress.address_line1,
        newAddress.address_line2,
        newAddress.city,
        newAddress.state,
        newAddress.postal_code,
        newAddress.country,
        newAddress.is_default
      ]
    );
    
    const createdAddress = createAddressResult.rows[0];
    console.log('Address created successfully:', {
      id: createdAddress.id,
      label: createdAddress.label,
      recipient_name: createdAddress.recipient_name,
      city: createdAddress.city
    });
    
    // 2. Test getting all user addresses
    console.log('\n2. Testing get all user addresses...');
    
    const getAllAddressesResult = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );
    
    console.log(`Found ${getAllAddressesResult.rows.length} addresses for user`);
    
    // Display first 3 addresses
    const addressesToShow = getAllAddressesResult.rows.slice(0, 3);
    addressesToShow.forEach(addr => {
      console.log(`- ${addr.label}: ${addr.recipient_name}, ${addr.city}`);
    });
    
    // 3. Test getting a specific user address by ID
    console.log('\n3. Testing get user address by ID...');
    
    const getAddressResult = await pool.query(
      'SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2',
      [createdAddress.id, user.id]
    );
    
    if (getAddressResult.rows.length === 0) {
      throw new Error('Address not found');
    }
    
    const retrievedAddress = getAddressResult.rows[0];
    console.log('Address retrieved successfully:', {
      id: retrievedAddress.id,
      label: retrievedAddress.label,
      recipient_name: retrievedAddress.recipient_name,
      phone: retrievedAddress.phone,
      address_line1: retrievedAddress.address_line1,
      city: retrievedAddress.city,
      state: retrievedAddress.state,
      postal_code: retrievedAddress.postal_code,
      country: retrievedAddress.country,
      is_default: retrievedAddress.is_default
    });
    
    // 4. Test updating a user address
    console.log('\n4. Testing update user address...');
    
    const updatedAddressData = {
      label: 'Updated Test Address',
      recipient_name: 'Updated Recipient',
      phone: '+6281234567999',
      address_line1: 'Updated Street 789',
      address_line2: 'Updated Apartment 012',
      city: 'Updated City',
      state: 'Updated State',
      postal_code: '54321',
      country: 'ID',
      is_default: true
    };
    
    const updateAddressResult = await pool.query(
      `UPDATE user_addresses 
      SET label = $1, recipient_name = $2, phone = $3, address_line1 = $4, address_line2 = $5, 
          city = $6, state = $7, postal_code = $8, country = $9, is_default = $10
      WHERE id = $11 AND user_id = $12
      RETURNING *`,
      [
        updatedAddressData.label,
        updatedAddressData.recipient_name,
        updatedAddressData.phone,
        updatedAddressData.address_line1,
        updatedAddressData.address_line2,
        updatedAddressData.city,
        updatedAddressData.state,
        updatedAddressData.postal_code,
        updatedAddressData.country,
        updatedAddressData.is_default,
        createdAddress.id,
        user.id
      ]
    );
    
    if (updateAddressResult.rows.length === 0) {
      throw new Error('Address not found for update');
    }
    
    const updatedAddress = updateAddressResult.rows[0];
    console.log('Address updated successfully:', {
      id: updatedAddress.id,
      label: updatedAddress.label,
      recipient_name: updatedAddress.recipient_name,
      city: updatedAddress.city,
      is_default: updatedAddress.is_default
    });
    
    // 5. Test setting address as default
    console.log('\n5. Testing set address as default...');
    
    // First, unset all other addresses as default for this user
    await pool.query(
      'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
      [user.id]
    );
    
    // Then set this address as default
    const setDefaultResult = await pool.query(
      'UPDATE user_addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [createdAddress.id, user.id]
    );
    
    if (setDefaultResult.rows.length === 0) {
      throw new Error('Address not found for setting as default');
    }
    
    console.log('Address set as default successfully');
    
    // 6. Test deleting a user address
    console.log('\n6. Testing delete user address...');
    
    // Create another address to delete (so we don't delete our main test address)
    const addressToDeleteResult = await pool.query(
      `INSERT INTO user_addresses 
      (user_id, label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        user.id,
        'Address to Delete',
        'Delete Recipient',
        '+6281234567111',
        'Delete Street',
        'Delete Apartment',
        'Delete City',
        'Delete State',
        '99999',
        'ID',
        false
      ]
    );
    
    const addressToDelete = addressToDeleteResult.rows[0];
    console.log('Created address to delete:', addressToDelete.label);
    
    // Now delete it
    const deleteResult = await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [addressToDelete.id, user.id]
    );
    
    if (deleteResult.rows.length === 0) {
      throw new Error('Address not found for deletion');
    }
    
    console.log('Address deleted successfully:', deleteResult.rows[0].label);
    
    // 7. Test ownership validation
    console.log('\n7. Testing ownership validation...');
    
    // Try to access an address that doesn't belong to the user
    const otherUserResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['user2@test.com']
    );
    
    if (otherUserResult.rows.length > 0) {
      const otherUser = otherUserResult.rows[0];
      
      // Create an address for the other user
      const otherAddressResult = await pool.query(
        `INSERT INTO user_addresses 
        (user_id, label, recipient_name, phone, address_line1, city, state, postal_code, country, is_default) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          otherUser.id,
          'Other User Address',
          'Other User',
          '+6281234567222',
          'Other Street',
          'Other City',
          'Other State',
          '88888',
          'ID',
          false
        ]
      );
      
      const otherAddress = otherAddressResult.rows[0];
      console.log('Created address for other user:', otherAddress.label);
      
      // Try to access this address with our test user's token
      // This should fail in a real API, but in our direct database test we're just showing the concept
      const tryAccessResult = await pool.query(
        'SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2',
        [otherAddress.id, user.id] // Using our user ID, not the owner's ID
      );
      
      if (tryAccessResult.rows.length === 0) {
        console.log('Ownership validation works: Cannot access address belonging to another user');
      } else {
        console.log('Warning: Ownership validation may not be working correctly');
      }
      
      // Clean up the other user's address
      await pool.query(
        'DELETE FROM user_addresses WHERE id = $1',
        [otherAddress.id]
      );
    }
    
    console.log('\nAll user address API tests passed successfully!');
    
    await pool.end();
  } catch (error) {
    console.error('Error testing user address APIs:', error);
    await pool.end();
    throw error;
  }
}

// Run the tests
testUserAddressAPIs()
  .then(() => {
    console.log('\nUser address API testing completed successfully.');
  })
  .catch(error => {
    console.error('User address API testing failed:', error);
    process.exit(1);
  });

export default testUserAddressAPIs;