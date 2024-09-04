const Transaction = require('../models/transactionModel');
const { getPostData,decodeToken } = require('../utilis'); // Assuming you have a utility to get POST data

// Create a new transaction
const createTransaction = async (req, res,sender_id,campaign_id) => {
  try {
    const body = await getPostData(req);
    const transaction_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // const now = new Date();

    // const transaction_date = now.toISOString(); // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
    const transaction_status = 'COMPLETE'
    const {
      payment_method,
      transaction_amount,
      sender_id,
      campaign_id
    } = JSON.parse(body);
    console.log(sender_id,campaign_id)
    const result = await Transaction.createTransaction({
      payment_method,
      transaction_date,
      transaction_status,
      transaction_amount,
      sender_id,
      campaign_id
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      message: 'Transaction created successfully',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      transactionId: result.insertId
    }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: 'Transaction creation failed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      error: error.message
    }));
    console.error(error);
  }
};

// Get transaction by ID
const getTransactionById = async (req, res, transactionId) => {
  try {

    const transaction = await Transaction.getTransactionById(transactionId);

    if (transaction) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: true,
        transaction: transaction,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        message: 'Transaction not found',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      }));
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: 'Fetching transaction failed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      error: error.message
    }));
    console.error(error);
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {

    const body = await getPostData(req);
    const transactionData = JSON.parse(body);

    const result = await Transaction.updateTransaction(transactionId, transactionData);

    if (result.affectedRows > 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: true,
        message: 'Transaction updated successfully',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        message: 'Transaction not found',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      }));
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: 'Updating transaction failed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      error: error.message
    }));
    console.error(error);
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;

    const result = await Transaction.deleteTransaction(transactionId);

    if (result.affectedRows > 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: true,
        message: 'Transaction deleted successfully',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        message: 'Transaction not found',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      }));
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: 'Deleting transaction failed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      error: error.message
    }));
    console.error(error);
  }
};

// Get transactions by user ID
const getTransactionsByUserId = async (req, res, userId) => {
  try {
    const transactions = await Transaction.getTransactionsByUserId(userId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      transactions: transactions,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: 'Fetching transactions for user failed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      error: error.message
    }));
    console.error(error);
  }
};

// Get transactions by campaign ID
const getTransactionsByCampaignId = async (req, res, campaignId) => {
  try {

    const transactions = await Transaction.getTransactionsByCampaignId(campaignId);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      transactions: transactions,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: 'Fetching transactions for campaign failed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      error: error.message
    }));
    console.error(error);
  }
};

const getAllTransactions = async (req, res) => {

  try {
    const transactions = await Transaction.getAllTransactions();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: true,
      transactions: transactions,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: 'Fetching all transactions failed',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      error: error.message
    }));
    console.error(error);
  }
};

module.exports = {
  createTransaction,
  getTransactionById,
  updateTransaction,
deleteTransaction,
getTransactionsByUserId,
getTransactionsByCampaignId,
getAllTransactions
};
