const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const sampleUsers = [
  {
    name: 'Administrator',
    email: 'admin@imovies.com',
    password: 'Admin@Password123',
    role: 'admin',
    phone: '+1 555-0199',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Alex Johnson',
    email: 'user@imovies.com',
    password: 'User@Password123',
    role: 'user',
    phone: '+1 555-0144',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
];

const sampleTheatres = [
  {
    name: 'IMovies Grand IMAX - Manhattan',
    city: 'New York',
    location: 'Times Square, Manhattan',
    address: '1540 Broadway, New York, NY 10036',
    totalScreens: 3,
    screens: [
      {
        screenNumber: 1,
        name: 'IMAX Laser Screen 1',
        screenType: 'IMAX',
        rows: 8,
        cols: 12,
        seatLayout: {
          silverRows: ['A', 'B', 'C'],
          goldRows: ['D', 'E', 'F'],
          vipRows: ['G', 'H'],
        },
      },
      {
        screenNumber: 2,
        name: 'Dolby Atmos Screen 2',
        screenType: 'DOLBY_ATMOS',
        rows: 8,
        cols: 12,
        seatLayout: {
          silverRows: ['A', 'B', 'C'],
          goldRows: ['D', 'E', 'F'],
          vipRows: ['G', 'H'],
        },
      },
    ],
    amenities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Seating', 'VIP Lounge', 'Gourmet Dining'],
  },
  {
    name: 'IMovies Dolby Cinema - Downtown LA',
    city: 'Los Angeles',
    location: 'Downtown L.A. Live',
    address: '1000 W Olympic Blvd, Los Angeles, CA 90015',
    totalScreens: 2,
    screens: [
      {
        screenNumber: 1,
        name: 'Screen 1 Luxe',
        screenType: 'DOLBY_ATMOS',
        rows: 8,
        cols: 12,
        seatLayout: {
          silverRows: ['A', 'B', 'C'],
          goldRows: ['D', 'E', 'F'],
          vipRows: ['G', 'H'],
        },
      },
    ],
    amenities: ['Dolby Vision', 'Premium Sound', 'Valet Parking', 'Cocktail Bar'],
  },
  {
    name: 'IMovies Leicester Square',
    city: 'London',
    location: 'West End',
    address: 'Leicester Square, London WC2H 7NA, UK',
    totalScreens: 2,
    screens: [
      {
        screenNumber: 1,
        name: 'Royal Screen 1',
        screenType: 'IMAX',
        rows: 8,
        cols: 12,
        seatLayout: {
          silverRows: ['A', 'B', 'C'],
          goldRows: ['D', 'E', 'F'],
          vipRows: ['G', 'H'],
        },
      },
    ],
    amenities: ['Laser Projection', 'Full Bar', 'Reserved Seating', 'Costa Coffee'],
  },
  {
    name: 'IMovies Phoenix Palladium',
    city: 'Mumbai',
    location: 'Lower Parel',
    address: 'Senapati Bapat Marg, Lower Parel, Mumbai 400013',
    totalScreens: 2,
    screens: [
      {
        screenNumber: 1,
        name: 'Screen 1 IMAX',
        screenType: 'IMAX',
        rows: 8,
        cols: 12,
        seatLayout: {
          silverRows: ['A', 'B', 'C'],
          goldRows: ['D', 'E', 'F'],
          vipRows: ['G', 'H'],
        },
      },
    ],
    amenities: ['IMAX 3D', 'Dolby Atmos', 'Gourmet Popcorn', 'Valet Parking'],
  },
];

const sampleMovies = [
  {
    title: 'Dune: Part Two',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    posterUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    languages: ['English', 'Spanish'],
    durationMinutes: 166,
    releaseDate: new Date('2024-03-01'),
    rating: 8.6,
    formats: ['2D', '3D', 'IMAX'],
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
    director: 'Denis Villeneuve',
    certificate: 'PG-13',
    status: 'NOW_SHOWING',
  },
  {
    title: 'Oppenheimer',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, examining the deep moral dilemmas and political fallout.',
    posterUrl:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    genres: ['Biography', 'Drama', 'History'],
    languages: ['English', 'German'],
    durationMinutes: 180,
    releaseDate: new Date('2023-07-21'),
    rating: 8.9,
    formats: ['2D', 'IMAX'],
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    director: 'Christopher Nolan',
    certificate: 'R',
    status: 'NOW_SHOWING',
  },
  {
    title: 'Interstellar',
    description:
      'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    languages: ['English'],
    durationMinutes: 169,
    releaseDate: new Date('2014-11-07'),
    rating: 8.7,
    formats: ['2D', 'IMAX'],
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    director: 'Christopher Nolan',
    certificate: 'PG-13',
    status: 'NOW_SHOWING',
  },
  {
    title: 'Inception',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    posterUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    languages: ['English', 'Japanese', 'French'],
    durationMinutes: 148,
    releaseDate: new Date('2010-07-16'),
    rating: 8.8,
    formats: ['2D', 'IMAX'],
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy', 'Ken Watanabe'],
    director: 'Christopher Nolan',
    certificate: 'PG-13',
    status: 'NOW_SHOWING',
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    posterUrl:
      'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1400&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    genres: ['Animation', 'Action', 'Adventure'],
    languages: ['English', 'Spanish'],
    durationMinutes: 140,
    releaseDate: new Date('2023-06-02'),
    rating: 8.7,
    formats: ['2D', '3D', 'IMAX'],
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Jake Johnson'],
    director: 'Joaquim Dos Santos, Kemp Powers',
    certificate: 'PG',
    status: 'NOW_SHOWING',
  },
  {
    title: 'Gladiator II',
    description:
      'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
    posterUrl:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    genres: ['Action', 'Drama', 'Adventure'],
    languages: ['English'],
    durationMinutes: 148,
    releaseDate: new Date('2024-11-22'),
    rating: 8.2,
    formats: ['2D', 'IMAX'],
    cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
    director: 'Ridley Scott',
    certificate: 'R',
    status: 'UPCOMING',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Show.deleteMany({});
    await Seat.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Creating Users...');
    const createdUsers = [];
    for (const u of sampleUsers) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }
    console.log(`[Seed] Created ${createdUsers.length} users. Admin email: admin@imovies.com`);

    console.log('[Seed] Creating Theatres...');
    const createdTheatres = await Theatre.insertMany(sampleTheatres);
    console.log(`[Seed] Created ${createdTheatres.length} theatres.`);

    console.log('[Seed] Creating Movies...');
    const createdMovies = await Movie.insertMany(sampleMovies);
    console.log(`[Seed] Created ${createdMovies.length} movies.`);

    // Generate dates: today, tomorrow, day after tomorrow
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const showTimes = [
      { start: '10:30', end: '13:15' },
      { start: '14:30', end: '17:15' },
      { start: '18:15', end: '21:00' },
      { start: '21:45', end: '00:30' },
    ];

    console.log('[Seed] Generating Shows and Seat Matrices...');
    let totalShowsCount = 0;
    let totalSeatsCount = 0;

    for (const theatre of createdTheatres) {
      for (const movie of createdMovies.filter((m) => m.status === 'NOW_SHOWING')) {
        for (const date of dates) {
          // Schedule 2 shows per day per movie per theatre
          for (const time of showTimes.slice(0, 2)) {
            const pricing = {
              silver: 15,
              gold: 22,
              vip: 35,
            };

            const show = await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screenNumber: 1,
              screenType: 'IMAX',
              date,
              startTime: time.start,
              endTime: time.end,
              pricing,
              totalSeats: 96,
              availableSeats: 96,
              status: 'SCHEDULED',
            });

            totalShowsCount++;

            // Create 96 seats (A to H, 1 to 12)
            const seatDocs = [];
            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            for (const r of rows) {
              let tier = 'SILVER';
              let price = pricing.silver;
              if (['G', 'H'].includes(r)) {
                tier = 'VIP';
                price = pricing.vip;
              } else if (['D', 'E', 'F'].includes(r)) {
                tier = 'GOLD';
                price = pricing.gold;
              }

              for (let c = 1; c <= 12; c++) {
                seatDocs.push({
                  show: show._id,
                  seatNumber: `${r}${c}`,
                  row: r,
                  col: c,
                  tier,
                  price,
                  status: 'AVAILABLE',
                  lockedBy: null,
                  lockedAt: null,
                });
              }
            }

            // Reserve a few seats randomly to simulate a live theatre
            const sampleBookedSeats = ['D6', 'D7', 'E6', 'E7'];
            seatDocs.forEach((s) => {
              if (sampleBookedSeats.includes(s.seatNumber)) {
                s.status = 'BOOKED';
              }
            });

            await Seat.insertMany(seatDocs);
            totalSeatsCount += seatDocs.length;

            show.availableSeats = seatDocs.filter((s) => s.status === 'AVAILABLE').length;
            await show.save();
          }
        }
      }
    }

    console.log(
      `[Seed] Successfully created ${totalShowsCount} shows with ${totalSeatsCount} individual seats!`
    );
    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
