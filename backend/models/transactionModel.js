const pool = require("../db");

class Transaction {

  // Create a new transaction
  static async createTransaction(transaction) {
    try {

    const sql = `
      INSERT INTO transactions (
        payment_method,
        transaction_date,
        transaction_status,
        transaction_amount,
        sender_id,
        campaign_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      transaction.payment_method,
      transaction.transaction_date,
      transaction.transaction_status,
      transaction.transaction_amount,
      transaction.sender_id,
      transaction.campaign_id
    ];

      const [result] = await pool.execute(sql, values);

      return result;

    }
    catch(error){

        throw error;
        
    }
  }

  // Read a transaction by ID
  static async getTransactionById(transaction_id) {
    const sql = `SELECT * FROM transactions WHERE transaction_id = ?`;
    try {
      const [rows] = await pool.execute(sql, [parseInt(transaction_id)]);
      return rows[0];
    } catch (error) {
      throw new Error('Fetching transaction failed: ' + error.message);
    }
  }

  // Update a transaction
  static async updateTransaction(transaction_id, transaction) {
    try{
    const sql = `
      UPDATE transactions SET
        payment_method = ?,
        transaction_date = ?,
        transaction_status = ?,
        transaction_amount = ?,
        sender_id = ?,
        campaign_id = ?
      WHERE transaction_id = ?
    `;

    const values = [
      transaction.payment_method,
      transaction.transaction_date,
      transaction.transaction_status,
      transaction.transaction_amount,
      transaction.sender_id,
      transaction.campaign_id,
      transaction_id
    ];

  
      const [result] = await pool.execute(sql, values);
      return result;
    
    }

      catch(error){

        throw new Error('Updating transaction failed: ' + error.message);

    }
  }

  // Delete a transaction
  static async deleteTransaction(transaction_id) {
    try {
    
    const sql = `DELETE FROM transactions WHERE transaction_id = ?`;

 
      const [result] = await pool.execute(sql, [transaction_id]);
      return result;
    } catch (error) {

      throw new Error('Deleting transaction failed: ' + error.message);
    
    }
  }

  // Get all transactions for a specific user
  static async getTransactionsByUserId(user_id) {
    try {
    const sql = `SELECT * FROM transactions WHERE sender_id = ?`;
      const [rows] = await pool.execute(sql, [user_id]);
      return rows;
    } catch (error) {
      throw new Error('Fetching transactions for user failed: ' + error.message);
    }
  }

  // Get all transactions for a specific campaign
  static async getTransactionsByCampaignId(campaign_id) {
    try {
    const sql = `SELECT * FROM transactions WHERE campaign_id = ?`;
      const [rows] = await pool.execute(sql, [parseInt(campaign_id,10)]);
      return rows;
    } catch (error) {
      throw new Error('Fetching transactions for campaign failed: ' + error.message);
    }
  }

  static async getAllTransactions() {
    try {
    const sql = `SELECT * FROM transactions`;
      const [rows] = await pool.execute(sql);
      return rows;
    } catch (error) {
      throw new Error('Fetching transactions all failed: ' + error.message);
    }
  }
}

module.exports = Transaction;
