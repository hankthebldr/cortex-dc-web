import { Router, type Router as RouterType } from 'express';
const router = Router();
router.post('/login', (req, res) => { res.json({ message: 'Auth handled by Keycloak/Firebase' }); });
router.post('/register', (req, res) => { res.json({ message: 'Auth handled by Keycloak/Firebase' }); });
router.post('/logout', (req, res) => { res.json({ message: 'Logged out' }); });
export const authRoutes: RouterType = router;
