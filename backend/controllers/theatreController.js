const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const { APIError } = require('../middleware/errorHandler');

// @desc    Get all theatres with optional city filter
// @route   GET /api/theatres
// @access  Public
const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    let query = {};

    if (city && city !== 'All Cities') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const theatres = await Theatre.find(query).sort('city name');

    res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return next(new APIError('Theatre not found', 404));
    }

    res.status(200).json({
      success: true,
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre
// @route   POST /api/theatres
// @access  Private/Admin
const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre details
// @route   PUT /api/theatres/:id
// @access  Private/Admin
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theatre) {
      return next(new APIError('Theatre not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully',
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return next(new APIError('Theatre not found', 404));
    }

    // Check for existing shows
    const showsCount = await Show.countDocuments({ theatre: theatre._id });
    if (showsCount > 0) {
      return next(
        new APIError(
          `Cannot delete theatre with ${showsCount} associated shows. Cancel or remove shows first.`,
          400
        )
      );
    }

    await theatre.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Theatre deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
