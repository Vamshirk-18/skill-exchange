const SwapRequest = require('../models/SwapRequest');

// @POST /api/swap/send
const sendSwapRequest = async (req, res) => {
  const { receiverId, senderSkill, receiverSkill, message } = req.body;
  try {
    // Prevent sending request to yourself
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: "Can't send request to yourself" });
    }

    // Check if request already exists
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

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/swap/received  — requests I received
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

// @GET /api/swap/sent  — requests I sent
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

// @PUT /api/swap/:id/respond  — accept or reject
const respondToRequest = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only receiver can respond
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/swap/:id  — cancel a sent request
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

module.exports = {
  sendSwapRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
  cancelRequest
};