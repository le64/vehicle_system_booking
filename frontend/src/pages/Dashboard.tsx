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
  AvatarGroup
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
    fetchDashboardData()
  }, [user?.role])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les statistiques selon le rôle
      const statsEndpoint = user?.role === 'ADMIN' ? '/admin/stats' : '/admin/stats/employee'
      console.log('Calling endpoint:', statsEndpoint, 'User role:', user?.role, 'Token:', localStorage.getItem('token')?.substring(0, 20))
      
      const statsResponse = await apiClient.get(statsEndpoint)
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
      <Box sx={{ mb: 4, pb: 2, borderBottom: '2px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Tableau de bord
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Bienvenue, {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
        </Box>
      </Box>

      {/* Main Statistics - Quick Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Véhicules Disponibles
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats?.availableVehicles || 0}
                  </Typography>
                  <Chip 
                    label={`${stats?.totalVehicles || 0} total`} 
                    size="small" 
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                  />
                </Box>
                <DirectionsCar sx={{ fontSize: 48, opacity: 0.6 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Mes Réservations
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats?.activeReservations || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    En cours
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 48, opacity: 0.6 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Taux d'Utilisation
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stats ? Math.round(((stats.totalVehicles - stats.availableVehicles) / stats.totalVehicles) * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Flotte globale
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.6 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* My Recent Reservations - Featured */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                  Mes Réservations Récentes
                </Typography>
                <Button size="small" onClick={() => navigate('/reservations')}>
                  Voir toutes
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {reservations.length > 0 ? (
                <List disablePadding>
                  {reservations.slice(0, 4).map((reservation, index) => (
                    <React.Fragment key={reservation.id}>
                      <ListItem sx={{ py: 2, px: 0, '&:hover': { backgroundColor: '#f5f5f5', borderRadius: 1 } }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.main' }}>
                            <DirectionsCar sx={{ fontSize: 20 }} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
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
                              <Typography variant="caption" display="block" sx={{ mb: 0.3 }}>
                                <AccessTime sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                {formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}
                              </Typography>
                              {reservation.purpose && (
                                <Typography variant="caption" display="block" color="textSecondary">
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
                  <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.3 }} />
                  <Typography color="textSecondary">
                    Vous n'avez pas de réservations actuellement
                  </Typography>
                  <Button 
                    size="small" 
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
          <Grid container spacing={3} sx={{ height: '100%' }}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocalOffer sx={{ mr: 1, color: 'primary.main' }} />
                    Actions Rapides
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate('/vehicles')}
                        startIcon={<DirectionsCar />}
                        sx={{ py: 1.5 }}
                      >
                        Consulter les Véhicules
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/reservations')}
                        startIcon={<CalendarToday />}
                        sx={{ py: 1.5 }}
                      >
                        Gérer mes Réservations
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/profile')}
                        startIcon={<Person />}
                        sx={{ py: 1.5 }}
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
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                    État de la Flotte
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List disablePadding>
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2">Disponibles</Typography>}
                        secondary={<Typography variant="caption">{stats?.availableVehicles}/{stats?.totalVehicles}</Typography>}
                      />
                    </ListItem>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats?.availableVehicles || 0) / (stats?.totalVehicles || 1) * 100}
                      sx={{ my: 1, backgroundColor: '#f0f0f0', height: 6, borderRadius: 3 }}
                    />
                    {stats?.maintenanceCount !== undefined && stats.maintenanceCount > 0 && (
                      <>
                        <ListItem sx={{ py: 1, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Warning sx={{ color: '#ff9800' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body2">En Maintenance</Typography>}
                            secondary={<Typography variant="caption">{stats.maintenanceCount} véhicule(s)</Typography>}
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