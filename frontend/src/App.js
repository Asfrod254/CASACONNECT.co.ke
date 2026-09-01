import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Bell,
  Building2,
  CreditCard,
  FileCheck2,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  MessageSquareText,
  Pencil,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  UserCircle2,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  getAdminLandlords,
  getAdminMessages,
  getAdminRequests,
  updateAdminRequest,
  deleteAdminResource,
  forgotPassword,
  resetPassword,
  createLandlord,
  createPayment,
  createProperty,
  createRentalRequest,
  createRealtimeClient,
  createReview,
  deleteProperty,
  getAdminAnalytics,
  getAdminData,
  getAdminStats,
  getMessages,
  getMyProperties,
  getPayments,
  getProperties,
  getProperty,
  getRentalRequests,
  getReviews,
  loginUser,
  sendMessage,
  signupUser,
  updateAdminResource,
  updateProfile,
  updateProperty,
  updateRentalRequest,
} from './api';
import './App.css';

const LOGO = process.env.PUBLIC_URL + '/casaconnect-logo.png';

function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="splash">
      <div className="splash-inner">
        <img src={LOGO} alt="CasaConnect" className="splash-logo" />
        <h1 className="splash-title">CasaConnect</h1>
        <p className="splash-sub">Rent smarter, live better.</p>
        <div className="splash-bar"><span /></div>
      </div>
    </div>
  );
}

function Skeleton({ width, height, radius, style }) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius ?? 10, display: 'block', ...style }} />;
}

function SkeletonCard() {
  return (
    <div className="property-card">
      <Skeleton height={160} radius={0} />
      <div className="property-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <Skeleton height={16} width="70%" />
        <Skeleton height={12} width="50%" />
        <Skeleton height={12} width="40%" />
        <Skeleton height={36} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="list-row" style={{ gap: '0.8rem' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Skeleton height={14} width="60%" />
        <Skeleton height={11} width="40%" />
      </div>
      <Skeleton height={24} width={70} radius={999} />
    </div>
  );
}

const FAQ = [
  { q: 'How do I submit a rental request?', a: 'Browse Properties, open a listing, write a short intro and click "Send rental request".' },
  { q: 'How long does approval take?', a: 'Landlords typically respond within 24–48 hours. Track status under Requests.' },
  { q: 'Can I message a landlord directly?', a: 'Yes — once you send a request, the Messages tab opens a live chat with the landlord.' },
  { q: 'How do I update my profile?', a: 'Go to Profile in the sidebar, fill in your details and click Save profile.' },
  { q: 'What payment methods are supported?', a: 'M-Pesa, Stripe, and bank transfer are all supported when recording a payment.' },
  { q: 'How do I list a property?', a: 'Go to Properties → Add a property. Your listing is reviewed by admin before going live.' },
  { q: 'How do I approve a tenant request?', a: 'Open Requests in your sidebar, find the request and click Approve.' },
  { q: 'Can I edit a listing after publishing?', a: 'Yes — click Edit next to any property in your Properties list.' },
];

function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('home');
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! How can we help you today?' }]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const userMsg = draft.trim();
    setDraft('');
    setMessages((prev) => [...prev, { from: 'user', text: userMsg }]);
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      const match = FAQ.find((f) => f.q.toLowerCase().split(' ').some((w) => w.length > 3 && lower.includes(w)));
      const reply = match ? match.a : 'Thanks for reaching out! Our team will follow up via email within 24 hours.';
      setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
    }, 700);
  };

  return (
    <>
      <button className="support-fab" onClick={() => setOpen((o) => !o)} aria-label="Support">
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div className="support-widget">
          <div className="support-header">
            <img src={LOGO} alt="" className="support-logo" />
            <div>
              <strong>CasaConnect Support</strong>
              <small>We usually reply instantly</small>
            </div>
          </div>
          {view === 'home' && (
            <div className="support-home">
              <p className="support-greeting">👋 Hi there! How can we help?</p>
              <button className="support-option" onClick={() => setView('faq')}><span>📖</span><span>Browse FAQs</span></button>
              <button className="support-option" onClick={() => setView('chat')}><span>💬</span><span>Chat with us</span></button>
            </div>
          )}
          {view === 'faq' && (
            <div className="support-faq">
              <button className="support-back" onClick={() => { setView('home'); setActive(null); }}>← Back</button>
              {FAQ.map((item, i) => (
                <div key={i} className="faq-item">
                  <button className="faq-q" onClick={() => setActive(active === i ? null : i)}>
                    {item.q}<span>{active === i ? '▲' : '▼'}</span>
                  </button>
                  {active === i && <p className="faq-a">{item.a}</p>}
                </div>
              ))}
            </div>
          )}
          {view === 'chat' && (
            <div className="support-chat">
              <button className="support-back" onClick={() => setView('home')}>← Back</button>
              <div className="support-messages">
                {messages.map((m, i) => (
                  <div key={i} className={`support-msg ${m.from}`}>{m.text}</div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="support-composer" onSubmit={sendMessage}>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" />
                <button type="submit" className="primary-button small-button">Send</button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

const userNav = [
  { label: 'Home', to: '/tenant', icon: Home },
  { label: 'Properties', to: '/tenant/properties', icon: Building2 },
  { label: 'Requests', to: '/tenant/requests', icon: FileCheck2 },
  { label: 'Messages', to: '/tenant/messages', icon: MessageSquareText },
  { label: 'Profile', to: '/tenant/profile', icon: UserCircle2 },
];

const adminNav = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', to: '/admin/analytics', icon: TrendingUp },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Landlords', to: '/admin/landlords', icon: UserCog },
  { label: 'Properties', to: '/admin/properties', icon: Building2 },
  { label: 'Requests', to: '/admin/requests', icon: FileCheck2 },
  { label: 'Messages', to: '/admin/messages', icon: MessageSquareText },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

const landlordNav = [
  { label: 'Dashboard', to: '/landlord', icon: LayoutDashboard },
  { label: 'Properties', to: '/landlord/properties', icon: Building2 },
  { label: 'Requests', to: '/landlord/requests', icon: FileCheck2 },
  { label: 'Messages', to: '/landlord/messages', icon: MessageSquareText },
];

const SESSION_KEY = 'casaconnect_session';

function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedSession = window.localStorage.getItem(SESSION_KEY);
    const session = savedSession ? JSON.parse(savedSession) : null;
    if (!session?.token) return null;

    const tokenPayload = JSON.parse(window.atob(session.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (tokenPayload.exp && tokenPayload.exp * 1000 <= Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(session) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

function getPortalHome(role) {
  switch (role) {
    case 'admin': return '/admin';
    case 'landlord': return '/landlord';
    case 'tenant':
    default: return '/tenant';
  }
}

function ProtectedRoute({ allowedRoles, fallbackPath, children }) {
  const session = getStoredSession();

  if (!session?.token) {
    return <Navigate to={fallbackPath || '/tenant/login'} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user?.role)) {
    const redirectPath = getPortalHome(session.user?.role) || fallbackPath || '/tenant/login';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function RootRedirect() {
  const session = getStoredSession();
  if (!session?.token) return <Navigate to="/tenant/login" replace />;
  return <Navigate to={getPortalHome(session.user?.role)} replace />;
}

function UserShell({ title, subtitle, children }) {
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div>
            <strong>CasaConnect</strong>
            <small>Tenant portal</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {userNav.map(({ label, to, icon: Icon }) => (
            <NavLink key={label} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <p>Tenant status</p>
          <strong>Verified</strong>
          <span><ShieldCheck size={16} /> Secure profile active</span>
        </div>
      </aside>

      <main className="portal-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Tenant workspace</p>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search homes or requests" aria-label="Search" />
            </div>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
              <span className="badge">2</span>
            </button>
          </div>
        </header>

        <div className="page-subhead">
          <p>{subtitle}</p>
          <Link className="primary-button" to="/tenant/properties">
            Browse homes
            <ArrowRight size={16} />
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
}

function AdminShell({ title, subtitle, children }) {
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div>
            <strong>CasaConnect</strong>
            <small>Admin portal</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {adminNav.map(({ label, to, icon: Icon }) => (
            <NavLink key={label} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <p>System access</p>
          <strong>Admin</strong>
          <span><ShieldCheck size={16} /> RBAC enforced</span>
        </div>
      </aside>

      <main className="portal-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations center</p>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search users or listings" aria-label="Search" />
            </div>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
              <span className="badge">3</span>
            </button>
          </div>
        </header>

        <div className="page-subhead">
          <p>{subtitle}</p>
          <button className="primary-button" type="button">
            Export report
            <FileText size={16} />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}

function LandlordShell({ title, subtitle, children }) {
  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div>
            <strong>CasaConnect</strong>
            <small>Landlord portal</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {landlordNav.map(({ label, to, icon: Icon }) => (
            <NavLink key={label} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-card">
          <p>Landlord status</p>
          <strong>Approved</strong>
          <span><ShieldCheck size={16} /> Managed account active</span>
        </div>
      </aside>

      <main className="portal-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Portfolio overview</p>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search requests or properties" aria-label="Search" />
            </div>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={18} />
              <span className="badge">1</span>
            </button>
          </div>
        </header>

        <div className="page-subhead">
          <p>{subtitle}</p>
          <Link className="primary-button" to="/landlord/properties/new">
            Add property
            <Building2 size={16} />
          </Link>
        </div>

        {children}
      </main>
    </div>
  );
}

function StatCard({ label, value, detail, accent }) {
  return (
    <div className="stat-card">
      <span className={`stat-accent ${accent}`} />
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function UserDashboardPage() {
  const session = getStoredSession();
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProperties().catch(() => []),
      getRentalRequests(session?.token).catch(() => []),
      getPayments(session?.token).catch(() => []),
    ]).then(([p, r, pay]) => {
      setProperties(p); setRequests(r); setPayments(pay);
    }).finally(() => setLoading(false));
  }, [session?.token]);

  return (
    <UserShell title="Welcome back" subtitle="Track active rentals, requests, and payment activity in one place.">
      <section className="stats-grid">
        <StatCard label="Active rentals" value={requests.filter((request) => request.status === 'approved').length} detail="Approved rental requests" accent="green" />
        <StatCard label="Pending requests" value={requests.filter((request) => request.status === 'pending').length} detail="Awaiting landlord review" accent="orange" />
        <StatCard label="Payments" value={payments.length} detail="Saved payment records" accent="blue" />
        <StatCard label="Available homes" value={properties.length} detail="Live backend listings" accent="purple" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Favorites</p>
              <h3>Recommended homes</h3>
            </div>
            <Link to="/tenant/properties" className="text-link">View all</Link>
          </div>
          <div className="property-grid compact-grid">
            {loading ? [1,2].map((k) => <SkeletonCard key={k} />) : properties.slice(0, 3).map((property) => (
              <article className="property-card" key={property.id}>
                <div className="property-image-placeholder" aria-hidden="true"><Building2 size={28} /></div>
                <div className="property-body">
                  <div className="property-row">
                    <strong>{property.title}</strong>
                    <span>{property.listing_status || 'Available'}</span>
                  </div>
                  <p>{property.address || property.location || 'Location pending'}</p>
                  <div className="meta-row">
                    <span>{property.bedrooms || 0} bed</span>
                    <span>{property.bathrooms || 0} bath</span>
                  </div>
                  <div className="property-footer">
                    <strong>KES {Number(property.rent || property.price || 0).toLocaleString()}</strong>
                    <Link to="/tenant/properties" className="ghost-button">View</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Timeline</p>
              <h3>Recent requests</h3>
            </div>
          </div>
          <div className="list-stack">
            {loading ? [1,2,3].map((k) => <SkeletonRow key={k} />) : requests.slice(0, 5).map((request) => (
              <div className="list-row" key={request.id}>
                <div>
                  <strong>{request.properties?.title || 'Property request'}</strong>
                  <small>{new Date(request.created_at).toLocaleDateString()}</small>
                </div>
                <span className={`status-pill ${request.status}`}>{request.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </UserShell>
  );
}

function UserPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', city: '', maxRent: '', bedrooms: '' });
  const session = getStoredSession();

  const loadProperties = () => {
    setError('');
    setLoading(true);
    getProperties({ token: session?.token, ...filters })
      .then(setProperties)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadProperties, [filters, session?.token]);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  const handleRequest = async (propertyId) => {
    setNotice('');
    setError('');
    try {
      await createRentalRequest(propertyId, 'I am interested in this property.', session?.token);
      setNotice('Your rental request was sent successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to send rental request.');
    }
  };

  return (
    <UserShell title="Properties" subtitle="Browse verified listings filtered to your budget, location, and needs.">
      <div className="filter-row filter-row-wide">
        <label className="filter-field">
          <Search size={14} />
          <input
            placeholder="Search title, address, city"
            value={filters.q}
            onChange={(event) => setFilter('q', event.target.value)}
            aria-label="Search properties"
          />
        </label>
        <label className="filter-field">
          <MapPin size={14} />
          <input
            placeholder="City (e.g. Kilimani)"
            value={filters.city}
            onChange={(event) => setFilter('city', event.target.value)}
            aria-label="Filter by city"
          />
        </label>
        <label className="filter-field">
          <Wallet size={14} />
          <input
            type="number"
            min="0"
            placeholder="Max rent (KES)"
            value={filters.maxRent}
            onChange={(event) => setFilter('maxRent', event.target.value)}
            aria-label="Maximum rent"
          />
        </label>
        <label className="filter-field">
          <BedDouble size={14} />
          <select
            value={filters.bedrooms}
            onChange={(event) => setFilter('bedrooms', event.target.value)}
            aria-label="Minimum bedrooms"
          >
            <option value="">Any beds</option>
            <option value="1">1+ beds</option>
            <option value="2">2+ beds</option>
            <option value="3">3+ beds</option>
          </select>
        </label>
      </div>

      {notice && <p className="auth-success">{notice}</p>}
      {error && <p className="auth-error">{error}</p>}
      <div className="property-grid">
        {loading ? [1,2,3,4,5,6].map((k) => <SkeletonCard key={k} />) : properties.map((property) => {
          const averageRating = property.average_rating || 0;
          return (
            <article className="property-card" key={property.id}>
              <Link to={`/tenant/properties/${property.id}`} className="property-image-placeholder" aria-label={`View ${property.title}`}>
                <Building2 size={28} />
              </Link>
              <div className="property-body">
                <div className="property-row">
                  <strong>{property.title}</strong>
                  <span className="status-pill approved">Verified</span>
                </div>
                <p><MapPin size={13} /> {property.address || property.location || 'Location pending'}</p>
                <div className="meta-row">
                  <span><BedDouble size={13} /> {property.bedrooms || 0} bed</span>
                  <span><Bath size={13} /> {property.bathrooms || 0} bath</span>
                  {averageRating > 0 && <span className="rating-mini"><Star size={13} /> {averageRating}</span>}
                </div>
                <div className="property-footer">
                  <strong>{Number(property.rent || property.price || 0).toLocaleString()} KES</strong>
                  <Link to={`/tenant/properties/${property.id}`} className="ghost-button">View</Link>
                  <button type="button" className="primary-button small-button" onClick={() => handleRequest(property.id)}>Request</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!properties.length && !error && <div className="panel empty-state">No properties match your filters yet.</div>}
    </UserShell>
  );
}

function UserPropertyDetailsPage() {
  const { id } = useParams();
  const session = getStoredSession();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  const loadData = () => {
    Promise.all([getProperty(id, session?.token), getReviews(id)])
      .then(([propertyData, reviewData]) => {
        setProperty(propertyData);
        setReviews(reviewData);
      })
      .catch((loadError) => setError(loadError.message));
  };

  useEffect(loadData, [id, session?.token]);

  const handleRequest = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await createRentalRequest(id, requestMessage.trim() || `I am interested in ${property.title}.`, session?.token);
      setNotice('Your rental request was sent. The landlord has been notified.');
      setRequestMessage('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to send the rental request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (rating, comment) => {
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await createReview(id, rating, comment, session?.token);
      setNotice('Thanks! Your review has been posted.');
      loadData();
      return true;
    } catch (reviewError) {
      setError(reviewError.message || 'Unable to post the review.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !property) {
    return <UserShell title="Property"><p className="auth-error">{error}</p></UserShell>;
  }

  if (!property) {
    return <UserShell title="Property"><div className="empty-state">Loading property…</div></UserShell>;
  }

  return (
    <UserShell
      title={property.title}
      subtitle={`${property.city || 'City'} · Listed for rent on CasaConnect`}
    >
      <div className="detail-grid">
        <div className="detail-main">
          <div className="property-hero" aria-hidden="true"><Building2 size={64} /></div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Overview</p>
                <h3>About this home</h3>
              </div>
            </div>
            <p className="property-description">
              {property.description || 'No description provided by the landlord yet.'}
            </p>
            <div className="meta-row detail-meta">
              <span><BedDouble size={15} /> {property.bedrooms || 0} bedrooms</span>
              <span><Bath size={15} /> {property.bathrooms || 0} bathrooms</span>
              <span><MapPin size={15} /> {property.address || 'Address pending'}</span>
            </div>
            {property.amenities?.length > 0 && (
              <div className="amenity-list">
                {property.amenities.map((amenity, index) => (
                  <span className="chip" key={`${amenity}-${index}`}>{amenity}</span>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Ratings</p>
                <h3>Tenant reviews</h3>
              </div>
            </div>
            {reviews.length === 0 && <p className="empty-state">No reviews yet. Be the first to review this home.</p>}
            <div className="review-stack">
              {reviews.map((review) => (
                <div className="review-item" key={review.id}>
                  <div className="review-head">
                    <div className="mini-avatar">{(review.users?.full_name || 'T').slice(0, 1).toUpperCase()}</div>
                    <div>
                      <strong>{review.users?.full_name || 'Tenant'}</strong>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= review.rating ? 'star-filled' : ''} />
                        ))}
                      </div>
                    </div>
                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                </div>
              ))}
            </div>
            {session?.user?.role === 'tenant' && (
              <ReviewForm existing={reviews.some((review) => review.tenant_id === session?.user?.id)} onSubmit={handleReview} />
            )}
          </div>
        </div>

        <div className="detail-side">
          <div className="panel">
            <p className="eyebrow">Monthly rent</p>
            <div className="price-display">{Number(property.rent).toLocaleString()} KES</div>
            <div className="meta-row">Available from {new Date(property.available_from).toLocaleDateString()}</div>
            {session?.user?.role === 'tenant' && (
              <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.8rem' }}>
                <textarea
                  rows="3"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself and ask any questions…"
                  style={{ resize: 'vertical' }}
                />
                <button type="submit" className="primary-button full-width-button" disabled={submitting}>
                  <Home size={16} /> {submitting ? 'Sending…' : 'Send rental request'}
                </button>
              </form>
            )}
            {session?.user?.role === 'tenant' && (
              <Link to={`/tenant/messages?property=${id}`} className="ghost-button full-width-button" style={{ marginTop: '0.4rem' }}>
                <MessageSquareText size={16} /> Contact landlord
              </Link>
            )}
          </div>
          {notice && <p className="auth-success">{notice}</p>}
          {error && !property ? null : error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    </UserShell>
  );
}

function ReviewForm({ existing, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="review-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        await onSubmit(rating, comment);
        setBusy(false);
      }}
    >
      <p className="eyebrow">{existing ? 'Update your experience' : 'Leave a review'}</p>
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((star) => (
          <button type="button" key={star} onClick={() => setRating(star)} className={star <= rating ? 'star-on' : ''} aria-label={`${star} star`}>
            <Star size={20} />
          </button>
        ))}
      </div>
      <textarea
        rows="3"
        placeholder="Tell other tenants about this home…"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <button type="submit" className="primary-button small-button" disabled={busy}>
        {busy ? 'Posting…' : (existing ? 'Update review' : 'Post review')}
      </button>
    </form>
  );
}

function UserRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const session = getStoredSession();

  useEffect(() => {
    getRentalRequests(session?.token).then(setRequests).catch((loadError) => setError(loadError.message));
  }, [session?.token]);

  return (
    <UserShell title="Requests" subtitle="Track your submitted rental enquiries and all landlord responses.">
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Landlord</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.properties?.title || 'Property'}</td>
                <td>{request.properties?.city || 'Assigned landlord'}</td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                <td><span className={`status-pill ${request.status}`}>{request.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <p className="auth-error">{error}</p>}
        {!requests.length && !error && <p className="empty-state">You have not submitted any rental requests.</p>}
      </div>
    </UserShell>
  );
}

function UserPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ property_id: '', amount: '', currency: 'KES', method: 'mpesa', provider_reference: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const session = getStoredSession();

  const loadPayments = () => getPayments(session?.token).then(setPayments).catch(() => setPayments([]));

  useEffect(() => {
    loadPayments();
    getProperties().then(setProperties).catch(() => setProperties([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice('');
    setError('');
    try {
      await createPayment(form.property_id, form.amount, session?.token, {
        currency: form.currency,
        method: form.method,
        provider_reference: form.provider_reference.trim() || undefined,
      });
      setNotice('Payment recorded successfully.');
      setForm({ property_id: '', amount: '', currency: 'KES', method: 'mpesa', provider_reference: '' });
      loadPayments();
    } catch (payError) {
      setError(payError.message || 'Unable to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserShell title="Payments" subtitle="Monitor rent payments, transaction history, and your payment methods.">
      <div className="panel create-panel" style={{ marginBottom: '1rem' }}>
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">New payment</p>
            <h3>Record a rent payment</h3>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Property *
              <select value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} required>
                <option value="">Select a property</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </label>
            <label>
              Amount (KES) *
              <input type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="45000" />
            </label>
            <label>
              Currency
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="KES">KES</option>
                <option value="USD">USD</option>
              </select>
            </label>
            <label>
              Payment method *
              <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} required>
                <option value="mpesa">M-Pesa</option>
                <option value="stripe">Stripe</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="form-span-two">
              Provider reference (optional)
              <input value={form.provider_reference} onChange={(e) => setForm({ ...form, provider_reference: e.target.value })} placeholder="M-Pesa transaction code, Stripe charge ID, etc." />
            </label>
          </div>
          {notice && <p className="auth-success" style={{ marginTop: '0.8rem' }}>{notice}</p>}
          {error && <p className="auth-error" style={{ marginTop: '0.8rem' }}>{error}</p>}
          <button type="submit" className="primary-button" style={{ marginTop: '0.8rem' }} disabled={submitting}>
            {submitting ? 'Recording…' : 'Record payment'} <CreditCard size={15} />
          </button>
        </form>
      </div>

      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                <td>{payment.currency} {Number(payment.amount).toLocaleString()}</td>
                <td>{payment.method}</td>
                <td>{payment.provider_reference || '—'}</td>
                <td><span className={`status-pill ${payment.status}`}>{payment.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!payments.length && <p className="empty-state">No payment records found.</p>}
      </div>
    </UserShell>
  );
}

function UserMessagesPage() {
  const session = getStoredSession();
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => { getProperties().then(setProperties).catch(() => setProperties([])); }, []);

  useEffect(() => {
    if (!activeProperty && properties.length) {
      setActiveProperty(properties[0].id);
    }
  }, [properties, activeProperty]);

  useEffect(() => {
    if (!activeProperty) return;
    let mounted = true;
    getMessages(activeProperty, session?.token).then((items) => { if (mounted) setMessages(items); }).catch(() => {});

    const supabase = createRealtimeClient(session?.supabaseSession);
    let channel = null;
    if (supabase) {
      channel = supabase
        .channel(`messages-${activeProperty}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `property_id=eq.${activeProperty}`,
        }, (payload) => {
          if (payload.new) setMessages((current) => [...current, payload.new]);
        })
        .subscribe();
    }

    return () => { mounted = false; if (supabase && channel) supabase.removeChannel(channel); };
  }, [activeProperty, session?.token, session?.supabaseSession]);

  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeProperty) return;
    const text = draft.trim();
    setDraft('');
    try {
      await sendMessage(activeProperty, text, session?.token);
    } catch {
      setDraft(text);
    }
  };

  return (
    <UserShell title="Messages" subtitle="Chat securely with landlords and keep a record of property conversations.">
      {properties.length === 0 && <div className="panel empty-state">Send a rental request first to start a conversation.</div>}
      {properties.length > 0 && (
        <div className="panel chat-panel">
          <div className="chat-sidebar">
            {properties.map((property) => (
              <button
                type="button"
                key={property.id}
                className={`conversation-tab ${activeProperty === property.id ? 'active-conversation' : ''}`}
                onClick={() => setActiveProperty(property.id)}
              >
                <strong>{property.title}</strong>
                <small>{property.city || 'Property'}</small>
              </button>
            ))}
          </div>
          <div className="conversation-main">
            <div className="conversation-list">
              {messages.map((item) => (
                <div className={`conversation-item ${item.sender_id === session?.user?.id ? 'mine' : ''}`} key={item.id}>
                  <div className="mini-avatar">{item.sender_id.slice(0, 2).toUpperCase()}</div>
                  <div className="conversation-copy">
                    <div className="conversation-head">
                      <strong>{item.sender_id === session?.user?.id ? 'You' : 'Landlord'}</strong>
                      <small>{new Date(item.created_at).toLocaleString()}</small>
                    </div>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
              {!messages.length && <p className="empty-state">No messages in this conversation yet.</p>}
            </div>
            <form className="composer" onSubmit={send}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message…"
                aria-label="Message"
              />
              <button type="submit" className="primary-button small-button" disabled={!draft.trim()}>
                <Send size={15} /> Send
              </button>
            </form>
          </div>
        </div>
      )}
    </UserShell>
  );
}

function UserProfilePage() {
  const session = getStoredSession();
  const user = session?.user || {};
  const PREFS_KEY = 'cc_tenant_prefs';
  const savedPrefs = (() => { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; } })();
  const [form, setForm] = useState({ full_name: user.name || '', phone: '', preferred_area: '', company: '' });
  const [prefs, setPrefs] = useState({ budget: savedPrefs.budget ?? 150000, petFriendly: savedPrefs.petFriendly ?? false, furnished: savedPrefs.furnished ?? true });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const togglePref = (key) => setPrefs((p) => { const next = { ...p, [key]: !p[key] }; localStorage.setItem(PREFS_KEY, JSON.stringify(next)); return next; });
  const saveBudget = (val) => { const next = { ...prefs, budget: Number(val) }; setPrefs(next); localStorage.setItem(PREFS_KEY, JSON.stringify(next)); };

  const handleSave = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice('');
    setError('');
    try {
      await updateProfile(form, session?.token);
      setNotice('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserShell title="Profile" subtitle="Manage contact details, tenant preferences, and account verification.">
      <div className="settings-grid">
        <div className="panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Account</p>
              <h3>Personal details</h3>
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <label>
                Full name
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
              </label>
              <label>
                Email
                <input defaultValue={user.email || ''} readOnly />
              </label>
              <label>
                Phone
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 0712345678" />
              </label>
              <label>
                Preferred area
                <input value={form.preferred_area} onChange={(e) => setForm({ ...form, preferred_area: e.target.value })} placeholder="e.g. Kilimani" />
              </label>
              <label>
                Company
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company or employer (optional)" />
              </label>
            </div>
            {notice && <p className="auth-success" style={{ marginTop: '1rem' }}>{notice}</p>}
            {error && <p className="auth-error" style={{ marginTop: '1rem' }}>{error}</p>}
            <div className="form-actions" style={{ marginTop: '1rem' }}>
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Preferences</p>
              <h3>Rental match</h3>
            </div>
          </div>
          <div className="setting-list">
            <div className="setting-row">
              <span>Budget up to <strong>KES {Number(prefs.budget).toLocaleString()}</strong></span>
            </div>
            <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={prefs.budget}
                onChange={(e) => saveBudget(e.target.value)}
                style={{ width: '100%' }}
                aria-label="Budget"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.72rem', opacity: 0.5 }}>
                <span>KES 10,000</span><span>KES 500,000</span>
              </div>
            </div>
            <div className="setting-row">
              <span>Pet friendly options</span>
              <button type="button" className={`toggle ${prefs.petFriendly ? 'on' : ''}`} onClick={() => togglePref('petFriendly')} aria-pressed={prefs.petFriendly}><span /></button>
            </div>
            <div className="setting-row">
              <span>Furnished homes</span>
              <button type="button" className={`toggle ${prefs.furnished ? 'on' : ''}`} onClick={() => togglePref('furnished')} aria-pressed={prefs.furnished}><span /></button>
            </div>
          </div>
        </div>
      </div>
    </UserShell>
  );
}

function UserAuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  useEffect(() => {
    const session = getStoredSession();
    if (session?.token) {
      navigate(getPortalHome(session.user?.role), { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = mode === 'login'
        ? await loginUser(form.email, form.password)
        : await signupUser(form.name, form.email, form.password, 'tenant', form.phone);

      if (payload.user?.role !== 'tenant') {
        throw new Error('This account is not registered as a tenant.');
      }

      saveSession({ token: payload.token, user: payload.user });
      navigate('/tenant', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel hero-panel">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div>
            <strong>CasaConnect</strong>
            <small>Tenant access</small>
          </div>
        </div>
        <div>
          <p className="eyebrow">Find a place to call home</p>
          <h1>Rent smarter,<br />live better.</h1>
        </div>
        <p className="quote">Explore verified homes, send requests, and manage every part of your move in one place.</p>
      </div>

      <div className="auth-panel form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-tabs">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>

          {mode === 'register' && (
            <label>
              Full name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          )}

          {mode === 'register' && (
            <label>
              Phone number
              <input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="e.g. 0712345678" />
            </label>
          )}

          <label>
            Email address
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="primary-button full-width-button" disabled={submitting}>
            {submitting ? 'Please wait...' : (mode === 'login' ? 'Sign in' : 'Create account')}
            <ArrowRight size={16} />
          </button>

          <div className="helper-row">
            <span>Use tenant access</span>
            <Link to="/tenant/forgot-password" className="text-link">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function ForgotPasswordPage({ portal = 'tenant' }) {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const loginPath = portal === 'admin' ? '/admin/login' : portal === 'landlord' ? '/landlord/login' : '/tenant/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setNotice(''); setError('');
    try {
      await forgotPassword(email);
      setNotice('Check your email — a reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Unable to send reset email.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel hero-panel">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div><strong>CasaConnect</strong><small>Password recovery</small></div>
        </div>
        <div>
          <p className="eyebrow">Account recovery</p>
          <h1>Reset your password.</h1>
        </div>
        <p className="quote">Enter your email and we'll send you a secure link to set a new password.</p>
      </div>
      <div className="auth-panel form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Forgot password</p>
          <h2>Send reset link</h2>
          <label>
            Email address
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {notice && <p className="auth-success">{notice}</p>}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary-button full-width-button" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}<ArrowRight size={16} />
          </button>
          <div className="helper-row">
            <Link to={loginPath} className="text-link">← Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const [params] = useState(() => new URLSearchParams(window.location.hash.replace('#', '?')));
  const accessToken = params.get('access_token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!accessToken) { setError('Invalid or expired reset link. Please request a new one.'); return; }
    setSubmitting(true); setNotice(''); setError('');
    try {
      await resetPassword(accessToken, password);
      setNotice('Password updated! Redirecting to login…');
      setTimeout(() => navigate('/tenant/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel hero-panel">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div><strong>CasaConnect</strong><small>Set new password</small></div>
        </div>
        <div>
          <p className="eyebrow">Almost there</p>
          <h1>Choose a new password.</h1>
        </div>
        <p className="quote">Pick a strong password — at least 6 characters.</p>
      </div>
      <div className="auth-panel form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Reset password</p>
          <h2>New password</h2>
          <label>
            New password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>
          <label>
            Confirm password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>
          {notice && <p className="auth-success">{notice}</p>}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary-button full-width-button" disabled={submitting || !accessToken}>
            {submitting ? 'Saving…' : 'Set new password'}<ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const session = getStoredSession();
  useEffect(() => { getAdminStats(session?.token).then(setStats).catch(() => setStats({})); }, [session?.token]);
  useEffect(() => {
    getAdminAnalytics(session?.token).then(setAnalytics).catch(() => setAnalytics({}));
  }, [session?.token]);

  const userData = analytics.usersByMonth || [];
  const revenueData = analytics.revenueByMonth || [];
  const statusData = analytics.propertyStatus || [];

  return (
    <AdminShell title="Dashboard" subtitle="Monitor portfolio growth, requests, and admin actions across CasaConnect.">
      <section className="stats-grid">
        <StatCard label="Users" value={stats.users || 0} detail="Accounts in database" accent="blue" />
        <StatCard label="Properties" value={stats.properties || 0} detail="Saved listings" accent="green" />
        <StatCard label="Pending listings" value={stats.pendingProperties || 0} detail="Awaiting approval" accent="orange" />
        <StatCard label="Flagged reviews" value={stats.flaggedReviews || 0} detail="Needs moderation" accent="purple" />
      </section>

      <section className="content-grid analytics-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Growth</p>
              <h3>New users per month</h3>
            </div>
            <span className="chip success-chip"><TrendingUp size={15} /> Last 12 months</span>
          </div>
          {userData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Users" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No signups recorded in the last 12 months.</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Revenue</p>
              <h3>Paid rent by month</h3>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" name="KES" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No paid rent recorded yet.</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Moderation</p>
              <h3>Listing status breakdown</h3>
            </div>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#4f46e5', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No listings recorded yet.</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Moderation</p>
              <h3>Active alerts</h3>
            </div>
          </div>
          <div className="list-stack">
            <div className="alert-row"><div className="alert-icon blue"><Users size={15} /></div><div><strong>{stats.messages || 0} messages</strong><small>Stored conversations</small></div></div>
            <div className="alert-row"><div className="alert-icon orange"><FileCheck2 size={15} /></div><div><strong>{stats.pendingProperties || 0} pending listings</strong><small>Awaiting approval</small></div></div>
            {analytics.averageRating > 0 && (
              <div className="alert-row"><div className="alert-icon purple"><Star size={15} /></div><div><strong>Average rating {analytics.averageRating}</strong><small>Across {analytics.totalRatings} reviews</small></div></div>
            )}
            <Link className="text-link" to="/admin/properties">Review pending listings</Link>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function AdminAnalyticsPage() {
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const session = getStoredSession();

  useEffect(() => {
    getAdminStats(session?.token).then(setStats).catch(() => setStats({}));
    getAdminAnalytics(session?.token).then(setAnalytics).catch(() => setAnalytics({}));
  }, [session?.token]);

  const userData = analytics.usersByMonth || [];
  const revenueData = analytics.revenueByMonth || [];
  const statusData = analytics.propertyStatus || [];
  const cityData = analytics.propertiesByCity || [];

  return (
    <AdminShell title="Analytics & Reports" subtitle="Deep platform analytics covering revenue, growth, and listing performance.">
      <section className="stats-grid">
        <StatCard label="Total users" value={stats.users || 0} detail="Active platform accounts" accent="blue" />
        <StatCard label="Total listings" value={stats.properties || 0} detail="All properties on file" accent="green" />
        <StatCard label="Pending listings" value={stats.pendingProperties || 0} detail="Awaiting moderation" accent="orange" />
        <StatCard label="Average rating" value={analytics.averageRating ? `${analytics.averageRating} / 5` : 'N/A'} detail={`Across ${analytics.totalRatings || 0} reviews`} accent="purple" />
      </section>

      <section className="content-grid analytics-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Growth</p>
              <h3>User registrations over time</h3>
            </div>
            <span className="chip success-chip"><TrendingUp size={15} /> 12 months</span>
          </div>
          {userData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" name="Users" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No signups recorded in this period.</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Revenue</p>
              <h3>Rental transactions (KES)</h3>
            </div>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" name="KES" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No payment data recorded yet.</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inventory</p>
              <h3>Listings by city</h3>
            </div>
          </div>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Listings" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No listings categorized yet.</div>}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Status</p>
              <h3>Listing moderation breakdown</h3>
            </div>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#4f46e5', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No status records available.</div>}
        </div>
      </section>
    </AdminShell>
  );
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const session = getStoredSession();

  const loadUsers = () => { getAdminData('users', session?.token).then(setUsers).catch((e) => setError(e.message)); };
  useEffect(() => { loadUsers(); }, [session?.token]);

  const toggleStatus = async (user) => {
    setNotice('');
    setError('');
    const newStatus = user.account_status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateAdminResource('users', user.id, { account_status: newStatus }, session?.token);
      setNotice(`User ${user.email} marked as ${newStatus}.`);
      loadUsers();
    } catch (updateError) {
      setError(updateError.message || 'Unable to update user status.');
    }
  };

  const changeRole = async (user, newRole) => {
    setNotice('');
    setError('');
    try {
      await updateAdminResource('users', user.id, { role: newRole }, session?.token);
      setNotice(`User ${user.email} role changed to ${newRole}.`);
      loadUsers();
    } catch (roleError) {
      setError(roleError.message || 'Unable to change user role.');
    }
  };

  return (
    <AdminShell title="Users" subtitle="Manage accounts, toggle roles, and suspend or reactivate platform access.">
      {notice && <p className="auth-success">{notice}</p>}
      {error && <p className="auth-error">{error}</p>}
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.full_name || 'No name'}</strong>
                  {user.phone && <small><br />{user.phone}</small>}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-pill ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`status-pill ${user.account_status || 'active'}`}>{user.account_status || 'active'}</span>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className={`ghost-button compact-button ${user.account_status === 'suspended' ? 'success' : 'danger'}`}
                      onClick={() => toggleStatus(user)}
                    >
                      {user.account_status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        className="ghost-button compact-button"
                        onClick={() => changeRole(user, user.role === 'landlord' ? 'tenant' : 'landlord')}
                      >
                        Make {user.role === 'landlord' ? 'tenant' : 'landlord'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && !error && <p className="empty-state">No users registered yet.</p>}
      </div>
    </AdminShell>
  );
}

function AdminLandlordsPage() {
  const [draft, setDraft] = useState({ name: '', company: '', email: '', phone: '', password: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateLandlord = async () => {
    setNotice('');
    setError('');

    if (!draft.name || !draft.email || !draft.password) {
      setError('Name, email, and password are required to create a landlord account.');
      return;
    }

    try {
      setSubmitting(true);
      const session = getStoredSession();
      const payload = await createLandlord(draft.name, draft.email, draft.password, session?.token, draft.phone);
      setNotice(`Landlord account created successfully for ${payload.user?.name || draft.name}.`);
      setDraft({ name: '', company: '', email: '', phone: '', password: '' });
    } catch (submitError) {
      setError(submitError.message || 'Unable to create landlord account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Landlords" subtitle="Landlords are onboarded only by admin approval, not self-registration.">
      <div className="panel create-panel">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Onboarding</p>
            <h3>Create landlord account</h3>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Name
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Daniel Karu" />
          </label>
          <label>
            Company
            <input value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} placeholder="Karu Holdings" />
          </label>
          <label>
            Email
            <input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="daniel@casaconnect.co" />
          </label>
          <label>
            Phone
            <input type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="e.g. 0712345678" />
          </label>
          <label>
            Password
            <input type="password" value={draft.password} onChange={(event) => setDraft({ ...draft, password: event.target.value })} placeholder="Create password" />
          </label>
          <button type="button" className="primary-button" onClick={handleCreateLandlord} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create landlord'}
            <UserCog size={16} />
          </button>
        </div>
        {error && <p className="auth-error">{error}</p>}
        {notice && <p className="auth-success">{notice}</p>}
      </div>

      <LandlordsTable />
    </AdminShell>
  );
}

function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const session = getStoredSession();

  const loadProperties = () => { getAdminData('properties', session?.token).then(setProperties).catch((e) => setError(e.message)); };
  useEffect(() => { loadProperties(); }, [session?.token]);

  const updateStatus = async (property, newStatus) => {
    setNotice('');
    setError('');
    try {
      await updateAdminResource('properties', property.id, { listing_status: newStatus }, session?.token);
      setNotice(`Property "${property.title}" listing status updated to ${newStatus}.`);
      loadProperties();
    } catch (statusError) {
      setError(statusError.message || 'Unable to update property status.');
    }
  };

  return (
    <AdminShell title="Properties" subtitle="Approve, reject, or suspend housing listings submitted by landlords.">
      {notice && <p className="auth-success">{notice}</p>}
      {error && <p className="auth-error">{error}</p>}
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>City</th>
              <th>Monthly rent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>
                  <strong>{property.title}</strong>
                  <small><br />{property.address}</small>
                </td>
                <td>{property.city}</td>
                <td>{Number(property.rent).toLocaleString()} KES</td>
                <td>
                  <span className={`status-pill ${property.listing_status}`}>{property.listing_status}</span>
                </td>
                <td>
                  <div className="table-actions">
                    {property.listing_status !== 'approved' && (
                      <button
                        type="button"
                        className="ghost-button compact-button success"
                        onClick={() => updateStatus(property, 'approved')}
                      >
                        Approve
                      </button>
                    )}
                    {property.listing_status !== 'rejected' && (
                      <button
                        type="button"
                        className="ghost-button compact-button danger"
                        onClick={() => updateStatus(property, 'rejected')}
                      >
                        Reject
                      </button>
                    )}
                    {property.listing_status === 'approved' && (
                      <button
                        type="button"
                        className="ghost-button compact-button"
                        onClick={() => updateStatus(property, 'suspended')}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!properties.length && !error && <p className="empty-state">No listings submitted yet.</p>}
      </div>
    </AdminShell>
  );
}

function LandlordsTable() {
  const [landlords, setLandlords] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const session = getStoredSession();

  const load = () => { getAdminLandlords(session?.token).then(setLandlords).catch((e) => setError(e.message)); };
  useEffect(load, [session?.token]);

  const remove = async (id, email) => {
    if (!window.confirm(`Delete landlord ${email}?`)) return;
    try {
      await deleteAdminResource('users', id, session?.token);
      setNotice(`Landlord ${email} deleted.`);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="panel table-panel">
      {notice && <p className="auth-success">{notice}</p>}
      {error && <p className="auth-error">{error}</p>}
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {landlords.map((l) => (
            <tr key={l.id}>
              <td>{l.full_name || '—'}</td>
              <td>{l.email}</td>
              <td>{l.company || '—'}</td>
              <td><span className={`status-pill ${l.account_status || 'active'}`}>{l.account_status || 'active'}</span></td>
              <td>
                <button type="button" className="ghost-button compact-button danger" onClick={() => remove(l.id, l.email)}>
                  <Trash2 size={14} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!landlords.length && !error && <p className="empty-state">No landlord accounts yet.</p>}
    </div>
  );
}

function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const session = getStoredSession();

  const load = () => { getAdminRequests(session?.token).then(setRequests).catch((e) => setError(e.message)); };
  useEffect(load, [session?.token]);

  const update = async (id, status) => {
    try {
      await updateAdminRequest(id, status, session?.token);
      setNotice(`Request marked as ${status}.`);
      load();
    } catch (e) { setError(e.message); }
  };

  return (
    <AdminShell title="Requests" subtitle="Review all tenant rental requests across the platform.">
      {notice && <p className="auth-success">{notice}</p>}
      {error && <p className="auth-error">{error}</p>}
      <div className="panel table-panel">
        <table>
          <thead><tr><th>Tenant</th><th>Property</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.users?.full_name || r.tenant_id}</td>
                <td>{r.properties?.title || '—'}</td>
                <td><small>{r.message || '—'}</small></td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td><span className={`status-pill ${r.status}`}>{r.status}</span></td>
                <td>
                  <div className="table-actions">
                    {r.status !== 'approved' && <button type="button" className="ghost-button compact-button success" onClick={() => update(r.id, 'approved')}>Approve</button>}
                    {r.status !== 'rejected' && <button type="button" className="ghost-button compact-button danger" onClick={() => update(r.id, 'rejected')}>Reject</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!requests.length && !error && <p className="empty-state">No rental requests yet.</p>}
      </div>
    </AdminShell>
  );
}

function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const session = getStoredSession();

  useEffect(() => {
    getAdminMessages(session?.token).then(setMessages).catch((e) => setError(e.message));
  }, [session?.token]);

  return (
    <AdminShell title="Messages" subtitle="Monitor all property conversations across the platform.">
      {error && <p className="auth-error">{error}</p>}
      <div className="panel table-panel">
        <table>
          <thead><tr><th>Property</th><th>Sender</th><th>Message</th><th>Date</th></tr></thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id}>
                <td>{m.properties?.title || '—'}</td>
                <td>{m.users?.full_name || m.sender_id}</td>
                <td><small>{m.message}</small></td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!messages.length && !error && <p className="empty-state">No messages recorded yet.</p>}
      </div>
    </AdminShell>
  );
}

function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const session = getStoredSession();

  const loadReviews = () => { getAdminData('reviews', session?.token).then(setReviews).catch((e) => setError(e.message)); };
  useEffect(() => { loadReviews(); }, [session?.token]);

  const moderateReview = async (review, status) => {
    setNotice('');
    setError('');
    try {
      await updateAdminResource('reviews', review.id, { moderation_status: status }, session?.token);
      setNotice(`Review moderation status set to ${status}.`);
      loadReviews();
    } catch (modError) {
      setError(modError.message || 'Unable to update review moderation status.');
    }
  };

  return (
    <AdminShell title="Reviews" subtitle="Moderate feedback, approve genuine comments, or flag abusive reviews.">
      {notice && <p className="auth-success">{notice}</p>}
      {error && <p className="auth-error">{error}</p>}
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Rating</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={13} className={star <= review.rating ? 'star-filled' : ''} />
                    ))}
                  </div>
                </td>
                <td>
                  <p>{review.comment || 'No comment provided.'}</p>
                </td>
                <td>
                  <span className={`status-pill ${review.moderation_status || 'approved'}`}>{review.moderation_status || 'approved'}</span>
                </td>
                <td>
                  <div className="table-actions">
                    {review.moderation_status !== 'approved' && (
                      <button
                        type="button"
                        className="ghost-button compact-button success"
                        onClick={() => moderateReview(review, 'approved')}
                      >
                        Approve
                      </button>
                    )}
                    {review.moderation_status !== 'flagged' && (
                      <button
                        type="button"
                        className="ghost-button compact-button danger"
                        onClick={() => moderateReview(review, 'flagged')}
                      >
                        Flag
                      </button>
                    )}
                    {review.moderation_status !== 'removed' && (
                      <button
                        type="button"
                        className="ghost-button compact-button"
                        onClick={() => moderateReview(review, 'removed')}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!reviews.length && !error && <p className="empty-state">No reviews recorded yet.</p>}
      </div>
    </AdminShell>
  );
}

function AdminSettingsPage() {
  return (
    <AdminShell title="Settings" subtitle="Configure platform rules, safety checks, and integrations.">
      <div className="settings-grid">
        <div className="panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Global rules</p>
              <h3>System configuration</h3>
            </div>
          </div>
          <div className="setting-list">
            {[
              'Require landlord verification before activation',
              'Auto-approve tenant self-registration',
              'Enable M-Pesa payment logging',
              'Moderate messaging for abuse alerts',
            ].map((label, index) => (
              <div key={label} className="setting-row">
                <span>{label}</span>
                <button type="button" className={`toggle ${index % 2 === 0 ? 'on' : ''}`}><span /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header compact">
            <div>
              <p className="eyebrow">Integrations</p>
              <h3>Connected services</h3>
            </div>
          </div>
          <div className="system-list">
            <div className="system-row"><span><CreditCard size={16} /> Stripe</span><strong>Connected</strong></div>
            <div className="system-row"><span><Wallet size={16} /> M-Pesa</span><strong>Sandbox</strong></div>
            <div className="system-row"><span><ShieldCheck size={16} /> Supabase</span><strong>Online</strong></div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function AdminAuthPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (session?.token && session.user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = await loginUser(form.email, form.password);
      if (payload.user?.role !== 'admin') {
        throw new Error('This account does not have admin access.');
      }

      saveSession({ token: payload.token, user: payload.user });
      navigate('/admin', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Unable to sign in to the admin portal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel hero-panel">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div>
            <strong>CasaConnect</strong>
            <small>Admin access</small>
          </div>
        </div>
        <div>
          <p className="eyebrow">Secure operations</p>
          <h1>Run the platform with full oversight.</h1>
        </div>
        <p className="quote">Manage landlords, approve listings, and monitor every sensitive workflow from one control center.</p>
      </div>

      <div className="auth-panel form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Restricted access</p>
          <h2>Admin login</h2>
          <label>
            Work email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary-button full-width-button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Enter admin portal'}
            <ArrowRight size={16} />
          </button>
          <div className="helper-row">
            <span>Role: admin</span>
            <Link to="/admin/forgot-password" className="text-link">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function LandlordDashboardPage() {
  const session = getStoredSession();
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    getProperties().then(setProperties).catch(() => setProperties([]));
    getRentalRequests(session?.token).then(setRequests).catch(() => setRequests([]));
  }, [session?.token]);
  return (
    <LandlordShell title="Dashboard" subtitle="Track listings, tenant requests, and rental income for your portfolio.">
      <section className="stats-grid">
        <StatCard label="Properties" value={properties.length} detail="Backend listings" accent="green" />
        <StatCard label="Pending requests" value={requests.filter((request) => request.status === 'pending').length} detail="Awaiting response" accent="orange" />
        <StatCard label="Approved requests" value={requests.filter((request) => request.status === 'approved').length} detail="Accepted tenants" accent="blue" />
        <StatCard label="Messages" value="0" detail="Live message count available per property" accent="purple" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Portfolio</p>
              <h3>Managed properties</h3>
            </div>
          </div>
          <div className="list-stack">
            {properties.map((property) => (
              <div className="list-row" key={property.id}>
                <div>
                  <strong>{property.title}</strong>
                  <small>{property.address || property.location || 'Location pending'}</small>
                </div>
                <span className="status-pill active">Live</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Requests</p>
              <h3>Tenant follow-ups</h3>
            </div>
          </div>
          <div className="list-stack">
            {requests.map((request) => (
              <div className="list-row" key={request.id}>
                <div>
                  <strong>{request.tenant_id}</strong>
                  <small>{request.properties?.title || 'Property request'}</small>
                </div>
                <span className={`status-pill ${request.status}`}>{request.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandlordShell>
  );
}

function LandlordPropertiesPage() {
  const session = getStoredSession();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadProperties = () => getMyProperties(session?.token).then(setProperties).catch((loadError) => setError(loadError.message));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadProperties(); }, [session?.token]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    try {
      await deleteProperty(id, session?.token);
      setNotice('Property deleted.');
      loadProperties();
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete the property.');
    }
  };

  return (
    <LandlordShell title="Properties" subtitle="Add, update, and maintain listings assigned to your portfolio.">
      {notice && <p className="auth-success">{notice}</p>}
      {error && <p className="auth-error">{error}</p>}
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Location</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>{property.title}</td>
                <td>{property.address || property.location || 'Location pending'}</td>
                <td>{Number(property.rent || property.price || 0).toLocaleString()} KES</td>
                <td><span className={`status-pill ${property.listing_status || 'pending'}`}>{property.listing_status || 'pending'}</span></td>
                <td>
                  <div className="table-actions">
                    <Link className="ghost-button compact-button" to={`/landlord/properties/${property.id}/edit`}>
                      <Pencil size={14} /> Edit
                    </Link>
                    <button type="button" className="ghost-button compact-button danger" onClick={() => handleDelete(property.id, property.title)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!properties.length && !error && <p className="empty-state">You have not listed any properties yet.</p>}
      </div>
      <Link className="primary-button full-width-button" to="/landlord/properties/new">
        <Building2 size={16} /> Add a property
      </Link>
    </LandlordShell>
  );
}

function LandlordPropertyFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const session = getStoredSession();
  const editing = Boolean(id);

  const defaultForm = { title: '', address: '', city: '', description: '', rent: '', bedrooms: 1, bathrooms: 1, amenities: '', images: '', available_from: '' };
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProperty(id, session?.token)
      .then((property) => {
        if (!property) throw new Error('Property not found.');
        setForm({
          title: property.title || '',
          address: property.address || '',
          city: property.city || '',
          description: property.description || '',
          rent: property.rent || '',
          bedrooms: property.bedrooms || 1,
          bathrooms: property.bathrooms || 1,
          amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
          images: Array.isArray(property.images) ? property.images.join(', ') : '',
          available_from: property.available_from ? property.available_from.slice(0, 10) : '',
        });
      })
      .catch((loadError) => setError(loadError.message));
  }, [id, session?.token]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        title: form.title.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        rent: Number(form.rent),
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
        available_from: form.available_from || new Date().toISOString(),
      };
      if (editing) {
        await updateProperty(id, payload, session?.token);
        setNotice('Property updated. Changes are saved.');
      } else {
        const created = await createProperty(payload, session?.token);
        setNotice('Property created and submitted for admin approval.');
        navigate(`/landlord/properties/${created.id}/edit`, { replace: true });
      }
    } catch (submitError) {
      setError(submitError.message || 'Unable to save the property.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LandlordShell
      title={editing ? 'Edit property' : 'New property'}
      subtitle={editing ? 'Update the details of your listing.' : 'Create a listing — it will be reviewed by admin before going live.'}
    >
      <form className="panel form-panel create-property-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Title *
            <input value={form.title} onChange={(event) => setField('title', event.target.value)} required placeholder="Sunflower Suites Apartment" />
          </label>
          <label>
            City *
            <input value={form.city} onChange={(event) => setField('city', event.target.value)} required placeholder="Kilimani" />
          </label>
          <label className="form-span-two">
            Address *
            <input value={form.address} onChange={(event) => setField('address', event.target.value)} required placeholder="Ngong Road, Kilimani" />
          </label>
          <label className="form-span-two">
            Description
            <textarea rows="4" value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Bright 2-bedroom apartment with a balcony overlooking the city…" />
          </label>
          <label>
            Monthly rent (KES) *
            <input type="number" min="1" value={form.rent} onChange={(event) => setField('rent', event.target.value)} required placeholder="45000" />
          </label>
          <label>
            Bedrooms
            <input type="number" min="0" value={form.bedrooms} onChange={(event) => setField('bedrooms', event.target.value)} />
          </label>
          <label>
            Bathrooms
            <input type="number" min="0" value={form.bathrooms} onChange={(event) => setField('bathrooms', event.target.value)} />
          </label>
          <label>
            Available from
            <input type="date" value={form.available_from} onChange={(event) => setField('available_from', event.target.value)} />
          </label>
          <label className="form-span-two">
            Amenities (comma separated)
            <input value={form.amenities} onChange={(event) => setField('amenities', event.target.value)} placeholder="WiFi, Parking, Water heater, Furnished" />
          </label>
          <label className="form-span-two">
            Image URLs (comma separated)
            <input value={form.images} onChange={(event) => setField('images', event.target.value)} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
          </label>
        </div>
        {error && <p className="auth-error">{error}</p>}
        {notice && <p className="auth-success">{notice}</p>}
        <div className="form-actions">
          <Link className="ghost-button" to="/landlord/properties">
            <ArrowLeft size={15} /> Back
          </Link>
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Saving…' : (editing ? 'Save changes' : 'Create property')}
          </button>
        </div>
      </form>
    </LandlordShell>
  );
}

function LandlordRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const session = getStoredSession();

  const loadRequests = () => getRentalRequests(session?.token).then(setRequests).catch((loadError) => setError(loadError.message));
  useEffect(() => {
    getRentalRequests(session?.token).then(setRequests).catch((loadError) => setError(loadError.message));
  }, [session?.token]);

  const changeStatus = async (id, status) => {
    try {
      await updateRentalRequest(id, status, session?.token);
      await loadRequests();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  return (
    <LandlordShell title="Requests" subtitle="Review tenant rental requests, schedule viewings, and update applications.">
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Property</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.tenant_id}</td>
                <td>{request.properties?.title || 'Property'}</td>
                <td><span className={`status-pill ${request.status}`}>{request.status}</span></td>
                <td><button className="ghost-button" type="button" onClick={() => changeStatus(request.id, 'approved')}>Approve</button>{request.status === 'pending' && <button className="ghost-button" type="button" onClick={() => changeStatus(request.id, 'rejected')}>Reject</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <p className="auth-error">{error}</p>}
        {!requests.length && !error && <p className="empty-state">No tenant requests yet.</p>}
      </div>
    </LandlordShell>
  );
}

function LandlordMessagesPage() {
  const session = getStoredSession();
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => { getMyProperties(session?.token).then(setProperties).catch(() => setProperties([])); }, [session?.token]);

  useEffect(() => {
    if (!activeProperty && properties.length) {
      setActiveProperty(properties[0].id);
    }
  }, [properties, activeProperty]);

  useEffect(() => {
    if (!activeProperty) return;
    let mounted = true;
    getMessages(activeProperty, session?.token).then((items) => { if (mounted) setMessages(items); }).catch(() => {});

    const supabase = createRealtimeClient(session?.supabaseSession);
    let channel = null;
    if (supabase) {
      channel = supabase
        .channel(`landlord-messages-${activeProperty}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `property_id=eq.${activeProperty}`,
        }, (payload) => {
          if (payload.new) setMessages((current) => [...current, payload.new]);
        })
        .subscribe();
    }

    return () => { mounted = false; if (supabase && channel) supabase.removeChannel(channel); };
  }, [activeProperty, session?.token, session?.supabaseSession]);

  const send = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeProperty) return;
    const text = draft.trim();
    setDraft('');
    try {
      await sendMessage(activeProperty, text, session?.token);
    } catch {
      setDraft(text);
    }
  };

  return (
    <LandlordShell title="Messages" subtitle="Moderate tenant conversations and answer inquiries efficiently.">
      {properties.length === 0 && <div className="panel empty-state">Messages appear here once tenants request your properties.</div>}
      {properties.length > 0 && (
        <div className="panel chat-panel">
          <div className="chat-sidebar">
            {properties.map((property) => (
              <button
                type="button"
                key={property.id}
                className={`conversation-tab ${activeProperty === property.id ? 'active-conversation' : ''}`}
                onClick={() => setActiveProperty(property.id)}
              >
                <strong>{property.title}</strong>
                <small>{property.city || 'Property'}</small>
              </button>
            ))}
          </div>
          <div className="conversation-main">
            <div className="conversation-list">
              {messages.map((item) => (
                <div className={`conversation-item ${item.sender_id === session?.user?.id ? 'mine' : ''}`} key={item.id}>
                  <div className="mini-avatar">{item.sender_id.slice(0, 2).toUpperCase()}</div>
                  <div className="conversation-copy">
                    <div className="conversation-head">
                      <strong>{item.sender_id === session?.user?.id ? 'You' : 'Tenant'}</strong>
                      <small>{new Date(item.created_at).toLocaleString()}</small>
                    </div>
                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
              {!messages.length && <p className="empty-state">No messages in this conversation yet.</p>}
            </div>
            <form className="composer" onSubmit={send}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Reply to the tenant…"
                aria-label="Reply"
              />
              <button type="submit" className="primary-button small-button" disabled={!draft.trim()}>
                <Send size={15} /> Reply
              </button>
            </form>
          </div>
        </div>
      )}
    </LandlordShell>
  );
}

function LandlordPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const session = getStoredSession();
  useEffect(() => { getPayments(session?.token).then(setPayments).catch(() => setPayments([])); }, [session?.token]);
  return (
    <LandlordShell title="Payments" subtitle="Monitor rent inflow, settlement history, and payout status.">
      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Tenant</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                <td>{payment.tenant_id}</td>
                <td>{payment.method}</td>
                <td><span className={`status-pill ${payment.status}`}>{payment.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!payments.length && <p className="empty-state">No payment records found.</p>}
      </div>
    </LandlordShell>
  );
}

function LandlordAuthPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (session?.token && session.user?.role === 'landlord') {
      navigate('/landlord', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = await loginUser(form.email, form.password);
      if (payload.user?.role !== 'landlord') {
        throw new Error('This account is not registered as a landlord.');
      }

      saveSession({ token: payload.token, user: payload.user });
      navigate('/landlord', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Unable to sign in to the landlord portal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel hero-panel">
        <div className="brand-block">
          <img src={LOGO} alt="CasaConnect" className="brand-logo" />
          <div>
            <strong>CasaConnect</strong>
            <small>Landlord access</small>
          </div>
        </div>
        <div>
          <p className="eyebrow">Approved management</p>
          <h1>Grow your portfolio with confidence.</h1>
        </div>
        <p className="quote">Only approved landlords can manage properties, requests, and tenant conversations on CasaConnect.</p>
      </div>

      <div className="auth-panel form-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="eyebrow">Verification required</p>
          <h2>Landlord login</h2>
          <label>
            Work email
            <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="primary-button full-width-button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Continue to portfolio'}
            <ArrowRight size={16} />
          </button>
          <div className="helper-row">
            <span>Role: landlord</span>
            <Link to="/landlord/forgot-password" className="text-link">Forgot password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [splash, setSplash] = useState(!sessionStorage.getItem('cc_splash'));
  const hideSplash = () => { sessionStorage.setItem('cc_splash', '1'); setSplash(false); };
  const session = getStoredSession();
  const showWidget = session?.user?.role === 'tenant' || session?.user?.role === 'landlord';

  if (splash) return <SplashScreen onDone={hideSplash} />;

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {showWidget && <SupportWidget />}
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/properties/:id" element={<UserPropertyDetailsPage />} />

        <Route path="/tenant" element={<ProtectedRoute allowedRoles={['tenant']} fallbackPath="/tenant/login"><UserDashboardPage /></ProtectedRoute>} />
        <Route path="/tenant/login" element={<UserAuthPage />} />
        <Route path="/tenant/register" element={<UserAuthPage />} />
        <Route path="/tenant/properties" element={<ProtectedRoute allowedRoles={['tenant']} fallbackPath="/tenant/login"><UserPropertiesPage /></ProtectedRoute>} />
        <Route path="/tenant/properties/:id" element={<ProtectedRoute allowedRoles={['tenant', 'admin']} fallbackPath="/tenant/login"><UserPropertyDetailsPage /></ProtectedRoute>} />
        <Route path="/tenant/requests" element={<ProtectedRoute allowedRoles={['tenant']} fallbackPath="/tenant/login"><UserRequestsPage /></ProtectedRoute>} />
        <Route path="/tenant/payments" element={<ProtectedRoute allowedRoles={['tenant']} fallbackPath="/tenant/login"><UserPaymentsPage /></ProtectedRoute>} />
        <Route path="/tenant/messages" element={<ProtectedRoute allowedRoles={['tenant']} fallbackPath="/tenant/login"><UserMessagesPage /></ProtectedRoute>} />
        <Route path="/tenant/profile" element={<ProtectedRoute allowedRoles={['tenant']} fallbackPath="/tenant/login"><UserProfilePage /></ProtectedRoute>} />

        <Route path="/tenant/forgot-password" element={<ForgotPasswordPage portal="tenant" />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminAuthPage />} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminAnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/landlords" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminLandlordsPage /></ProtectedRoute>} />
        <Route path="/admin/properties" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminPropertiesPage /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminRequestsPage /></ProtectedRoute>} />
        <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminMessagesPage /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminReviewsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/admin/login"><AdminSettingsPage /></ProtectedRoute>} />

        <Route path="/admin/forgot-password" element={<ForgotPasswordPage portal="admin" />} />

        <Route path="/landlord" element={<ProtectedRoute allowedRoles={['landlord']} fallbackPath="/landlord/login"><LandlordDashboardPage /></ProtectedRoute>} />
        <Route path="/landlord/login" element={<LandlordAuthPage />} />
        <Route path="/landlord/properties" element={<ProtectedRoute allowedRoles={['landlord']} fallbackPath="/landlord/login"><LandlordPropertiesPage /></ProtectedRoute>} />
        <Route path="/landlord/properties/new" element={<ProtectedRoute allowedRoles={['landlord']} fallbackPath="/landlord/login"><LandlordPropertyFormPage /></ProtectedRoute>} />
        <Route path="/landlord/properties/:id/edit" element={<ProtectedRoute allowedRoles={['landlord']} fallbackPath="/landlord/login"><LandlordPropertyFormPage /></ProtectedRoute>} />
        <Route path="/landlord/requests" element={<ProtectedRoute allowedRoles={['landlord']} fallbackPath="/landlord/login"><LandlordRequestsPage /></ProtectedRoute>} />
        <Route path="/landlord/messages" element={<ProtectedRoute allowedRoles={['landlord']} fallbackPath="/landlord/login"><LandlordMessagesPage /></ProtectedRoute>} />
        <Route path="/landlord/forgot-password" element={<ForgotPasswordPage portal="landlord" />} />
        <Route path="/landlord/payments" element={<ProtectedRoute allowedRoles={['landlord']} fallbackPath="/landlord/login"><LandlordPaymentsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
