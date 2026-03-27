/**
 * layouts/ModernLayout.jsx — Ostello App Shell
 *
 * Role-based navigation:
 *   STUDENT   → Dashboard, Browse Hostels, My Bookings
 *   CUSTODIAN → Dashboard, My Hostels, Booking Requests
 *   ADMIN     → Dashboard, All Users, Browse Hostels
 */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, List, ListItemButton, ListItemIcon,
    ListItemText, Typography, Avatar, Divider, Stack, Tooltip,
    IconButton, Breadcrumbs, Link, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ApartmentIcon from '@mui/icons-material/Apartment';
import PeopleIcon from '@mui/icons-material/People';
import InboxIcon from '@mui/icons-material/Inbox';
import LogoutIcon from '@mui/icons-material/Logout';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MenuIcon from '@mui/icons-material/Menu';

const DRAWER_WIDTH = 240;

const BRAND = {
    teal: '#0E7C6B',
    tealDark: '#065C50',
    orange: '#F2994A',
    orangeLight: '#FDE8D0',
    white: '#FFFFFF',
    offWhite: '#F5F7FA',
};

// Role-specific nav items
const NAV_MAP = {
    STUDENT: [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/hostels', label: 'Browse Hostels', icon: <SearchIcon /> },
        { path: '/my-bookings', label: 'My Bookings', icon: <BookOnlineIcon /> },
    ],
    CUSTODIAN: [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/manage-hostels', label: 'My Hostels', icon: <ApartmentIcon /> },
        { path: '/booking-requests', label: 'Booking Requests', icon: <InboxIcon /> },
    ],
    ADMIN: [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { path: '/users', label: 'Users', icon: <PeopleIcon /> },
        { path: '/hostels', label: 'Browse Hostels', icon: <SearchIcon /> },
    ],
};

const PAGE_LABELS = {
    '/dashboard': 'Dashboard',
    '/hostels': 'Browse Hostels',
    '/my-bookings': 'My Bookings',
    '/manage-hostels': 'My Hostels',
    '/booking-requests': 'Booking Requests',
    '/users': 'Users',
};

const AVATAR_COLORS = [BRAND.teal, '#7B3F00', '#1A4A7B', '#1A5C2E', '#4A1A7B'];
const avatarBg = (name = '') =>
    AVATAR_COLORS[(name.codePointAt(0) ?? 0) % AVATAR_COLORS.length];

const ROLE_LABELS = { STUDENT: 'Student', CUSTODIAN: 'Custodian', ADMIN: 'Admin' };

export default function ModernLayout({ children, user }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const displayName = user?.full_name ?? 'User';
    const role = user?.role ?? 'STUDENT';
    const navItems = NAV_MAP[role] ?? NAV_MAP.STUDENT;
    const pageLabel = PAGE_LABELS[location.pathname] ?? 'Page';

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navClick = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: BRAND.teal, color: BRAND.white }}>

            {/* Branding header */}
            <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: BRAND.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
                        <ApartmentIcon sx={{ fontSize: 26, color: BRAND.teal }} />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ color: BRAND.white, fontWeight: 800, lineHeight: 1.1, letterSpacing: 0.5 }}>
                            Ostello
                        </Typography>
                        <Typography variant="caption" sx={{ color: BRAND.orangeLight, fontSize: 9, letterSpacing: 0.6, lineHeight: 1, display: 'block' }}>
                            HOSTEL DISCOVERY &amp; BOOKING
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

            {/* Nav list */}
            <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
                {navItems.map(({ path, label, icon }) => {
                    const active = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
                    return (
                        <ListItemButton
                            key={path}
                            onClick={() => navClick(path)}
                            sx={{
                                borderRadius: 2, mb: 0.5, px: 1.5, py: 1.1,
                                color: active ? BRAND.orange : 'rgba(255,255,255,0.78)',
                                bgcolor: active ? 'rgba(242,153,74,0.18)' : 'transparent',
                                borderLeft: active ? `3px solid ${BRAND.orange}` : '3px solid transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.09)', color: BRAND.white },
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{icon}</ListItemIcon>
                            <ListItemText
                                primary={<Typography sx={{ fontWeight: active ? 700 : 500, fontSize: 14, color: 'inherit' }}>{label}</Typography>}
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />

            {/* User + logout */}
            <Box sx={{ px: 2, py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: avatarBg(displayName), border: `2px solid ${BRAND.orange}`, fontWeight: 700, fontSize: 15 }}>
                        {displayName[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ color: BRAND.white, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {displayName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                            {ROLE_LABELS[role] ?? role}
                        </Typography>
                    </Box>
                    <Tooltip title="Logout">
                        <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: BRAND.orange } }}>
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: BRAND.offWhite }}>

            {/* Desktop permanent drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: DRAWER_WIDTH, flexShrink: 0,
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.13)' },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Mobile temporary drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none' },
                }}
            >
                {drawerContent}
            </Drawer>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                {/* Top AppBar */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: BRAND.white,
                        borderBottom: `3px solid ${BRAND.teal}`,
                        color: 'text.primary',
                        zIndex: (t) => t.zIndex.drawer - 1,
                    }}
                >
                    <Toolbar sx={{ minHeight: 56, gap: 1 }}>
                        {/* Hamburger — mobile only */}
                        <IconButton
                            edge="start"
                            onClick={() => setMobileOpen(true)}
                            sx={{ display: { xs: 'flex', md: 'none' }, color: BRAND.teal, mr: 0.5 }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Breadcrumbs
                            separator={<NavigateNextIcon fontSize="small" sx={{ color: BRAND.teal }} />}
                            sx={{ flexGrow: 1 }}
                        >
                            <Link
                                underline="hover"
                                onClick={() => navigate('/dashboard')}
                                sx={{ cursor: 'pointer', fontSize: 13, color: BRAND.teal, fontWeight: 600 }}
                            >
                                Home
                            </Link>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: BRAND.teal }}>{pageLabel}</Typography>
                        </Breadcrumbs>

                        {/* Role badge */}
                        <Chip
                            label={ROLE_LABELS[role] ?? role}
                            size="small"
                            sx={{ bgcolor: BRAND.orangeLight, color: BRAND.teal, fontWeight: 700, fontSize: 11, display: { xs: 'none', sm: 'flex' } }}
                        />

                        {/* User chip */}
                        <Chip
                            avatar={
                                <Avatar sx={{ bgcolor: `${avatarBg(displayName)} !important`, fontSize: 12, fontWeight: 700 }}>
                                    {displayName[0]?.toUpperCase()}
                                </Avatar>
                            }
                            label={displayName}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: BRAND.teal, color: BRAND.teal, fontWeight: 600, fontSize: 12 }}
                        />
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, overflow: 'auto' }}>
                    {children}
                </Box>

                {/* Footer */}
                <Box sx={{
                    textAlign: 'center', py: 1.5,
                    borderTop: '1px solid rgba(14,124,107,0.1)',
                    color: BRAND.teal, fontSize: 11, fontWeight: 500, opacity: 0.65,
                }}>
                    © {new Date().getFullYear()} Ostello — Hostel Discovery &amp; Booking Platform
                </Box>
            </Box>
        </Box>
    );
}
