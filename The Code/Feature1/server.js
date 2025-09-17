import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'Zayn11Assaf';

app.use(bodyParser.json());
app.use(express.static('public'));

const users = {
    'Asem': { password: 'password123', profile: { name: 'Asem', email: 'Asem@gmail.com' } }
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        return res.sendStatus(401).json({ error: 'Token missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username].password === password) {
        const accessToken = jwt.sign({ username: username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token: accessToken });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

app.put('/profile', authenticateToken, (req, res) => {
    const { name, email } = req.body;
    users[req.user.username].profile.name = name || users[req.user.username].profile.name;
    users[req.user.username].profile.email = email || users[req.user.username].profile.email;

    console.log(`Profile updated for ${req.user.username}:`, users[req.user.username].profile);
    res.json({ message: 'Profile updated successfully' });
});

app.post('/payment', authenticateToken, (req, res) => {
    const { cardNumber, amount } = req.body;
    console.log(`Payment received from ${req.user.username} for amount ${amount} with card ending in ${cardNumber.slice(-4)}`);
    res.json({ message: 'Payment processed successfully' });
    setTimeout(() => {
        console.log(`[ASYNC] Sending email receipt to ${req.user.username}...`);
    }, 1000);
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});