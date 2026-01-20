const Model = require('../models');
const bcrypt = require('bcryptjs');

class UserRepository extends Model {
  constructor() {
    super('users');
  }

  async create(userData) {
    const hashedPassword = await bcrypt.hash(
      userData.password, 
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );
    
    const user = {
      email: userData.email,
      password: hashedPassword,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role || 'EMPLOYEE',
      is_active: userData.isActive !== undefined ? userData.isActive : true,
      created_at: new Date().toISOString()
    };

    return super.create(user);
  }

  async findByEmail(email) {
    return this.findOne({ email });
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(
      newPassword, 
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );
    
    return this.update(id, { password: hashedPassword });
  }

  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUsersWithStats() {
    const sql = `
      SELECT 
        u.*,
        (SELECT COUNT(*) FROM reservations WHERE user_id = u.id) as total_reservations,
        (SELECT COUNT(*) FROM reservations WHERE user_id = u.id AND status = 'active') as active_reservations
      FROM users u
      ORDER BY u.created_at DESC
    `;
    
    return await this.db.all(sql);
  }
}

module.exports = new UserRepository();