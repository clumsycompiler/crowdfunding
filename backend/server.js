const http = require("http");
const url = require("url");
const qs = require("querystring");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key'; // Replace with a strong secret key

const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} = require("./controllers/campaignController");
const {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  loginUser,
  verifyToken,
} = require("./controllers/userController");
const {
  createTransaction,
  getTransactionById,
  updateTransaction,
deleteTransaction,
getTransactionsByUserId,
getTransactionsByCampaignId,
getAllTransactions
} = require("./controllers/transactionController");
// const uploadDir = path.join(__dirname, "../uploads");
const uploadDir = "/media/DATA/school/Project/progress/code/uploads";

// Function to handle different routes
function handleRequest(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const urlPath = parsedUrl.pathname.replace("/api", "");
  const method = req.method;
  const headers = req.headers;
  if (urlPath.startsWith("/admin/")) {
    verifyToken(req, res, async () => {
      console.log(req.user.account_type);
      if (req.user.account_type !== "admin") {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Access denied" }));
      } else if (urlPath === "/admin/allUsers" && method === "GET") {
        getAllUsers(req, res);
      } else if (
        urlPath.match(/\/admin\/user\/updateUser\/\w+/) &&
        method === "PUT"
      ) {
        // const id = urlPath.split("/")[3];
        updateUser(req, res);
      } else if (
        urlPath.match(/\/admin\/user\/deleteUser\/\w+/) &&
        method == "DELETE"
      ) {
        const id = urlPath.split("/")[4];
        deleteUser(req, res, id);
      } else if (urlPath.match(/\/admin\/user\/profile\/\w+/) && method === "GET") {
        // Get one user information
        const id = urlPath.split("/")[4];
        getUser(req, res, id);
      }
    });
    // })
  } else if (urlPath.startsWith("/user/")) {
    if (urlPath === "/user/login" && method === "POST") {
      console.log("login called")
      loginUser(req, res);
    } else if (urlPath === "/user/createUser" && method === "POST") {
      console.log("called here");
      createUser(req, res);
    } else {
      verifyToken(req, res, async () => {
        // Only allow authenticated users to access user routes
        authenticateUser(headers.email, headers.password, (err, user) => {
          if (err || !isNormalUser(user)) {
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Access denied" }));
            return;
          } else if (urlPath === "/user/profile" && method === "GET") {
            // Get own user information
            getUser(req, res, id);
          } else if (
            urlPath.match(/\/user\/udpateUser\/\w+/) &&
            method === "PUT"
          ) {
            const id = urlPath.split("/")[3];
            updateUser(req, res, id);
          } else if (
            urlPath.match(/\/user\/deleteUser\/\w+/) &&
            method === "DELETE"
          ) {
            const id = urlPath.split("/")[3];
            deleteUser(req, res, id);
          }
        });
      });
    }
  } else if (urlPath.startsWith("/campaigns/")) {
    if (urlPath.match(/\/campaigns\/getCampaign\/\w+/) && method === "GET") {
      const id = urlPath.split("/")[3];
      getCampaign(req, res, id);
    }
    else if (urlPath.startsWith("/campaigns/getAllCampaigns")) {
      getCampaigns(req, res);
    } 
    else {
      verifyToken(req, res, async () => {
        if (urlPath === "/campaigns/createCampaign" && method === "POST") {
          const form = new formidable.IncomingForm();
          form.uploadDir = uploadDir;
          form.keepExtensions = true;

          form.parse(req, (err, fields, files) => {
            if (err) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  message: "Failed to parse form data",
                  error: err.message,
                })
              );
              return;
            }
            if (!files.image || files.image.length === 0) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  message: "No image file uploaded",
                })
              );
              return;
            }
            const imageFile = files.image[0]; // Get the first image file
            const oldPath = imageFile.filepath;
            const originalFilename = imageFile.originalFilename;
            const extension = path.extname(originalFilename);
            const newFilename = `${path.basename(
              imageFile.newFilename,
              path.extname(imageFile.newFilename)
            )}${extension}`;
            const newPath = path.join(uploadDir, newFilename);
            console.log(newPath);
            console.log(oldPath)

            fs.copyFile(oldPath, newPath, (err) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: false,
                    message: "Failed to copy image",
                    error: err.message,
                  })
                );
                return;
              }

              const imageUrl = `/uploads/${imageFile.newFilename}`;

              const campaignData = {
                imageUrls: [imageUrl], // Ensure imageUrls is an array if you expect multiple images
                campaign_title: fields.campaign_title[0], // Access first element assuming it's a single value field
                campaign_description: fields.campaign_description[0], // Access first element assuming it's a single value field
                target_amount: parseInt(fields.target_amount[0], 10), // Convert to integer
                funding_deadline: new Date(fields.funding_deadline[0]), // Convert to Date object
                industry: fields.industry[0], // Access first element assuming it's a single value field
                is_active:
                  fields.is_active && fields.is_active[0] === "on" ? 1 : 0, // Check if 'is_active' checkbox is checked
                current_amount: parseInt(fields.current_amount[0] || 0, 10), // Convert to integer, default to 0 if empty
                creator_id: req.user.user_id,
              };
              createCampaign(req, res, campaignData);
            });
          });
        }
        //   end of create campaign
        // start of update campaign
        else if (
          urlPath.match(/\/campaigns\/updateCampaign\/\w+/) &&
          method === "PUT"
        ) {
          verifyToken(req, res, async () => {
            const id = urlPath.split("/")[4];

            const form = new formidable.IncomingForm();
            form.uploadDir = uploadDir;
            form.keepExtensions = true;
            form.parse(req, (err, fields, files) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: false,
                    message: "Failed to parse form data",
                    error: err.message,
                  })
                );
                return;
              }

              console.log("Files:", files); // Debugging line
              console.log("Fields:", fields); // Debugging line

              if (!files.image || files.image.length === 0) {
                const campaignData = {
                  imageUrls: [], // Ensure imageUrls is an array if you expect multiple images
                  campaign_title: fields.campaign_title[0], // Access first element assuming it's a single value field
                  campaign_description: fields.campaign_description[0], // Access first element assuming it's a single value field
                  target_amount: parseInt(fields.target_amount[0], 10), // Convert to integer
                  funding_deadline: new Date(fields.funding_deadline[0]), // Convert to Date object
                  industry: fields.industry[0], // Access first element assuming it's a single value field
                  is_active:
                    fields.is_active && fields.is_active[0] === "on" ? 1 : 0, // Check if 'is_active' checkbox is checked
                  current_amount: parseInt(fields.current_amount[0] || 0, 10), // Convert to integer, default to 0 if empty
                };

                updateCampaign(req, res, campaignData);

              }
              const imageFile = files.image[0]; // Get the first image file
              const oldPath = imageFile.filepath;
              const originalFilename = imageFile.originalFilename;
              const extension = path.extname(originalFilename);
              const newFilename = `${path.basename(
                imageFile.newFilename,
                path.extname(imageFile.newFilename)
              )}${extension}`;
              const newPath = path.join(uploadDir, newFilename);
              fs.copyFile(oldPath, newPath, (err) => {
                if (err) {
                  res.writeHead(500, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({
                      success: false,
                      message: "Failed to copy image",
                      error: err.message,
                    })
                  );
                  return;
                }

                const imageUrl = `/uploads/${imageFile.newFilename}`;

                const campaignData = {
                  imageUrls: [imageUrl], // Ensure imageUrls is an array if you expect multiple images
                  campaign_title: fields.campaign_title[0], // Access first element assuming it's a single value field
                  campaign_description: fields.campaign_description[0], // Access first element assuming it's a single value field
                  target_amount: parseInt(fields.target_amount[0], 10), // Convert to integer
                  funding_deadline: new Date(fields.funding_deadline[0]), // Convert to Date object
                  industry: fields.industry[0], // Access first element assuming it's a single value field
                  is_active:
                    fields.is_active && fields.is_active[0] === "on" ? 1 : 0, // Check if 'is_active' checkbox is checked
                  current_amount: parseInt(fields.current_amount[0] || 0, 10), // Convert to integer, default to 0 if empty
                  creator_id: req.user.user_id,
                };

                updateCampaign(req, res, campaignData);
              });
            });
          });
        }
        // end of update campaign
        // start of delete campaign
        else if (
          urlPath.match(/\/campaigns\/deleteCampaign\/\w+/) &&
          method === "DELETE"
        ) {
          verifyToken(req, res, async () => {
            const id = urlPath.split("/")[4];
            deleteCampaign(req, res, id);
          });
        }
      });
    }
  } else if (urlPath.startsWith("/transactions/")){
    if (urlPath === "/transactions/getAllTransactions" && method == "GET"){
      getAllTransactions(req,res);
    }
    if (urlPath.match(/\/transactions\/getCampaignTransactions\/\w+/) && method == "GET"){
      campaignId = urlPath.split("/")[3];
      getTransactionsByCampaignId(req,res,campaignId);
    }
    else if (urlPath.match (/\/transactions\/getUserTransactions\/\w+/) && method == "GET"){
      userId = urlPath.split("/")[3];
      getTransactionsByUserId(req,res, userId)
    }
    else if (urlPath == "/transactions/createTransactions/" && method == "POST"){
      createTransaction(req,res)
    }
    else if (urlPath == "/transactions/updateTransactions/" && method == "PUT"){
      updateTransaction(req,res)
    }
    else if (urlPath.match(/\/transactions\/deleteTransactions\/\w+/) && method == "DELETE"){
      const id = urlPath.split("/")[4];
      deleteTransaction(req,res,id)
    }
    else if (urlPath.match(/\/transactions\/getTransactionById\/\w+/) && method == "GET"){
      transactionId = urlPath.split("/")[3];
      
      getTransactionById(req,res, transactionId)
    }
  }
  
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "No matching route found" }));
  }
}

const server = http.createServer(handleRequest);

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
