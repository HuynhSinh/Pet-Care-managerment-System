export const login = (req, res) => {
    const { username, password } = req.body;

    // Mock Authentication Logic
    if (username === 'admin' && password === '123456') {
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: 1,
                username: 'admin',
                role: 'Administrator',
                avatar: 'https://ui-avatars.com/api/?name=Admin',
            }
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
    });
};
