const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { swapRequestEmail, swapAcceptedEmail } = require('../utils/emailTemplates');

// @POST /api/swap/send
const sendSwapRequest = async (req, res) => {
  const { receiverId, senderSkill, receiverSkill, message } = req.body;
  try {
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: "Can't send request to yourself" });
    }

    const existing = await SwapRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = await SwapRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      senderSkill,
      receiverSkill,
      message
    });

    const receiver = await User.findById(receiverId);
    if (receiver?.email) {
      await sendEmail({
        to: receiver.email,
        subject: `${req.user.name} wants to swap skills with you! 🤝`,
        html: swapRequestEmail(req.user.name, senderSkill, receiverSkill),
      }).catch(() => {});
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/swap/received
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ receiver: req.user._id })
      .populate('sender', 'name email college avatar skillsToTeach')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/swap/sent
const getSentRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({ sender: req.user._id })
      .populate('receiver', 'name email college avatar skillsToTeach')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/swap/:id/respond
const respondToRequest = async (req, res) => {
  const { status } = req.body;
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    if (status === 'accepted' && request.sender?.email) {
      await sendEmail({
        to: request.sender.email,
        subject: `${request.receiver.name} accepted your swap request! 🎉`,
        html: swapAcceptedEmail(request.receiver.name, request.senderSkill, request.receiverSkill),
      }).catch(() => {});
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/swap/:id
const cancelRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/swap/:id/propose-session
const proposeSession = async (req, res) => {
  const { dateTime } = req.body;
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isPartOfSwap =
      request.sender.toString() === req.user._id.toString() ||
      request.receiver.toString() === req.user._id.toString();
    if (!isPartOfSwap) return res.status(403).json({ message: 'Not authorized' });

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Swap must be accepted first' });
    }

    request.session = {
      dateTime,
      proposedBy: req.user._id,
      confirmed: false,
    };
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/swap/:id/confirm-session
const confirmSession = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isPartOfSwap =
      request.sender.toString() === req.user._id.toString() ||
      request.receiver.toString() === req.user._id.toString();
    if (!isPartOfSwap) return res.status(403).json({ message: 'Not authorized' });

    if (!request.session?.dateTime) {
      return res.status(400).json({ message: 'No session proposed yet' });
    }

    if (request.session.proposedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't confirm your own proposal" });
    }

    request.session.confirmed = true;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendSwapRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
  cancelRequest,
  proposeSession,
  confirmSession,
};
