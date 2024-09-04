const Campaign = require("../models/campaignModel");

const { getPostData } = require("../utilis");

// @desc    Gets All Campaigns
// @route   GET /api/campaigns
async function getCampaigns(req, res) {
  try {
    const campaigns = await Campaign.readAllCampaigns();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: `successfully read all campaign data`,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        campaigns: campaigns,
      })
    );
    console.log("successfully read all campaign data");
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
    console.log(error);
  }
}

// @desc    Gets Single Campaign
// @route   GET /api/campaign/:id
async function getCampaign(req, res, campaign_id) {
  try {
    // const body = await getPostData(req);
    const campaign = await Campaign.readCampaignById(campaign_id);

    if (!campaign) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: "Campaign Not Found",
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
        })
      );
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: `Campaign id: ${campaign_id} read successfully`,
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.url,
          campaign: campaign,
        })
      );
    }
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
    console.log(error);
  }
}

// @desc    Create a Campaign
// @route   POST /api/campaigns
async function createCampaign(req,res,campaignData) {
  try {
    // const body = await getPostData(req);

    const {
      imageUrls,
      campaign_title,
      campaign_description,
      target_amount,
      funding_deadline,
      industry,
      is_active,
      current_amount,
      creator_id
    } = campaignData

    await Campaign.createCampaignModel({
      imageUrls,
      campaign_title,
      campaign_description,
      target_amount,
      funding_deadline,
      industry,
      is_active,
      current_amount,
      creator_id
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: "Campaign created successfully",
        method: req.method,
        url: req.url,
      })
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: "Failed to create campaign",
        method: req.method,
        url: req.url,
        error: error.message,
      })
    );
  }
}

// @desc    Update a Campaign
// @route   PUT /api/campaigns/:id
async function updateCampaign(req, res,campaignData) {
  try {
    const body = await getPostData(req);

    const {
      campaign_id,
      imagesData,
      campaign_title,
      campaign_description,
      target_amount,
      funding_deadline,
      industry,
      is_active,
      current_amount,
    } = campaignData;

    console.log(campaignData)

    const campaign = await Campaign.readCampaignById(campaign_id);

    if (!campaign) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: `Campaign with id : ${campaign_id} does not exist`,
        })
      );
    } else {
      await Campaign.updateCampaignModel({
        campaign_id,
        imagesData,
        campaign_title,
        campaign_description,
        target_amount,
        funding_deadline,
        industry,
        is_active,
        current_amount,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          JSON.stringify({
            success: true,
            message: `successfully updated campaign data`,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
          })
        )
      );
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: "Failed to update campaign data",
        error: error.message,
      })
    );
    console.log(error);
  }
}

// @desc    Delete Campaign
// @route   DELETE /api/campaign/:id
async function deleteCampaign(req, res) {
  try {
    const body = await getPostData(req);

    const { campaign_id } = JSON.parse(body);

    const campaign = await Campaign.readCampaignById(parseInt(campaign_id, 10));
    if (!campaign) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false, 
        message: "Campaign Not Found" }));
    } else {
      console.log("start delete");
      await Campaign.removeCampaignModel(campaign_id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          JSON.stringify({
            success: true,
            message: `Campaign ${campaign_id} deleted successfully`,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
          })
        )
      );
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: false,
        message: "Failed to delete campaign data",
        error: error.message,
      })
    );
    console.log(error);
  }
}

module.exports = {
  getCampaign,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};
