import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CustomerLayout from '../layouts/customer/CustomerLayout';
import AdminLayout from '../layouts/admin/AdminLayout';
import { AdminRoute, ProtectedRoute } from '../routes/RouteGuards';
import HomePage from '../pages/public/HomePage';
import MoviesPage from '../pages/public/MoviesPage';
import MovieDetailsPage from '../pages/public/MovieDetailsPage';
import AuthPage from '../pages/auth/AuthPage';
import ProfilePage from '../pages/customer/ProfilePage';
import SeatSelectionPage from '../pages/customer/SeatSelectionPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import BookingSuccessPage from '../pages/customer/BookingSuccessPage';
import BookingsPage from '../pages/customer/BookingsPage';
import BookingDetailsPage from '../pages/customer/BookingDetailsPage';
import DashboardPage from '../pages/admin/DashboardPage';
import MoviesAdminPage from '../pages/admin/MoviesAdminPage';
import CinemasAdminPage from '../pages/admin/CinemasAdminPage';
import ShowsAdminPage from '../pages/admin/ShowsAdminPage';
import BookingsAdminPage from '../pages/admin/BookingsAdminPage';
import { NotFoundPage, UnauthorizedPage } from '../pages/public/StatusPages';

export default function App() {
  return <BrowserRouter><Routes><Route element={<CustomerLayout />}>
    <Route index element={<HomePage />} /><Route path="movies" element={<MoviesPage />} /><Route path="movies/:movieId" element={<MovieDetailsPage />} />
    <Route path="login" element={<AuthPage mode="login" />} /><Route path="register" element={<AuthPage mode="register" />} /><Route path="unauthorized" element={<UnauthorizedPage />} />
    <Route element={<ProtectedRoute />}><Route path="profile" element={<ProfilePage />} /><Route path="shows/:showId/seats" element={<SeatSelectionPage />} /><Route path="checkout/:bookingId" element={<CheckoutPage />} /><Route path="booking-success/:bookingId" element={<BookingSuccessPage />} /><Route path="bookings" element={<BookingsPage />} /><Route path="bookings/:bookingId" element={<BookingDetailsPage />} />
      <Route element={<AdminRoute />}><Route path="admin" element={<AdminLayout />}><Route index element={<DashboardPage />} /><Route path="movies" element={<MoviesAdminPage />} /><Route path="cinemas" element={<CinemasAdminPage />} /><Route path="shows" element={<ShowsAdminPage />} /><Route path="bookings" element={<BookingsAdminPage />} /></Route></Route>
    </Route><Route path="*" element={<NotFoundPage />} />
  </Route></Routes></BrowserRouter>;
}
