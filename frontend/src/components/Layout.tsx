import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material'
import { AccountCircle, Logout, Dashboard, DirectionsCar, AdminPanelSettings, Assessment, BookOnline } from '@mui/icons-material'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
    navigate('/login')
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    handleMenuClose()
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky">
        <Toolbar>
          <DirectionsCar sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => {
              if (user?.role === 'ADMIN') {
                navigate('/admin/dashboard')
              } else {
                navigate('/dashboard')
              }
            }}
          >
            Réservation de Véhicules
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => user.role === 'ADMIN' ? navigate('/admin/dashboard') : navigate('/dashboard')}
                sx={{
                  textTransform: 'none',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                Tableau de bord
              </Button>

              {user.role === 'EMPLOYEE' && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<DirectionsCar />}
                    onClick={() => navigate('/vehicles')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Véhicules
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<BookOnline />}
                    onClick={() => navigate('/reservations')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Réservations
                  </Button>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Button
                    color="inherit"
                    startIcon={<AdminPanelSettings />}
                    onClick={() => navigate('/admin/users')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Utilisateurs
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<DirectionsCar />}
                    onClick={() => navigate('/admin/vehicles')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Véhicules
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<Assessment />}
                    onClick={() => navigate('/admin/reservations')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Réservations
                  </Button>
                </>
              )}

              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
              >
                <AccountCircle />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>
                  {user.email}
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  Profil
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> Déconnexion
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout