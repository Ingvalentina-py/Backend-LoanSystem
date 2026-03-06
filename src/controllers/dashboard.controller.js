const User = require("../models/User");
const Client = require("../models/Client");
const Credit = require("../models/Credit");

async function getDashboard(req, res) {
  try {
    const user = req.user;

    if (user.role === "admin") {
      const [
        activeCollectors,
        totalClients,
        pendingCredits,
        paidCredits,
        totalCredits,
      ] = await Promise.all([
        User.countDocuments({ role: "collector", isActive: true }),
        Client.countDocuments(),
        Credit.countDocuments({ status: "pending" }),
        Credit.countDocuments({ status: "paid" }),
        Credit.countDocuments(),
      ]);

      return res.json({
        role: "admin",
        metrics: {
          activeCollectors,
          totalClients,
          pendingCredits,
          paidCredits,
          totalCredits,
        },
      });
    }

    const filter = { collectorId: user._id };

    const [myClients, myPendingCredits, myPaidCredits, myTotalCredits] =
      await Promise.all([
        Client.countDocuments(filter),
        Credit.countDocuments({ ...filter, status: "pending" }),
        Credit.countDocuments({ ...filter, status: "paid" }),
        Credit.countDocuments(filter),
      ]);

    return res.json({
      role: "collector",
      metrics: {
        myClients,
        myPendingCredits,
        myPaidCredits,
        myTotalCredits,
      },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    return res
      .status(500)
      .json({ message: "Error interno al cargar dashboard" });
  }
}

module.exports = { getDashboard };
