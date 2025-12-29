const {
  sequelize,
  PaymentOrder,
  PaymentOrderLineItem,
  PaymentTransaction,
} = require("../../../../../packages/db/models");
const SchoolPaymentGateway = require("../../../../../packages/db/models/SchoolPaymentGateway");
const { getPaymentProvider } = require("../../../../../packages/payments");
const { createClient } = require("../../../../../packages/payments/razorpay");

module.exports = {
  async createOrder(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const school_id = req.school.id; // ✅ your JWT style
      const { student_id, line_items, notes } = req.body;

      if (!Array.isArray(line_items) || line_items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "line_items are required",
        });
      }

      // ✅ compute total once
      const total_amount = line_items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

      const status = total_amount === 0 ? "NO_PAYMENT_REQUIRED" : "PENDING";

      // 1️⃣ Create Order
      const order = await PaymentOrder.create(
        {
          school_id,
          student_id: student_id || null,
          total_amount,
          status,
          notes,
        },
        { transaction }
      );

      // 2️⃣ Create Line Items (bulk = fewer DB calls)
      const items = line_items.map((item) => ({
        order_id: order.id,
        service_id: item.service_id,
        class_id: item.class_id || null,
        amount: item.amount,
        notes: item.notes || null,
      }));

      await PaymentOrderLineItem.bulkCreate(items, { transaction });

      await transaction.commit();

      return res.status(201).json({
        success: true,
        data: {
          order_id: order.id,
          status,
          total_amount,
        },
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async markOrderPaid(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const school_id = req.school.id;
      const admin_id = req.school?.id;

      const { order_id } = req.params;
      const { amount, method } = req.body;

      const order = await PaymentOrder.findOne({
        where: { id: order_id, school_id },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!order || order.status === "PAID") {
        return res.status(400).json({
          success: false,
          message: "Invalid or already paid order",
        });
      }

      if (amount <= 0 || amount > order.total_amount) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment amount",
        });
      }

      // Create transaction
      await PaymentTransaction.create(
        {
          order_id: order.id,
          school_id,
          amount,
          method, // CASH / ONLINE / QR
          gateway: "NONE",
          status: "SUCCESS",
          created_by: admin_id,
        },
        { transaction }
      );

      // Mark order paid (simple version)
      order.status = "PAID";
      order.payment_method = method;
      await order.save({ transaction });

      await transaction.commit();

      return res.json({ success: true, message: "Order marked as paid" });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async createPaymentLink(req, res) {
    try {
      const school_id = req.school.id;
      const { order_id } = req.params;
      const { provider } = req.body; // RAZORPAY | CASHFREE

      if (!provider) {
        return res.status(400).json({
          success: false,
          message: "provider is required (RAZORPAY / CASHFREE)",
        });
      }

      // 1️⃣ Validate order
      const order = await PaymentOrder.findOne({
        where: { id: order_id, school_id },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (order.status !== "PENDING") {
        return res.status(400).json({
          success: false,
          message: "Payment link can be created only for PENDING orders",
        });
      }

      // 2️⃣ Check if gateway enabled for school
      const gateway = await SchoolPaymentGateway.findOne({
        where: {
          school_id,
          provider,
          enabled: true,
        },
      });

      if (!gateway) {
        return res.status(400).json({
          success: false,
          message: `${provider} not enabled for this school`,
        });
      }

      // 3️⃣ Create provider client
      const paymentProvider = getPaymentProvider(provider, gateway.credentials);

      // 4️⃣ Create payment link
      let paymentLinkResponse;

      try {
        paymentLinkResponse = await paymentProvider.createPaymentLink({
          amount: order.total_amount,
          notes: {
            order_id: order.id,
            reference_type: "ORDER",
            reference_id: `ORDER_${order.id}`,
            school_id: order.school_id,
            service: "FEES",
            created_at: Date.now(),
          },
        });
      } catch (err) {
        // Axios / Razorpay error: propagate exact message
        const message =
          err.error?.description || // Razorpay API error
          err.response?.data?.message || // Cashfree
          err.message || // JS error message
          "Unknown error from payment provider";

        return res.status(400).json({
          success: false,
          message: `Payment provider error: ${message}`,
        });
      }

      /**
       * Normalize response
       */
      let payment_link;
      let gateway_payment_id;

      if (provider === "RAZORPAY") {
        payment_link = paymentLinkResponse.short_url;
        gateway_payment_id = paymentLinkResponse.id;
      }

      if (provider === "CASHFREE") {
        payment_link = paymentLinkResponse.link_url;
        gateway_payment_id = paymentLinkResponse.link_id;
      }

      // 5️⃣ Store transaction (PENDING)
      await PaymentTransaction.create({
        order_id: order.id,
        school_id,
        amount: order.total_amount,
        method: "ONLINE",
        gateway: provider,
        gateway_payment_id,
        status: "PENDING",
        created_by: req.school?.id || null,
      });

      return res.json({
        success: true,
        data: {
          order_id: order.id,
          provider,
          payment_link,
        },
      });
    } catch (err) {
      console.error("createPaymentLink error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // ✅ List all orders for a school
  async listOrders(req, res) {
    try {
      const school_id = req.school.id;

      const orders = await PaymentOrder.findAll({
        where: { school_id },
        include: [
          {
            model: PaymentOrderLineItem,
            as: "PaymentOrderLineItems",
          },
          {
            model: PaymentTransaction,
            as: "PaymentTransactions",
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.json({
        success: true,
        data: orders,
      });
    } catch (err) {
      console.error("listOrders error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  // ✅ Get single order by ID
  async getOrderById(req, res) {
    try {
      const school_id = req.school.id;
      const { order_id } = req.params;

      const order = await PaymentOrder.findOne({
        where: { id: order_id, school_id },
        include: [
          {
            model: PaymentOrderLineItem,
            as: "PaymentOrderLineItems",
          },
          {
            model: PaymentTransaction,
            as: "PaymentTransactions",
          },
        ],
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.json({
        success: true,
        data: order,
      });
    } catch (err) {
      console.error("getOrderById error:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },
};
