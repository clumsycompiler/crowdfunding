const User = require("../models/userModel");
const { getPostData } = require("../utilis");
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key'; // Replace with a strong secret key

// Function to generate a JWT token
function generateToken(user) {
  const payload = {
    user_id: user.user_id,
    email: user.email,
    // username: user.username,
    account_type: user.account_type
  };
  return jwt.sign(payload, secretKey, { expiresIn: '24h' }); // Token expires in 1 hour
}

// Function to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  console.log(token)
  if (!token) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'No token provided' }));
    return;
  }
  if (token.startsWith('Bearer ')) {
    // Extract the token part after 'Bearer '
    const actualToken = token.slice(7, token.length).trim();


  jwt.verify(actualToken, secretKey, (err, decoded) => {
    if (err) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Failed to authenticate token' }));
      return;
    }
    console.log("success verify token")
    // Save user information for future use
    req.user = decoded;
    next();
  });
}
}



const loginUser = async (req, res) => {
  try {
    const body = await getPostData(req);
    const { email, password } = JSON.parse(body);

    const user = await User.findByEmail(email);


    if (user && await User.comparePassword(password, user.password)) {
      const token = generateToken(user);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: true,
        message: `Login successful`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        userId: user.user_id,
        token: token
      }));
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        message: `Invalid email or password`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      }));
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      success: false,
      message: `Login failed`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }));
    console.error(error);
  }
};

const createUser = async (req, res) => {
  try {
    const body = await getPostData(req);

    const { username, email, password, location, account_type } =
      JSON.parse(body);
    console.log({ username, email, password, location, account_type })
    const result = await User.create({
      username,
      email,
      password,
      location,
      account_type,
    });

    const user = { user_id: result.insertId, username, email, account_type };
    console.log("user")
    console.log(user)
    const token = generateToken(user);
    console.log("token")
    console.log(token)
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: `User created successfully`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        token: token
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: `User creation failed`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      })
    );
    console.log(error);
  }
};

const getUser = async (req, res,user_id) => {
  try {
    const user = await User.findById(user_id);
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: "User Not Found",
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
        })
      );
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: `User id: ${user_id} read successfully`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        user: user,
      })
    );
  } 
  catch (error) {
    console.log(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: `No data, try again or contact support`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      })
    );
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: `successfully read all users data`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        users: users,
      })
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: `No data, try again or contact support`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
      })
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const body = await getPostData(req);
    const {user_id, username, email, password, location, account_type } =
      JSON.parse(body);

    await User.update({user_id, username, email, password, location, account_type });

    res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          JSON.stringify({
            success: true,
            message: `User updated`,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
          })
        )
      );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: "Failed to update user data",
        error: error.message,
      })
    );
    console.log(error);
  }
};

const deleteUser = async (req, res, user_id) => {
  try {
    const body = await getPostData(req);
    await User.delete(user_id);

    res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          JSON.stringify({
            success: true,
            message: `User ${user_id} deleted successfully`,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
          })
        )
      );
  } catch (error) {
    res.end(
        JSON.stringify({
          success: false,
          message: "Failed to delete user data",
          error: error.message,
        })
      );
      console.log(error);
  }
};

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser,
  verifyToken
};
