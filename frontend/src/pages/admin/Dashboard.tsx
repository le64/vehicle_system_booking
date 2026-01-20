import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import apiClient from '../../config/api'
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
  Paper,
  Chip
} from '@mui/material'
import {
  DirectionsCar,
  CalendarToday,
  Person,
  TrendingUp,
  CheckCircle,
  Warning,
  Settings,
  GroupAdd,
  Inventory2,
  ArrowRight
} from '@mui/icons-material'
import Layout from '../../components/Layout'

interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  activeReservations: number
  totalUsers: number
  maintenanceCount: number
  unavailableCount: number
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/admin/stats')
        setStats(response.data.data)
        setError(null)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques')
        // Données de fallback pour tester l'interface
        setStats({
          totalVehicles: 15,
          availableVehicles: 12,
          activeReservations: 8,
          totalUsers: 24,
          maintenanceCount: 2,
          unavailableCount: 1
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  const utilizationRate = stats ? Math.round(((stats.totalVehicles - stats.availableVehicles) / stats.totalVehicles) * 100) : 0
  const pendingReservations = stats ? Math.max(0, stats.activeReservations - (stats.totalVehicles - stats.maintenanceCount - stats.unavailableCount)) : 0

  return (
    <Layout>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Tableau de bord Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenue {user?.firstName}, gérez vos utilisateurs, véhicules et les réservations du système
        </Typography>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {stats && (
        <>
          {/* Quick Stats - Top Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {/* Véhicules Disponibles */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 3,
                boxShadow: 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }} onClick={() => navigate('/admin/vehicles')}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Véhicules Disponibles
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {stats.availableVehicles}
                      </Typography>
                      <Typography variant="caption">
                        {stats.totalVehicles} total
                      </Typography>
                    </Box>
                    <DirectionsCar sx={{ fontSize: 40, opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Réservations en Cours */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'error.main',
                color: 'white',
                borderRadius: 3,
                boxShadow: 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }} onClick={() => navigate('/admin/reservations')}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Réservations Système
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {stats.activeReservations}
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

            {/* Taux d'Utilisation */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'info.main',
                color: 'white',
                borderRadius: 3,
                boxShadow: 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }} onClick={() => navigate('/admin/vehicles')}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Taux d'Utilisation
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {utilizationRate}%
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

            {/* Utilisateurs */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'success.main',
                color: 'white',
                borderRadius: 3,
                boxShadow: 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }} onClick={() => navigate('/admin/users')}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Utilisateurs
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="caption">
                        Inscrits
                      </Typography>
                    </Box>
                    <Person sx={{ fontSize: 40, opacity: 0.5 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Management Panels */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {/* Gestion des Utilisateurs */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 1, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: 'success.light', 
                      p: 1, 
                      borderRadius: 1,
                      mr: 1.5
                    }}>
                      <GroupAdd sx={{ color: 'success.main', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Gestion Utilisateurs
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Total: {stats.totalUsers} utilisateurs
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Gérez les profils et permissions des utilisateurs
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button 
                    fullWidth
                    variant="contained" 
                    color="success"
                    size="small" 
                    onClick={() => navigate('/admin/users')}
                  >
                    Gérer Utilisateurs
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Gestion des Véhicules */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 1, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: 'primary.light', 
                      p: 1, 
                      borderRadius: 1,
                      mr: 1.5
                    }}>
                      <Inventory2 sx={{ color: 'primary.main', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Gestion Véhicules
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      Disponibles: {stats.availableVehicles} / {stats.totalVehicles}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.availableVehicles / stats.totalVehicles) * 100}
                        color="primary"
                        sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                      />
                      <Chip label={`${utilizationRate}%`} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Taux d'utilisation du parc
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button 
                    fullWidth
                    variant="contained" 
                    color="primary"
                    size="small" 
                    onClick={() => navigate('/admin/vehicles')}
                  >
                    Gérer Véhicules
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Gestion des Réservations */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 1, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 3
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: 'info.light', 
                      p: 1, 
                      borderRadius: 1,
                      mr: 1.5
                    }}>
                      <CalendarToday sx={{ color: 'info.main', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Gestion Réservations
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      En cours: {stats.activeReservations}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (stats.activeReservations / stats.totalVehicles) * 100)}
                      color="info"
                      sx={{ mb: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Suivi et gestion des demandes
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 0 }}>
                  <Button 
                    fullWidth
                    variant="contained" 
                    color="info"
                    size="small" 
                    onClick={() => navigate('/admin/reservations')}
                  >
                    Gérer Réservations
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Information */}
          <Grid container spacing={2}>
            {/* Fleet Status */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DirectionsCar sx={{ mr: 1, color: 'primary.main' }} />
                    État de la Flotte
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List disablePadding>
                    <ListItem sx={{ mb: 2, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircle sx={{ color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Disponibles"
                        secondary={`${stats.availableVehicles} sur ${stats.totalVehicles} véhicules`}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main', minWidth: '50px', textAlign: 'right' }}>
                        {Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%
                      </Typography>
                    </ListItem>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.availableVehicles / stats.totalVehicles) * 100}
                      color="success"
                      sx={{ mb: 2, height: 6, borderRadius: 3 }}
                    />
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <ListItem sx={{ mb: 2, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Warning sx={{ color: 'warning.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="En Maintenance"
                        secondary={`${stats.maintenanceCount} véhicule(s)`}
                      />
                    </ListItem>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <ListItem sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Warning sx={{ color: 'error.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Indisponibles"
                        secondary={`${stats.unavailableCount} véhicule(s) réservé(s)`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Summary Stats */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 1, color: 'info.main' }} />
                    Résumé des Activités
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List disablePadding>
                    <ListItem sx={{ mb: 2, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <DirectionsCar sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Parc Total"
                        secondary={`${stats.totalVehicles} véhicules`}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {stats.totalVehicles}
                      </Typography>
                    </ListItem>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <ListItem sx={{ mb: 2, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday sx={{ color: 'info.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Réservations Actives"
                        secondary={`${stats.activeReservations} en cours`}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                        {stats.activeReservations}
                      </Typography>
                    </ListItem>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <ListItem sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Person sx={{ color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Utilisateurs Actifs"
                        secondary={`${stats.totalUsers} inscrits`}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {stats.totalUsers}
                      </Typography>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Layout>
  )
}

export default AdminDashboard