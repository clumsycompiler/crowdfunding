// let campaigns = require('../data/campaigns')
const pool = require("../db");
// const dbConnection = require("../db");
// used to generate unique ids for entities
const { v4: uuidv4 } = require("uuid");
const userModel = require("./userModel");

async function insertImage(connection, imageUrls) {
  const imageIds = [];

  try {
    console.log("images urls form image model");
    console.log(imageUrls);
    for (const img of imageUrls) {
      const sql = "INSERT INTO images (image_url) VALUES (?)";
      const [results] = await connection.execute(sql, [img]);
      imageIds.push(results.insertId);
      console.log("Image saved successfully:", results.insertId);
    }
  } catch (error) {
    console.error("Error executing insert image query:", error);
    throw error;
  }
  return imageIds;
}

async function insertCampaign(connection, campaign) {
  try {
    const sql = `
      INSERT INTO campaigns (
        campaign_title,
        campaign_description,
        target_amount,
        funding_deadline,
        industry,
        is_active,
        current_amount,
        creator_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      campaign.campaign_title,
      campaign.campaign_description,
      campaign.target_amount,
      campaign.funding_deadline,
      campaign.industry,
      campaign.is_active,
      campaign.current_amount,
      campaign.creator_id,
    ];

    const [result] = await connection.execute(sql, values);
    const campaignId = result.insertId;

    console.log("Campaign created with ID:", campaignId);

    return campaignId;
  } catch (error) {
    console.error("Campaign creation failed:", error);
    throw new Error("Campaign creation failed: " + error.message);
  }
}

async function insertCampaignImage(connection, campaignId, imageIds) {
  try {
    for (const imageId of imageIds) {
      const sql =
        "INSERT INTO campaignImages (campaign_id, image_id) VALUES (?, ?)";
      const [results] = await connection.execute(sql, [campaignId, imageId]);
      console.log("Campaign image inserted successfully:", results);
    }

    console.log("campaignImages table added success");
    return Promise.resolve("campaignImages table added success");
  } catch (error) {
    console.error("Error executing insert campaign image query:", error);
    return Promise.reject("campaignImages table added failed");
  }
}

// model for creating new campaign  in db
async function createCampaignModel(campaignData) {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const imageIdsArr = await insertImage(connection, campaignData.imageUrls);

    const campaign_id = await insertCampaign(connection, campaignData);

    await insertCampaignImage(
      connection,
      parseInt(campaign_id, 10),
      imageIdsArr
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error creating campaign:", error);

    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function updateImages(connection, imagesData) {
  const imageIds = [];

  try {
    for (const [id, url] of Object.entries(imagesData)) {
      const sql = id
        ? "INSERT INTO images (image_id, image_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)"
        : "INSERT INTO images (image_url) VALUES (?)";
      const [results] = await connection.execute(sql, id ? [id, url] : [url]);

      if (results.insertId) {
        imageIds.push(results.insertId);
      } else if (results.affectedRows > 0) {
        const [rows] = await connection.execute(
          "SELECT image_id FROM images WHERE image_url = ?",
          [url]
        );
        imageIds.push(...rows.map((row) => row.image_id));
      }
    }
  } catch (error) {
    console.error("Error updating images:", error);
    throw error;
  }

  return imageIds;
}

async function updateCampaign(connection, campaign) {
  const sql = `
    UPDATE campaigns SET
      campaign_title = ?,
      campaign_description = ?,
      target_amount = ?,
      funding_deadline = ?,
      industry = ?,
      is_active = ?,
      current_amount = ?
    WHERE campaign_id = ?
  `;
  const values = [
    campaign.campaign_title,
    campaign.campaign_description,
    campaign.target_amount,
    campaign.funding_deadline,
    campaign.industry,
    campaign.is_active,
    campaign.current_amount,
    campaign.campaign_id,
  ];

  try {
    await connection.execute(sql, values);
    console.log("Campaign table updated successfully");
  } catch (error) {
    console.error("Error executing update campaign table query:", error);
    throw error;
  }
}

async function updateCampaignImage(connection, campaignId, imageIds) {
  try {
    for (const imageId of imageIds) {
      const sql = `
        UPDATE campaignImages SET
          image_id = ?
        WHERE campaign_id = ?
      `;
      const values = [imageId, campaignId];
      await connection.execute(sql, values);
      console.log("Campaign image table updated successfully");
    }
  } catch (error) {
    console.error("Error executing update campaign image table query:", error);
    throw error;
  }
}

// model for updating campaign data in db
async function updateCampaignModel(campaignData) {
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const imageIdsArr = await updateImages(connection, campaignData.imagesData);

    await updateCampaign(connection, campaignData);

    await updateCampaignImage(
      connection,
      campaignData.campaign_id,
      imageIdsArr
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error updating campaign:", error);

    throw error;
  } finally {
    connection.release();
  }
}

// model for deleting campaign  from db
async function removeCampaign(connection, campaignId) {
  try {
    await connection.execute("DELETE FROM campaigns WHERE campaign_id = ?", [
      campaignId,
    ]);

    console.log(`campaign id :${campaignId} deleted successfully`);

    return Promise.resolve(`campaign deleted successfully`);
  } catch (error) {
    await connection.rollback();

    console.error("Error deleting campaign:", error);

    throw error;
    // return Promise.reject("Error deleting campaign: " + error.message);
  }
}

// removes images from images table and campaignImages table
async function removeImages(connection, campaignId) {
  try {
    // Get all image IDs associated with the campaign
    const [rows] = await connection.execute(
      "SELECT image_id FROM campaignImages WHERE campaign_id = ?",
      [campaignId]
    );

    const imageIds = rows.map((row) => row.image_id);

    if (imageIds.length > 0) {
      // Delete entries from campaignImages table
      await connection.execute(
        "DELETE FROM campaignImages WHERE campaign_id = ?",
        [campaignId]
      );

      // Delete images from images table
      await connection.execute(
        `DELETE FROM images WHERE image_id IN (${imageIds.join(",")})`,
        [imageIds]
      );
    }

    console.log("Images and their references deleted successfully.");
    return Promise.resolve("Images and their references deleted successfully.");
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();

    console.error("Error deleting images:", error);
    throw error;
    // return Promise.reject("Error deleting images: " + error.message);
  }
}

async function removeCampaignModel(campaignId) {
  try {
    connection = await pool.getConnection();
    // Start a transaction
    await connection.beginTransaction();

    await removeImages(connection, campaignId);

    console.log("images deleted success");
    await removeCampaign(connection, campaignId);

    await connection.execute(
      "DELETE FROM transactions WHERE campaign_id = ?",
      [campaignId]
    );

    console.log(`campaign data deleted + images successfully`);

    await connection.commit();

    return Promise.resolve(`campaign data deleted + images successfully`);
  } catch (error) {
    connection.rollback();

    console.log(`campaign data  + images delete operation failed`);
    return Promise.reject(`campaign data  + images delete operation failed`);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function removev1(campaignId) {
  try {
    connection = await pool.getConnection();
    // Start a transaction
    await connection.beginTransaction();

    // Get all image IDs associated with the campaign
    const [rows] = await connection.execute(
      "SELECT image_id FROM campaignImages WHERE campaign_id = ?",
      [campaignId]
    );

    const imageIds = rows.map((row) => row.image_id);

    if (imageIds.length > 0) {
      // Delete entries from campaignImages table
      await connection.execute(
        "DELETE FROM campaignImages WHERE campaign_id = ?",
        [campaignId]
      );

      // Delete images from images table
      await connection.execute(
        `DELETE FROM images WHERE image_id IN (${imageIds.join(",")})`,
        [imageIds]
      );
    }
    // Commit the transaction
    await connection.commit();

    console.log("Images and their references deleted successfully.");
    return Promise.resolve("Images and their references deleted successfully.");
  } catch (error) {
    // Rollback the transaction in case of error
    await connection.rollback();

    console.error("Error deleting images:", error);
    return Promise.reject("Error deleting images: " + error.message);
  }
}

async function readCampaignImagesById(connection, campaign_id) {
  try {
    // Query to get the related images
    const imagesSql = `
        SELECT images.image_id, images.image_url 
        FROM images
        JOIN campaignImages ON images.image_id = campaignImages.image_id
        WHERE campaignImages.campaign_id = ?
      `;
    const [imagesResults] = await connection.execute(imagesSql, [campaign_id]);
    return imagesResults;
  } catch (error) {
    console.error("Error executing read one campaign by id query:", error);
    throw error;
  }
}

// gets one campaign at a time
async function readCampaignById(campaign_id) {
  connection = await pool.getConnection();
  // Start a transaction
  await connection.beginTransaction();

  const campaignSql = `
        SELECT * FROM campaigns
        WHERE campaign_id = ?
      `;

  try {
    const [campaignResults] = await connection.execute(campaignSql, [
      campaign_id,
    ]);

    if (campaignResults.length === 0) {
      throw new Error("Campaign not found");
    }

    const campaignData = campaignResults[0];

    const imagesData = await readCampaignImagesById(connection, campaign_id);
    campaignData["images"] = imagesData;

    const campaignOwnerDetails = await userModel.findById(
      campaignData.creator_id
    );

    const transactionData = await readAllCampaignTransactions(connection,campaign_id)
    campaignData["transactionData"]=transactionData

    campaignData["campaignOwnerDetails"] = {
      user_id: campaignOwnerDetails.user_id,
      username: campaignOwnerDetails.username,
      email: campaignOwnerDetails.email,
      location: campaignOwnerDetails.location,
    };

    await connection.commit();
    return campaignData;
  } catch (error) {
    await connection.rollback();
    console.error("Error executing read one campaign by id query:", error);

    return Promise.reject();
  }
}

async function readAllCampaignImages(connection) {
  try {
    const imagesSql = `
      SELECT images.image_id, images.image_url, campaignImages.campaign_id
      FROM images
      JOIN campaignImages ON images.image_id = campaignImages.image_id
    `;
    const [imagesResults] = await connection.execute(imagesSql);
    return imagesResults;
  } catch (error) {
    console.error("Error executing read all campaign images query:", error);
    throw error;
  }
}

async function readAllCampaignTransactions(connection, campaign_id) {
  try {
    const transactionSql = `
    SELECT * FROM transactions WHERE campaign_id = ?
  `;
    const [campaignTx] = await connection.execute(transactionSql, [
      campaign_id,
    ]);
    for (const tx of campaignTx) {
      const txSender = await userModel.findById(
        tx.sender_id
      );
      tx['senderData'] ={
        user_id: txSender.user_id,
        username: txSender.username,
        email: txSender.email,
        location: txSender.location,
      }

    }
    return campaignTx;
  } catch (error) {
    throw error;

  }
}

// gets all campaigns
async function readAllCampaigns() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  const campaignSql = `
    SELECT * FROM campaigns
  `;

  try {
    const [campaignResults] = await connection.execute(campaignSql);

    const imagesData = await readAllCampaignImages(connection);

    for (const campaign of campaignResults) {
      const campaignOwnerDetails = await userModel.findById(
        campaign.creator_id
      );

      const transactionData = await readAllCampaignTransactions(connection,campaign.campaign_id)
      campaign["transactionData"]=transactionData
      campaign["campaignOwnerDetails"] = {
        user_id: campaignOwnerDetails.user_id,
        username: campaignOwnerDetails.username,
        email: campaignOwnerDetails.email,
        location: campaignOwnerDetails.location,
      };
    }


    const campaignsData = campaignResults.map((campaign) => {
      const campaignImages = imagesData.filter(
        (image) => image.campaign_id === campaign.campaign_id
      );
      return {
        ...campaign,
        images: campaignImages,
      };
    });

    await connection.commit();
    return campaignsData;
  } catch (error) {
    await connection.rollback();
    console.error("Error executing read all campaigns query:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// expose methods for use in code base
module.exports = {
  createCampaignModel,
  readAllCampaigns,
  readCampaignById,
  updateCampaignModel,
  removeCampaignModel,
};
