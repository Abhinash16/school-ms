const {
  PaymentServiceClass,
  Classroom,
  PaymentService,
  sequelize,
} = require("../../../../../packages/db/models");

/**
 * Assign a payment service to classes with amounts
 * body: { service_id, class_amounts: [{class_id, amount}] }
 */
module.exports = {
  async assignServiceToClasses(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const school_id = req.school.id; // Corrected: JWT decoded school object
      const { service_id, class_amounts } = req.body;

      if (
        !service_id ||
        !Array.isArray(class_amounts) ||
        class_amounts.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "service_id and class_amounts array are required",
        });
      }

      // Extract class_ids from request
      const classIds = class_amounts.map((c) => c.class_id);

      // 1️⃣ Validate all classes exist for this school
      const existingClasses = await Classroom.findAll({
        where: { id: classIds, school_id },
        transaction,
      });

      const existingClassIds = new Set(existingClasses.map((c) => c.id));
      const invalidIds = classIds.filter((id) => !existingClassIds.has(id));
      if (invalidIds.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Invalid class IDs for this school: ${invalidIds.join(
            ", "
          )}`,
        });
      }

      // 2️⃣ Fetch existing PaymentServiceClass rows for this service + school
      const existingAssignments = await PaymentServiceClass.findAll({
        where: { service_id, school_id, class_id: classIds },
        transaction,
      });

      const existingMap = new Map();
      existingAssignments.forEach((rec) => existingMap.set(rec.class_id, rec));

      const results = [];

      // 3️⃣ Iterate once, upsert each class assignment
      for (const item of class_amounts) {
        const amount = item.amount || 0;

        if (existingMap.has(item.class_id)) {
          // Update existing
          const record = existingMap.get(item.class_id);
          if (record.amount !== amount) {
            record.amount = amount;
            await record.save({ transaction });
          }
          results.push(record);
        } else {
          // Create new
          const record = await PaymentServiceClass.create(
            { service_id, class_id: item.class_id, school_id, amount },
            { transaction }
          );
          results.push(record);
        }
      }

      await transaction.commit();
      return res.status(200).json({ success: true, data: results });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * List services assigned to classes for a school
   */
  async listServiceClasses(req, res) {
    try {
      const school_id = req.school.id;
      const service_id = req.query.service_id;

      const whereClause = { school_id };
      if (service_id) whereClause.service_id = service_id;

      const records = await PaymentServiceClass.findAll({
        where: whereClause,
        include: [
          { model: Classroom, as: "classroom" },
          { model: PaymentService, as: "service" },
        ],
      });

      return res.json({ success: true, data: records });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
