import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../config/api'
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  CircularProgress
} from '@mui/material'
import {
  DirectionsCar,
  CalendarToday,
  Person,
  Warning,
  CheckCircle,
  Schedule,
  TrendingUp,
  AccessTime,
  LocalOffer
} from '@mui/icons-material'
import Layout from '../components/Layout'

interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  activeReservations: number
  totalUsers?: number
  maintenanceCount?: number
  unavailableCount?: number
}

interface Reservation {
  id: number
  vehicle: {
    brand: string
    model: string
    registrationNumber: string
  }
  startDate: string
  endDate: string
  purpose: string
  status?: string
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Rediriger l'admin vers son dashboard dédié
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true })
      return
    }
    
    fetchDashboardData()
  }, [user?.role, navigate])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les statistiques pour les employés
      const statsResponse = await apiClient.get('/admin/stats/employee')
      setStats(statsResponse.data.data)

      // Récupérer les réservations de l'utilisateur
      const reservationsResponse = await apiClient.get('/reservations/my-reservations', {
        params: { limit: 5 }
      })
      setReservations(reservationsResponse.data.data)
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Afficher un loader pendant la redirection de l'admin
  if (loading || user?.role === 'ADMIN') {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getReservationStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'success'
      case 'PENDING': return 'warning'
      case 'REJECTED': return 'error'
      default: return 'default'
    }
  }

  const getReservationStatusLabel = (status?: string) => {
    switch (status) {
      case 'APPROVED': return 'Approuvée'
      case 'PENDING': return 'En attente'
      case 'REJECTED': return 'Refusée'
      default: return 'En cours'
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header with User Info */}
      <Box sx={{ mb: 4, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Tableau de bord
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Bienvenue, {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
        </Box>
      </Box>

      {/* Main Statistics - Quick Overview */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, bgcolor: 'primary.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Véhicules Disponibles
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    {stats?.availableVehicles || 0}
                  </Typography>
                  <Chip 
                    label={`${stats?.totalVehicles || 0} total`} 
                    size="small" 
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
                <DirectionsCar sx={{ fontSize: 40, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, bgcolor: 'error.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Mes Réservations
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    {stats?.activeReservations || 0}
                  </Typography>
                  <Typography variant="caption">
                    En cours
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, bgcolor: 'info.main', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Taux d'Utilisation
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    {stats ? Math.round(((stats.totalVehicles - stats.availableVehicles) / stats.totalVehicles) * 100) : 0}%
                  </Typography>
                  <Typography variant="caption">
                    Flotte globale
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* My Recent Reservations - Featured */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: 1, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                  Mes Réservations Récentes
                </Typography>
                <Button size="small" color="primary" onClick={() => navigate('/reservations')}>
                  Voir toutes
                </Button>
              </Box>
              
              {reservations.length > 0 ? (
                <List disablePadding>
                  {reservations.slice(0, 4).map((reservation, index) => (
                    <React.Fragment key={reservation.id}>
                      <ListItem sx={{ py: 1.5, px: 0, '&:hover': { bgcolor: 'action.hover' } }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}>
                            <DirectionsCar sx={{ fontSize: 18 }} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {reservation.vehicle.brand} {reservation.vehicle.model}
                              </Typography>
                              <Chip 
                                label={getReservationStatusLabel(reservation.status)} 
                                size="small" 
                                color={getReservationStatusColor(reservation.status) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                                {formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}
                              </Typography>
                              {reservation.purpose && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                  Motif: {reservation.purpose}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(3, reservations.length - 1) && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">
                    Vous n'avez pas de réservations actuellement
                  </Typography>
                  <Button 
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/vehicles')}
                    sx={{ mt: 2 }}
                  >
                    Réserver un véhicule
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions and Fleet Status */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocalOffer sx={{ mr: 1, color: 'primary.main' }} />
                    Actions Rapides
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/vehicles')}
                        startIcon={<DirectionsCar />}
                        sx={{ py: 1.2, borderRadius: 2 }}
                      >
                        Consulter les Véhicules
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/reservations')}
                        startIcon={<CalendarToday />}
                        sx={{ py: 1.2, borderRadius: 2 }}
                      >
                        Gérer mes Réservations
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/profile')}
                        startIcon={<Person />}
                        sx={{ py: 1.2, borderRadius: 2 }}
                      >
                        Mon Profil
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Fleet Status Summary */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                    État de la Flotte
                  </Typography>
                  <List disablePadding>
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle sx={{ color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Disponibles"
                        secondary={`${stats?.availableVehicles}/${stats?.totalVehicles}`}
                      />
                    </ListItem>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats?.availableVehicles || 0) / (stats?.totalVehicles || 1) * 100}
                      color="success"
                      sx={{ my: 1, height: 6, borderRadius: 3 }}
                    />
                    {stats?.maintenanceCount !== undefined && stats.maintenanceCount > 0 && (
                      <>
                        <ListItem sx={{ py: 1, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Warning sx={{ color: 'warning.main' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="En Maintenance"
                            secondary={`${stats.maintenanceCount} véhicule(s)`}
                          />
                        </ListItem>
                      </>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Layout>
  )
}

export default Dashboard