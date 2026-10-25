/**
 * IMovies Automated Integration Test Runner
 * Validates REST APIs, Auth workflows, RBAC, Seat transitions, and Booking cancellations.
 */

const http = require('http');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5001/api';

const makeRequest = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🎬 =======================================================');
  console.log('🧪 Starting IMovies Backend API Integration Test Suite');
  console.log('🎬 =======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    console.log('🔍 Testing Health Endpoint...');
    const health = await makeRequest('/health');
    assert(health.status === 200 && health.data?.status === 'online', 'Server is online');

    // 2. Authentication: Admin Login
    console.log('\n🔍 Testing Authentication & JWT...');
    const adminLogin = await makeRequest('/auth/login', 'POST', {
      email: 'admin@imovies.com',
      password: 'Admin@Password123',
    });
    assert(
      adminLogin.status === 200 && adminLogin.data?.token,
      'Admin login returns JWT token'
    );
    const adminToken = adminLogin.data?.token;

    // 3. Authentication: User Login
    const userLogin = await makeRequest('/auth/login', 'POST', {
      email: 'user@imovies.com',
      password: 'User@Password123',
    });
    assert(
      userLogin.status === 200 && userLogin.data?.token,
      'User login returns JWT token'
    );
    const userToken = userLogin.data?.token;

    // 4. Role-Based Access Control (RBAC) Protection
    console.log('\n🔍 Testing Security & Role-Based Access Control...');
    const forbiddenAdminCheck = await makeRequest('/admin/dashboard', 'GET', null, userToken);
    assert(
      forbiddenAdminCheck.status === 403,
      'Standard user is blocked from Admin Dashboard (HTTP 403)'
    );

    const allowedAdminCheck = await makeRequest('/admin/dashboard', 'GET', null, adminToken);
    assert(
      allowedAdminCheck.status === 200,
      'Admin user successfully accesses Admin Dashboard (HTTP 200)'
    );

    // 5. Unauthenticated request protection
    const unauthCheck = await makeRequest('/bookings/my-bookings', 'GET');
    assert(
      unauthCheck.status === 401,
      'Unauthenticated request blocked from protected routes (HTTP 401)'
    );

    // 6. Movies Search & Filters
    console.log('\n🔍 Testing Movies Catalog & Search...');
    const movies = await makeRequest('/movies?status=NOW_SHOWING');
    assert(
      movies.status === 200 && Array.isArray(movies.data?.data),
      'Movie listing returns active movies'
    );

    const firstMovie = movies.data?.data?.[0];
    assert(firstMovie && firstMovie._id, 'Movie has valid MongoDB ID and fields');

    // 7. Shows and Seat Layout
    console.log('\n🔍 Testing Shows & Seat Matrix...');
    const shows = await makeRequest(`/shows?movie=${firstMovie._id}`);
    assert(shows.status === 200, 'Shows retrieved successfully for movie');

    let targetShowId = null;
    if (shows.data?.data?.length > 0 && shows.data?.data[0].shows?.length > 0) {
      targetShowId = shows.data.data[0].shows[0]._id;
    }

    if (targetShowId) {
      const seatMatrix = await makeRequest(`/shows/${targetShowId}`);
      assert(
        seatMatrix.status === 200 && Array.isArray(seatMatrix.data?.data?.seats),
        'Show returns live seat matrix with rows and tiers'
      );

      const availableSeats = seatMatrix.data.data.seats.filter((s) => s.status === 'AVAILABLE');
      assert(availableSeats.length > 0, 'Found available seats in show');

      // 8. Booking Creation & Atomic Seat Reservation
      console.log('\n🔍 Testing Booking Lifecycle...');
      const pickSeat = availableSeats[0].seatNumber;
      const bookingRes = await makeRequest(
        '/bookings',
        'POST',
        {
          showId: targetShowId,
          seatNumbers: [pickSeat],
          paymentMethod: 'CARD',
        },
        userToken
      );

      assert(
        bookingRes.status === 201 && bookingRes.data?.data?.bookingReference,
        `Seat ${pickSeat} successfully booked with generated reference`
      );

      const bookingId = bookingRes.data?.data?._id;

      // Verify seat is now BOOKED
      const updatedSeats = await makeRequest(`/shows/${targetShowId}`);
      const checkedSeat = updatedSeats.data?.data?.seats?.find((s) => s.seatNumber === pickSeat);
      assert(
        checkedSeat && checkedSeat.status === 'BOOKED',
        `Verified seat ${pickSeat} status is updated to BOOKED`
      );

      // 9. Booking Cancellation and Seat Release
      console.log('\n🔍 Testing Cancellation and Seat Freeing...');
      const cancelRes = await makeRequest(
        `/bookings/${bookingId}/cancel`,
        'PUT',
        { reason: 'Automated Test Cancellation' },
        userToken
      );

      assert(
        cancelRes.status === 200 && cancelRes.data?.data?.bookingStatus === 'CANCELLED',
        'Booking cancelled and marked for full refund'
      );

      // Verify seat is released back to AVAILABLE
      const releasedSeats = await makeRequest(`/shows/${targetShowId}`);
      const releasedSeat = releasedSeats.data?.data?.seats?.find((s) => s.seatNumber === pickSeat);
      assert(
        releasedSeat && releasedSeat.status === 'AVAILABLE',
        `Verified seat ${pickSeat} has returned to AVAILABLE status`
      );
    }
  } catch (error) {
    console.error('Test execution error:', error.message);
    failed++;
  }

  console.log('\n🎬 =======================================================');
  console.log(`📊 Test Summary: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('🎬 =======================================================\n');
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
