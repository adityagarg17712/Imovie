const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const { APIError } = require('../middleware/errorHandler');

// @desc    Get all movies with search, filter, pagination
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      format,
      status = 'NOW_SHOWING',
      city,
      page = 1,
      limit = 12,
      sort = '-rating',
    } = req.query;

    let query = {};

    // Filter by status if not "ALL"
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Filter by genre
    if (genre && genre !== 'All Genres') {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }

    // Filter by language
    if (language && language !== 'All Languages') {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }

    // Filter by format
    if (format && format !== 'All Formats') {
      query.formats = { $in: [format] };
    }

    // Search query on title, director, cast, description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { director: { $regex: search.trim(), $options: 'i' } },
        { cast: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // City filter: Find theatres in the city, find active shows, get movie IDs
    if (city && city !== 'All Cities') {
      const theatres = await Theatre.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
      }).select('_id');
      const theatreIds = theatres.map((t) => t._id);

      const shows = await Show.find({
        theatre: { $in: theatreIds },
        status: { $in: ['SCHEDULED', 'ACTIVE'] },
      }).distinct('movie');

      query._id = { $in: shows };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: movies.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum,
      },
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID with upcoming shows summary
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return next(new APIError('Movie not found', 404));
    }

    // Fetch unique dates where this movie has shows
    const upcomingShowDates = await Show.find({
      movie: movie._id,
      status: { $in: ['SCHEDULED', 'ACTIVE'] },
    }).distinct('date');

    upcomingShowDates.sort();

    res.status(200).json({
      success: true,
      data: {
        movie,
        availableDates: upcomingShowDates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter options (genres, languages, cities)
// @route   GET /api/movies/filters/options
// @access  Public
const getFilterOptions = async (req, res, next) => {
  try {
    const genres = await Movie.distinct('genres');
    const languages = await Movie.distinct('languages');
    const cities = await Theatre.distinct('city');

    res.status(200).json({
      success: true,
      data: {
        genres: genres.filter(Boolean).sort(),
        languages: languages.filter(Boolean).sort(),
        cities: cities.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
const createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie details
// @route   PUT /api/movies/:id
// @access  Private/Admin
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return next(new APIError('Movie not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return next(new APIError('Movie not found', 404));
    }

    // Check if there are active bookings or shows
    const activeShows = await Show.countDocuments({
      movie: movie._id,
      status: { $in: ['SCHEDULED', 'ACTIVE'] },
    });

    if (activeShows > 0) {
      return next(
        new APIError(
          `Cannot delete movie with ${activeShows} active scheduled shows. Archive it or cancel shows first.`,
          400
        )
      );
    }

    await movie.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  getFilterOptions,
  createMovie,
  updateMovie,
  deleteMovie,
};
