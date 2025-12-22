const PaymentService = require("../../../../../packages/db/models/PaymentService");
const handleSQLError = require("../utils/sqlErrorHandler");

module.exports = {
  // Create a new Payment Service
  async createPaymentService(req, res) {
    try {
      const { title, description, default_amount, status } = req.body;
      const school_id = req.school.id; // from JWT
      const service = await PaymentService.create({
        title,
        description,
        default_amount,
        status,
        school_id,
      });

      return res.status(201).json({ success: true, data: service });
    } catch (err) {
      const errorResponse = handleSQLError(err);
      return res.status(500).json(errorResponse);
    }
  },

  // List all Payment Services for a school
  async listPaymentServices(req, res) {
    try {
      const school_id = req.school.id;

      const services = await PaymentService.findAll({ where: { school_id } });
      return res.json({ success: true, data: services });
    } catch (err) {
      const errorResponse = handleSQLError(err);
      return res.status(500).json(errorResponse);
    }
  },

  // Get a single Payment Service by id
  async getPaymentService(req, res) {
    try {
      const school_id = req.school.id;
      const { id } = req.params;

      const service = await PaymentService.findOne({
        where: { id, school_id },
      });
      if (!service) {
        return res
          .status(404)
          .json({ success: false, message: "Service not found" });
      }

      return res.json({ success: true, data: service });
    } catch (err) {
      const errorResponse = handleSQLError(err);
      return res.status(500).json(errorResponse);
    }
  },
};
