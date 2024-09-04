// let campaigns = require('../data/campaigns')
// const pool = require("../db");
const dbConnection = require("../db");
// used to generate unique ids for entities
const { v4: uuidv4 } = require("uuid");

async function insertImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO images (image_url) VALUES (?)";
    dbConnection.query(sql, [imageUrl], (error, results) => {
      if (error) {
        console.error("Error executing insert image query:", error);
        return reject(error);
      }
      console.log("Image inserted successfully:", results);
      resolve(results.insertId);
    });
  });
}

async function insertCampaign(campaign) {
  return new Promise((resolve, reject) => {
    const sql = `
    INSERT INTO campaigns (
      campaign_title,
      campaign_description,
      target_amount, 
      funding_deadline,
      industry,
      is_active, 
      current_amount, 
      campaignCategory_category_id, 
      images_image_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
  `;
    const values = [
      campaign.campaign_title,
      campaign.campaign_description,
      campaign.target_amount,
      campaign.funding_deadline,
      campaign.industry,
      campaign.is_active,
      campaign.current_amount,
      campaign.campaignCategory_category_id,
      campaign.images_image_id,
    ];
    dbConnection.query(sql, values, (error, results) => {
      if (error) {
        console.error("Error executing create campaign query:", error);
        reject(error);
      }
      console.log("Campaign created successfully", results);
      resolve(results);
    });
  });
}

// model for creating new campaign  in db
async function create(campaignData) {
  // const connection = await pool.getConnection();

  try {
    con.beginTransaction();

    let imageId = null;

    // If image URL is provided, insert into the images table
    if (campaignData.image_url) {
      const [imageResult] = con.query(
        "INSERT INTO images (image_url) VALUES (?)",
        [campaignData.image_url]
      );
      imageId = imageResult.insertId;
    }

    // Insert into the campaigns table
    const [campaignResult] = con.query(
      `INSERT INTO campaigns (
        campaign_title,
        campaign_description,
        target_amount,
        funding_deadline,
        industry,
        is_active,
        current_amount,
        rewardTiers_reward_tier_id,
        campaignCategory_category_id,
        images_image_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campaignData.campaign_title,
        campaignData.campaign_description,
        campaignData.target_amount,
        campaignData.funding_deadline,
        campaignData.industry,
        campaignData.is_active,
        campaignData.current_amount,
        campaignData.rewardTiers_reward_tier_id,
        campaignData.campaignCategory_category_id,
        imageId,
      ]
    );

    // Return the created campaign
    return {
      success: true,
      message: "Campaign created successfully",
      campaign: {
        campaign_id: campaignResult.insertId,
        ...campaignData,
        images_image_id: imageId,
      },
    };
  } catch (error) {
    console.error("Error creating campaign:", error);

    return {
      success: false,
      message: "Failed to create campaign",
      error: error.message,
    };
  } finally {
    // Release the connection
    connection.release();
  }
}

// model for updating campaign data in db
async function update(campaign_id, updatedCampaignData) {
  return new Promise((resolve, reject) => {
    const updateCampaignQuery = `
        UPDATE campaigns SET
          campaign_title = ?,
          campaign_description = ?,
          target_amount = ?,
          funding_deadline = ?,
          industry = ?,
          is_active = ?,
          current_amount = ?,
          campaignCategory_category_id = ?,
          images_image_id = ?
        WHERE campaign_id = ?
      `;

    const queryParams = [
      updatedCampaignData.campaign_title,
      updatedCampaignData.campaign_description,
      updatedCampaignData.target_amount,
      updatedCampaignData.funding_deadline,
      updatedCampaignData.industry,
      updatedCampaignData.is_active,
      updatedCampaignData.current_amount,
      updatedCampaignData.campaignCategory_category_id,
      updatedCampaignData.images_image_id,
      updatedCampaignData.campaign_id,
    ];

    dbConnection.query(
      updateCampaignQuery,
      queryParams,
      (error, results, fields) => {
        if (error) {
          console.error("Error executing update campaign data query:", error);
          return reject(error);
        }
        console.log("Campaign updated successfully:", results);
        resolve(results);
      }
    );
  });
}

// model for deleting campaign  from db
async function remove(campaign_id) {
  return new Promise((resolve, reject) => {
    const deleteCampaignQuery = `
        DELETE FROM campaigns
        WHERE campaign_id = ?
      `;

    dbConnection.query(
      deleteCampaignQuery,
      [campaign_id],
      (error, results, fields) => {
        if (error) {
          console.error("Error executing delete campaign query:", error);
          return reject(error);
        }
        console.log("Campaign deleted successfully:", results);
        resolve(results);
      }
    );
  });
}

// gets one campaign at a time
async function readById(campaign_id) {
  return new Promise((resolve, reject) => {
    const readCampaignQuery = `
        SELECT * FROM campaigns
        WHERE campaign_id = ?
      `;

    dbConnection.query(readCampaignQuery,[campaign_id],(error, results) => {
        if (error) {
          console.error(
            "Error executing read one campaign by id query:",
            error
          );
           reject(error);
        }
        console.log("Campaign details:", results);
        resolve(results);
      }
    );
  });
}

// gets all campaigns
async function readAll() {
  return new Promise((resolve, reject) => {
    const readAllCampaignsQuery = `
        SELECT * FROM campaigns
      `;

    dbConnection.query(readAllCampaignsQuery, (error, results, fields) => {
      if (error) {
        console.error("Error executing read all campaigns query:", error);
        return reject(error);
      }
      console.log("All campaigns details:", results);
      resolve(results);
    });
  });
}

// expose methods for use in code base
module.exports = {
  insertCampaign,
  insertImage,
  readAll,
  readById,
  create,
  update,
  remove,
};
