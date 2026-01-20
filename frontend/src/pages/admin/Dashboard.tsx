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
  Inventory2
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Tableau de bord Admin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bienvenue {user?.firstName}, gérez vos utilisateurs, véhicules et réservations
        </Typography>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {stats && (
        <>
          {/* Main KPIs - Top Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#3f51b5', color: 'white', borderRadius: 2, boxShadow: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="body2" sx={{ mb: 1 }}>
                        Total Véhicules
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.totalVehicles}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        Parc complet
                      </Typography>
                    </Box>
                    <DirectionsCar sx={{ fontSize: 36, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#e91e63', color: 'white', borderRadius: 2, boxShadow: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="body2" sx={{ mb: 1 }}>
                        Disponibles
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.availableVehicles}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        Prêts à être loués
                      </Typography>
                    </Box>
                    <CheckCircle sx={{ fontSize: 36, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#2196f3', color: 'white', borderRadius: 2, boxShadow: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="body2" sx={{ mb: 1 }}>
                        Réservations
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.activeReservations}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        En cours actuellement
                      </Typography>
                    </Box>
                    <CalendarToday sx={{ fontSize: 36, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ backgroundColor: '#4caf50', color: 'white', borderRadius: 2, boxShadow: 3, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="rgba(255,255,255,0.7)" variant="body2" sx={{ mb: 1 }}>
                        Utilisateurs
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {stats.totalUsers}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.6)">
                        Inscrits au système
                      </Typography>
                    </Box>
                    <Person sx={{ fontSize: 36, opacity: 0.7 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Management Panels - Quick Access */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Gestion des Utilisateurs */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GroupAdd sx={{ color: '#4caf50', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Gestion Utilisateurs
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Total: <strong>{stats.totalUsers}</strong> utilisateurs
                    </Typography>
                    <LinearProgress variant="determinate" value={Math.min(100, (stats.totalUsers / 100) * 100)} sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Gestion complète des profils et permissions
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/admin/users')}>Gérer</Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Gestion des Véhicules */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Inventory2 sx={{ color: '#3f51b5', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Gestion Véhicules
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Disponibles: <strong>{stats.availableVehicles}</strong>
                      </Typography>
                      <Chip label={`${utilizationRate}%`} size="small" color="primary" variant="outlined" />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={utilizationRate} 
                      sx={{ mb: 1, backgroundColor: '#e0e0e0', '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } }} 
                    />
                    <Typography variant="caption" color="text.secondary">
                      Taux d'utilisation du parc
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/admin/vehicles')}>Gérer</Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Gestion des Réservations */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ color: '#2196f3', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Gestion Réservations
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Actives: <strong>{stats.activeReservations}</strong>
                    </Typography>
                    <LinearProgress variant="determinate" value={Math.min(100, (stats.activeReservations / stats.totalVehicles) * 100)} sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Suivi et approbation des demandes
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/admin/reservations')}>Gérer</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          {/* Vehicle Status and Quick Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DirectionsCar sx={{ mr: 1, color: '#3f51b5' }} />
                    État de la Flotte
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List disablePadding>
                    <ListItem sx={{ mb: 1.5, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Disponibles"
                        secondary={`${stats.availableVehicles} sur ${stats.totalVehicles} véhicules`}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                        {Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%
                      </Typography>
                    </ListItem>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.availableVehicles / stats.totalVehicles) * 100}
                      sx={{ mb: 2, backgroundColor: '#f0f0f0' }}
                    />
                    <Divider sx={{ my: 1.5 }} />
                    <ListItem sx={{ mb: 1.5, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Warning sx={{ color: '#ff9800' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="En Maintenance"
                        secondary={`${stats.maintenanceCount} véhicule(s) en révision`}
                      />
                    </ListItem>
                    <Divider sx={{ my: 1.5 }} />
                    <ListItem sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Warning sx={{ color: '#f44336' }} />
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

            {/* Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 1, color: '#2196f3' }} />
                    Indicateurs Clés
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List disablePadding>
                    <ListItem sx={{ mb: 2, py: 1 }}>
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Taux d'utilisation</Typography>
                          <Chip label={`${utilizationRate}%`} size="small" color="primary" />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={utilizationRate}
                          sx={{ backgroundColor: '#f0f0f0' }}
                        />
                      </Box>
                    </ListItem>
                    <Divider sx={{ my: 1.5 }} />
                    <ListItem sx={{ mb: 2, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday sx={{ color: '#2196f3' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Réservations Actives"
                        secondary={`${stats.activeReservations} réservations en cours`}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                        {stats.activeReservations}
                      </Typography>
                    </ListItem>
                    <Divider sx={{ my: 1.5 }} />
                    <ListItem sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Person sx={{ color: '#4caf50' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Utilisateurs Actifs"
                        secondary={`${stats.totalUsers} utilisateurs inscrits`}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
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