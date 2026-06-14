const CallRequest = require('../models/CallRequest');

/**
 * @desc    Create a human help / call request
 * @route   POST /api/support/call-request
 * @access  Private (logged-in users)
 */
exports.createCallRequest = async (req, res, next) => {
  try {
    const { topic, note } = req.body;

   
    if (!topic || !note) {
      return res.status(400).json({
        success: false,
        message: 'Topic and note are required',
      });
    }

   
    const callRequest = await CallRequest.create({
      user: req.user._id,
      topic,
      note,
      status: 'pending', 
    });

    res.status(201).json({
      success: true,
      message: 'Call request submitted successfully',
      data: callRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all call requests (Admin / future use)
 * @route   GET /api/support/call-requests
 * @access  Private (Admin later)
 */

exports.getAllCallRequests = async (req, res, next) => {
  try {
    const requests = await CallRequest.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Update call request status
 * @route   PATCH /api/support/call-request/:id
 * @access  Private (Admin later)
 */


exports.updateCallRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const request = await CallRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Call request not found',
      });
    }

    request.status = status || request.status;
    await request.save();

    res.json({
      success: true,
      message: 'Call request updated',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
