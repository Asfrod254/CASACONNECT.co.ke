import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

function makeSessionToken(user) {
  const payload = {
    id: user.id || 'u-1',
    email: user.email || 'jane@example.com',
    role: user.role || 'tenant',
    name: user.name || 'Jane Doe',
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const encoded = window.btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `header.${encoded}.signature`;
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

test('redirects the app root to the tenant login screen for security', () => {
  window.history.pushState({}, '', '/');
  render(<App />);

  expect(screen.getByRole('heading', { name: /Rent smarter/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
});

test('renders the CasaConnect user portal shell', () => {
  const session = { token: makeSessionToken({ role: 'tenant', email: 'jane@example.com', name: 'Jane Doe' }), user: { role: 'tenant', email: 'jane@example.com', name: 'Jane Doe' } };
  window.localStorage.setItem('casaconnect_session', JSON.stringify(session));
  window.history.pushState({}, '', '/user');
  render(<App />);

  expect(screen.getByText(/CasaConnect/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Welcome back/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Properties/i).length).toBeGreaterThan(0);
});

test('shows password recovery guidance and support contact on login pages', () => {
  window.history.pushState({}, '', '/user/login');
  render(<App />);

  expect(screen.getByText(/Forgot your password\?/i)).toBeInTheDocument();
  expect(screen.getByText(/0102686169/i)).toBeInTheDocument();
});

test('shows profile and logout controls in the user shell', () => {
  const session = { token: makeSessionToken({ role: 'tenant', email: 'jane@example.com', name: 'Jane Doe' }), user: { role: 'tenant', email: 'jane@example.com', name: 'Jane Doe' } };
  window.localStorage.setItem('casaconnect_session', JSON.stringify(session));
  window.history.pushState({}, '', '/user/profile');
  render(<App />);

  expect(screen.getAllByText(/Jane Doe/i).length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
});

test('uses the CasaConnect title and exposes the landlord add-property form', () => {
  const session = { token: makeSessionToken({ role: 'landlord', email: 'landlord@casaconnect.com', name: 'Landlord User' }), user: { role: 'landlord', email: 'landlord@casaconnect.com', name: 'Landlord User' } };
  window.localStorage.setItem('casaconnect_session', JSON.stringify(session));
  window.history.pushState({}, '', '/landlord/properties/new');
  render(<App />);

  expect(document.title.toLowerCase()).toBe('casaconnect');
  expect(screen.getByRole('heading', { name: /new property/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/title \*/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/upload property image/i)).toBeInTheDocument();
});

test('shows the phone field on the landlord creation form', () => {
  const session = { token: makeSessionToken({ role: 'admin', email: 'admin@casaconnect.com', name: 'Admin User' }), user: { role: 'admin', email: 'admin@casaconnect.com', name: 'Admin User' } };
  window.localStorage.setItem('casaconnect_session', JSON.stringify(session));
  window.history.pushState({}, '', '/admin/landlords');
  render(<App />);

  expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
});

test('rejects rent values that exceed the supported database limit', async () => {
  const session = { token: makeSessionToken({ role: 'landlord', email: 'landlord@casaconnect.com', name: 'Landlord User' }), user: { role: 'landlord', email: 'landlord@casaconnect.com', name: 'Landlord User' } };
  window.localStorage.setItem('casaconnect_session', JSON.stringify(session));
  window.history.pushState({}, '', '/landlord/properties/new');
  render(<App />);

  fireEvent.change(screen.getByLabelText(/title \*/i), { target: { value: 'Test apartment' } });
  fireEvent.change(screen.getByLabelText(/city \*/i), { target: { value: 'Nairobi' } });
  fireEvent.change(screen.getByLabelText(/address \*/i), { target: { value: 'Westlands' } });
  fireEvent.change(screen.getByLabelText(/monthly rent \(kes\) \*/i), { target: { value: '22222222222' } });

  fireEvent.click(screen.getByRole('button', { name: /create property/i }));

  expect(await screen.findByText(/rent must be a valid positive amount/i)).toBeInTheDocument();
});
