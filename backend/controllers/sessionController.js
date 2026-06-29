const Session = require('../models/Session');
const SwapRequest = require('../models/SwapRequest');

// @POST /api/session/propose
const proposeSession = async (req, res) => {
  const { swapRequestId, scheduledAt, mode, meetingLink, location, notes } = req.body;
  try {
    const swap = await SwapRequest.findById(swapRequestId);
    if (!swap || swap.status !== 'accepted')
      return res.status(400).json({ message: 'Swap must be accepted first' });

    const isPartOfSwap =
      swap.sender.toString() === req.user._id.toString() ||
      swap.receiver.toString() === req.user._id.toString();
    if (!isPartOfSwap) return res.status(403).json({ message: 'Not authorized' });

    // Cancel any existing proposed session for this swap
    await Session.updateMany(
      { swapRequest: swapRequestId, status: 'proposed' },
      { status: 'cancelled' }
    );

    const session = await Session.create({
      swapRequest: swapRequestId,
      proposedBy: req.user._id,
      scheduledAt,
      mode,
      meetingLink,
      location,
      notes,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/session/:id/confirm
const confirmSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('swapRequest');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const swap = session.swapRequest;
    const isPartOfSwap =
      swap.sender.toString() === req.user._id.toString() ||
      swap.receiver.toString() === req.user._id.toString();
    if (!isPartOfSwap) return res.status(403).json({ message: 'Not authorized' });

    session.status = 'confirmed';
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/session/:id/complete
const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('swapRequest');
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'completed';
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/session/:id/cancel
const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.status = 'cancelled';
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/session/swap/:swapId
const getSessionBySwap = async (req, res) => {
  try {
    const session = await Session.findOne({ swapRequest: req.params.swapId })
      .populate('proposedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(session || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/session/mine
const getMySessions = async (req, res) => {
  try {
    const swaps = await SwapRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: 'accepted',
    });
    const swapIds = swaps.map(s => s._id);
    const sessions = await Session.find({ swapRequest: { $in: swapIds } })
      .populate({ path: 'swapRequest', populate: { path: 'sender receiver', select: 'name college' } })
      .populate('proposedBy', 'name')
      .sort({ scheduledAt: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { proposeSession, confirmSession, completeSession, cancelSession, getSessionBySwap, getMySessions };
