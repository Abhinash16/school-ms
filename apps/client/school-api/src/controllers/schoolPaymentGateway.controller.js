const SchoolPaymentGateway = require("../../../../../packages/db/models/SchoolPaymentGateway");
const {
  validateGatewayCredentials,
} = require("../../../../../packages/payments/credentialValidator");

module.exports.upsertGateway = async (req, res) => {
  try {
    const school_id = req.school.id;
    const { provider, credentials, enabled } = req.body;

    if (!provider || !credentials) {
      return res.status(400).json({
        success: false,
        message: "provider and credentials are required",
      });
    }

    // ✅ STRUCTURE VALIDATION HERE
    validateGatewayCredentials(provider, credentials);

    const [gateway, created] = await SchoolPaymentGateway.upsert(
      {
        school_id,
        provider,
        credentials,
        enabled: !!enabled,
      },
      {
        returning: true,
      }
    );

    return res.json({
      success: true,
      data: gateway,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports.listGateways = async (req, res) => {
  try {
    const school_id = req.school.id;

    const gateways = await SchoolPaymentGateway.findAll({
      where: { school_id },
      attributes: ["id", "provider", "enabled", "createdAt"],
    });

    return res.json({ success: true, data: gateways });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.disableGateway = async (req, res) => {
  try {
    const school_id = req.school.id;
    const { provider } = req.params;

    const updated = await SchoolPaymentGateway.update(
      { enabled: false },
      { where: { school_id, provider } }
    );

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
