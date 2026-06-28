const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');

// @GET /api/messages/:swapId
const getMessages = async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.swapId);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    const isPartOfSwap =
      swap.sender.toString() === req.user._id.toString() ||
      swap.receiver.toString() === req.user._id.toString();

    if (!isPartOfSwap) return res.status(403).json({ message: 'Not authorized' });

    const messages = await Message.find({ swapRequest: req.params.swapId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMessages };