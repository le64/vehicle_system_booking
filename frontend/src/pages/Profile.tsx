import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Box,
  Card,
  CardContent,
  CardActions,
  TextField,
  Button,
  Typography,
  Alert,
  Grid
} from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import Layout from '../components/Layout'

const Profile: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Ajouter l'endpoint pour mettre à jour le profil
      // await axios.put('/api/auth/profile', formData)
      
      setSuccess(true)
      setIsEditing(false)
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Profil
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Mis à jour</Alert>}

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountCircle sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role === 'ADMIN' ? 'Administrateur' : 'Employé'}
                </Typography>
              </Box>
            </Box>

            {!isEditing && (
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography>{user?.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Prénom</Typography>
                  <Typography>{user?.firstName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Nom</Typography>
                  <Typography>{user?.lastName}</Typography>
                </Grid>
              </Grid>
            )}

            {isEditing && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    size="small"
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            {!isEditing ? (
              <>
                <Button
                  size="small"
                  onClick={() => setIsEditing(true)}
                >
                  Modifier
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={handleLogout}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="small"
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Sauvegarder
                </Button>
              </>
            )}
          </CardActions>
        </Card>
      </Container>
    </Layout>
  )
}

export default Profile